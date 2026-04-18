import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

function clampPage(pageNumber, totalPages) {
  const safePage = Math.max(1, Number(pageNumber) || 1);
  if (!totalPages) return safePage;
  return Math.min(safePage, totalPages);
}

export default function PdfReader({ fileUrl, initialPage = 1, onDocumentReady, onPageChange }) {
  const containerRef = useRef(null);
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(Math.max(1, Number(initialPage) || 1));
  const [pageWidth, setPageWidth] = useState(720);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    setPageNumber((currentPage) => {
      const fallbackPage = clampPage(initialPage, numPages);
      if (currentPage === fallbackPage) return currentPage;
      return fallbackPage;
    });
  }, [initialPage, numPages]);

  useEffect(() => {
    if (!containerRef.current) return undefined;

    const updateWidth = () => {
      if (!containerRef.current) return;
      const nextWidth = Math.max(280, Math.floor(containerRef.current.clientWidth - 32));
      setPageWidth(nextWidth);
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    onPageChange?.({
      pageNumber,
      totalPages: numPages,
    });
  }, [numPages, onPageChange, pageNumber]);

  const handleDocumentLoadSuccess = ({ numPages: loadedPages }) => {
    setLoadError("");
    setNumPages(loadedPages);

    const nextPage = clampPage(initialPage, loadedPages);
    setPageNumber(nextPage);
    onDocumentReady?.(loadedPages);
  };

  return (
    <div className="h-full flex flex-col bg-slate-950">
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
        <div className="text-sm text-white/70">
          Pagina {pageNumber}
          {numPages ? ` de ${numPages}` : ""}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNumber((currentPage) => clampPage(currentPage - 1, numPages))}
            disabled={pageNumber <= 1}
            className="px-3 py-1.5 rounded-full border border-white/15 text-sm text-white disabled:opacity-40"
          >
            Anterior
          </button>
          <button
            onClick={() => setPageNumber((currentPage) => clampPage(currentPage + 1, numPages))}
            disabled={Boolean(numPages) && pageNumber >= numPages}
            className="px-3 py-1.5 rounded-full bg-gold text-navy text-sm font-semibold disabled:opacity-40"
          >
            Proxima
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto p-4 md:p-6">
        <Document
          file={fileUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={(error) => setLoadError(error.message || "Nao foi possivel carregar o PDF.")}
          loading={
            <div className="min-h-[60vh] flex items-center justify-center text-white/70">
              Carregando PDF...
            </div>
          }
          error={
            <div className="min-h-[60vh] flex items-center justify-center text-center text-red-200 px-4">
              {loadError || "Nao foi possivel carregar o PDF."}
            </div>
          }
          className="mx-auto w-fit"
        >
          <Page
            pageNumber={pageNumber}
            width={pageWidth}
            renderAnnotationLayer
            renderTextLayer
            loading={
              <div className="min-h-[60vh] flex items-center justify-center text-white/70">
                Carregando pagina...
              </div>
            }
            className="shadow-2xl"
          />
        </Document>
      </div>
    </div>
  );
}
