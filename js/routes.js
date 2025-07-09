import Mustache from "./mustache.js";
import { processOpnFrmData, getRandomImage } from "./addComment.js";
import { activateLink } from "./scriptButton.js";

//an array, defining the routes
export default [
  {
    //the part after '#' in the url (so-called fragment):
    hash: "journal",
    ///id of the target html element:
    target: "router-view",
    //the function that returns content to be rendered to the target html element:
    getTemplate: (targetElm) => {
      document.getElementById(targetElm).innerHTML =
        document.getElementById("template-journal").innerHTML;
      renderGoogleSignInIfNeeded();
      updateLoginUI();
    },
  },
  {
    hash: "articles",
    target: "router-view",
    getTemplate: fetchAndDisplayArticles,
  },
  {
    hash: "comments",
    target: "router-view",
    getTemplate: createHtml4opinions,
  },
  {
    hash: "addComment",
    target: "router-view",
    getTemplate: (targetElm) => {
      document.getElementById(targetElm).innerHTML = document.getElementById(
        "template-addComment"
      ).innerHTML;
      document.getElementById("opnFrm").onsubmit = processOpnFrmData;
    },
  },
  {
    hash: "artInsert",
    target: "router-view",
    getTemplate: addArticle,
  },
  {
    hash: "artEdit",
    target: "router-view",
    getTemplate: (target, id) => editArticle(target, id),
  },
  {
    hash: "article",
    target: "router-view",
    getTemplate: (target, id) => showArticle(target, id),
  },
  {
    hash: "addArtComment",
    target: "router-view",
    getTemplate: (target, id) => addArtComment(target, id),
  },
];

const maxCommentsPerPage = 9;
let currentPage = 1;

function createHtml4opinions(targetElm) {
  const opinionsFromStorage = localStorage.myTreesComments;
  let opinions = [];

  if (opinionsFromStorage) {
    opinions = JSON.parse(opinionsFromStorage);
    opinions.forEach((opinion) => {
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
        url_photo: opinion.url_photo,
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
    return `${days} day${days > 1 ? "s" : ""} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  } else if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  } else {
    return "Just now";
  }
}

const urlBase = "https://wt.kpi.fei.tuke.sk/api";

function fetchAndDisplayArticles(targetElm, current, totalCount) {
  const url = `https://wt.kpi.fei.tuke.sk/api/article?offset=${
    (current - 1) * 2
  }&max=2`;
  current = parseInt(current);
  totalCount = parseInt(totalCount);
  const data4rendering = {
    currPage: current,
    pageCount: totalCount,
  };

  async function reqListener() {
    console.log(this.responseText);
    if (this.status == 200) {
      if (current > 1) {
        data4rendering.prevPage = current - 1;
      }

      if (current < totalCount) {
        data4rendering.nextPage = current + 1;
      }

      const myArticles1 = [
        {
          title: "Which Products Help You Get a Good Sleep",
          imageLink: "fig/sleep_nutrition_img1_.png",
          author: "Varich Journal",
          dateCreated: "September 30, 2023",
          tags: ["#Nutrition", " #Health"],
        },
        {
          title: "Tips and Strategies for Better Sleep",
          imageLink: "fig/sleep_health_img1.png",
          author: "Varich Journal",
          dateCreated: "December 27, 2023",
          tags: ["#Health"],
        },
      ];
      const myArticles2 = [
        {
          title: "Foods that Promote Cancer and How to Avoid Exposure",
          imageLink: "fig/cancer_nutrition_img1.png",
          author: "Varich Journal",
          dateCreated: "February 17, 2024",
          tags: ["#Health"],
        },
        {
          title: "Foods that slow down aging",
          imageLink: "fig/nutrition_health_img1.jpg",
          author: "Varich Journal",
          dateCreated: "August 17, 2024",
          tags: ["#Nutrition", " #Health"],
        },
      ];
      const data = JSON.parse(this.responseText);
      if (current === 1) {
        data.articles = myArticles1;
      } else if (current === 2) {
        data.articles = myArticles2;
      } else {
        const DEFAULT_IMAGE = "fig/vj_articles_photo.png";
        data.articles = data.articles.map((article) => {
          if (!article.imageLink) {
            article.imageLink = DEFAULT_IMAGE;
          }
          if (article.tags) {
            article.tags = article.tags.map((tag) => "#" + tag);
            article.tags = article.tags.join(", ");
          } else {
            article.tags = ["#Journal"];
          }
          if (article.dateCreated) {
            const date = new Date(article.dateCreated);

            const options = { year: "numeric", month: "long", day: "numeric" };
            const formattedDate = date.toLocaleDateString("en-US", options);
            article.dateCreated = formattedDate;
          }
          return article;
        });
      }

      const fetchCommentsForArticle = async (article) => {
        try {
          const response = await fetch(
            `https://wt.kpi.fei.tuke.sk/api/article/${article.id}/comment`
          );
          if (response.ok) {
            const comments = await response.json();
            comments.comments = comments.comments.map((comment) => {
              if (comment.author && comment.text) {
                comment.avatar = getRandomImage();
              }
              return comment;
            });
            article.comments = comments.comments;
          } else {
            article.comments = [];
          }
        } catch (e) {
          article.comments = [];
        }
        console.log("COMENETS:", article.comments);
      };

      if (!data.comments || data.comments.length === 0) {
        data.comments = null;
      }

      await Promise.all(data.articles.map(fetchCommentsForArticle));
      console.log(data.articles);
      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-articles").innerHTML,
        { ...data, ...data4rendering }
      );
      const articlesMain = document.getElementById("articles-main");
      console.log("GROK IS TRUE?", articlesMain);
      const routerView = document.getElementById("router-view");
      if (articlesMain && routerView) {
        routerView.style.left = "5%";
        routerView.style.top = "25%";
      }

      const leftArrow = document.querySelector(".articles-left-arrow");
      const rightArrow = document.querySelector(".articles-right-arrow");

      if (leftArrow) {
        leftArrow.addEventListener("click", function () {
          if (data4rendering.prevPage) {
            window.location.hash = `#articles/${data4rendering.prevPage}/${data4rendering.pageCount}`;
          }
        });
      }

      if (rightArrow) {
        rightArrow.addEventListener("click", function () {
          if (data4rendering.nextPage) {
            window.location.hash = `#articles/${data4rendering.nextPage}/${data4rendering.pageCount}`;
          }
        });
      }
    } else {
      alert("ERROR: " + this.statusText);
    }
  }
  console.log(url);
  var ajax = new XMLHttpRequest();
  ajax.addEventListener("load", reqListener);
  ajax.open("GET", url, true);
  ajax.send();
  console.log("send");
}

function addArticle(targetElm) {
  const userNameGoogle = localStorage.getItem("userName");
  const responseJSON = {
    formTitle: "Add Article",
    submitBtTitle: "Add",
    author: userNameGoogle || "",
    title: "",
    content: "",
    imageLink: "",
    tags: "",
  };

  document.getElementById(targetElm).innerHTML = Mustache.render(
    document.getElementById("template-addArticle").innerHTML,
    responseJSON
  );
  submitArticleForm();
}

function editArticle(targetElm, articleId) {
  const url = `${urlBase}/article/${articleId}`;

  function reqListener() {
    console.log(this.responseText);
    if (this.status == 200) {
      const responseJSON = JSON.parse(this.responseText);
      const upgradeJSON = {
        formTitle: "Edit Article",
        submitBtTitle: "Save",
        author: responseJSON.author || "Anonymous",
        title: responseJSON.title || "",
        content: responseJSON.content || "",
        imageLink: responseJSON.imageLink || "",
        tags: responseJSON.tags[0] || "",
      };

      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-addArticle").innerHTML,
        upgradeJSON
      );

      submitArticleForm(articleId);
    }
  }

  console.log(url);
  var ajax = new XMLHttpRequest();
  ajax.addEventListener("load", reqListener);
  ajax.open("GET", url, true);
  ajax.send();
}

async function submitArticleForm(articleId = null) {
  const form = document.getElementById("articleForm");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      let imageLink = null;
      let manualLink = formData.get("photo");
      if (window.uploadedFile) {
        imageLink = await uploadImageAndGetUrl(window.uploadedFile);
      } else if (manualLink && (await isValidImageUrl(manualLink))) {
        imageLink = manualLink;
      }

      console.log(
        formData.get("title_name"),
        formData.get("author_name"),
        imageLink,
        formData.get("content"),
        formData.get("tag")
      );

      const articleData = {
        title: formData.get("title_name"),
        author: formData.get("author_name"),
        imageLink: imageLink,
        content: formData.get("content"),
        tags: [formData.get("tag") || "Journal"],
      };

      const url = articleId
        ? `https://wt.kpi.fei.tuke.sk/api/article/${articleId}`
        : "https://wt.kpi.fei.tuke.sk/api/article";
      const method = articleId ? "PUT" : "POST";
      try {
        const response = await fetch(url, {
          method: method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });

        if (response.ok) {
          //   alert("Article added successfully!");
          activateLink("link1");
          window.location.hash = "#articles/1/20";
        } else {
          const errorText = await response.text();
          alert("Failed to add article: " + errorText);
        }
      } catch (err) {
        alert("Error while sending request");
      }
    });
  }
}

async function uploadImageAndGetUrl(file) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://wt.kpi.fei.tuke.sk/api/fileUpload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Upload failed");
  }

  const json = await response.json();
  return json.fullFileUrl;
}

async function isValidImageUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD" });
    const contentType = response.headers.get("Content-Type");
    return response.ok && contentType && contentType.startsWith("image/");
  } catch (e) {
    return false;
  }
}

function showArticle(targetElm, articleId) {
  const url = `${urlBase}/article/${articleId}`;

  function reqListener() {
    console.log(this.responseText);
    if (this.status == 200) {
      const responseJSON = JSON.parse(this.responseText);
      if (responseJSON.dateCreated) {
        const date = new Date(responseJSON.dateCreated);

        const options = { year: "numeric", month: "long", day: "numeric" };
        const formattedDate = date.toLocaleDateString("en-US", options);
        responseJSON.dateCreated = formattedDate;
      }
      if (responseJSON.tags) {
        responseJSON.tags = responseJSON.tags.map((tag) => "#" + tag);
        responseJSON.tags = responseJSON.tags.join(", ");
      } else {
        responseJSON.tags = ["#Journal"];
      }
      const upgradeJSON = {
        author: responseJSON.author || "Anonymous",
        title: responseJSON.title || "Title",
        content: responseJSON.content || "",
        imageLink: responseJSON.imageLink || "fig/vj_articles_photo.png",
        dateCreated: responseJSON.dateCreated || Date.now(),
        tags: responseJSON.tags,
      };

      document.getElementById(targetElm).innerHTML = Mustache.render(
        document.getElementById("template-showArticle").innerHTML,
        upgradeJSON
      );

      const routerView = document.getElementById("router-view");
      if (routerView) {
        routerView.style.left = "0";
        routerView.style.top = "0";
      }

      const indexBody = document.getElementsByClassName("index-body")[0];
      if (indexBody) {
        indexBody.style.overflowY = "visible";
      } else {
        indexBody.style.overflowY = "hidden";
      }

      // const backButton = document.getElementById("backButton");
      // if (backButton) {}
    }
  }
  console.log(url);
  var ajax = new XMLHttpRequest();
  ajax.addEventListener("load", reqListener);
  ajax.open("GET", url, true);
  ajax.send();
}

function addArtComment(targetElm, articleId) {
  const userNameGoogle = localStorage.getItem("userName");
  const responseJSON = {
    formTitle: "Add Comment",
    submitBtTitle: "Add",
    author: userNameGoogle || "",
    comment: "",
  };

  document.getElementById(targetElm).innerHTML = Mustache.render(
    document.getElementById("template-addArtComment").innerHTML,
    responseJSON
  );

  //   const routerView = document.getElementById("router-view");
  //   if (routerView) {
  //     routerView.style.left = "0";
  //     routerView.style.top = "15%";
  //   }

  const form = document.getElementById("articleForm");
  if (form) {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      const formData = new FormData(form);

      const articleData = {
        text: formData.get("comment"),
        author: formData.get("author_name"),
      };

      const url = `https://wt.kpi.fei.tuke.sk/api/article/${articleId}/comment`;
      try {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(articleData),
        });

        if (response.ok) {
          activateLink("link1");
          window.location.hash = "#articles/1/20";
        } else {
          const errorText = await response.text();
          alert("Failed to add article: " + errorText);
        }
      } catch (err) {
        alert("Error while sending request");
      }
    });
  }
}
