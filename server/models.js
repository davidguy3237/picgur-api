const pool = require('./db');

module.exports = {
  getAllPosts(search, sort) {
    const query = `SELECT * FROM posts WHERE title ILIKE '%${search}%' ORDER BY ${sort}`;
    return pool
      .query(query)
      .then((results) => results.rows)
      .catch((err) => {
        throw new Error(`PROBLEM GETTING POSTS: ${err.stack}`);
      });
  },
  async addPost(title, url, tags) {
    const client = await pool.connect();
    await client.query('BEGIN');

    const uploadQuery = 'INSERT INTO posts(title, url) VALUES($1, $2) RETURNING *';
    const uploadValues = [title, url];
    const uploadResponse = await client.query(uploadQuery, uploadValues);
    const postId = uploadResponse.rows[0].id;

    if (tags && tags.length) {
      const tagsPromises = tags.map((tag) => {
        const tagQuery = 'INSERT INTO tags(tag) VALUES ($1) ON CONFLICT DO NOTHING';
        const tagValues = [tag];
        return client.query(tagQuery, tagValues);
      });

      await Promise.all(tagsPromises);

      const junctionPromises = tags.map((tag) => {
        const junctionQuery = 'INSERT INTO posts_tags (post_id, tag_id) VALUES ($1, (SELECT id FROM tags WHERE tag=$2))';
        const junctionValues = [postId, tag];
        return client.query(junctionQuery, junctionValues);
      });

      await Promise.all(junctionPromises);
    }

    await client.query('COMMIT');
    await client.release();
  },
  incrementViewCount(id) {
    const query = 'UPDATE posts SET views = views + 1 WHERE id=$1';
    const values = [id];
    return pool
      .query(query, values)
      .catch((err) => {
        throw new Error(`PROBLEM INCREMENTING VIEW COUNT: ${err.stack}`);
      });
  },
  updateLikes(id, likes) {
    const query = 'UPDATE posts SET likes = $1 WHERE id=$2';
    const values = [likes, id];
    return pool
      .query(query, values)
      .catch((err) => {
        throw new Error(`PROBLEM UPDATING LIKES: ${err.stack}`);
      });
  },
  updateDislikes(id, dislikes) {
    const query = 'UPDATE posts SET dislikes = $1 WHERE id=$2';
    const values = [dislikes, id];
    return pool
      .query(query, values)
      .catch((err) => {
        throw new Error(`PROBLEM UPDATING DISLIKES: ${err.stack}`);
      });
  },
  getTagsForId(id) {
    const query = 'SELECT tags.tag FROM tags JOIN posts_tags ON tags.id = posts_tags.tag_id WHERE posts_tags.post_id = $1';
    const values = [id];
    return pool
      .query(query, values)
      .then((results) => results.rows)
      .catch((err) => {
        throw new Error(`PROBLEM GETTING TAGS FOR ID ${id}: ${err.stack}`);
      });
  },
  getPostsByTags(tag) {
    const query = 'SELECT posts.* FROM posts JOIN posts_tags on posts.id = posts_tags.post_id WHERE posts_tags.tag_id = (SELECT id FROM tags WHERE tags.tag = $1)';
    const values = [tag];
    return pool
      .query(query, values)
      .then((results) => results.rows)
      .catch((err) => {
        throw new Error(`PROBLEM GETTING POSTS BY ${tag}: ${err.stack}`);
      });
  },
};
