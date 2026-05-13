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
const PdfReader = lazy(() => import("../components/PdfReader.jsx"));
const EpubReader = lazy(() => import("../components/EpubReader.jsx"));
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
  const readerContainerRef = useRef(null);
  const lastSavedPageRef = useRef(0);
  const lastSaveTimestampRef = useRef(Date.now());
  const hasInitializedReaderRef = useRef(false);
  const bookId = useMemo(() => getHashParams().get("book"), []);
  const chapterPagesRef = useRef({});
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
            ? {
              absolutePage: progressData?.current_page || 0,
            }
            : {
              currentPage: progressData?.current_page || 1,
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
            totalPages: readerMetrics.totalPages,
          }
          : readDisplayedMetrics(
            renditionRef.current,
            readerMetrics.currentPage,
            readerMetrics.totalPages
          ));

      const isEpub = readerSource?.type === "epub";

      const { currentPage } = metrics;
      const totalPages = isEpub
        ? readerMetrics.totalPages
        : metrics.totalPages;

      const minutesSpent = Math.max(
        1,
        Math.round((Date.now() - lastSaveTimestampRef.current) / 60000)
      );

      const absolutePage = isEpub
        ? (readerMetrics.absolutePage || 0)
        : currentPage;

      const computedProgress = isEpub
        ? (totalPages > 0 ? Math.floor((absolutePage / totalPages) * 100) : 0)
        : progress?.completion_percentage;

      const pagesDelta = Math.max(0, (absolutePage || 0) - (lastSavedPageRef.current || 0));

      // Skip autosaves that recorded no new pages — avoids "+0 XP" session spam.
      if (pagesDelta === 0 && !forceFinish) {
        lastSaveTimestampRef.current = Date.now();
        return;
      }

      setSaving(true);

      const saveResult = forceFinish
        ? await finishReading(
          user.id,
          book.id,
          nextLocation,
          absolutePage,
          totalPages,
          minutesSpent,
          computedProgress
        )
        : await saveReadingPosition(
          user.id,
          book.id,
          nextLocation,
          absolutePage,
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

      lastSavedPageRef.current = absolutePage || lastSavedPageRef.current;
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
    <div className="h-screen bg-cream flex flex-col">

      {/* HEADER */}
      <div className="bg-crimson border-b border-white/10 px-4 py-3 flex justify-between items-center gap-4">

        <div className="min-w-0">
          <h1 className="text-base font-semibold text-white truncate">{book.title}</h1>
          <p className="text-xs text-white/75">{book.author}</p>
        </div>

        <div className="flex items-center gap-4 text-sm text-white shrink-0">

          <span className="hidden sm:inline">
            {readerSource?.type === "epub" ? (
              <>
                Capítulo {readerMetrics.currentChapter} / {readerMetrics.totalChapters}
                {" — "}
                Pág. {readerMetrics.chapterPage} / {readerMetrics.chapterTotalPages}
                {" — "}
                {readerMetrics.absolutePage || 0} / {readerMetrics.totalPages || "..."}
              </>
            ) : (
              <>
                Pág. {readerMetrics.currentPage || progress?.current_page || 0} /{" "}
                {readerMetrics.totalPages || 0}
              </>
            )}
          </span>

          <span className="hidden sm:inline shadow-[inset_0_0_0_1px_rgba(26,95,168,0.08)] py-0.5 px-1.5 text-secondary bg-secondary-light font-bold rounded-xl">
            {readerSource?.type === "epub"
              ? (readerMetrics.totalPages > 0 ? Math.min(100, Math.floor(((readerMetrics.absolutePage || 0) / readerMetrics.totalPages) * 100)) : 0)
              : progress?.completion_percentage || 0}%
          </span>

          <button
            onClick={async () => {
              await persistProgress(location, true);
              window.location.hash = book.categoryId || "acervo";
            }}
            className="rounded-full bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-[#d45f00] transition-colors"
          >
            Concluir leitura
          </button>

          <span className="text-xs text-white/75 w-[52px] text-center hidden md:inline-block">
            {saving ? "Salvando..." : "Salvo"}
          </span>

        </div>
      </div>

      {/* READER */}
      <div ref={readerContainerRef} className="flex-1 overflow-auto">
        <Suspense fallback={<div className="h-full flex items-center justify-center text-[#64748b]">Carregando...</div>}>

          {readerSource?.type === "epub" ? (
            <EpubReader
              url={readerSource.url}
              initialLocation={location || undefined}
              onRendition={(r) => { renditionRef.current = r; }}
              onReady={(total) => {
                setReaderMetrics((prev) => ({ ...prev, totalPages: total }));
              }}
              onLocationChange={(loc, spine = []) => {
                if (!loc?.start) return;

                setLocation(loc.start.cfi);
                const chapterIdx = loc.start.index ?? 0;
                const chapterPage = loc.start.displayed?.page ?? 1;
                const chapterTotalPages = loc.start.displayed?.total ?? 1;

                chapterPagesRef.current[chapterIdx] = chapterTotalPages;

                const known = Object.values(chapterPagesRef.current);
                const avg = known.length > 0
                  ? Math.round(known.reduce((s, p) => s + p, 0) / known.length)
                  : 10;

                let completedPages = 0;
                let totalPages = 0;
                for (let i = 0; i < spine.length; i++) {
                  const pages = chapterPagesRef.current[i] ?? avg;
                  if (i < chapterIdx) completedPages += pages;
                  totalPages += pages;
                }

                setReaderMetrics((prev) => ({
                  ...prev,
                  currentChapter: chapterIdx + 1,
                  totalChapters: spine.length || 0,
                  chapterPage,
                  chapterTotalPages,
                  absolutePage: completedPages + chapterPage,
                  totalPages,
                }));
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