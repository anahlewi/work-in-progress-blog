-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- Adds a `section` column so notes/posts can be grouped in the sidebar as
-- Pinned, Musings, Tutorials, or Reviews. Left null = unsorted.

alter table notes add column if not exists section text;
alter table notes add constraint notes_section_check check (section in ('pinned', 'musings', 'tutorials', 'reviews'));

-- "about me" is pinned.
update notes set section = 'pinned' where slug = 'about-me';

-- Everything else older than 30 days defaults to Musings; anything newer
-- is left unsorted so you can pick a section for it yourself in the app.
update notes
set section = 'musings'
where slug <> 'about-me'
  and created_at < (now() - interval '30 days')
  and section is null;
