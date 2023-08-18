create or replace function match_page_sections(embedding vector(1536), match_threshold float, match_count int, min_content_length int)
returns table (path text, content text, similarity float)
language plpgsql
as $$
#variable_conflict use_variable
begin
  return query
  select
    page.path,
    page_section.content,
    (page_section.embedding <#> embedding) * -1 as similarity
  from page_section
  join page
    on page_section.page_id = page.id

  where length(page_section.content) >= min_content_length

  and (page_section.embedding <#> embedding) * -1 > match_threshold

  order by page_section.embedding <#> embedding
  
  limit match_count;
end;
$$;