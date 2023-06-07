const models = require('./models');

module.exports = {
  getAllPosts(req, res) {
    models
      .getAllPosts()
      .then((results) => res.json(results));
  },
};
