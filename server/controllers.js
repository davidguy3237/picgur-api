const cloudinary = require('cloudinary').v2;
const models = require('./models');

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

async function handleUpload(file) {
  const res = await cloudinary.uploader.upload(file, {
    resource_type: 'auto',
  });
  return res;
}

module.exports = {
  getAllPosts(req, res) {
    const search = req.query.search || '';
    const sort = req.query.sort || 'likes DESC';
    models
      .getAllPosts(search, sort)
      .then((results) => res.json(results));
  },
  async addPost(req, res) {
    const { title, tags } = req.body;
    try {
      const b64 = Buffer.from(req.file.buffer).toString('base64');
      // eslint-disable-next-line prefer-template
      const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
      const cldRes = await handleUpload(dataURI);
      const url = cldRes.secure_url;
      await models.addPost(title, url, tags);
    } catch (err) {
      console.log(err);
      res.send({ message: err.message });
    } finally {
      res.sendStatus(201);
    }
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
  getTagsForId(req, res) {
    const { id } = req.query;
    models
      .getTagsForId(id)
      .then((results) => res.json(results));
  },
  getPostsByTags(req, res) {
    const { tag } = req.query;
    models
      .getPostsByTags(tag)
      .then((results) => res.json(results));
  },
};
