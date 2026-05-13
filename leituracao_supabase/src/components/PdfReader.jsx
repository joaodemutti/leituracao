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
    <div className="h-full flex flex-col bg-[#f0ece4]">
      <div className="px-4 py-3 border-b border-[#ddd5c8] bg-white flex items-center justify-between gap-3">
        <div className="text-sm text-[#64748b]">
          Página {pageNumber}
          {numPages ? ` de ${numPages}` : ""}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setPageNumber((currentPage) => clampPage(currentPage - 1, numPages))}
            disabled={pageNumber <= 1}
            className="px-4 py-2 rounded-full border border-[#ddd5c8] text-sm font-medium text-crimson disabled:opacity-40 hover:bg-[#f6f1e8] transition-colors"
          >
            Anterior
          </button>
          <button
            onClick={() => setPageNumber((currentPage) => clampPage(currentPage + 1, numPages))}
            disabled={Boolean(numPages) && pageNumber >= numPages}
            className="px-4 py-2 rounded-full bg-crimson text-white text-sm font-semibold disabled:opacity-40 hover:bg-crimson-mid transition-colors"
          >
            Próxima
          </button>
        </div>
      </div>

      <div ref={containerRef} className="flex-1 overflow-auto p-4 md:p-6 bg-[#f0ece4]">
        <Document
          file={fileUrl}
          onLoadSuccess={handleDocumentLoadSuccess}
          onLoadError={(error) => setLoadError(error.message || "Nao foi possivel carregar o PDF.")}
          loading={
            <div className="min-h-[60vh] flex items-center justify-center text-[#64748b]">
              Carregando PDF...
            </div>
          }
          error={
            <div className="min-h-[60vh] flex items-center justify-center text-center text-red-600 px-4">
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
              <div className="min-h-[60vh] flex items-center justify-center text-[#64748b]">
                Carregando página...
              </div>
            }
            className="shadow-2xl"
          />
        </Document>
      </div>
    </div>
  );
}
