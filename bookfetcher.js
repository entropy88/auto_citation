let fetchBtn = document.getElementById("fetchBtn");
let inputField = document.getElementById("isbnInput");
let result = document.getElementById("result");
let biblio = document.getElementById('biblio');
let cover = document.getElementById('coverImg');

let isbn = "";

console.log(fetchBtn)
console.log(inputField)


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
      let isEbook=data.saleInfo.isEbook;
      console.log(isEbook)
      let info = data.volumeInfo;
      let bookInfo = Object.assign(info);
      visualise(bookInfo);

    })
    .catch(error => console.log(error))
}


function visualise(bookInfo) {
 //clean container
 biblio.innerHTML="";

  //get image if there is one
  let coverSrc="./no_cover.png";
  if (bookInfo.imageLinks){
coverSrc = bookInfo.imageLinks.thumbnail;
  }
 

  let title = bookInfo.title;
  let subtitle = bookInfo.subtitle;

  //if there are authors
  let authors="";
  if(bookInfo.authors){
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
  authorsP.className="info_authors";
  authorsP.innerText = authors;

  let titleP = document.createElement('p');
  titleP.textContent = title;

  let subtitleP = document.createElement('p');
  subtitleP.textContent = subtitle;

  let publisherP = document.createElement('p');
  publisherP.className="info_publishingDetails";
  publisherP.textContent = publisher;

  let publishedP = document.createElement('p');
  publishedP.className="info_publishingDetails";
  publishedP.textContent = publishedDate;

  let pagesP = document.createElement('p');
  pagesP.className="info_publishingDetails";
  pagesP.textContent = pages + " с.";



  biblio.appendChild(authorsP);
  biblio.appendChild(titleP);
  biblio.appendChild(subtitleP);
  biblio.appendChild(publisherP);
  biblio.appendChild(publishedP);
  biblio.appendChild(pagesP);

  //invert authors and capitalize
  let recordAuthors = [];
  if (bookInfo.authors){
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
let authorsString="";
//add . after authors if any
if (recordAuthors.length>0){
  authorsString=recordAuthors.join(", ")+"."
}

  //add subtitle if any
  if (subtitle){
    title+=`: ${subtitle}`
  }

  let record = `${authorsString} ${title}. ${publisher}, ${publishedDate}. ISBN ${isbn}`;
  let recordP = document.createElement('p');
  recordP.innerText = record;
  result.appendChild(recordP)

}