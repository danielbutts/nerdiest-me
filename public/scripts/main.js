document.addEventListener("DOMContentLoaded", function() {
  addButtonEventListeners();
  $('#searchForm').submit(submitSearch);
});

function addButtonEventListeners() {
  $('#hide_graph').click(toggleHide);
  $('#show_graph').click(toggleHide);
  $('#hide_table').click(toggleHide);
  $('#show_table').click(toggleHide);
}

function chooseBook(e) {
  let el = $(e.target).closest("tr");
  let isbn = $(el).attr('id');
  console.log(isbn);
}


function toggleHide(e) {
  let el = $(e.target).closest("a");

  $("[id$="+$(el).attr('id').split('_')[1]+"]").each(function () {
    if ($(this).hasClass('isHidden')) {
      $(this).removeClass('isHidden');
    } else {
      $(this).addClass('isHidden');
    }
  });

  // find the graph or table div and toggle it.
  if ($('.'+$(el).attr('id').split('_')[1]).hasClass('isHidden')) {
    $('.'+$(el).attr('id').split('_')[1]).removeClass('isHidden');
  } else {
    $('.'+$(el).attr('id').split('_')[1]).addClass('isHidden');
  }
}

function submitSearch (e) {
  e.preventDefault();
  let title = $('#title').val();
  let $xhr = $.ajax({
    type: "GET",
    url: `/search?title=${title}`
  }).then(
    function (result) {
      // console.log(result);
      let booksDiv = $('.books');
      $('#results tbody').empty();
      // $('#results').append(`<tr><th></th><th>Title</th><th>Authors</th><th>Pages</th><th>Publisher</th><th>Date</th></tr>`);

      for (let book of result) {
        let title = book.title;
        let isbn = book.isbn;
        let authors = book.authors;
        let categories = book.categories;
        let pageCount = book.pageCount;
        let publishedDate = '';
        if (book.publishedDate != undefined) {
          publishedDate = book.publishedDate.split('-')[0];
        }
        let publisher = book.publisher;
        let image = book.image;

        if (title == undefined || isbn == undefined || authors == undefined || categories == undefined || pageCount == undefined || publishedDate == undefined || publisher == undefined || image == undefined) {
          continue;
        }

        $('#results tbody').append(`<tr id="${isbn}">
        <td><img src="${image}" class="thumbnail" alt="book cover image"></td>
        <td>${title}</td>
        <td>${authors}</td>
        <td>${pageCount}</td>
        <td>${publisher}</td>
        <td>${publishedDate}</td>
        </tr>`);
        $(`#${isbn}`).click(chooseBook);
        $(`#${isbn}`).mouseover(function () {
          $(`#${isbn}`).addClass('success');
        });
        $(`#${isbn}`).mouseout(function () {
          $(`#${isbn}`).removeClass('success');
        });

      }
    // console.log(result)
  }).catch(function (error) {
    console.error('Error:',error)
  });
}

// let graphData = [
//   {'1001':}
// ]
