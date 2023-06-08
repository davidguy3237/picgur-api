/* eslint-disable prefer-template */
/* eslint-disable new-cap */
/* eslint-disable no-console */
require('dotenv').config();
const axios = require('axios');
const express = require('express');
const cloudinary = require('cloudinary').v2;
const morgan = require('morgan');
const cors = require('cors');
const Multer = require('multer');
const controllers = require('./controllers');
const models = require('./models');
const pool = require('./db');

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

const storage= new Multer.memoryStorage();
const upload = Multer({ storage });

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/posts', controllers.getAllPosts);
app.put('/api/views', controllers.incrementViewCount);
app.put('/api/likes', controllers.updateLikes);
app.post('/api/upload', upload.single('file'), async (req, res) => {
  const client = await pool.connect();
  const { title, tags } = req.body;
  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    const cldRes = await handleUpload(dataURI);
    const url = cldRes.secure_url;

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

    // models.addPost(req.body.title, url)
    //   // .then(() => {
    //   //   const { tags } = req.body;
    //   //   if (tags && tags.length) {
    //   //     models.addTag(tags);
    //   //   }
    //   // })
    //   .then((results) => {
    //     const { tags } = req.body;
    //     const { id } = results[0];
    //     if (tags && tags.length) {
    //       return models
    //         .addTag(tags)
    //         .then(() => {
    //           return models.addJunction(id, tags)
    //         });
    //     }
    //     return null;
    //   })
    //   .then(() => {

    //   })
  } catch (error) {
    console.log(error);
    res.send({ message: error.message });
  } finally {
    client.release();
    res.json('EVERYTHING IS WORKING');
  }
});

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));
