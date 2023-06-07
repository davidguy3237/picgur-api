const axios = require('axios');
const models = require('./models');

module.exports = {
  getAllPosts(req, res) {
    models
      .getAllPosts()
      .then((results) => res.json(results));
  },
  incrementViewCount(req, res) {
    models
      .incrementViewCount(req.body.id)
      .then(() => res.sendStatus(201));
  },
};
