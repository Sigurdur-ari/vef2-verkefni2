CREATE TABLE IF NOT EXISTS public.categories(
  id serial primary key,
  name varchar(64) not null unique,
  created timestamp with time zone not null default current_timestamp
);

CREATE TABLE IF NOT EXISTS public.questions(
  questionId serial primary key,
  categoryId int not null,
  content varchar(500),
  foreign key (categoryId) references categories(id)
);

CREATE TABLE IF NOT EXISTS public.answers(
  answerId serial primary key,
  qId int,
  content varchar(500),
  correct boolean default false,
  foreign key (qId) references questions(questionId)
);
