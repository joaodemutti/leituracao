const AUTH_PAGES = new Set(["login", "register"]);

export default function AppFooter({ currentPage }) {
  const isAuthPage = AUTH_PAGES.has(currentPage);

  return (
    <footer className="bg-[#07111f] text-white/65">
      <div className="container flex flex-col gap-2 py-5 text-xs sm:flex-row sm:items-center sm:justify-between">
        <p>&copy; 2026 LeiturAcao ONG</p>
        <p>{isAuthPage ? "Seus dados estao protegidos - RNF03" : "Feito com carinho para quem mais precisa"}</p>
      </div>
    </footer>
  );
}
