begin;

with gutenberg_links as (
  select
    id,
    substring(external_url from 'gutenberg\.org/(?:cache/epub/|ebooks/)([0-9]+)') as ebook_id
  from public.livros
  where external_url ~ 'gutenberg\.org/(?:cache/epub/|ebooks/)[0-9]+'
)
update public.livros as livros
set
  epub_url = format('https://www.gutenberg.org/cache/epub/%s/pg%s-images-3.epub', gutenberg_links.ebook_id, gutenberg_links.ebook_id)
from gutenberg_links
where livros.id = gutenberg_links.id
  and gutenberg_links.ebook_id is not null;

commit;
