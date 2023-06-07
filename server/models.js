const pool = require('./db');

module.exports = {
  getAllPosts() {
    const query = 'SELECT * FROM posts';
    return pool
      .query(query)
      .then((results) => results.rows)
      .catch((err) => {
        throw new Error(`PROBLEM GETTING POSTS ${err.stack}`)
      });
  },
};
