import {
  Suspense,
  lazy,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { getCurrentUser } from "../services/AuthService";
import { getBookById, getReaderSource } from "../services/CatalogService";
import { getProxiedBlob } from "../lib/proxyUrl.js";
import {
  finishReading,
  getBookProgress,
  startReading,
  saveReadingPosition,
} from "../services/ReadingService";
import { ReactReader } from "react-reader";

const PdfReader = lazy(() => import("../components/PdfReader.jsx"));
const PDF_LOCATION_PREFIX = "pdf-page:";

/* =========================
  HELPERS
========================= */

function getHashParams() {
  const [, queryString = ""] = window.location.hash.split("?");
  return new URLSearchParams(queryString);
}

function readDisplayedMetrics(rendition, fallbackPage, fallbackTotal) {
  if (!rendition) {
    return { currentPage: fallbackPage, totalPages: fallbackTotal };
  }

  try {
    const location =
      typeof rendition.currentLocation === "function"
        ? rendition.currentLocation()
        : rendition.currentLocation;

    return {
      currentPage: location?.start?.displayed?.page ?? fallbackPage,
      totalPages: location?.start?.displayed?.total ?? fallbackTotal,
    };
  } catch {
    return { currentPage: fallbackPage, totalPages: fallbackTotal };
  }
}

function calculateChapterProgress(metrics) {
  const {
    currentChapter = 1,
    totalChapters = 1,
    chapterPage = 1,
    chapterTotalPages = 1,
  } = metrics || {};

  if (!totalChapters || totalChapters <= 0) return 0;

  const chapterIndex = currentChapter - 1;

  const intraChapterProgress =
    chapterTotalPages > 0
      ? chapterPage / chapterTotalPages
      : 0;

  const totalProgress =
    (chapterIndex + intraChapterProgress) / totalChapters;

  const percent = Math.floor(totalProgress * 100);
  return Math.min(100, percent);
}

function buildPdfLocation(pageNumber) {
  const safePage = Math.max(1, Number(pageNumber) || 1);
  return `${PDF_LOCATION_PREFIX}${safePage}`;
}

function parsePdfPage(location) {
  if (!location) return null;

  if (typeof location === "number") {
    return Math.max(1, location);
  }

  if (typeof location !== "string") return null;

  const normalized = location.startsWith(PDF_LOCATION_PREFIX)
    ? location.slice(PDF_LOCATION_PREFIX.length)
    : location;

  const pageNumber = Number.parseInt(normalized, 10);

  return Number.isFinite(pageNumber) && pageNumber > 0 ? pageNumber : null;
}

/* =========================
  COMPONENT
========================= */

export default function ReaderPage() {
  const [epubReady, setEpubReady] = useState(false);
  const [user, setUser] = useState(null);
  const [book, setBook] = useState(null);
  const [progress, setProgress] = useState(null);
  const [location, setLocation] = useState(null);
  const [readerSource, setReaderSource] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [readerMetrics, setReaderMetrics] = useState({});

  const renditionRef = useRef(null);
  const lastSavedPageRef = useRef(0);
  const lastSaveTimestampRef = useRef(Date.now());
  const hasInitializedReaderRef = useRef(false);

  const bookId = useMemo(() => getHashParams().get("book"), []);

  const readerLabel =
    readerSource?.type === "pdf" ? "Leitor PDF" : "Leitor EPUB";

  /* =========================
    LOAD
  ========================= */

  useEffect(() => {
    let mounted = true;

    async function loadReader() {
      setLoading(true);
      setError("");

      try {
        const currentUser = await getCurrentUser();
        if (!currentUser) {
          window.location.hash = "login";
          return;
        }

        const bookResult = await getBookById(bookId);
        if (bookResult.error) throw new Error(bookResult.error);

        const progressResult = await getBookProgress(currentUser.id, bookId);
        const progressData = progressResult.error ? null : progressResult.data;

        const resolvedReaderSource = getReaderSource(bookResult.data);

        const initialLocation =
          progressData?.epub_location ||
          (resolvedReaderSource?.type === "pdf"
            ? buildPdfLocation(progressData?.current_page || 1)
            : null);

        await startReading(
          currentUser.id,
          bookId,
          initialLocation,
          bookResult.data.estimatedPages
        );

        if (!mounted) return;

        setUser(currentUser);
        setBook(bookResult.data);
        setProgress(progressData);
        setLocation(initialLocation);

        let finalReaderSource = resolvedReaderSource;

        if (resolvedReaderSource?.type === "epub") {
          const blob = await getProxiedBlob(resolvedReaderSource.url);
          finalReaderSource = { ...resolvedReaderSource, url: blob };
        }

        if (!mounted) return;

        setReaderSource(finalReaderSource);

        setReaderMetrics(
          resolvedReaderSource?.type === "epub"
            ? {}
            : {
              currentPage: progressData?.current_page || 1,
              totalPages:
                progressData?.estimated_pages ||
                bookResult.data.estimatedPages,
            }
        );

        lastSavedPageRef.current = progressData?.current_page || 0;
      } catch (err) {
        setError(err.message || "Nao foi possivel abrir o livro.");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadReader();
    return () => (mounted = false);
  }, [bookId]);

  /* =========================
    SAVE
  ========================= */

  const persistProgress = useCallback(
    async (nextLocation, forceFinish = false, nextMetrics = null) => {
      if (!user || !book || !nextLocation) return;

      const metrics =
        nextMetrics ||
        (readerSource?.type === "pdf"
          ? {
            currentPage:
              parsePdfPage(nextLocation) || readerMetrics.currentPage,
            totalPages:
              readerMetrics.totalPages || book.estimatedPages,
          }
          : readDisplayedMetrics(
            renditionRef.current,
            readerMetrics.currentPage,
            readerMetrics.totalPages || book.estimatedPages
          ));

      const { currentPage, totalPages } = metrics;

      const minutesSpent = Math.max(
        1,
        Math.round((Date.now() - lastSaveTimestampRef.current) / 60000)
      );

      const pagesDelta = currentPage
        ? Math.max(0, currentPage - (lastSavedPageRef.current || 0))
        : 0;

      setSaving(true);

      const computedProgress =
        readerSource?.type === "epub"
          ? calculateChapterProgress({
            currentChapter: readerMetrics.currentChapter,
            totalChapters: readerMetrics.totalChapters,
            chapterPage: readerMetrics.chapterPage,
            chapterTotalPages: readerMetrics.chapterTotalPages,
          })
          : progress?.completion_percentage;
      const saveResult = forceFinish
        ? await finishReading(
          user.id,
          book.id,
          nextLocation,
          currentPage,
          totalPages,
          minutesSpent,
          computedProgress
        )
        : await saveReadingPosition(
          user.id,
          book.id,
          nextLocation,
          currentPage,
          totalPages,
          minutesSpent,
          pagesDelta,
          computedProgress
        );

      setSaving(false);

      if (saveResult.error) {
        setError(saveResult.error);
        return;
      }

      lastSavedPageRef.current = currentPage || lastSavedPageRef.current;
      lastSaveTimestampRef.current = Date.now();

      setProgress(saveResult.data);
    },
    [book, readerMetrics, readerSource, user]
  );

  /* =========================
    AUTO SAVE
  ========================= */

  useEffect(() => {
    if (!hasInitializedReaderRef.current || !location) {
      hasInitializedReaderRef.current = true;
      return;
    }

    const timer = setTimeout(() => {
      persistProgress(location);
    }, 900);

    return () => clearTimeout(timer);
  }, [location, persistProgress]);

  /* =========================
    RENDER
  ========================= */

  if (loading) return <div className="p-8 text-center">Carregando leitor...</div>;

  if (error)
    return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!book || !readerSource) return null;

  return (
    <div className="h-screen bg-[#0f172a] text-white flex flex-col">

      {/* HEADER */}
      <div className="border-b border-white/10 px-4 py-3 flex justify-between">

        <div>
          <h1 className="text-xl font-bold">{book.title}</h1>
          <p className="text-sm text-white/70">{book.author}</p>
        </div>

        <div className="flex items-center gap-3 text-sm text-white/80">

          <span>
            {readerSource?.type === "epub" ? (
              <>
                Chapter {readerMetrics.currentChapter} / {readerMetrics.totalChapters}
                {" — "}
                Page {readerMetrics.chapterPage} / {readerMetrics.chapterTotalPages}
              </>
            ) : (
              <>
                {readerMetrics.currentPage || progress?.current_page || 0} /{" "}
                {readerMetrics.totalPages || progress?.estimated_pages || 0}
              </>
            )}
          </span>

          <span>
            {readerSource?.type === "epub"
              ? (
                epubReady
                  ? calculateChapterProgress(readerMetrics)
                  : progress?.completion_percentage || 0
              )
              : progress?.completion_percentage || 0}
            % concluido
          </span>

          <button
            onClick={async () => {
              await persistProgress(location, true);
              window.location.hash = book.categoryId || "acervo";
            }}
            className="px-4 py-2 rounded-full bg-gold text-navy font-semibold"
          >
            Concluir leitura
          </button>

          <span className="text-xs text-white/50 w-[80px] inline-block text-center">
            {saving ? "Salvando..." : "Salvo"}
          </span>

        </div>
      </div>

      {/* READER */}
      <div className="flex-1">
        <Suspense fallback={<div>Carregando...</div>}>

          {readerSource?.type === "epub" ? (
            <ReactReader
              url={readerSource.url}
              location={location || undefined}
              getRendition={(r) => {
                renditionRef.current = r;

                const spineLength = r?.book?.spine?.items?.length || 0;
                console.log(r?.book?.spine?.items)

                setReaderMetrics((prev) => ({
                  ...prev,
                  totalChapters: spineLength,
                }));
              }}

              locationChanged={(nextLocation) => {
                setLocation(nextLocation);

                if (readerSource?.type !== "epub") return;

                const loc = renditionRef.current?.currentLocation?.();
                if (!loc?.start) return;

                const spine = renditionRef.current?.book?.spine?.items || [];

                const metrics = {
                  currentChapter: (loc.start.index ?? 0) + 1,
                  totalChapters: spine.length || 0,
                  chapterPage: loc.start.displayed?.page ?? 1,
                  chapterTotalPages: loc.start.displayed?.total ?? 1,
                };

                setReaderMetrics(metrics);
                setEpubReady(true); // 🔥 THIS IS THE REAL “READY SIGNAL”
              }}

              epubOptions={{
                allowPopups: true,
                allowScriptedContent: true,
              }}
            />
          ) : (
            <PdfReader
              fileUrl={readerSource.url}
              initialPage={
                parsePdfPage(location) || readerMetrics.currentPage || 1
              }
              onDocumentReady={(totalPages) => {
                setReaderMetrics((m) => ({
                  ...m,
                  totalPages,
                }));
              }}
              onPageChange={({ pageNumber, totalPages }) => {
                setReaderMetrics({
                  currentPage: pageNumber,
                  totalPages,
                });

                setLocation(buildPdfLocation(pageNumber));
              }}
            />
          )}

        </Suspense>
      </div>
    </div>
  );
}