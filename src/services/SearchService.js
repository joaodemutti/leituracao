import { searchBooks as searchBooksFromCatalog } from "./CatalogService.js";

export async function searchBooks(rawQuery) {
  return searchBooksFromCatalog(rawQuery);
}

export function filterByCategory(books, filter) {
  if (filter === "Todos") return books;
  return books.filter((book) => book.cat === filter || book.tags?.includes(filter));
}
