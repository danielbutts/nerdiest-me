document.addEventListener("DOMContentLoaded", function() {
  addButtonEventListeners();
  $('#searchForm').submit(submitSearch);
  $('#searchCancel').click(cancelSearch);
  $('#addForm').submit(submitAdd);
  $('#addCancel').click(cancelAdd);

});

function getDateFromToday(offset) {
  let now = new Date();
  if (offset != null) {
    now.setDate(now.getDate()+offset);
  }
  let day = now.getDate();
  if (day < 10) {
    day = '0'+day;
  }

  let month = now.getMonth()+1;
  if (month < 10) {
    month = '0'+month;
  }

  let year = now.getFullYear();

  return year +'-'+month+'-'+day;
}

function addButtonEventListeners() {
  $('#show_search-form').click(showSearch);
  $('#hide_graph').click(toggleHide);
  $('#show_graph').click(toggleHide);
  $('#hide_datatable').click(toggleHide);
  $('#show_datatable').click(toggleHide);
}

function showSearch (e) {
  $('.search-form').removeClass('isHidden');
  $('#dataTable').addClass('isHidden');
  $('.graph').addClass('isHidden');
  $('#show_search-form').addClass('isHidden');
  $('#add_progress').addClass('isHidden');
  $('#hide_graph').addClass('isHidden');
  $('#show_graph').addClass('isHidden');
  $('#hide_datatable').addClass('isHidden');
  $('#show_datatable').addClass('isHidden');
  // $('#results tbody').addClass('isHidden');
  $('#results').addClass('isHidden');

}

function chooseBook(e) {
  let el = $(e.target).closest("tr");
  let isbn = $(el).attr('id');
  console.log(isbn);
  $('.add-form #add-title').val(isbn);
  $('#start-date').val(getDateFromToday());
  $('#end-date').val(getDateFromToday(14));
  $('.search-form').addClass('isHidden');
  $('.add-form').removeClass('isHidden');
}

function cancelAdd () {
  console.log('Canceled Add');
}

function submitAdd (e) {
  e.preventDefault();
  console.log('Submitted Add');
}

function cancelSearch () {
  $('#results').addClass('isHidden');
  $('.search-form').addClass('isHidden');
  // $('#dataTable').addClass('wheee');
  $('.datatable').removeClass('isHidden');
  $('.graph').removeClass('isHidden');
  $('#show_search-form').removeClass('isHidden');
  $('#add_progress').removeClass('isHidden');
  $('#hide_graph').removeClass('isHidden');
  // $('#show_graph').addClass('wheee');
  $('#show_graph').removeClass('isHidden');
  // $('#hide_datatable').removeClass('isHidden');
  $('#show_datatable').removeClass('isHidden');
}

function submitSearch (e) {
  e.preventDefault();
  // $('#results tbody').removeClass('isHidden');
  $('#results').removeClass('isHidden');
  $('.datatable').addClass('isHidden');
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

function submitAdd (e) {
  e.preventDefault();
  let $xhr = $.ajax({
    type: "POST",
    url: '/add-goal',
    dataType: 'json',
    // contentType: 'application/json',
    data: {'user_id': 1 ,
        'book' : {"title":"JavaScript and JQuery","isbn":"9781118871652","authors":["Jon Duckett"],"categories":["Computers"],"pageCount":640,"publishedDate":"2014-07-21","publisher":"John Wiley & Sons","image":"http://books.google.com/books/content?id=_uTRAwAAQBAJ&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api"},
        'start-date': new Date(),
        'end-date': new Date()}
  }).then(function (result) {
      console.log(result);
  }).catch(function (error) {
    console.error('Error:',error)
  });
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


// let graphData = [
//   {'1001':}
// ]
