const models = require('./models');

module.exports = {
  getAllPosts(req, res) {
    const search = req.query.search || '';
    models
      .getAllPosts(search)
      .then((results) => res.json(results));
  },
  incrementViewCount(req, res) {
    models
      .incrementViewCount(req.body.id)
      .then(() => res.sendStatus(201));
  },
  updateLikes(req, res) {
    const { id } = req.body;
    const promises = [];
    if (req.body.likes !== undefined) {
      promises.push(models.updateLikes(id, req.body.likes));
    }
    if (req.body.dislikes !== undefined) {
      promises.push(models.updateDislikes(id, req.body.dislikes));
    }

    Promise.all(promises).then(() => res.sendStatus(201));
  },
};
