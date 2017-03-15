require('dotenv').config()
let express = require('express');
let request = require('request');
let app = express();
let pg = require('pg');
var bodyParser = require('body-parser')

app.get('/db', function (request, response) {
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT * FROM users', function(err, result) {
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
  let url = `https://www.googleapis.com/books/v1/volumes?q=${searchString}&key=${process.env.GOOGLE_KEY}`;
  let books = [];
  request(url, function(err, response, body) {
    body = JSON.parse(body);
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

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.post('/add-goal', function (request, response) {
  console.log('/add-goal endpoint');
  let body = request.body;
  let userId = parseInt(body.user_id);
  let book = {}
  if (body.book != null) {
    book.title = encodeURIComponent(body.book.title);
    book.isbn = encodeURIComponent(body.book.isbn);
    // book.categories = [];
    // for (let category in body.book.categories) {
    //   book.categories.push(encodeURIComponent(category));
    // }
    book.authors = [];
    for (let author in body.book.authors) {
      book.authors.push(encodeURIComponent(author));
    }
    book.pages = parseInt(body.book.pageCount);
    book.published = new Date(body.book.publishedDate);
    // console.log(`publishedDate: ${body.book.publishedDate} | ${new Date(body.book.publishedDate).getTime()}`);
    book.publisher = encodeURIComponent(body.book.publisher);
    book.image_url = encodeURIComponent(body.book.image);
  }
  let startDate = new Date(body['start-date']);
  let endDate = new Date(body['end-date']);

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {

    // check if book already exists in the database
    let newBook = true;
    client.query('select * from books where isbn = $1', [book.isbn], function(err, result) {
      console.log('checking for existing book.');
      done();
      if (err) {
        console.error(err);
        response.send("Error " + err);
      } else {
        if (result.rowCount == 0 ) {
          client.query('insert into books (isbn,pages,title,authors,publisher,published,image_url) values ($1,$2,$3,$4,$5,$6,$7)', [book.isbn,book.pages,book.title,book.authors,book.publisher,book.published,book.image_url], function(err, result) {
            done();
            if (err) {
              console.error(err); response.send("Error " + err);
            }
          });
        }
      }
    });

    client.query('select * from goals where isbn = $1 and user_id = $2', [book.isbn,userId], function(err, result) {
      console.log('checking for existing goal.' + book.isbn + ' ' +userId);
      done();
      if (err) {
        console.error(err);
        response.send("Error " + err);
      } else {
        console.log('result.rowCount '+result.rowCount);

        if (result.rowCount == 0 ) {
          console.log('inserting goal: ' + userId+' '+book.isbn+' '+startDate+' '+endDate+' '+false+' '+true);
          client.query('insert into goals (user_id,isbn,start_date,end_date,complete,active) values ($1,$2,$3,$4,$5,$6)', [userId,book.isbn,startDate,endDate,false,true], function(err, result) {
            done();
            if (err) {
              console.error(err);
              response.send("Error " + err);
            } else {
              console.log('Goal added');
              response.send({message:`Goal successfully added for user ${userId} and book ${book.isbn}`});
            }
          });
        } else {
          console.log('goal already existed');
          response.send({message:`Goal already existed`});
        }
      }
    });
    // response.send({message:`We shouldn't get here`});
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
