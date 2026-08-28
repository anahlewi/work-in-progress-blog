-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- Adds a shareable slug per note and a note/post type distinction.

alter table notes add column if not exists slug text;
alter table notes add column if not exists type text not null default 'note';
alter table notes add constraint notes_type_check check (type in ('note', 'post'));

-- Backfill slugs for existing rows from their title.
update notes
set slug = trim(both '-' from regexp_replace(lower(title), '[^a-z0-9]+', '-', 'g'))
where slug is null;

-- If any titles collided into the same slug, resolve those manually before
-- running the next two statements (they'll fail on a duplicate).
alter table notes alter column slug set not null;
create unique index if not exists notes_slug_key on notes (slug);
