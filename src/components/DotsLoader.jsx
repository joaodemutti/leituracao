export default function DotsLoader() {
  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 rounded-full bg-current"
          style={{ animation: `heavy-bounce 0.9s ease-in-out ${i * 0.2}s infinite` }}
        />
      ))}
    </span>
  );
}
