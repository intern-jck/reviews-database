const fs = require('fs');
const path = require('path');
const csv = require('fast-csv');
const mongoose = require('mongoose');
const { Schema } = mongoose;

const reviewsCSV = './reviewsSimple.csv';
const photosCSV = './photosSimple.csv';
const characteristicsCSV = '../charsTest.csv';
const reviewsCharacteristicsCSV = '../reviewCharTest.csv';

mongoose.connect('mongodb://localhost/basic', { useNewUrlParser: true, useUnifiedTopology: true })
.then(() => {
  console.log(`MongoDB Connected!`);
  // addReviews(reviewsCSV);
  // addPhotos(photosCSV);
  addCharacteristics(characteristicsCSV);
  // updateCharacteristics(reviewsCharacteristicsCSV);
})
.catch((err) => {
  console.log(`MongoDB ERR ${err}`);
});

const schema = new mongoose.Schema({
  product_id: String,
  results: [
      {
        id: String,
        rating: Number,
        photos: [{ id: String, url: String }]
      }],
  meta: {
    likes: Number,
    ratings: {
      1: Number,
      2: Number,
      3: Number,
      4: Number,
      5: Number
    },
    characteristics: {}
  }
});

const Test = mongoose.model('Examples', schema);

const addReviews = (csvPath) => {

  fs.createReadStream(path.resolve(__dirname, csvPath))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', (row) => {
    let result = {};
    Object.keys(row).map((key, i) => {
      if (key !== 'product_id') {
        result[key] = row[key];
      }
    });

    Test.findOneAndUpdate(
      {
      "product_id": row.product_id
      },
      {
        'product_id': row.product_id,
        '$push': { results: result}
      },
      {
        useFindAndModify: false,
        new: true,
        upsert: true,
      },
      (err, result) => {
        if(err) {console.log(err)}
      })

    })
  .on('end', (rowCount) => {
    console.log(`Added ${rowCount} rows`)
  });
}

const addPhotos = (csvPath) => {

  fs.createReadStream(path.resolve(__dirname, csvPath))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', (row) => {
    let photo = {};
    Object.keys(row).map((key, i) => {
      if (key !== 'review_id') {
        photo[key] = row[key];
      }
    });

    Test.findOneAndUpdate(
      {
        "results.id": row.review_id,
      },
      {
        $push: { 'results.$.photos': photo}
      },
      {
        useFindAndModify: false,
        new: true,
      },
      (err, result) => {
        if(err) {console.log(err)}
      })

    })
  .on('end', (rowCount) => {
    console.log(`Added ${rowCount} photos`)
  });
}

const addCharacteristics = (csvPath) => {
  fs.createReadStream(path.resolve(__dirname, csvPath))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', (row) => {

    let characteristic = {};
    let name = row.name;
    characteristic = {id: row.id, value: 0};

    const update = {};
    update['meta.characteristics.' + name] = characteristic;

    Test.findOneAndUpdate(
      {
        'product_id': row.product_id,
      },
      {
        $set: {}
      },
      {
        useFindAndModify: false,
        // new: true,
        // upsert: true,
      },
      (err, result) => {
        if (err) { console.log('error', err) }
      });
  });

}

const updateCharacteristics = (csvPath) => {
  fs.createReadStream(path.resolve(__dirname, csvPath))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', (row) => {
    console.log(row);

    Test.findOneAndUpdate(
      {
        'results.id': row.review_id,
      },
      {

      },
      {
        useFindAndModify: false
      },
      (err, result) => {
        if (err) { console.log('error', err) }
      });

  });
}
