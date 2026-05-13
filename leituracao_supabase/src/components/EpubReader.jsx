import { useEffect, useRef, useCallback } from "react";
import ePub from "epubjs";

const PAGE_WIDTH = 600;
const PAGE_HEIGHT = 840;

async function countAllPages(book) {
  const items = book.spine.spineItems || [];
  if (items.length === 0) return 0;

  const el = document.createElement("div");
  el.style.cssText = `position:absolute;left:-9999px;top:-9999px;width:${PAGE_WIDTH}px;height:${PAGE_HEIGHT}px;visibility:hidden;overflow:hidden;`;
  document.body.appendChild(el);

  const r = book.renderTo(el, {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
    spread: "none",
    flow: "paginated",
  });

  let total = 0;
  for (const item of items) {
    try {
      await r.display(item.href);
      const loc = r.currentLocation();
      total += loc?.start?.displayed?.total ?? 1;
    } catch {
      total += 1;
    }
  }

  r.destroy();
  el.remove();
  return total;
}

export default function EpubReader({ url, initialLocation, onLocationChange, onReady, onRendition }) {
  const containerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);

  const next = useCallback(() => renditionRef.current?.next(), []);
  const prev = useCallback(() => renditionRef.current?.prev(), []);

  useEffect(() => {
    if (!containerRef.current || !url) return;

    const book = ePub(url);
    bookRef.current = book;

    const rendition = book.renderTo(containerRef.current, {
      width: PAGE_WIDTH,
      height: PAGE_HEIGHT,
      spread: "none",
      flow: "paginated",
    });
    renditionRef.current = rendition;
    if (onRendition) onRendition(rendition);

    rendition.display(initialLocation || undefined);

    rendition.on("relocated", (location) => {
      if (onLocationChange) onLocationChange(location, rendition.book.spine.items || []);
    });

    book.ready.then(() => countAllPages(book)).then((total) => {
      if (onReady) onReady(total);
    }).catch(() => {});

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
  }, [url]);

  return (
    <div style={{ width: "100%", minHeight: "100%", overflow: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "16px 0" }}>
      <div style={{ position: "relative", width: PAGE_WIDTH, height: PAGE_HEIGHT, flexShrink: 0 }}>
        <div ref={containerRef} style={{ width: PAGE_WIDTH, height: PAGE_HEIGHT }} />
        <button
          onClick={prev}
          style={{ position: "absolute", left: 0, top: 0, width: "30%", height: "100%", opacity: 0, cursor: "pointer" }}
        />
        <button
          onClick={next}
          style={{ position: "absolute", right: 0, top: 0, width: "30%", height: "100%", opacity: 0, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}
