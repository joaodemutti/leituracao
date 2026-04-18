import { supabase } from "../lib/supabase.js";

function isHttpAssetUrl(value) {
  if (!value) return false;

  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isEpubAssetUrl(value) {
  if (!isHttpAssetUrl(value)) return false;
  return new URL(value).pathname.toLowerCase().includes(".epub");
}

function isPdfAssetUrl(value) {
  if (!isHttpAssetUrl(value)) return false;
  return new URL(value).pathname.toLowerCase().includes(".pdf");
}

function mapBook(row, filterMap = new Map()) {
  const filterLabel = row.filter_id ? filterMap.get(row.filter_id) || null : null;
  return {
    id: row.id,
    categoryId: row.category_id,
    title: row.title,
    author: row.author,
    summary: row.summary,
    description: row.summary,
    coverUrl: row.cover_url,
    coverImage: row.cover_url,
    coverEmoji: row.cover_emoji,
    emoji: row.cover_emoji,
    badge: row.badge,
    size: row.file_size_label,
    url: row.external_url,
    externalUrl: row.external_url,
    pdfUrl: row.pdf_url,
    epubUrl: row.epub_url,
    estimatedPages: row.estimated_pages,
    totalPages: row.estimated_pages,
    tags: filterLabel ? [filterLabel] : [],
    cat: filterLabel,
    isFeatured: row.is_featured,
    featuredRank: row.featured_rank,
  };
}

function mapCategory(row, filters = [], stats = {}) {
  return {
    id: row.id,
    route: row.route,
    label: row.label,
    desc: row.description,
    emoji: row.emoji,
    color: row.color,
    bg: row.bg_color,
    eyebrowClass: row.eyebrow_class,
    badgeClass: row.badge_class,
    filters: ["Todos", ...filters],
    stats: {
      total: stats.total || 0,
      free: stats.free || 0,
      authors: stats.authors || 0,
    },
  };
}

async function fetchCategoryFilters(categoryId) {
  const { data, error } = await supabase
    .from("filtros_categoria")
    .select("id, label, sort_order")
    .eq("category_id", categoryId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data || [];
}

async function fetchCategoryStats(categoryId) {
  const { data, error } = await supabase
    .from("livros")
    .select("id, author, is_free")
    .eq("category_id", categoryId)
    .eq("is_active", true);

  if (error) throw error;

  const authors = new Set((data || []).map((book) => book.author));
  return {
    total: data?.length || 0,
    free: (data || []).filter((book) => book.is_free).length,
    authors: authors.size,
  };
}

export async function listCategories() {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) return { error: error.message };

  try {
    const categories = await Promise.all(
      (data || []).map(async (row) => {
        const [filters, stats] = await Promise.all([
          fetchCategoryFilters(row.id),
          fetchCategoryStats(row.id),
        ]);
        return mapCategory(
          row,
          filters.map((filter) => filter.label),
          stats,
        );
      }),
    );

    return { data: categories };
  } catch (fetchError) {
    return { error: fetchError.message };
  }
}

export async function getCategoryByRoute(route) {
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .eq("route", route)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return { error: "Categoria nao encontrada." };
    return { error: error.message };
  }

  try {
    const [filters, stats] = await Promise.all([
      fetchCategoryFilters(data.id),
      fetchCategoryStats(data.id),
    ]);

    return {
      data: mapCategory(
        data,
        filters.map((filter) => filter.label),
        stats,
      ),
    };
  } catch (fetchError) {
    return { error: fetchError.message };
  }
}

export async function listCategoryFilters(categoryId) {
  try {
    const filters = await fetchCategoryFilters(categoryId);
    return { data: filters.map((filter) => filter.label) };
  } catch (error) {
    return { error: error.message };
  }
}

export async function listBooksByCategory(route, filter = "Todos") {
  const categoryResult = await getCategoryByRoute(route);
  if (categoryResult.error) return categoryResult;

  try {
    const category = categoryResult.data;
    const filtersResult = await fetchCategoryFilters(category.id);
    const filterMap = new Map(filtersResult.map((item) => [item.id, item.label]));

    let query = supabase
      .from("livros")
      .select("*")
      .eq("category_id", category.id)
      .eq("is_active", true)
      .order("is_featured", { ascending: false })
      .order("featured_rank", { ascending: true })
      .order("title", { ascending: true });

    if (filter && filter !== "Todos") {
      const filterRow = filtersResult.find((item) => item.label === filter);
      if (!filterRow) {
        return { data: [] };
      }
      query = query.eq("filter_id", filterRow.id);
    }

    const { data, error } = await query;
    if (error) return { error: error.message };

    return { data: (data || []).map((row) => mapBook(row, filterMap)), category };
  } catch (error) {
    return { error: error.message };
  }
}

export async function getBookById(bookId) {
  const { data, error } = await supabase
    .from("livros")
    .select("*")
    .eq("id", bookId)
    .eq("is_active", true)
    .single();

  if (error) {
    if (error.code === "PGRST116") return { error: "Livro nao encontrado." };
    return { error: error.message };
  }

  let filterMap = new Map();
  if (data.filter_id) {
    const { data: filters } = await supabase
      .from("filtros_categoria")
      .select("id, label")
      .eq("category_id", data.category_id);
    filterMap = new Map((filters || []).map((item) => [item.id, item.label]));
  }

  return { data: mapBook(data, filterMap) };
}

export async function listFeaturedBooks(limit = 6) {
  const { data, error } = await supabase
    .from("livros")
    .select("*")
    .eq("is_featured", true)
    .eq("is_active", true)
    .order("featured_rank", { ascending: true })
    .limit(limit);

  if (error) return { error: error.message };
  return { data: (data || []).map((row) => mapBook(row)) };
}

export async function searchBooks(rawQuery) {
  const query = rawQuery.trim();
  if (!query) return { data: [] };

  const { data, error } = await supabase
    .from("livros")
    .select("*")
    .eq("is_active", true)
    .or(`title.ilike.%${query}%,author.ilike.%${query}%,summary.ilike.%${query}%`)
    .order("is_featured", { ascending: false })
    .order("title", { ascending: true })
    .limit(20);

  if (error) return { error: error.message };
  return { data: (data || []).map((row) => mapBook(row)) };
}

export function resolveEpubUrl(book) {
  const candidates = [book?.epubUrl, book?.url, book?.externalUrl];
  return candidates.find((value) => isEpubAssetUrl(value)) || null;
}

export function resolvePdfUrl(book) {
  const candidates = [book?.pdfUrl, book?.url, book?.externalUrl];
  return candidates.find((value) => isPdfAssetUrl(value)) || null;
}

export function getReaderSource(book) {
  const epubUrl = resolveEpubUrl(book);
  if (epubUrl) {
    return { type: "epub", url: epubUrl };
  }

  const pdfUrl = resolvePdfUrl(book);
  if (pdfUrl) {
    return { type: "pdf", url: pdfUrl };
  }

  return null;
}

export function canOpenInReader(book) {
  return Boolean(getReaderSource(book));
}
