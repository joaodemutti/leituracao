begin;

update public.livros
set pdf_url = null
where pdf_url is not null;

commit;
