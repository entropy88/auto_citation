let fetchBtn = document.getElementById("fetchBtn");
let inputField = document.getElementById("isbnInput");
let noBookFound=document.getElementById("noBookFound");
console.log(noBookFound)
let result = document.getElementById("result");
let infoContainer = document.getElementById('info');
let cover = document.getElementById('coverImg');
let addToBibliographyButton = document.getElementById('addToBibliography');
let bibliographyContainer = document.getElementById('bibliographyContainer');
let italics=document.getElementById('italics');


let isbn = "";
let bibliography = [];
let bibliographyElements=[];


fetchBtn.addEventListener('click', function () {
  isbn = inputField.value;
  // fetchBook(isbn);
  fetchGoogleBookVolumeId(isbn);
})

function fetchGoogleBookVolumeId(isbn) {
  console.log(isbn, 'from google search')

  fetch(`https://www.googleapis.com/books/v1/volumes?q=isbn:${isbn}`)
    .then(response => {
      // indicates whether the response is successful (status code 200-299) or not
      if (!response.ok) {
        throw new Error(`Request failed with status ${reponse.status}`)
      }
      return response.json()
    })
    .then(data => {
      let volumeId = data.items[0].id;
      if (!volumeId) {
        result.innerText = "няма резултати в базата :(";

      }
      console.log(volumeId);
      fetchInfo(volumeId);

    })
    .catch(error => {
      noBookFound.style.display="block";
      console.log(error);
      return;
    })
}


function fetchInfo(volumeId) {

  fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
    .then(response => {
      // indicates whether the response is successful (status code 200-299) or not
      if (!response.ok) {
        throw new Error(`Request failed with status ${reponse.status}`)
      }
      return response.json()
    })
    .then(data => {
      console.log(data)
      let isEbook = data.saleInfo.isEbook;
      console.log(isEbook)
      let info = data.volumeInfo;
      let bookInfo = Object.assign(info);
      visualise(bookInfo);

    })
    .catch(error => console.log(error))
}


function visualise(bookInfo) {
  //clean noBookFound
  noBookFound.style.display="none";
  //clean container
  infoContainer.innerHTML = "";

  //get image if there is one
  let coverSrc = "./no_cover.png";
  if (bookInfo.imageLinks) {
    coverSrc = bookInfo.imageLinks.thumbnail;
  }


  let title = bookInfo.title;
  let subtitle = bookInfo.subtitle;

  //if there are authors
  let authors = "";
  if (bookInfo.authors) {
    authors = bookInfo.authors.join(", ");
  }
  let publisher = bookInfo.publisher;

  //get the year only
  let rawDate = bookInfo.publishedDate;
  let publishedDateArray = rawDate.match(/\d{4}/);
  let publishedDate = publishedDateArray[0];


  let pages = bookInfo.pageCount;

  cover.src = coverSrc;

  let authorsP = document.createElement('p');
  authorsP.className = "info_authors";
  authorsP.innerText = authors;

  let titleP = document.createElement('p');
  titleP.textContent = title;

  let subtitleP = document.createElement('p');
  subtitleP.textContent = subtitle;

  let publisherP = document.createElement('p');
  publisherP.className = "info_publishingDetails";
  publisherP.textContent = publisher;

  let publishedP = document.createElement('p');
  publishedP.className = "info_publishingDetails";
  publishedP.textContent = publishedDate;

  let pagesP = document.createElement('p');
  pagesP.className = "info_publishingDetails";
  pagesP.textContent = pages + " с.";


  //visualise info
  infoContainer.appendChild(authorsP);
  infoContainer.appendChild(titleP);
  infoContainer.appendChild(subtitleP);
  infoContainer.appendChild(publisherP);
  infoContainer.appendChild(publishedP);
  infoContainer.appendChild(pagesP);

  //invert authors and capitalize
  let recordAuthors = [];
  if (bookInfo.authors) {
    bookInfo.authors.forEach(a => {
      let authorNames = a.split(" ");
      let surname = authorNames[authorNames.length - 1].toUpperCase();
      let invertedName = surname;
      authorNames.pop();
      invertedName += `, ${authorNames.join(" ")}`;
      //remove . if invertedName ends on it
      if (invertedName.charAt(invertedName.length - 1) == '.') {
        invertedName = invertedName.substr(0, invertedName.length - 1);
      }

      recordAuthors.push(invertedName);
    })
  }
  let authorsString = "";
  //add . after authors if any
  if (recordAuthors.length > 0) {
    authorsString = recordAuthors.join(", ") + "."
  }

  //add subtitle if any
  if (subtitle) {
    title += `: ${subtitle}`
  }

  //create record object to pass to add to bibliography function
  let recordObj = {
    authorsString,
    title,
    publisher,
    publishedDate,
    isbn
  }

  //visualise button
  addToBibliographyButton.style.display = "block";
  addToBibliographyButton.addEventListener('click', function () {
    addToBibliography(recordObj);
  })

  function addToBibliography(recordObj) {
    console.log(recordObj);

    //create italicized span
    let italicizedSpan=document.createElement("SPAN");
    
    italicizedSpan.style.fontStyle="italic";
    italicizedSpan.textContent=" "+recordObj.title;
    console.log(italicizedSpan.innerText+ "ITALICS")

    //create record p element
    let recordP=document.createElement('p');
    recordP.innerText=recordObj.authorsString;
    recordP.appendChild(italicizedSpan);

    let restOfRecord=document.createElement("span");
    restOfRecord.innerText=`. ${recordObj.publisher}, ${recordObj.publishedDate}. ISBN ${recordObj.isbn}`;
    recordP.appendChild(restOfRecord);
    
    bibliographyElements.push({sortWord:authorsString, htmle:recordP})
    console.log(bibliographyElements)

 
    //create record
    let record = `${recordObj.authorsString} ${recordObj.title}. ${recordObj.publisher}, ${recordObj.publishedDate}. ISBN ${recordObj.isbn}`;

    //clear container
    bibliographyContainer.innerHTML = "";
    //add record
    bibliography.push(record);

    //remove duplicate records
    let unique = [];
    bibliography.forEach(r => {
      if (!unique.includes(r)) {
        unique.push(r)
      }
    })

    //find a way to remove repeating elements
 
    let uniqueElements = [];
    // let uniqueElements = [];
    
    bibliographyElements.forEach(r => {
      if (!uniqueElements.includes(r)) {
        uniqueElements.push(r)
      }
    })

  

    //sort records
    let sorted = unique.sort(function (a, b) {
      return a.localeCompare(b)
    });

    let sortedElements = uniqueElements.sort(function (a, b) {
      return a.sortWord.localeCompare(b.sortWord)
    });

    sorted.forEach(r => {
      let recordP = document.createElement('p');
      recordP.innerText = r;
      bibliographyContainer.appendChild(recordP)
    })

    sortedElements.forEach(r => {
    console.log(r)
     italics.appendChild(r.htmle)
    })
  }
}