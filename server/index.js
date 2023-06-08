/* eslint-disable new-cap */
/* eslint-disable no-console */
require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const Multer = require('multer');
const controllers = require('./controllers');

const storage = new Multer.memoryStorage();
const upload = Multer({ storage });

const app = express();

app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/posts', controllers.getAllPosts);
app.get('/api/tags', controllers.getTagsForId);
app.get('/api/posts-by-tag', controllers.getPostsByTags);
app.put('/api/views', controllers.incrementViewCount);
app.put('/api/likes', controllers.updateLikes);
app.post('/api/upload', upload.single('file'), controllers.addPost);

app.listen(process.env.PORT, () => console.log(`Listening on port ${process.env.PORT}`));
