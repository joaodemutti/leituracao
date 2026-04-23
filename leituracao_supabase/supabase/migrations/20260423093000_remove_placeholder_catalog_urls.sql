update public.livros
set
  external_url = null
where external_url ilike 'https://example.com%'
   or external_url ilike 'http://example.com%';

update public.livros
set
  pdf_url = null
where pdf_url ilike 'https://example.com%'
   or pdf_url ilike 'http://example.com%';

update public.livros
set
  epub_url = null
where epub_url ilike 'https://example.com%'
   or epub_url ilike 'http://example.com%';

update public.livros
set
  cover_url = null
where cover_url ilike 'https://example.com%'
   or cover_url ilike 'http://example.com%';
