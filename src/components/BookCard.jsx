import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isAdminUser, refreshCurrentUser } from "../services/AuthService";
import { canOpenInReader } from "../services/CatalogService";

export default function BookCard({ book }) {
  const [isOpen, setIsOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const navigate = useNavigate();

  const primaryHref = useMemo(
    () => (book.pdfUrl || book.url || book.externalUrl ? book.pdfUrl || book.url || book.externalUrl : null),
    [book.externalUrl, book.pdfUrl, book.url],
  );
  const canUseReader = useMemo(() => canOpenInReader(book), [book]);

  useEffect(() => {
    let mounted = true;
    refreshCurrentUser().then((user) => {
      if (mounted) setCanEdit(isAdminUser(user));
    });
    return () => {
      mounted = false;
    };
  }, []);

  const openReader = () => {
    navigate(`/reader?book=${book.id}`);
  };

  const openAdminEditor = (event) => {
    event.stopPropagation();
    navigate(`/admin?category=${encodeURIComponent(book.categoryId || "")}&book=${encodeURIComponent(book.id)}`);
  };

  return (
    <>
      <article
        onClick={() => setIsOpen(true)}
        className="cursor-pointer overflow-hidden rounded-[26px] border border-[#e8dfcf] bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
      >
        <div className="relative flex aspect-[0.9] items-center justify-center overflow-hidden bg-gradient-to-br from-[#f0f5ff] via-[#f7eadc] to-[#f7f4ee]">
          {book.coverUrl ? (
            <img
              src={book.coverUrl}
              alt={book.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="text-center">
              <div className="text-5xl">{book.emoji || "Livro"}</div>
            </div>
          )}
          {book.badge && (
            <span className="absolute left-3 top-3 rounded-full bg-crimson-dark px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              {book.badge}
            </span>
          )}
        </div>

        <div className="p-4">
          <h3 className="line-clamp-2 min-h-[56px] text-xl font-semibold leading-tight text-crimson">
            {book.title}
          </h3>
          <p className="mt-2 text-sm text-[#697789]">{book.author}</p>
          <p className="mt-3 line-clamp-3 min-h-[60px] text-sm text-[#5d697a]">
            {book.summary || book.description}
          </p>

          {book.tags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {book.tags.slice(0, 2).map((tag) => (
                <span key={tag} className="rounded-full bg-secondary-light px-3 py-1 text-xs font-medium text-secondary">
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="mt-5 grid gap-2">
            <button
              onClick={(event) => {
                event.stopPropagation();
                if (canUseReader) {
                  openReader();
                  return;
                }
                setIsOpen(true);
              }}
              className="rounded-full bg-crimson px-4 py-3 text-sm font-semibold text-white"
            >
              {canUseReader ? "Ler agora" : "Ver detalhes"}
            </button>
            {canEdit && (
              <button
                onClick={openAdminEditor}
                className="rounded-full border border-[#d8d0c1] px-4 py-2.5 text-sm font-semibold text-crimson"
              >
                Editar livro
              </button>
            )}
          </div>
        </div>
      </article>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-crimson/45 px-4">
          <div className="max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-[32px] bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-secondary">Livro do acervo</p>
                <h2 className="mt-2 font-serif text-4xl text-crimson">{book.title}</h2>
                <p className="mt-2 text-sm text-[#6d7989]">{book.author}</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full border border-[#ddd4c5] px-4 py-2 text-sm font-medium text-[#627081]"
              >
                Fechar
              </button>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
              <div className="overflow-hidden rounded-[24px] bg-[#f3f7ff]">
                {book.coverUrl ? (
                  <img src={book.coverUrl} alt={book.title} className="aspect-[0.9] h-full w-full object-cover" />
                ) : (
                  <div className="flex aspect-[0.9] items-center justify-center text-6xl">{book.emoji || "Livro"}</div>
                )}
              </div>

              <div>
                <p className="text-base leading-7 text-[#516071]">{book.description || book.summary}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  {canUseReader ? (
                    <button
                      onClick={openReader}
                      className="rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white"
                    >
                      Abrir no leitor
                    </button>
                  ) : primaryHref ? (
                    <a
                      href={primaryHref}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white"
                    >
                      Abrir livro
                    </a>
                  ) : null}

                  {canEdit && (
                    <button
                      onClick={openAdminEditor}
                      className="rounded-full border border-[#d8d0c1] px-5 py-3 text-sm font-semibold text-crimson"
                    >
                      Editar
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
