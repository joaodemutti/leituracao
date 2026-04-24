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
import { getProxiedBlobUrl } from "../lib/proxyUrl.js";
import {
  finishReading,
  getBookProgress,
  startReading,
  saveReadingPosition,
} from "../services/ReadingService";

const ReactReader = lazy(() =>
  import("react-reader").then((module) => ({ default: module.ReactReader })),
);
const PdfReader = lazy(() => import("../components/PdfReader.jsx"));
const PDF_LOCATION_PREFIX = "pdf-page:";

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

export default function ReaderPage() {
  const [user, setUser] = useState(null);
  const [book, setBook] = useState(null);
  const [progress, setProgress] = useState(null);
  const [location, setLocation] = useState(null);
  const [readerSource, setReaderSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [readerMetrics, setReaderMetrics] = useState({
    currentPage: null,
    totalPages: null,
  });

  const renditionRef = useRef(null);
  const lastSavedPageRef = useRef(0);
  const lastSaveTimestampRef = useRef(Date.now());
  const hasInitializedReaderRef = useRef(false);

  const bookId = useMemo(() => getHashParams().get("book"), []);
  const readerLabel =
    readerSource?.type === "pdf" ? "Leitor PDF" : "Leitor EPUB";

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
        if (bookResult.error) {
          throw new Error(bookResult.error);
        }

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
          bookResult.data.estimatedPages,
        );

        if (!mounted) return;

        const initialCurrentPage =
          progressData?.current_page ||
          (resolvedReaderSource?.type === "pdf"
            ? parsePdfPage(initialLocation) || 1
            : null);

        setUser(currentUser);
        setBook(bookResult.data);
        setProgress(progressData);
        setLocation(initialLocation);

        // Apply proxy to URLs - use blob URLs for EPUBs to handle structure correctly
        let finalReaderSource = null;
        if (resolvedReaderSource) {
          if (resolvedReaderSource.type === "epub") {
            try {
              const blobUrl = await getProxiedBlobUrl(resolvedReaderSource.url);
              finalReaderSource = { ...resolvedReaderSource, url: blobUrl };
            } catch (error) {
              console.error("Failed to create blob URL for EPUB:", error);
              throw new Error("Failed to load EPUB: " + error.message);
            }
          } else {
            // PDFs can use regular proxy URLs
            finalReaderSource = {
              ...resolvedReaderSource,
              url: resolvedReaderSource.url, // PDFs don't need proxy, they'll work directly
            };
          }
        }

        if (!mounted) return;

        setReaderSource(finalReaderSource);
        setReaderMetrics({
          currentPage: initialCurrentPage,
          totalPages:
            progressData?.estimated_pages ||
            bookResult.data.estimatedPages ||
            null,
        });
        lastSavedPageRef.current = initialCurrentPage || 0;
      } catch (loadError) {
        if (mounted) {
          setError(loadError.message || "Nao foi possivel abrir o livro.");
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadReader();
    return () => {
      mounted = false;
    };
  }, [bookId]);

  const persistProgress = useCallback(
    async (nextLocation, forceFinish = false, nextMetrics = null) => {
      if (!user || !book || !nextLocation) return;

      const metrics =
        nextMetrics ||
        (readerSource?.type === "pdf"
          ? {
              currentPage:
                parsePdfPage(nextLocation) || readerMetrics.currentPage,
              totalPages: readerMetrics.totalPages || book.estimatedPages,
            }
          : readDisplayedMetrics(
              renditionRef.current,
              readerMetrics.currentPage,
              readerMetrics.totalPages || book.estimatedPages,
            ));
      const { currentPage, totalPages } = metrics;

      const minutesSpent = Math.max(
        1,
        Math.round((Date.now() - lastSaveTimestampRef.current) / 60000),
      );
      const pagesDelta = currentPage
        ? Math.max(0, currentPage - (lastSavedPageRef.current || 0))
        : 0;

      setSaving(true);
      const saveResult = forceFinish
        ? await finishReading(
            user.id,
            book.id,
            nextLocation,
            currentPage,
            totalPages,
            minutesSpent,
          )
        : await saveReadingPosition(
            user.id,
            book.id,
            nextLocation,
            currentPage,
            totalPages,
            minutesSpent,
            pagesDelta,
          );
      setSaving(false);

      if (saveResult.error) {
        setError(saveResult.error);
        return;
      }

      lastSavedPageRef.current = currentPage || lastSavedPageRef.current;
      lastSaveTimestampRef.current = Date.now();
      setProgress(saveResult.data);
      setReaderMetrics({ currentPage, totalPages });
    },
    [
      book,
      readerMetrics.currentPage,
      readerMetrics.totalPages,
      readerSource?.type,
      user,
    ],
  );

  useEffect(() => {
    if (!hasInitializedReaderRef.current || !location) {
      hasInitializedReaderRef.current = true;
      return undefined;
    }

    const timer = setTimeout(() => {
      persistProgress(location);
    }, 900);

    return () => clearTimeout(timer);
  }, [location, persistProgress]);

  if (loading) {
    return <div className="p-8 text-center">Carregando leitor...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-4">
        <div className="max-w-lg rounded-xl bg-white p-6 shadow-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-navy">
            Nao foi possivel abrir o livro
          </h1>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => (window.location.hash = "acervo")}
            className="px-5 py-2 rounded-full bg-navy text-white font-semibold"
          >
            Voltar ao acervo
          </button>
        </div>
      </div>
    );
  }

  if (!book) return null;

  if (!readerSource) {
    return (
      <div className="min-h-screen bg-cream px-4 py-10">
        <div className="container max-w-3xl rounded-xl bg-white p-6 shadow-md space-y-5">
          <div>
            <p className="text-sm uppercase tracking-widest text-gold font-semibold">
              Leitor digital
            </p>
            <h1 className="text-3xl font-serif font-bold text-navy mt-2">
              {book.title}
            </h1>
            <p className="text-gray-600 mt-1">{book.author}</p>
          </div>

          <p className="text-gray-700">
            Este livro ainda nao possui uma fonte compativel com o leitor.
            Configure um EPUB em <code>epub_url</code>, um link direto de EPUB
            em <code>external_url</code>.
          </p>

          <div className="flex flex-wrap gap-3">
            {book.pdfUrl && (
              <a
                href={book.pdfUrl}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-full bg-blue text-white font-semibold"
              >
                Abrir PDF
              </a>
            )}
            {book.url && (
              <a
                href={book.url}
                target="_blank"
                rel="noreferrer"
                className="px-5 py-2 rounded-full border border-gray-300 text-gray-700 font-semibold"
              >
                Abrir link original
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <div className="border-b border-white/10 px-4 py-3 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <button
            onClick={() => (window.location.hash = book.categoryId || "acervo")}
            className="text-xs uppercase tracking-[0.2em] text-white/60 hover:text-white"
          >
            Voltar
          </button>
          <h1 className="text-xl font-serif font-bold mt-1">{book.title}</h1>
          <p className="text-sm text-white/70">{book.author}</p>
          <p className="text-xs uppercase tracking-[0.2em] text-white/40 mt-1">
            {readerLabel}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
          <span>
            {readerMetrics.currentPage || progress?.current_page || 0}
            {readerMetrics.totalPages || progress?.estimated_pages
              ? ` / ${readerMetrics.totalPages || progress?.estimated_pages}`
              : ""}
          </span>
          <span>{progress?.completion_percentage || 0}% concluido</span>
          <button
            onClick={() => persistProgress(location, true)}
            className="px-4 py-2 rounded-full bg-gold text-navy font-semibold"
          >
            Concluir leitura
          </button>
          <span className="text-xs text-white/50">
            {saving ? "Salvando..." : "Salvo"}
          </span>
        </div>
      </div>

      <div className="flex-1 min-h-[75vh]">
        <Suspense
          fallback={
            <div className="h-full min-h-[75vh] flex items-center justify-center text-white/70">
              Carregando leitor...
            </div>
          }
        >
          {readerSource.type === "epub" ? (
            <ReactReader
              url={readerSource.url}
              location={location || undefined}
              locationChanged={(nextLocation) => {
                setLocation(nextLocation);
                const metrics = readDisplayedMetrics(
                  renditionRef.current,
                  readerMetrics.currentPage,
                  readerMetrics.totalPages || book.estimatedPages,
                );
                setReaderMetrics(metrics);
              }}
              getRendition={(rendition) => {
                renditionRef.current = rendition;
              }}
              epubOptions={{ allowPopups: true, allowScriptedContent: true }}
              styles={{
                readerArea: { transition: "all 150ms ease" },
              }}
            />
          ) : (
            <PdfReader
              fileUrl={readerSource.url}
              initialPage={
                parsePdfPage(location) || readerMetrics.currentPage || 1
              }
              onDocumentReady={(totalPages) => {
                setReaderMetrics((currentMetrics) => ({
                  currentPage:
                    currentMetrics.currentPage || parsePdfPage(location) || 1,
                  totalPages,
                }));
              }}
              onPageChange={({ pageNumber, totalPages }) => {
                const nextLocation = buildPdfLocation(pageNumber);

                setReaderMetrics({
                  currentPage: pageNumber,
                  totalPages:
                    totalPages ||
                    readerMetrics.totalPages ||
                    book.estimatedPages,
                });
                setLocation((currentLocation) =>
                  currentLocation === nextLocation
                    ? currentLocation
                    : nextLocation,
                );
              }}
            />
          )}
        </Suspense>
      </div>
    </div>
  );
}
