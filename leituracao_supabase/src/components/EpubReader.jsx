import { useEffect, useRef, useCallback, useState } from "react";
import ePub from "epubjs";

const TOOLBAR_HEIGHT = 48;
const PAD = 8;
const MIN_ZOOM = 0.75;
const MAX_ZOOM = 2.0;
const ZOOM_STEP = 0.1;

// Fixed baseline for page counting — device-independent
const COUNT_W = 600;
const COUNT_H = 800;


function stripEpubCss(contents) {
  const doc = contents.document;

  // Force the iframe to treat itself as COUNT_W wide — prevents iOS Safari
  // from applying the mobile viewport and reflowing content differently
  let viewportMeta = doc.querySelector('meta[name="viewport"]');
  if (!viewportMeta) {
    viewportMeta = doc.createElement("meta");
    viewportMeta.name = "viewport";
    doc.head.appendChild(viewportMeta);
  }
  viewportMeta.content = `width=${COUNT_W}, initial-scale=1`;

  doc.querySelectorAll('link[rel="stylesheet"], link[type="text/css"]').forEach((el) => el.remove());
  doc.querySelectorAll("style").forEach((el) => el.remove());


  const style = doc.createElement("style");
  const fontBase = `${window.location.origin}/fonts`;
  style.textContent = `
    @font-face {
      font-family: "Lora";
      src: url('${fontBase}/lora-400.woff2') format('woff2');
      font-weight: 400; font-style: normal;
    }
    @font-face {
      font-family: "Lora";
      src: url('${fontBase}/lora-700.woff2') format('woff2');
      font-weight: 700; font-style: normal;
    }
    @font-face {
      font-family: "Lora";
      src: url('${fontBase}/lora-400-italic.woff2') format('woff2');
      font-weight: 400; font-style: italic;
    }
    html {
      -webkit-text-size-adjust: 100% !important;
      text-size-adjust: 100% !important;
    }
    html, body {
      background: #fff !important;
      color: #111 !important;
      margin: 0 !important;
      padding: 8px !important;
      font-family: "Lora", Georgia, serif !important;
      font-size: 16px !important;
      line-height: 27px !important;
      font-kerning: none !important;
      font-synthesis: none !important;
      text-rendering: optimizeSpeed !important;
      letter-spacing: 0 !important;
      -webkit-font-smoothing: antialiased !important;
      -moz-osx-font-smoothing: grayscale !important;
    }
    img, svg {
      max-width: 100% !important;
      max-height: ${COUNT_H - 16}px !important;
      height: auto !important;
      display: block !important;
    }
    p { margin: 0 0 13px !important; }
    h1, h2, h3, h4, h5, h6 { margin: 14px 0 7px !important; }
  `;
  doc.head.appendChild(style);
}

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
  r.hooks.content.register(stripEpubCss);

  const perChapter = [];
  let total = 0;
  for (const item of items) {
    try {
      await r.display(item.href);
      // Wait for fonts to load in the iframe before measuring
      try {
        const iframe = el.querySelector("iframe");
        if (iframe?.contentDocument?.fonts) await iframe.contentDocument.fonts.ready;
      } catch { /* ignore */ }
      const loc = r.currentLocation();
      const pages = loc?.start?.displayed?.total || 1;
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

export default function EpubReader({ url, initialLocation, onLocationChange, onReady, onRendition, navigateRef }) {
  const containerRef = useRef(null);
  const wrapperRef = useRef(null);
  const renditionRef = useRef(null);
  const bookRef = useRef(null);

  const [size, setSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const lastSizeRef = useRef({ w: 0, h: 0 });

  // Always render at the fixed page size so content never reflows
  const renderW = COUNT_W;
  const renderH = COUNT_H;

  // Scale to fit the container, then multiply by zoom
  const fitScale = size.width > 0
    ? Math.min(size.width / COUNT_W, size.height / COUNT_H)
    : 1;
  const totalScale = fitScale * zoom;

  const manualChapterPageRef = useRef(1);
  const prevChapterIdxRef = useRef(null);
  const navDirectionRef = useRef(0); // 1 = forward, -1 = backward

  const next = useCallback(() => {
    manualChapterPageRef.current += 1;
    navDirectionRef.current = 1;
    renditionRef.current?.next();
  }, []);

  const prev = useCallback(() => {
    manualChapterPageRef.current -= 1;
    navDirectionRef.current = -1;
    renditionRef.current?.prev();
  }, []);

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
    rendition.hooks.content.register(stripEpubCss);
    lastSizeRef.current = { w: renderW, h: renderH };
    if (onRendition) onRendition(rendition);

    rendition.display(initialLocation || undefined);

    rendition.on("relocated", (location) => {
      if (onLocationChange) {
        const chapterIdx = location.start.index ?? 0;
        if (chapterIdx !== prevChapterIdxRef.current) {
          // Going backward lands on the last page of the previous chapter.
          // iOS always reports displayed.page=1 so we use displayed.total instead.
          const goingBack = navDirectionRef.current === -1;
          manualChapterPageRef.current = goingBack
            ? (location.start.displayed?.total ?? 1)
            : (location.start.displayed?.page ?? 1);
          prevChapterIdxRef.current = chapterIdx;
          navDirectionRef.current = 0;
        } else {
          // Same chapter — clamp manual counter to valid range
          const total = location.start.displayed?.total ?? 1;
          manualChapterPageRef.current = Math.max(1, Math.min(total, manualChapterPageRef.current));
        }
        onLocationChange(location, rendition.book.spine.items || [], manualChapterPageRef.current);
      }
    });

    book.ready
      .then(() => countAllPages(book))
      .then(({ total, perChapter }) => { if (onReady) onReady(total, perChapter); })
      .catch(() => { });

    const handleKey = (e) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") next();
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") prev();
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

  const navigateToPage = useCallback(async (chapterIdx, pageWithinChapter) => {
    const spine = bookRef.current?.spine;
    if (!spine || !renditionRef.current) return;
    const spineItem = spine.items[chapterIdx];
    if (!spineItem) return;
    navDirectionRef.current = 0;
    prevChapterIdxRef.current = chapterIdx;
    manualChapterPageRef.current = pageWithinChapter;
    await renditionRef.current.display(spineItem.href);
    for (let i = 1; i < pageWithinChapter; i++) {
      manualChapterPageRef.current = i + 1;
      await renditionRef.current.next();
    }
  }, []);

  if (navigateRef) navigateRef.current = navigateToPage;

  const zoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, Math.round((z - ZOOM_STEP) * 10) / 10));
  const zoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, Math.round((z + ZOOM_STEP) * 10) / 10));

  return (
    <div ref={wrapperRef} className="flex flex-col w-full flex-1 min-h-0" style={{ background: "#2a2a2a" }}>

      {/* Book viewport */}
      <div className="flex-1 relative overflow-hidden">
        <div className="absolute inset-0 overflow-auto" style={{ padding: PAD }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minWidth: "100%", minHeight: "100%" }}>
            {/* Size proxy — scaled visual size of the fixed-dimension page */}
            <div
              style={{
                width: COUNT_W * totalScale,
                height: COUNT_H * totalScale,
                position: "relative",
                flexShrink: 0,
                boxShadow: "0 8px 40px rgba(0,0,0,0.6)",
              }}
            >
              {/* Epub always renders at COUNT_W×COUNT_H, scaled to fit+zoom */}
              <div
                ref={containerRef}
                style={{
                  width: renderW,
                  height: renderH,
                  transform: `scale(${totalScale})`,
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
          <span className="select-none">◀ Anterior</span>
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
          <span className="select-none">Próxima ▶</span>
        </button>
      </div>
    </div>
  );
}
