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
  addReviews(reviewsCSV);
  // addPhotos(photosCSV);
  // addCharacteristics(characteristicsCSV);
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
        recommends: Boolean,
        photos: [{ id: String, url: String }]
      }],
  meta: {
    ratings: {
      1: Number,
      2: Number,
      3: Number,
      4: Number,
      5: Number
    },
    recommends: {
      0: Number,
      1: Number,
    },
    characteristics: {}
  }
});

const metaRawSchema = new mongoose.Schema({
  product_id: String,
  results_meta: [
    {
      id: String,
      rating: Number,
      recommends: Boolean,
      characteristics: [
        {
          id: String,
          name: String,
          value: Number
        }
      ]
    }
  ]
});

const Test = mongoose.model('Tests', schema);
const MetaTest = mongoose.model('Metatests', metaRawSchema);

const addReviews = (csvPath) => {
  fs.createReadStream(path.resolve(__dirname, csvPath))
  .pipe(csv.parse({ headers: true }))
  .on('error', error => console.error(error))
  .on('data', (row) => {

    let result = {};

    // Build result
    Object.keys(row).map((key, i) => {
      if (key !== 'product_id') {
        result[key] = row[key];
      }
    });

    const updateRating = {};
    updateRating['meta.ratings.' + row.rating] = 1;

    const updateRecommends = {};

    if (row.recommend === 'false') {
      updateRecommends['meta.recommends.0'] = 1;
    } else if (row.recommend === 'true') {
      updateRecommends['meta.recommends.1'] = 1;
    }

    Test.findOneAndUpdate(
      {
      "product_id": row.product_id
      },
      {
        'product_id': row.product_id,
        // '$push': { results: result },
        '$inc': updateRating,
        '$inc': updateRecommends
      },
      {
        useFindAndModify: false,
        new: true,
        upsert: true,
      },
      (err, result) => {
        if(err) {console.log(err)}
        if(result) {console.log(result)}
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

    let metaCharacteristic = {id: row.id, name: row.name, value: row.value};

    Test.findOneAndUpdate(
      {
        'product_id': row.product_id,
      },
      {
        $set: update
      },
      {
        useFindAndModify: false,
        // new: true,
        // upsert: true,
      },
      (err, result) => {
        if (err) { console.log('error', err) }
      });

    MetaTest.findOneAndUpdate(
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
