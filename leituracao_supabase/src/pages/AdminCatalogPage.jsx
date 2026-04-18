import { useCallback, useEffect, useMemo, useState } from "react";
import { getCurrentUser, isAdminUser } from "../services/AuthService";
import {
  createBook,
  createCategory,
  createCategoryFilter,
  deleteBook,
  deleteCategory,
  deleteCategoryFilter,
  listAdminBooks,
  listAdminCategories,
  listAdminCategoryFilters,
  updateBook,
  updateCategory,
  updateCategoryFilter,
} from "../services/CatalogService";

function parseAdminQuery() {
  const [, queryString = ""] = window.location.hash.split("?");
  const params = new URLSearchParams(queryString);
  return {
    categoryId: params.get("category") || "",
    bookId: params.get("book") || "",
    filterId: params.get("filter") || "",
  };
}

const EMPTY_CATEGORY_FORM = {
  id: "",
  route: "",
  label: "",
  description: "",
  emoji: "",
  color: "",
  bg_color: "",
  eyebrow_class: "",
  badge_class: "",
  sort_order: 0,
  is_active: true,
};

const EMPTY_FILTER_FORM = {
  id: "",
  category_id: "",
  label: "",
  sort_order: 0,
};

const EMPTY_BOOK_FORM = {
  id: "",
  category_id: "",
  filter_id: "",
  title: "",
  author: "",
  summary: "",
  cover_url: "",
  cover_emoji: "",
  badge: "",
  file_size_label: "",
  external_url: "",
  epub_url: "",
  is_free: true,
  is_featured: false,
  featured_rank: "",
  estimated_pages: "",
  is_active: true,
};

function normalizeText(value) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function normalizeInteger(value) {
  if (value === "" || value === null || value === undefined) return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function mapCategoryToForm(category) {
  return {
    id: category.id,
    route: category.route || "",
    label: category.label || "",
    description: category.description || "",
    emoji: category.emoji || "",
    color: category.color || "",
    bg_color: category.bg_color || "",
    eyebrow_class: category.eyebrow_class || "",
    badge_class: category.badge_class || "",
    sort_order: category.sort_order ?? 0,
    is_active: category.is_active ?? true,
  };
}

function mapFilterToForm(filter) {
  return {
    id: filter.id,
    category_id: filter.category_id,
    label: filter.label || "",
    sort_order: filter.sort_order ?? 0,
  };
}

function mapBookToForm(book) {
  return {
    id: book.id,
    category_id: book.category_id,
    filter_id: book.filter_id || "",
    title: book.title || "",
    author: book.author || "",
    summary: book.summary || "",
    cover_url: book.cover_url || "",
    cover_emoji: book.cover_emoji || "",
    badge: book.badge || "",
    file_size_label: book.file_size_label || "",
    external_url: book.external_url || "",
    epub_url: book.epub_url || "",
    is_free: book.is_free ?? true,
    is_featured: book.is_featured ?? false,
    featured_rank: book.featured_rank ?? "",
    estimated_pages: book.estimated_pages ?? "",
    is_active: book.is_active ?? true,
  };
}

function buildCategoryPayload(form) {
  return {
    id: form.id.trim(),
    route: form.route.trim(),
    label: form.label.trim(),
    description: form.description.trim(),
    emoji: normalizeText(form.emoji),
    color: normalizeText(form.color),
    bg_color: normalizeText(form.bg_color),
    eyebrow_class: normalizeText(form.eyebrow_class),
    badge_class: normalizeText(form.badge_class),
    sort_order: normalizeInteger(form.sort_order) ?? 0,
    is_active: Boolean(form.is_active),
  };
}

function buildFilterPayload(form, categoryId) {
  return {
    category_id: categoryId,
    label: form.label.trim(),
    sort_order: normalizeInteger(form.sort_order) ?? 0,
  };
}

function buildBookPayload(form, categoryId) {
  return {
    id: form.id.trim(),
    category_id: categoryId,
    filter_id: form.filter_id || null,
    title: form.title.trim(),
    author: form.author.trim(),
    summary: form.summary.trim(),
    cover_url: normalizeText(form.cover_url),
    cover_emoji: normalizeText(form.cover_emoji),
    badge: normalizeText(form.badge),
    file_size_label: normalizeText(form.file_size_label),
    external_url: normalizeText(form.external_url),
    epub_url: normalizeText(form.epub_url),
    is_free: Boolean(form.is_free),
    is_featured: Boolean(form.is_featured),
    featured_rank: normalizeInteger(form.featured_rank),
    estimated_pages: normalizeInteger(form.estimated_pages),
    is_active: Boolean(form.is_active),
  };
}

export default function AdminCatalogPage() {
  const adminQuery = useMemo(() => parseAdminQuery(), []);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState([]);
  const [filters, setFilters] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [categoryForm, setCategoryForm] = useState(EMPTY_CATEGORY_FORM);
  const [filterForm, setFilterForm] = useState(EMPTY_FILTER_FORM);
  const [bookForm, setBookForm] = useState(EMPTY_BOOK_FORM);
  const [isCreatingCategory, setIsCreatingCategory] = useState(false);
  const [isCreatingFilter, setIsCreatingFilter] = useState(true);
  const [isCreatingBook, setIsCreatingBook] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadCategories = useCallback(async (nextSelectedCategoryId) => {
    const result = await listAdminCategories();
    if (result.error) {
      setError(result.error);
      return null;
    }

    const nextCategories = result.data || [];
    setCategories(nextCategories);

    const resolvedCategoryId =
      nextSelectedCategoryId && nextCategories.some((item) => item.id === nextSelectedCategoryId)
        ? nextSelectedCategoryId
        : nextCategories[0]?.id || "";

    setSelectedCategoryId(resolvedCategoryId);

    if (!resolvedCategoryId) {
      setCategoryForm(EMPTY_CATEGORY_FORM);
      setFilters([]);
      setBooks([]);
      return null;
    }

    const selectedCategory = nextCategories.find((item) => item.id === resolvedCategoryId);
    if (selectedCategory) {
      setCategoryForm(mapCategoryToForm(selectedCategory));
      setIsCreatingCategory(false);
    }

    return resolvedCategoryId;
  }, []);

  const loadCategoryDetails = useCallback(async (categoryId) => {
    if (!categoryId) {
      setFilters([]);
      setBooks([]);
      return;
    }

    const [filtersResult, booksResult] = await Promise.all([
      listAdminCategoryFilters(categoryId),
      listAdminBooks(categoryId),
    ]);

    if (filtersResult.error) {
      setError(filtersResult.error);
      return;
    }

    if (booksResult.error) {
      setError(booksResult.error);
      return;
    }

    setFilters(filtersResult.data || []);
    setBooks(booksResult.data || []);
    setFilterForm({ ...EMPTY_FILTER_FORM, category_id: categoryId });
    setBookForm({ ...EMPTY_BOOK_FORM, category_id: categoryId });
    setIsCreatingFilter(true);
    setIsCreatingBook(true);

    if (adminQuery.filterId) {
      const selectedFilter = (filtersResult.data || []).find((item) => item.id === adminQuery.filterId);
      if (selectedFilter) {
        setFilterForm(mapFilterToForm(selectedFilter));
        setIsCreatingFilter(false);
      }
    }

    if (adminQuery.bookId) {
      const selectedBook = (booksResult.data || []).find((item) => item.id === adminQuery.bookId);
      if (selectedBook) {
        setBookForm(mapBookToForm(selectedBook));
        setIsCreatingBook(false);
      }
    }
  }, [adminQuery.bookId, adminQuery.filterId]);

  useEffect(() => {
    let mounted = true;

    async function bootstrap() {
      setLoading(true);
      setError("");

      const currentUser = await getCurrentUser();
      if (!mounted) return;

      setUser(currentUser);

      if (!isAdminUser(currentUser)) {
        setLoading(false);
        return;
      }

      const initialCategoryId = await loadCategories(adminQuery.categoryId);
      if (!mounted) return;

      await loadCategoryDetails(initialCategoryId);
      if (!mounted) return;

      setLoading(false);
    }

    bootstrap();

    return () => {
      mounted = false;
    };
  }, [adminQuery.categoryId, loadCategories, loadCategoryDetails]);

  async function handleSelectCategory(categoryId) {
    setSelectedCategoryId(categoryId);
    const selectedCategory = categories.find((item) => item.id === categoryId);
    if (selectedCategory) {
      setCategoryForm(mapCategoryToForm(selectedCategory));
      setIsCreatingCategory(false);
    }
    setError("");
    setNotice("");
    await loadCategoryDetails(categoryId);
  }

  async function handleCategorySubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (!categoryForm.id.trim() || !categoryForm.route.trim() || !categoryForm.label.trim() || !categoryForm.description.trim()) {
      setError("Preencha id, rota, titulo e descricao da categoria.");
      setSaving(false);
      return;
    }

    const payload = buildCategoryPayload(categoryForm);
    const result = isCreatingCategory
      ? await createCategory(payload)
      : await updateCategory(categoryForm.id, payload);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    const nextCategoryId = result.data?.id || categoryForm.id;
    await loadCategories(nextCategoryId);
    await loadCategoryDetails(nextCategoryId);
    setNotice(isCreatingCategory ? "Categoria criada." : "Categoria atualizada.");
    setSaving(false);
  }

  async function handleDeleteCategory() {
    if (!selectedCategoryId) return;
    if (!window.confirm("Excluir esta categoria e todos os livros/filtros relacionados?")) return;

    setSaving(true);
    setError("");
    setNotice("");

    const result = await deleteCategory(selectedCategoryId);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    const nextCategoryId = await loadCategories();
    await loadCategoryDetails(nextCategoryId);
    setNotice("Categoria excluida.");
    setSaving(false);
  }

  async function handleFilterSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (!selectedCategoryId || !filterForm.label.trim()) {
      setError("Selecione uma categoria e informe o nome do filtro.");
      setSaving(false);
      return;
    }

    const payload = buildFilterPayload(filterForm, selectedCategoryId);
    const result = isCreatingFilter
      ? await createCategoryFilter(payload)
      : await updateCategoryFilter(filterForm.id, payload);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await loadCategoryDetails(selectedCategoryId);
    setNotice(isCreatingFilter ? "Filtro criado." : "Filtro atualizado.");
    setSaving(false);
  }

  async function handleDeleteFilter(filterId) {
    if (!window.confirm("Excluir este filtro?")) return;

    setSaving(true);
    setError("");
    setNotice("");

    const result = await deleteCategoryFilter(filterId);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await loadCategoryDetails(selectedCategoryId);
    setNotice("Filtro excluido.");
    setSaving(false);
  }

  async function handleBookSubmit(event) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");

    if (!selectedCategoryId || !bookForm.id.trim() || !bookForm.title.trim() || !bookForm.author.trim() || !bookForm.summary.trim()) {
      setError("Preencha id, titulo, autor e resumo do livro.");
      setSaving(false);
      return;
    }

    const payload = buildBookPayload(bookForm, selectedCategoryId);
    const result = isCreatingBook
      ? await createBook(payload)
      : await updateBook(bookForm.id, payload);

    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await loadCategoryDetails(selectedCategoryId);
    setNotice(isCreatingBook ? "Livro criado." : "Livro atualizado.");
    setSaving(false);
  }

  async function handleDeleteBook(bookId) {
    if (!window.confirm("Excluir este livro?")) return;

    setSaving(true);
    setError("");
    setNotice("");

    const result = await deleteBook(bookId);
    if (result.error) {
      setError(result.error);
      setSaving(false);
      return;
    }

    await loadCategoryDetails(selectedCategoryId);
    setNotice("Livro excluido.");
    setSaving(false);
  }

  if (loading) {
    return <div className="p-8 text-center">Carregando painel...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-navy mb-4">Acesso restrito</h1>
          <p className="text-gray-600 mb-6">Voce precisa estar autenticado para acessar esta pagina.</p>
          <button
            onClick={() => {
              window.location.hash = "login";
            }}
            className="px-6 py-2 bg-blue text-white rounded font-semibold hover:bg-blue/90"
          >
            Fazer login
          </button>
        </div>
      </div>
    );
  }

  if (!isAdminUser(user)) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-center max-w-lg px-4">
          <h1 className="text-2xl font-bold text-navy mb-4">Acesso restrito</h1>
          <p className="text-gray-600 mb-6">
            Esta area exige a role `admin` no `app_metadata` do usuario autenticado.
          </p>
          <button
            onClick={() => {
              window.location.hash = "profile";
            }}
            className="px-6 py-2 bg-blue text-white rounded font-semibold hover:bg-blue/90"
          >
            Voltar ao perfil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream py-8 px-4">
      <div className="container max-w-7xl space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-2">
            Admin
          </p>
          <h1 className="text-3xl font-serif font-bold text-navy">Gestao de catalogo</h1>
          <p className="text-gray-600 mt-2">
            Edite categorias, filtros e livros usando a role `admin` protegida por RLS.
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {notice && (
          <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {notice}
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="bg-white rounded-lg shadow-md p-4 h-fit">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-navy">Categorias</h2>
              <button
                type="button"
                onClick={() => {
                  setIsCreatingCategory(true);
                  setSelectedCategoryId("");
                  setCategoryForm(EMPTY_CATEGORY_FORM);
                  setFilters([]);
                  setBooks([]);
                  setFilterForm(EMPTY_FILTER_FORM);
                  setBookForm(EMPTY_BOOK_FORM);
                  setError("");
                  setNotice("");
                }}
                className="px-3 py-1.5 rounded bg-blue text-white text-sm font-semibold hover:bg-blue/90"
              >
                Nova
              </button>
            </div>

            <div className="space-y-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => {
                    handleSelectCategory(category.id);
                  }}
                  className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                    selectedCategoryId === category.id && !isCreatingCategory
                      ? "border-blue bg-blue-soft"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-semibold text-navy">{category.label}</span>
                    {!category.is_active && (
                      <span className="text-xs font-semibold text-red-600">Inativa</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{category.route}</p>
                </button>
              ))}
            </div>
          </aside>

          <div className="space-y-6">
            <section className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-navy">
                  {isCreatingCategory ? "Nova categoria" : "Editar categoria"}
                </h2>
                {!isCreatingCategory && selectedCategoryId && (
                  <button
                    type="button"
                    onClick={handleDeleteCategory}
                    disabled={saving}
                    className="text-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50"
                  >
                    Excluir categoria
                  </button>
                )}
              </div>

              <form onSubmit={handleCategorySubmit} className="grid gap-4 md:grid-cols-2">
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">ID</span>
                  <input
                    value={categoryForm.id}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, id: event.target.value }))}
                    disabled={!isCreatingCategory}
                    className="w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                    required
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Rota</span>
                  <input
                    value={categoryForm.route}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, route: event.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm text-gray-700 md:col-span-2">
                  <span className="block mb-1 font-medium">Titulo</span>
                  <input
                    value={categoryForm.label}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, label: event.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm text-gray-700 md:col-span-2">
                  <span className="block mb-1 font-medium">Descricao</span>
                  <textarea
                    value={categoryForm.description}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, description: event.target.value }))
                    }
                    rows={3}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                    required
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Emoji</span>
                  <input
                    value={categoryForm.emoji}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, emoji: event.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Ordem</span>
                  <input
                    type="number"
                    value={categoryForm.sort_order}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, sort_order: event.target.value }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Cor</span>
                  <input
                    value={categoryForm.color}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, color: event.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Fundo</span>
                  <input
                    value={categoryForm.bg_color}
                    onChange={(event) => setCategoryForm((current) => ({ ...current, bg_color: event.target.value }))}
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Eyebrow class</span>
                  <input
                    value={categoryForm.eyebrow_class}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, eyebrow_class: event.target.value }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="text-sm text-gray-700">
                  <span className="block mb-1 font-medium">Badge class</span>
                  <input
                    value={categoryForm.badge_class}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, badge_class: event.target.value }))
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-gray-700 md:col-span-2">
                  <input
                    type="checkbox"
                    checked={categoryForm.is_active}
                    onChange={(event) =>
                      setCategoryForm((current) => ({ ...current, is_active: event.target.checked }))
                    }
                  />
                  Categoria ativa
                </label>
                <div className="md:col-span-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-4 py-2 rounded bg-blue text-white font-semibold hover:bg-blue/90 disabled:opacity-50"
                  >
                    {isCreatingCategory ? "Criar categoria" : "Salvar categoria"}
                  </button>
                  {!isCreatingCategory && (
                    <button
                      type="button"
                      onClick={() => {
                        const selectedCategory = categories.find((item) => item.id === selectedCategoryId);
                        if (selectedCategory) {
                          setCategoryForm(mapCategoryToForm(selectedCategory));
                        }
                      }}
                      className="px-4 py-2 rounded border border-gray-300 font-semibold text-gray-700"
                    >
                      Reverter
                    </button>
                  )}
                </div>
              </form>
            </section>

            <section className="grid gap-6 xl:grid-cols-2">
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-navy">Filtros</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setFilterForm({ ...EMPTY_FILTER_FORM, category_id: selectedCategoryId });
                      setIsCreatingFilter(true);
                    }}
                    disabled={!selectedCategoryId}
                    className="px-3 py-1.5 rounded bg-blue text-white text-sm font-semibold hover:bg-blue/90 disabled:opacity-50"
                  >
                    Novo
                  </button>
                </div>

                <div className="space-y-2 mb-4">
                  {filters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between rounded border border-gray-200 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setFilterForm(mapFilterToForm(filter));
                          setIsCreatingFilter(false);
                        }}
                        className="text-left"
                      >
                        <p className="font-medium text-navy">{filter.label}</p>
                        <p className="text-sm text-gray-500">Ordem {filter.sort_order}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleDeleteFilter(filter.id);
                        }}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleFilterSubmit} className="space-y-4">
                  <label className="text-sm text-gray-700 block">
                    <span className="block mb-1 font-medium">Nome</span>
                    <input
                      value={filterForm.label}
                      onChange={(event) => setFilterForm((current) => ({ ...current, label: event.target.value }))}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>
                  <label className="text-sm text-gray-700 block">
                    <span className="block mb-1 font-medium">Ordem</span>
                    <input
                      type="number"
                      value={filterForm.sort_order}
                      onChange={(event) =>
                        setFilterForm((current) => ({ ...current, sort_order: event.target.value }))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <div className="flex gap-3">
                    <button
                      type="submit"
                      disabled={saving || !selectedCategoryId}
                      className="px-4 py-2 rounded bg-blue text-white font-semibold hover:bg-blue/90 disabled:opacity-50"
                    >
                      {isCreatingFilter ? "Criar filtro" : "Salvar filtro"}
                    </button>
                    {!isCreatingFilter && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilterForm({ ...EMPTY_FILTER_FORM, category_id: selectedCategoryId });
                          setIsCreatingFilter(true);
                        }}
                        className="px-4 py-2 rounded border border-gray-300 font-semibold text-gray-700"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-navy">Livros</h2>
                  <button
                    type="button"
                    onClick={() => {
                      setBookForm({ ...EMPTY_BOOK_FORM, category_id: selectedCategoryId });
                      setIsCreatingBook(true);
                    }}
                    disabled={!selectedCategoryId}
                    className="px-3 py-1.5 rounded bg-blue text-white text-sm font-semibold hover:bg-blue/90 disabled:opacity-50"
                  >
                    Novo
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto space-y-2 mb-4">
                  {books.map((book) => (
                    <div
                      key={book.id}
                      className="flex items-start justify-between gap-3 rounded border border-gray-200 px-3 py-2"
                    >
                      <button
                        type="button"
                        onClick={() => {
                          setBookForm(mapBookToForm(book));
                          setIsCreatingBook(false);
                        }}
                        className="text-left"
                      >
                        <p className="font-medium text-navy">{book.title}</p>
                        <p className="text-sm text-gray-500">
                          {book.author} · {book.id}
                        </p>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          handleDeleteBook(book.id);
                        }}
                        className="text-sm font-semibold text-red-600 hover:text-red-700"
                      >
                        Excluir
                      </button>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleBookSubmit} className="grid gap-4 md:grid-cols-2">
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">ID</span>
                    <input
                      value={bookForm.id}
                      onChange={(event) => setBookForm((current) => ({ ...current, id: event.target.value }))}
                      disabled={!isCreatingBook}
                      className="w-full rounded border border-gray-300 px-3 py-2 disabled:bg-gray-100"
                      required
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">Filtro</span>
                    <select
                      value={bookForm.filter_id}
                      onChange={(event) => setBookForm((current) => ({ ...current, filter_id: event.target.value }))}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    >
                      <option value="">Sem filtro</option>
                      {filters.map((filter) => (
                        <option key={filter.id} value={filter.id}>
                          {filter.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="text-sm text-gray-700 md:col-span-2">
                    <span className="block mb-1 font-medium">Titulo</span>
                    <input
                      value={bookForm.title}
                      onChange={(event) => setBookForm((current) => ({ ...current, title: event.target.value }))}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>
                  <label className="text-sm text-gray-700 md:col-span-2">
                    <span className="block mb-1 font-medium">Autor</span>
                    <input
                      value={bookForm.author}
                      onChange={(event) => setBookForm((current) => ({ ...current, author: event.target.value }))}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>
                  <label className="text-sm text-gray-700 md:col-span-2">
                    <span className="block mb-1 font-medium">Resumo</span>
                    <textarea
                      rows={4}
                      value={bookForm.summary}
                      onChange={(event) => setBookForm((current) => ({ ...current, summary: event.target.value }))}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                      required
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">URL externa</span>
                    <input
                      value={bookForm.external_url}
                      onChange={(event) =>
                        setBookForm((current) => ({ ...current, external_url: event.target.value }))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">EPUB URL</span>
                    <input
                      value={bookForm.epub_url}
                      onChange={(event) => setBookForm((current) => ({ ...current, epub_url: event.target.value }))}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">Capa URL</span>
                    <input
                      value={bookForm.cover_url}
                      onChange={(event) => setBookForm((current) => ({ ...current, cover_url: event.target.value }))}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">Emoji capa</span>
                    <input
                      value={bookForm.cover_emoji}
                      onChange={(event) =>
                        setBookForm((current) => ({ ...current, cover_emoji: event.target.value }))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">Badge</span>
                    <input
                      value={bookForm.badge}
                      onChange={(event) => setBookForm((current) => ({ ...current, badge: event.target.value }))}
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">Tamanho</span>
                    <input
                      value={bookForm.file_size_label}
                      onChange={(event) =>
                        setBookForm((current) => ({ ...current, file_size_label: event.target.value }))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">Paginas</span>
                    <input
                      type="number"
                      value={bookForm.estimated_pages}
                      onChange={(event) =>
                        setBookForm((current) => ({ ...current, estimated_pages: event.target.value }))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <label className="text-sm text-gray-700">
                    <span className="block mb-1 font-medium">Ordem destaque</span>
                    <input
                      type="number"
                      value={bookForm.featured_rank}
                      onChange={(event) =>
                        setBookForm((current) => ({ ...current, featured_rank: event.target.value }))
                      }
                      className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                  </label>
                  <div className="md:col-span-2 flex flex-wrap gap-4 text-sm text-gray-700">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bookForm.is_free}
                        onChange={(event) =>
                          setBookForm((current) => ({ ...current, is_free: event.target.checked }))
                        }
                      />
                      Gratuito
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bookForm.is_featured}
                        onChange={(event) =>
                          setBookForm((current) => ({ ...current, is_featured: event.target.checked }))
                        }
                      />
                      Destaque
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={bookForm.is_active}
                        onChange={(event) =>
                          setBookForm((current) => ({ ...current, is_active: event.target.checked }))
                        }
                      />
                      Ativo
                    </label>
                  </div>
                  <div className="md:col-span-2 flex gap-3">
                    <button
                      type="submit"
                      disabled={saving || !selectedCategoryId}
                      className="px-4 py-2 rounded bg-blue text-white font-semibold hover:bg-blue/90 disabled:opacity-50"
                    >
                      {isCreatingBook ? "Criar livro" : "Salvar livro"}
                    </button>
                    {!isCreatingBook && (
                      <button
                        type="button"
                        onClick={() => {
                          setBookForm({ ...EMPTY_BOOK_FORM, category_id: selectedCategoryId });
                          setIsCreatingBook(true);
                        }}
                        className="px-4 py-2 rounded border border-gray-300 font-semibold text-gray-700"
                      >
                        Cancelar
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
