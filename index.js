require('dotenv').config()
let express = require('express');
let request = require('request');
let app = express();
let pg = require('pg');

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM test_table', function(err, result) {
      done();
      if (err)
       { console.error(err); response.send("Error " + err); }
      else
       { response.render('pages/db', {results: result.rows} ); }
    });
  });
});

app.get('/search', function (req, res) {

  let searchString = req.query.title;
  // console.log(searchString);
  // let searchString = 'javascript';
  let url = `https://www.googleapis.com/books/v1/volumes?q=${searchString}&key=${process.env.GOOGLE_KEY}`;
  let books = [];
  request(url, function(err, response, body) {
    body = JSON.parse(body);
    // console.log(body.items); // Print the HTML for the Google homepage.
    if (body.items != undefined) {
      for (let item of body.items) {
        let book = {};
        book['title'] = item.volumeInfo.title;

        let identifiers = item.volumeInfo.industryIdentifiers;
        for (let id of identifiers) {
          if (id.type == "ISBN_13") {
            book['isbn'] = id.identifier;
          }
        }
        book['authors'] = item.volumeInfo.authors;
        book['categories'] = item.volumeInfo.categories;
        book['pageCount'] = item.volumeInfo.pageCount;
        book['publishedDate'] = item.volumeInfo.publishedDate;
        book['publisher'] = item.volumeInfo.publisher;
        if(item.volumeInfo.imageLinks != undefined) {
          book['image'] = item.volumeInfo.imageLinks.thumbnail;
        } else {
          book['image'] = '';
        }
        books.push(book);
      }
    }
    res.send(books);
  });

});

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function(request, response) {
  response.render('pages/index');
});

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
