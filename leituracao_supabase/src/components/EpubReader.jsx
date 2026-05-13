import { useEffect, useRef, useCallback } from "react";
import ePub from "epubjs";

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
      width: "100%",
      height: "100%",
      spread: "auto",
      flow: "paginated",
    });
    renditionRef.current = rendition;
    if (onRendition) onRendition(rendition);

    rendition.display(initialLocation || undefined);

    book.ready.then(() => {
      const loc = rendition.currentLocation();
      if (loc && onLocationChange) onLocationChange(loc, book.spine.items || []);

      const el = containerRef.current;
      const w = el?.clientWidth || window.innerWidth;
      const h = el?.clientHeight || window.innerHeight;
      const charsPerPage = Math.max(600, Math.floor((w * h) / 1000));
      return book.locations.generate(charsPerPage);
    }).then(() => {
      const total = book.locations.total;
      if (total > 0 && onReady) onReady(total);
    }).catch(() => {});

    rendition.on("relocated", (location) => {
      if (onLocationChange) onLocationChange(location, rendition.book.spine.items || []);
    });

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
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      <div ref={containerRef} style={{ width: "100%", height: "100%" }} />
      <button
        onClick={prev}
        style={{ position: "absolute", left: 0, top: 0, width: "30%", height: "100%", opacity: 0, cursor: "pointer" }}
      />
      <button
        onClick={next}
        style={{ position: "absolute", right: 0, top: 0, width: "30%", height: "100%", opacity: 0, cursor: "pointer" }}
      />
    </div>
  );
}
