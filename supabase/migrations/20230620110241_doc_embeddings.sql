create extension if not exists vector with schema public;

create table "public"."page" (
  id bigserial primary key,
  path text not null unique,
  checksum text,
  meta jsonb
);

create table "public"."page_section" (
  id bigserial primary key,
  page_id bigint not null references public.page on delete cascade,
  heading text,
  content text,
  token_count int,
  embedding vector(1536)
);

create unique index on "public"."page_section" (md5(embedding::text));
