const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const mongoose = require('mongoose');
const { addReviews, addPhotos, addCharacteristics, updateCharacteristics } = require('./etlBasicHelpers.js');

const reviewsCSV = '../../data-1M/reviews1M.csv';
const photosCSV = '../../data-1M/photos1M.csv';
// const characteristicsCSV = '../../data-50k/characteristics50k.csv';
// const characteristicReviewsCSV = '../../data-50k/characteristicReviews50k.csv';

// const reviewsCSV = '../../data-raw/reviewsRaw.csv';
// const photosCSV = '../../data-raw/photosRaw.csv';
// const characteristicsCSV = '../../data-raw/characteristicsRaw.csv';
// const characteristicReviewsCSV = '../../data-raw/characteristicReviewsRaw.csv';

// Need to add a port number?
mongoose.connect('mongodb://127.0.0.1:27017/reviews',
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log(`MongoDB Connected!`);
  })
  .then(() => {
    addReviews(reviewsCSV);
  })
  // .then(() => {
  //   addPhotos(photosCSV);
  // })
  // .then(() => {
  //   addCharacteristics(characteristicsCSV);
  // })
  // .then(() => {
  //   updateCharacteristics(characteristicReviewsCSV);
  // })
  .catch((err) => {
    console.log(`MongoDB ERR ${err}`);
  });


