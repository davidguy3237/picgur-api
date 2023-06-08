DROP TABLE IF EXISTS postS CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS tags CASCADE;
DROP TABLE IF EXISTS posts_tags CASCADE;

CREATE TABLE posts (
  id SERIAL,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (id)
);

CREATE TABLE comments (
  id SERIAL,
  text TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  dislikes INTEGER DEFAULT 0,
  createdAt TIMESTAMP DEFAULT NOW(),
  post_id INTEGER NOT NULL,
  PRIMARY KEY (id)
);

CREATE TABLE tags (
  id SERIAL,
  tag TEXT NOT NULL UNIQUE,
  PRIMARY KEY (id)
);

CREATE TABLE posts_tags (
  id SERIAL,
  tag_id INTEGER NOT NULL,
  post_id INTEGER NOT NULL,
  PRIMARY KEY (id)
);

ALTER TABLE comments ADD CONSTRAINT comments_posts_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id);
ALTER TABLE posts_tags ADD CONSTRAINT posts_tags_posts_id_fkey FOREIGN KEY (post_id) REFERENCES posts(id);
ALTER TABLE posts_tags ADD CONSTRAINT posts_tags_tags_id_fkey FOREIGN KEY (tag_id) REFERENCES tags(id);

CREATE INDEX comments_post_id ON comments(post_id);
CREATE INDEX posts_tags_tag_id ON posts_tags(post_id);
CREATE INDEX posts_tags_post_id ON posts_tags(post_id);