const path = require('path');
const fs = require('fs');

const express = require('express');

const mongoose = require('mongoose');

const multer = require('multer');

const authRoutes = require('./routes/auth');
const bandRoutes = require('./routes/band');
const scheduleRoutes = require('./routes/schedule');
const mediaRoutes = require('./routes/media');

const app = express();

const { v4: uuidv4 } = require('uuid');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'images');
    },
    filename: function(req, file, cb) {
        cb(null, uuidv4() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'video/mp4' ||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(express.json()); // application/json

app.use(
  multer({ storage: storage, fileFilter: fileFilter }).any()
);

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/', authRoutes);
app.use('/band', bandRoutes);
app.use('/schedule', scheduleRoutes);
app.use('/media', mediaRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

app.use((req, res, next) => {
    const paths = req.files.map(file => file.path.replace("\\" ,"/"));
    paths.forEach(pathE => {
      filePath = path.join(__dirname, pathE);
      fs.unlink(filePath, err => console.log(err));
    });
    next();
});

mongoose
  .connect(
    'mongodb+srv://denkobetona:POMNIM_NOIT1488@cluster0.37fy7yt.mongodb.net/?retryWrites=true&w=majority'
  )
  .then(result => {
    const server = app.listen(8080);
    const io = require('./socket').init(server);
    io.on('connection', socket => {
      console.log('Client connected');
    });
  })
  .catch(err => console.log(err));  