export default function DotsLoader() {
  return (
    <span className="inline-flex items-center gap-0.5 align-middle">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: `${i * 0.16}s` }}
        />
      ))}
    </span>
  );
}
