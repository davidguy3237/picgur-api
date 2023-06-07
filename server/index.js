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
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = 'data:' + req.file.mimetype + ';base64,' + b64;
    const cldRes = await handleUpload(dataURI);
    const url = cldRes.secure_url;
    models.addPost(req.body.title, url)
      .then(() => res.sendStatus(201));
  } catch (error) {
    console.log(error);
    res.send({
      message: error.message,
    });
  }
});

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));
