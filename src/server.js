const PORT = 3000;
const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
app.use(express.json());

const { getReviews, addReview } = require('./database/controllers.js');

// axios.get(`${url}/reviews/${id}/ list?sort=${sortString}:asc&count=${count}}`)
// axios.get(`${url}/reviews/${id}/meta`);

app.get('/*', (req, res) => {
  console.log(req.params);
  console.log(req.query);
  let path = req.params[0].split('/');


  if (path[0] === 'reviews') {
    // get reviews for product_id and type.
    getReviews(path[1], path[2])
    .then((doc) => {
      console.log(doc)
      if (path[2] === 'list') {
        doc[0].product_id = path[1];
      }

      if (path[2] === 'meta') {
        const chars = doc[0].meta.characteristics;
        console.log(chars)
        for (let c in chars) {
          console.log(c, chars[c].name)
          chars[chars[c].name] = { 'id': c, 'value': chars[c].value.reduce((a, b) => (a + b)) / chars[c].value.length};
          delete chars[c];
        }
      }

      res.send(doc);
    })
    .catch((error) => {
      console.log(error)
    });

  } else {
    res.sendStatus(404)
  }
});

app.post('/*', (req, res) => {
  console.log('GOT: ',req.body)

  addReview(req.body)
  .then((data) => {
    console.log('DB SENT', data)
    res.sendStatus(201)
  })
  .catch();

});

// app.put();
/*

axios.put(`${url}/reviews/report/${reviewId}`);

axios.post(`${url}/reviews/${id}`, {
  rating: rating,
  summary: summary,
  body: body,
  recommend: recommend,
  name: name,
  email: email,
  photos: photos,
  characteristics: characteristics,
})
*/

app.listen(PORT, function() {
  console.log(`@http://localhost:${PORT} on port ${PORT}`);
});

