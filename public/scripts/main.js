document.addEventListener("DOMContentLoaded", function() {
  $('#searchCancel').click(cancelSearch);
  $('#addCancel').click(cancelAdd);

  $('#show_search-form').click(showSearch);

  $('#searchForm').submit(submitSearch);
  $('#addForm').submit(submitAdd);
  $('#editGoalForm').submit(submitEditGoal);
  $('#confirmArchiveForm').submit(confirmArchiveGoal);
  $('#addProgressForm').submit(submitAddProgress);

  getGoals();
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

function getFormattedDate(dateString) {
  // console.log(dateString);
  let date = new Date(dateString);
  // console.log(date);
  let day = date.getDate();
  if (day < 10) {
    day = '0'+day;
  }
  let month = date.getMonth()+1;
  if (month < 10) {
    month = '0'+month;
  }
  let year = date.getFullYear();
  return year +'-'+month+'-'+day;
}

function editGoal(e) {
  let el = $(e.target).closest("a");
  let isbn = $(el).attr('id').split('_')[2];
  let startDate = $(`#${isbn}_start_date`).text();
  let endDate = $(`#${isbn}_end_date`).text();
  $('#editGoalStartDate').val(getFormattedDate(startDate));
  $('#editGoalEndDate').val(getFormattedDate(endDate));
  $('.edit-goal-form').removeClass('isHidden');
  $('#editGoalIsbn').val(isbn);
  // console.log(`edit goal for ${isbn}`)
}

function submitEditGoal(e) {
  let userId = 1;
  e.preventDefault();
  let form = e.target;
  let isbn = $('#editGoalIsbn').val();
  let startDate = $('#editGoalStartDate').val();
  let endDate = $('#editGoalEndDate').val();
  // console.log(startDate);
  // console.log(endDate);
  // sample body
  // let body = {
  //   user_id : 1,
  //   isbn : '9780831131289',
  //   start_date : '03/14/2017',
  //   end_date :	'03/28/2017',
  //   active : true,
  //   complete : false
  // }

  let $xhr = $.ajax({
    type: "POST",
    url: '/update-goal',
    dataType: 'json',
    data: {'user_id': userId ,
        'isbn' : isbn,
        'start_date': startDate,
        'end_date': endDate,
        'active' : true,
        'complete' : false
      }
  }).then(function (result) {
    getGoals();
    $('#editGoal').trigger("reset");
    $('.edit-goal-form').addClass('isHidden');
  }).catch(function (error) {
    console.error('Error:',error)
  });
}

function addProgress(e) {
  let el = $(e.target).closest("a");
  let isbn = $(el).attr('id').split('_')[2];
  $('#addProgressDate').val(getDateFromToday());
  $('.add-progress-form').removeClass('isHidden');
  $('#addProgressIsbn').val(isbn);
}

function submitAddProgress(e) {
  let userId = 1;
  e.preventDefault();
  let form = e.target;
  let isbn = $('#addProgressIsbn').val();
  let eventDate = $('#addProgressDate').val();
  let pages = $('#addProgressPages').val();

  // sample body
  // let body = {
  //   user_id : 1,
  //   isbn : '9780831131289',
  //   event_date : '03/14/2017',
  //   pages :	25
  // }

  let $xhr = $.ajax({
    type: "POST",
    url: '/add-progress',
    dataType: 'json',
    data: {'user_id': userId ,
        'isbn' : isbn,
        'event_date': eventDate,
        'pages' : pages
      }
  }).then(function (result) {
    getGoals ();
    $('#addProgressForm').trigger("reset");
    $('.add-progress-form').addClass('isHidden');
  }).catch(function (error) {
    console.error('Error:',error)
  });
}

function showArchiveConfirmation(e) {
  let el = $(e.target).closest("a");
  let isbn = $(el).attr('id').split('_')[2];
  $('.archive-goal-form').removeClass('isHidden');
  $('#confirmArchiveIsbn').val(isbn);
}

function confirmArchiveGoal(e) {
  let userId = 1;
  e.preventDefault();
  let isbn = $('#confirmArchiveIsbn').val();

  // sample body
  // let body = {
  //   user_id : 1,
  //   isbn : '9780831131289',
  //   active : false
  // }

  let $xhr = $.ajax({
    type: "POST",
    url: '/archive-goal',
    dataType: 'json',
    data: {'user_id': userId ,
        'isbn' : isbn,
        'active' : false
      }
  }).then(function (result) {
    getGoals();
    $('#confirmArchiveForm').trigger("reset");
    $('.archive-goal-form').addClass('isHidden');
  }).catch(function (error) {
    console.error('Error:',error)
  });
}

function addGoalButtonEventListeners() {
  $("[id^=edit_goal_]").each( function() {
    $(this).click(editGoal);
  })
  $("[id^=add_progress_]").each( function() {
    $(this).click(addProgress);
  })
  $("[id^=archive_goal_]").each( function() {
    $(this).click(showArchiveConfirmation);
  })
}

function showSearch (e) {
  $('.search-form').removeClass('isHidden');
  $('#add_progress').addClass('isHidden');
  $('#results').addClass('isHidden');
}

function chooseBook(e) {
  let el = $(e.target).closest("tr");
  let isbn = $(el).attr('id');
  let book = books[isbn];
  $('#addTitle').val(book.title);
  $('#addIsbn').val(isbn);
  $('#addStartDate').val(getDateFromToday());
  $('#addEndDate').val(getDateFromToday(14));
  $('#addPages').val(book.pageCount);

  $('.search-form').addClass('isHidden');
  $('.add-form').removeClass('isHidden');
  $('#searchForm').trigger("reset");
}

function cancelAdd () {
  console.log('Canceled Add');
}

function cancelSearch () {
  $('#results').addClass('isHidden');
  $('.search-form').addClass('isHidden');
  // $('#dataTable').addClass('wheee');
  // $('.datatable').removeClass('isHidden');
  // $('.goalsTable').removeClass('isHidden');
  // $('#show_search-form').removeClass('isHidden');
  $('#add_progress').removeClass('isHidden');
  // $('#hide_goalsTable').removeClass('isHidden');
  // $('#show_goalsTable').addClass('wheee');
  // $('#show_goalsTable').removeClass('isHidden');
  // $('#hide_datatable').removeClass('isHidden');
  // $('#show_datatable').removeClass('isHidden');
}

let books = {};
function submitSearch (e) {
  e.preventDefault();
  $('#results').removeClass('isHidden');
  $('.datatable').addClass('isHidden');
  let title = $('#title').val();
  let $xhr = $.ajax({
    type: "GET",
    url: `/search?title=${title}`
  }).then(
    function (result) {
      let booksDiv = $('.books');
      $('#results tbody').empty();

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

        books[isbn] =
          { title:title,
          isbn:isbn,
          authors:authors,
          categories:categories,
          pageCount:pageCount,
          publishedDate:publishedDate,
          publisher:publisher,
          image:image
          };

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
  }).catch(function (error) {
    console.error('Error:',error)
  });
}

function getProgress () {
  $('svg').empty();
  let userId = 1;
  $('#progressTable tbody').empty();
  let $xhr = $.ajax({
    type: "GET",
    url: `/get-progress?userId=${userId}`
  }).then(
    function (result) {
      let progressArr = []
      for (let progress of result.progress) {
        progressArr.push(progress);
      }
      progressArr.sort(function compare(a, b) {
        return b.event_date < a.event_date;
      });

      let goals = {};
      let readPages = 0;
      for (let p of progressArr) {
        // console.log(p + ' ' + (goals[p.isbn] == undefined));
        if (goals[p.isbn] == undefined) {
          readPages = 0;
        } else {
          readPages = goals[p.isbn].readPages;
        }
        // console.log(`readPages ${readPages}`);
        readPages = readPages + p.pages;

        goals[p.isbn] = {
          readPages : readPages,
          total : p.total,
          startDate : p.start_date,
          endDate : p.end_date
        };
        // console.log(goals[p.isbn]);

        let goalDays = Math.floor((new Date(p.end_date) - new Date(p.start_date)) / 86400000) ;
        if (goalDays == 0 ) {
          goalDays = 1;
        }
        // console.log(`${p.end_date} - ${p.start_date} = ${goalDays}`);

        let daysSoFar = Math.floor((new Date(p.event_date) - new Date(p.start_date)) / 86400000) ;
        if (daysSoFar == 0 ) {
          daysSoFar = 1;
        }
        let pagesPerDay = Math.floor(p.total / goalDays);
        let cumTargetPages = Math.floor(pagesPerDay * daysSoFar);
        if (cumTargetPages > p.total) {
          cumTargetPages = p.total;
        }
        // console.log(`pagesPerDay ${pagesPerDay} daysSoFar ${daysSoFar} targetPages ${cumTargetPages}`);

        // progressArr.push({
        //   isbn : p.isbn,
        //   eventDate : p.event_date,
        //   pages : p.pages,
        //   cumPages : readPages,
        //   cumTargetPages : cumTargetPages
        // })

        let percent = Math.floor(readPages / p.total * 100);

        let dateForId = printFormatDate(p.event_date).split('/').join('');
        // console.log(goals);
        $('#progressTable tbody').append(`
          <tr id="progress_${p.isbn}${dateForId}">
          <td class="h6 text-left fudge-table">${printFormatDate(p.event_date)}</td>
          <td class="h6 text-left fudge-table">${decodeURI(p.title)}</td>
          <td class="h6 text-center fudge-table">${p.pages}</td>
          <td class="h6 text-center fudge-table">${pagesPerDay}</td>
          <td class="h6 text-center fudge-table">${readPages}</td>
          <td class="h6 text-center fudge-table">${cumTargetPages}</td>
          <td class="h6 text-center fudge-table">${p.total}</td>
          <td class="h6 text-center fudge-table">${percent}%</td>`)

        if (readPages < cumTargetPages) {
          $(`#progress_${p.isbn}${dateForId}`).addClass('red-text')
          // console.log($(`#progress_${p.isbn}${dateForId}`));
        } else {
          $(`#progress_${p.isbn}${dateForId}`).addClass('green-text')
          // console.log($(`#progress_${p.isbn}${dateForId}`));
        }

      }

      for (let p of progressArr) {
        if (goals[p.isbn]['events'] == undefined) {
          goals[p.isbn]['events'] = [p];
        } else {
          goals[p.isbn]['events'].push(p);
        }
      }

      let colors = ['blue','lightblue','green','lightgreen','black','darkgray',
      'red','pink','orange','yellow']
      let colorIndex = 0;
      let x1 = 0;
      let y1 = 0;
      let x2 = 0;
      let y2 = 0;
      let first = true;

      // console.log(goals);
      let earliestDate = 0;
      let latestDate = 0;
      let mostPages = 0;

      let svgData = [];
      for (let goal in goals) {
        for (let e of goals[goal]['events']) {
          if (first) {
            x1 = Math.floor(new Date(e.event_date) / 86400000);
            y1 = 0;
            x2 = Math.floor(new Date(e.event_date) / 86400000);
            y2 = e.pages;
            // console.log(`${x1} ${y1} ${x2} ${y2}`)
            svgData.push([e.isbn,x1,y1,x2,y2,colors[colorIndex]]);
            first = false;
          } else {
            x1 = x2;
            y1 = y2;
            x2 = Math.floor(new Date(e.event_date) / 86400000);
            y2 += e.pages;
            if (earliestDate == 0 || x1 < earliestDate) {
              earliestDate = x1;
            }
            if (latestDate == 0 || x2 > latestDate) {
              latestDate = x2;
            }
            if (y2 > mostPages) {
              mostPages = y2;
            }
            svgData.push([e.isbn,x1,y1,x2,y2,colors[colorIndex]]);
          }
        }
        first = true;
        colorIndex++;
        x1 = Math.floor(new Date(goals[goal].startDate) / 86400000);
        x2 = Math.floor(new Date(goals[goal].endDate) / 86400000);
        y1 = 0;
        y2 = goals[goal].total;
        svgData.push([goal,x1,y1,x2,y2,colors[colorIndex]]);
        colorIndex++;
        if (earliestDate == 0 || x1 < earliestDate) {
          earliestDate = x1;
        }
        if (latestDate == 0 || x2 > latestDate) {
          latestDate = x2;
        }
        if (y2 > mostPages) {
          mostPages = y2;
        }
      }

      // console.log(svgData);





      // console.log(`${earliestDate} ${latestDate} ${mostPages}`);

      let width = 1100;
      let height = 330;
      var yScale = d3.scale.linear()
        .domain([0, mostPages])
         .range([25, height]);
      var xScale = d3.scale.linear()
        .domain([earliestDate, latestDate])
        .range([25, width]);

      var svg = d3.select("svg")

      var lines = svg.selectAll("line")
        .data(svgData)
        .enter()
        .append("line");

      lines.attr("x1", function(d) {
            return xScale(d[1])+15;
      })
      lines.attr("y1", function(d) {
            return height - yScale(d[2])+15;
      })
      lines.attr("x2", function(d) {
            return xScale(d[3])+15;
      })
      lines.attr("y2", function(d) {
            return height - yScale(d[4])+15;
      })
      .attr("stroke", function(d) {
        console.log(d[5]);
            return d[5];
      })
      .attr("stroke-width", 3)
      .attr("opacity", .5);

      let endpoints = [];
      for (let line of svgData) {
        endpoints.push([line[1],line[2],line[5]]);
        endpoints.push([line[3],line[4],line[5]]);
      }

      let circles = svg.selectAll("circle")
        .data(endpoints)
        .enter()
        .append("circle");

      circles.attr("cx", function(d) {
            return xScale(d[0])+15;
      })
      .attr("cy", function(d) {
         return height-yScale(d[1])+15;
      })
      .attr("r", 5)
      .attr("fill", function(d) {
        // console.log(d[2]);
            return d[2];
      })
      .attr("opacity", 1);








      // console.log(goals);
      for (let goal in goals) {
        let percent = Math.floor(goals[goal].readPages / goals[goal].total * 100);
        // console.log(`goal ${goal}: ${goals[goal].pages} / ${goals[goal].total} = ${percent}`);
        $(`#${goal}_percent-complete`).text(`${percent}%`);
      }
  }).catch(function (error) {
    console.error('Error:',error)
  });
}



function getGoals () {
  let userId = 1;
  $('#goalsTable tbody').empty();
  let $xhr = $.ajax({
    type: "GET",
    url: `/goals?userId=${userId}`
  }).then(
    function (result) {
      let goalArr = []
      for (let goal of result.goals) {
        goalArr.push(goal);
      }
      goalArr.sort(function compare(a, b) {
        return b.start_date < a.start_date;
      });

      for (let goal of goalArr) {
        $('#goalsTable tbody').append(`
          <tr id="goal_${goal.isbn}" class='active_${goal.active} complete_${goal.complete}'>
            <td class="h6 text-left fudge-table">${decodeURI(goal.title)}</td>
            <td class="h6 text-center fudge-table">${goal.pages}</td>
            <td id="${goal.isbn}_start_date" class="h6 text-center fudge-table">${printFormatDate(goal.start_date)}</td>
            <td id="${goal.isbn}_end_date" class="h6 text-center fudge-table">${printFormatDate(goal.end_date)}</td>
            <td id="${goal.isbn}_percent-complete"class="h6 text-center fudge-table">0%</td>
            <td class="h4 text-right">
              <a id="edit_goal_${goal.isbn}" hef="#"><span class="label label-default action blue"><span class="glyphicon glyphicon-pencil" aria-hidden="true"></span></span></a>
              <a id="add_progress_${goal.isbn}" hef="#"><span class="label label-default action green"><span class="glyphicon glyphicon-check" aria-hidden="true"></span></span></a>
              <a id="archive_goal_${goal.isbn}" hef="#"><span class="label label-default action red"><span class="glyphicon glyphicon-remove-sign" aria-hidden="true"></span></span></a>
            </td>`)
      }
      addGoalButtonEventListeners();
      getProgress();

  }).catch(function (error) {
    console.error('Error:',error)
  });
}

function printFormatDate (date) {
  if (date != undefined) {
    return date.substring(5,7)+'/'+date.substring(8,10)+'/'+date.substring(0,4);
  }
}

function submitAdd (e) {
  console.log('send post to add a new goal');
  e.preventDefault();
  let form = e.target;
  let isbn = $('#addIsbn').val();
  console.log(`isbn- ${isbn}`);

  let book = books[isbn];
  console.log(book);
  let startDate = $('#addStartDate').val();
  let endDate = $('#addEndDate').val();

  let $xhr = $.ajax({
    type: "POST",
    url: '/add-goal',
    dataType: 'json',
    data: {'user_id': 1 ,
        'book' : book,
        'start-date': startDate,
        'end-date': endDate
      }
  }).then(function (result) {
    getGoals();
    $('#addForm').trigger("reset");
    $('.add-form').addClass('isHidden');
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

  // find the goalsTable or table div and toggle it.
  if ($('.'+$(el).attr('id').split('_')[1]).hasClass('isHidden')) {
    $('.'+$(el).attr('id').split('_')[1]).removeClass('isHidden');
  } else {
    $('.'+$(el).attr('id').split('_')[1]).addClass('isHidden');
  }
}
