document.addEventListener("DOMContentLoaded", function() {
  $('.fillme').append('<ul>');
  for (let i=0;i<10;i++) {
    $('.fillme').append(`<li>${i+1}. Item!</li>`);
  }

  getGoogleBooksData('javascript');
});

function getGoogleBooksData (querystring) {
  let $xhr = $.ajax({
    type: "GET",
    url: `/search`
  }).then(
    function (result) {
      console.log(result);
      let booksDiv = $('.books');
      for (let book of result) {
        let title = book.title;
        let authors = book.authors;
        let categories = book.categories;
        let pageCount = book.pageCount;
        let publishedDate = book.publishedDate;
        let publisher = book.publisher;
        let image = book.image;


        $('.books').append(`<div class="row">
        <div class="col-xs-2"><img src="${image}" alt="book cover image"></div>
        <div class="col-xs-2">${title}</div>
        <div class="col-xs-2">${authors}</div>
        <div class="col-xs-2">${publisher}</div>
        <div class="col-xs-2">${pageCount}</div>
        <div class="col-xs-2">${publishedDate}</div>
        </div>`)
      }
    // console.log(result)
  }).catch(function (error) {
    console.error('Error:',error)
  });
}

// let graphData = [
//   {'1001':}
// ]
