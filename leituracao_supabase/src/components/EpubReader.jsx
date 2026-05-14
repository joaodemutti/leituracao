import { useEffect, useRef, useCallback, useState } from "react";
import ePub from "epubjs";

const TOOLBAR_HEIGHT = 48;
const PAD = 8;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

// Fixed baseline for page counting — device-independent
const COUNT_W = 600;
const COUNT_H = 840;

async function countAllPages(book) {
  const items = book.spine.spineItems || [];
  if (items.length === 0) return { total: 0, perChapter: [] };

  const el = document.createElement("div");
  el.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${COUNT_W}px;height:${COUNT_H}px;visibility:hidden;overflow:hidden;`;
  document.body.appendChild(el);

  const r = book.renderTo(el, {
    width: COUNT_W,
    height: COUNT_H,
    spread: "none",
    flow: "paginated",
  });

  const perChapter = [];
  let total = 0;
  for (const item of items) {
    try {
      await r.display(item.href);
      const loc = r.currentLocation();
      const pages = loc?.start?.displayed?.total ?? 1;
      perChapter.push(pages);
      total += pages;
    } catch {
      perChapter.push(1);
      total += 1;
    }
  }

  r.destroy();
  el.remove();
  return { total, perChapter };
}

export default function EpubReader({ url, initialLocation, onLocationChange, onReady, onRendition }) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const lastSizeRef = useRef({ w: 0, h: 0 });

  // Epub renders at this virtual size; CSS scale(zoom) brings it to fill the container
  const renderW = size.width > 0 ? Math.max(1, Math.round(size.width / zoom)) : COUNT_W;
  const renderH = size.height > 0 ? Math.max(1, Math.round(size.height / zoom)) : COUNT_H;

  const next = useCallback(() => renditionRef.current?.next(), []);
  const prev = useCallback(() => renditionRef.current?.prev(), []);

  // Measure available book area
  useEffect(() => {
    if (!wrapperRef.current) return;
    const obs = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      const w = Math.floor(width - PAD * 2);
      const h = Math.floor(height - TOOLBAR_HEIGHT - PAD * 2);
      if (w > 0 && h > 0) setSize({ width: w, height: h });
    });
    obs.observe(wrapperRef.current);
    return () => obs.disconnect();
  }, []);

  // Init epub once container size is known
  useEffect(() => {
    if (!containerRef.current || !url || size.width === 0) return;

    const book = ePub(url);
    bookRef.current = book;

    const rendition = book.renderTo(containerRef.current, {
      width: renderW,
      height: renderH,
      spread: "none",
      flow: "paginated",
    });
    renditionRef.current = rendition;
    lastSizeRef.current = { w: renderW, h: renderH };
    if (onRendition) onRendition(rendition);

    rendition.display(initialLocation || undefined);

    rendition.on("relocated", (location) => {
      if (onLocationChange) onLocationChange(location, rendition.book.spine.items || []);
    });

    book.ready
      .then(() => countAllPages(book))
      .then(({ total, perChapter }) => { if (onReady) onReady(total, perChapter); })
      .catch(() => {});

    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") rendition.next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") rendition.prev();
    };
    document.addEventListener("keyup", handleKey);

    return () => {
      document.removeEventListener("keyup", handleKey);
      rendition.destroy();
      book.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, size.width > 0]);

  // Resize rendition when container or zoom changes
  useEffect(() => {
    const rendition = renditionRef.current;
    if (!rendition || typeof rendition.resize !== "function") return;
    if (renderW <= 0 || renderH <= 0) return;
    // Skip if dimensions didn't actually change (e.g. right after renderTo)
    if (renderW === lastSizeRef.current.w && renderH === lastSizeRef.current.h) return;
    lastSizeRef.current = { w: renderW, h: renderH };
    rendition.resize(renderW, renderH);
  }, [renderW, renderH]);

  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 10) / 10));
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 10) / 10));

  return (
    <div ref={wrapperRef} className="flex flex-col w-full flex-1 min-h-0" style={{ background: "#2a2a2a" }}>

      {/* Book viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-auto" style={{ padding: PAD }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "100%", minHeight: "100%" }}>
            {/* Size proxy — always the natural visual size */}
            <div
              style={{
                width: size.width || renderW,
                height: size.height || renderH,
                position: "relative",
                flexShrink: 0,
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}
            >
              {/* Epub renders at virtual size, scaled up to fill the proxy */}
              <div
                ref={containerRef}
                style={{
                  width: renderW,
                  height: renderH,
                  transform: zoom !== 1 ? `scale(${zoom})` : undefined,
                  transformOrigin: "top left",
                  position: "absolute",
                  top: 0,
                  left: 0,
                }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={prev}
          aria-label="Página anterior"
          className="absolute left-0 top-0 h-full w-16 z-10 flex items-center justify-start pl-2 opacity-0 hover:opacity-100 transition-opacity duration-200 focus:outline-none"
        >
          <div className="flex items-center justify-center text-white text-2xl leading-none select-none" style={{ background: "rgba(0,0,0,0.55)", borderRadius: "50%", width: 40, height: 40 }}>‹</div>
        </button>

        <button
          onClick={next}
          aria-label="Próxima página"
          className="absolute right-0 top-0 h-full w-16 z-10 flex items-center justify-end pr-2 opacity-0 hover:opacity-100 transition-opacity duration-200 focus:outline-none"
        >
          <div className="flex items-center justify-center text-white text-2xl leading-none select-none" style={{ background: "rgba(0,0,0,0.55)", borderRadius: "50%", width: 40, height: 40 }}>›</div>
        </button>
      </div>

      {/* Bottom toolbar */}
      <div
        style={{ height: TOOLBAR_HEIGHT, background: "#141414", borderTop: "1px solid rgba(255,255,255,0.08)" }}
        className="flex items-center justify-center gap-2 shrink-0 px-4"
      >
        <button
          onClick={prev}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.background = "transparent"; }}
        >
          ◀ Anterior
        </button>

        <div className="flex items-center gap-1" style={{ margin: "0 8px" }}>
          <button
            onClick={zoomOut}
            disabled={zoom <= MIN_ZOOM}
            title="Diminuir zoom"
            style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: zoom <= MIN_ZOOM ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)", cursor: zoom <= MIN_ZOOM ? "not-allowed" : "pointer", background: "transparent", border: "none", fontSize: 18 }}
          >−</button>
          <button
            onClick={() => setZoom(1)}
            title="Redefinir zoom"
            style={{ minWidth: 42, textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.5)", background: "transparent", border: "none", cursor: "pointer", fontVariantNumeric: "tabular-nums" }}
          >{Math.round(zoom * 100)}%</button>
          <button
            onClick={zoomIn}
            disabled={zoom >= MAX_ZOOM}
            title="Aumentar zoom"
            style={{ width: 28, height: 28, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", color: zoom >= MAX_ZOOM ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.65)", cursor: zoom >= MAX_ZOOM ? "not-allowed" : "pointer", background: "transparent", border: "none", fontSize: 18 }}
          >+</button>
        </div>

        <button
          onClick={next}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm"
          style={{ color: "rgba(255,255,255,0.6)" }}
          onMouseEnter={(e) => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.6)"; e.currentTarget.style.background = "transparent"; }}
        >
          Próxima ▶
        </button>
      </div>
    </div>
  );
}
