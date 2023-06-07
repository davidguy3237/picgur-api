const pool = require('./db');

module.exports = {
  getAllPosts(search) {
    const query = `SELECT * FROM posts WHERE title ILIKE '%${search}%'`;
    return pool
      .query(query)
      .then((results) => results.rows)
      .catch((err) => {
        throw new Error(`PROBLEM GETTING POSTS: ${err.stack}`);
      });
  },
  addPost(title, url) {
    const query = 'INSERT INTO posts(title, url) VALUES($1, $2)';
    const values = [title, url];
    return pool
      .query(query, values)
      .then((results) => results.rows)
      .catch((err) => {
        throw new Error(`PROBLEM ADDING NEW POST: ${err.stack}`);
      });
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
  }
};
