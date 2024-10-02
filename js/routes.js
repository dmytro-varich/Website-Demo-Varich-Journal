import Mustache from "./mustache.js";
import processOpnFrmData from "./addComment.js";


//an array, defining the routes
export default[

    {
        //the part after '#' in the url (so-called fragment):
        hash:"journal",
        ///id of the target html element:
        target:"router-view",
        //the function that returns content to be rendered to the target html element:
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML = document.getElementById("template-journal").innerHTML;
        },
    
    },
    {
        hash:"articles",
        target:"router-view",
        getTemplate: fetchAndDisplayArticles
    },
    {
        hash:"comments",
        target:"router-view",
        getTemplate: createHtml4opinions
    },    
    {
        hash:"addComment",
        target:"router-view",
        getTemplate: (targetElm) => {
            document.getElementById(targetElm).innerHTML = document.getElementById("template-addComment").innerHTML;
            document.getElementById("opnFrm").onsubmit=processOpnFrmData;
        }
    }

];                  

const maxCommentsPerPage = 9; 
let currentPage = 1;

function createHtml4opinions(targetElm) {
    const opinionsFromStorage = localStorage.myTreesComments;
    let opinions = [];
    
    if (opinionsFromStorage) {
        opinions = JSON.parse(opinionsFromStorage);
        opinions.forEach(opinion => {
            const createdDate = new Date(opinion.created);
            const timeAgoResult = timeAgo(createdDate);

            opinion.opinionView = {
                first_name: opinion.first_name,
                last_name: opinion.last_name,
                gender: opinion.gender,
                tag: opinion.tag,
                comment: opinion.comment,
                createdDate: createdDate.toDateString(),
                timeAgoResult: timeAgoResult,
                url_photo: opinion.url_photo
            };
        });
    }

    const startIdx = (currentPage - 1) * maxCommentsPerPage;
    const endIdx = startIdx + maxCommentsPerPage;

    const paginatedOpinions = opinions.slice(startIdx, endIdx);

    document.getElementById(targetElm).innerHTML = Mustache.render(
    document.getElementById("template-comments").innerHTML,
    { opinions: paginatedOpinions }
  );
}

export function changePage(offset) {
    const opinionsFromStorage = localStorage.myTreesComments;
    let opinions = [];
    opinions = JSON.parse(opinionsFromStorage);

  const maxPages = Math.ceil(opinions.length / maxCommentsPerPage);

  currentPage += offset;

  if (currentPage < 1) {
    currentPage = maxPages; 
  } else if (currentPage > maxPages) {
    currentPage = 1; 
  }
  createHtml4opinions("router-view");
}

function timeAgo(createdDate) {
        const currentDate = new Date();
        const timeDifference = currentDate - createdDate;

        const seconds = Math.floor(timeDifference / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
        return 'Just now';
        }
} 

function fetchAndDisplayArticles(targetElm, current, totalCount) {
    const url = "http://192.168.56.101/api/article";
    current = parseInt(current);
    totalCount = parseInt(totalCount);
    const data4rendering = {
        currPage: current,
        pageCount: totalCount
    };

    function reqListener() {
        console.log(this.responseText)
        if (this.status == 200) {
            if (current > 1) {
                data4rendering.prevPage = current - 1;
            }

            if (current < totalCount) {
                data4rendering.nextPage = current + 1;
            }
            document.getElementById(targetElm).innerHTML =
                Mustache.render(
                    document.getElementById("template-articles").innerHTML,
                    JSON.parse(this.responseText)
                );

            // Добавляем обработчики событий для стрелок
            const leftArrow = document.querySelector('.articles-left-arrow');
            const rightArrow = document.querySelector('.articles-right-arrow');

            if (leftArrow) {
                leftArrow.addEventListener('click', function () {
                    if (data4rendering.prevPage) {
                        window.location.hash = `#articles/${data4rendering.prevPage}/${data4rendering.pageCount}`;
                    }
                });
            }

            if (rightArrow) {
                rightArrow.addEventListener('click', function () {
                    if (data4rendering.nextPage) {
                        window.location.hash = `#articles/${data4rendering.nextPage}/${data4rendering.pageCount}`;
                    }
                });
            }

        } else {
            alert("ERROR: " + this.statusText);
        }

    }

    console.log(url)
    var ajax = new XMLHttpRequest();
    ajax.addEventListener("load", reqListener);
    ajax.open("GET", url, true);
    ajax.send();
    console.log("send")
}

// function fetchAndDisplayArticles(targetElm, current,totalCount){
//     const url = "http://192.168.56.101/api/article";
    

//     function reqListener () {
// 		console.log(this.responseText)
//         if (this.status == 200) {
//             current=parseInt(current);
//             totalCount=parseInt(totalCount);
//             const data4rendering={
//         currPage:current,
//         pageCount:totalCount
//     };
//             if(current>1){
//         data4rendering.prevPage=current-1;
//     }

//     if(current<totalCount){
//         data4rendering.nextPage=current+1;
//     }
// 			document.getElementById(targetElm).innerHTML =
//             Mustache.render(
//                 document.getElementById("template-articles").innerHTML,
//                 JSON.parse(this.responseText), data4rendering
//                 );
            
// 		} else {
// 			alert("ERROR: " + this.statusText);
// 		}
		
//     }
//     console.log(url)
// 	var ajax = new XMLHttpRequest(); 
// 	ajax.addEventListener("load", reqListener); 
// 	ajax.open("GET", url, true); 
// 	ajax.send();
// 	console.log("send")
// } 