require('dotenv').config()
let express = require('express');
let request = require('request');
let app = express();
let pg = require('pg');
var bodyParser = require('body-parser')

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

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

app.get('/goals', function (request, response) {
  console.log('/goals endpoint');
  let userId = request.query.userId;
  let goals = []

  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('SELECT books.isbn, books.title, books.pages, goals.start_date, goals.end_date, goals.complete, goals.active FROM books INNER JOIN goals ON books.isbn = goals.isbn WHERE user_id = $1;', [userId], function(err, result) {
      console.log(`getting goals for user ${userId}.`);
      done();
      if (err) {
        console.error(err);
        response.send("Error " + err);
      } else {
        if (result.rowCount > 0 ) {
          // console.log(result.rows);
          response.send({
            message:`${result.rowCount} goals found for user ${userId}.`,
            goals: result.rows
          });
        } else {
          console.log(`No goals found for user ${userId}.`);
          response.send({
            message:`No goals found for user ${userId}.`,
            goals: []
          });
        }
      }
    });
  });
});

app.post('/add-goal', function (request, response) {
  console.log('/add-goal endpoint');
  let body = request.body;
  let userId = parseInt(body.user_id);
  let book = {}
  if (body.book != null) {
    book.title = encodeURIComponent(body.book.title);
    book.isbn = encodeURIComponent(body.book.isbn);
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
        // console.log('result.rowCount '+result.rowCount);
        if (result.rowCount == 0 ) {
          console.log('inserting goal: ' + userId+' '+book.isbn+' '+startDate+' '+endDate+' '+false+' '+true);
          client.query('insert into goals (user_id,isbn,start_date,end_date,complete,active) values ($1,$2,$3,$4,$5,$6)', [userId,book.isbn,startDate,endDate,false,true], function(err, result) {
            done();
            if (err) {
              console.error(err);
              response.send("Error " + err);
            } else {
              console.log('inserting starting point into progress.');
              console.log(`[userId,book.isbn,startDate,0] ${userId},${book.isbn},${startDate},0]`);
              client.query('insert into progress (user_id,isbn,event_date,pages) values ($1,$2,$3,$4)', [userId,book.isbn,startDate,0], function(err, result) {
                done();
                if (err) {
                  console.error(err); response.send("Error " + err);
                }
              });
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

app.get('/get-progress', function (request, response) {
  console.log('/get-progress endpoint');
  let userId = request.query.userId;
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query(`SELECT progress.user_id, books.isbn, books.title,
      books.pages as total, goals.start_date, goals.end_date, progress.event_date, progress.pages
      FROM books
      INNER JOIN progress
      ON books.isbn = progress.isbn
      INNER JOIN goals
      ON goals.isbn = progress.isbn and goals.user_id = progress.user_id
      WHERE goals.user_id = $1;`, [userId], function(err, result) {
      console.log(`getting progress for user ${userId}.`);
      done();
      if (err) {
        console.error(err);
        response.send("Error " + err);
      } else {
        if (result.rowCount > 0 ) {
          response.send({
            message:`${result.rowCount} progress events found for user ${userId}.`,
            progress: result.rows
          });
        } else {
          console.log(`No progress found for user ${userId}.`);
          response.send({
            message:`No goals found for user ${userId}.`,
            progress: []
          });
        }
      }
    });
  });
});

app.post('/add-progress', function (request, response) {
  console.log('/add-progress endpoint');
  // sample body
  // let body = {
  //   user_id : 1,
  //   isbn : '9780831131289',
  //   event_date :	'03/15/2017',
  //   pages : 10
  // }
  let body = request.body;
  let eventDate = new Date(body['event_date']);
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('insert into progress (user_id,isbn,event_date,pages) values ($1,$2,$3,$4)', [body.user_id,body.isbn,body.event_date,body.pages], function(err, result) {
      console.log(`adding progress to ${body.isbn} for user ${body.user_id}.`);
      done();
      if (err) {
        console.error(err);
        response.send("Error " + err);
      } else {
        response.send({message:`Progress successfully added for user ${body.user_id} and book ${body.isbn}`});
      }
    });
  });
});

app.post('/update-goal', function (request, response) {
  console.log('/update-goal endpoint');
  // sample body
  // let body = {
  //   user_id : 1,
  //   isbn : '9780831131289',
  //   start_date : '03/14/2017',
  //   end_date :	'03/28/2017',
  //   active : true,
  //   complete : false
  // }
  let body = request.body;
  let startDate = new Date(body['start_date']);
  let endDate = new Date(body['end_date']);
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('update goals set (start_date,end_date,complete,active) = ($1,$2,$3,$4) where user_id = $5 and isbn = $6', [body.start_date,body.end_date,body.complete,body.active,body.user_id,body.isbn], function(err, result) {
      console.log(`updating goal ${body.isbn} and user ${body.user_id}.`);
      done();
      if (err) {
        console.error(err);
        response.send("Error " + err);
      } else {
        response.send({message:`Goal successfully updated for user ${body.user_id} and book ${body.isbn}`});
      }
    });
  });
});

//TODO make /archive-goal turn goal inactive reather than delete. Also need to update goal add respectively to update duplicate goals to active.
app.post('/archive-goal', function (request, response) {
  console.log('/archive-goal endpoint');
  // sample body
  // let body = {
  //   user_id : 1,
  //   isbn : '9780831131289',
  //   active : false
  // }
  let body = request.body;
  pg.connect(process.env.DATABASE_URL, function(err, client, done) {
    client.query('Delete from goals where user_id = $1 and isbn = $2', [body.user_id,body.isbn], function(err, result) {
      console.log(`deleting goal ${body.isbn} for user ${body.user_id}.`);
      done();
      if (err) {
        console.error(err);
        response.send("Error " + err);
      } else {
        response.send({message:`Goal successfully deleted for user ${body.user_id} and book ${body.isbn}`});
      }
    });
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
