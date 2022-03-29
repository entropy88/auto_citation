let fetchBtn = document.getElementById("fetchBtn");
let inputField = document.getElementById("isbnInput");
let result = document.getElementById("result");
let biblio = document.getElementById('biblio');
let cover = document.getElementById('coverImg');

let isbn="";

console.log(fetchBtn)
console.log(inputField)


fetchBtn.addEventListener('click', function () {
   isbn = inputField.value;
    // fetchBook(isbn);
    fetchGoogleBookVolumeId(isbn);
})

function fetchGoogleBookVolumeId(isbn){
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
      let volumeId=data.items[0].id;
      if (!volumeId){
          result.innerText="няма резултати в базата :(";
        
      }
      console.log(volumeId);
      fetchInfo(volumeId);

  })
  .catch(error => {
      console.log(error);
    return;
}
  )
}


function fetchInfo(volumeId){   

    fetch(`https://www.googleapis.com/books/v1/volumes/${volumeId}`)
  .then(response => {
    // indicates whether the response is successful (status code 200-299) or not
    if (!response.ok) {
      throw new Error(`Request failed with status ${reponse.status}`)
    }
    return response.json()
  })
  .then(data => {  
       let info=data.volumeInfo;  
        let bookInfo=Object.assign(info);
        visualise(bookInfo);  

  })
  .catch(error => console.log(error))
}


function visualise(bookInfo){
  console.log(bookInfo)

  //get image
  let coverSrc=bookInfo.imageLinks.thumbnail;

    let title=bookInfo.title;
    let subtitle=bookInfo.subtitle;
    let authors=bookInfo.authors.join(", ");
    let publisher=bookInfo.publisher;    

    //get the year only
    let rawDate=bookInfo.publishedDate;
    let publishedDateArray=rawDate.match(/\d{4}/);
    let publishedDate=publishedDateArray[0];


    let pages=bookInfo.pageCount;

    cover.src=coverSrc;

    let authorsP=document.createElement('p');
    authorsP.innerText=authors;

    let titleP=document.createElement('p');
    titleP.textContent=title;

    let subtitleP=document.createElement('p');
   subtitleP.textContent=subtitle;

    let publisherP=document.createElement('p');
   publisherP.textContent=publisher;

   let publishedP=document.createElement('p');
   publishedP.textContent=publishedDate;

   let pagesP=document.createElement('p');
   pagesP.textContent=pages+" с.";



    biblio.appendChild(authorsP);
    biblio.appendChild(titleP);
    biblio.appendChild(subtitleP);   
    biblio.appendChild(publisherP);
    biblio.appendChild(publishedP);
    biblio.appendChild(pagesP);

    let record=`${authors}. ${title}. ${publisher}, ${publishedDate}. ISBN ${isbn}`;
    let recordP=document.createElement('p');
    recordP.innerText=record;
    result.appendChild(recordP)

}
