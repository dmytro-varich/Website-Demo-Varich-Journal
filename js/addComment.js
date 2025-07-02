import { activateLink } from './scriptButton.js' ;


export function processOpnFrmData(event) {
     //1.prevent normal event (form sending) processing
    event.preventDefault();

    //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
    const nopFirstName = document.getElementById("first_name").value.trim();
    const nopLastName = document.getElementById("last_name").value.trim();
    // const nopEmail = document.getElementById("email").value.trim();
    // const nopUrlPhoto = document.getElementById("photo").value.trim();
    const genderRadios = document.getElementsByName("user_gender");
    var nopTag = document.getElementById("tag").value.trim();
    const nopComment = document.getElementById("comment").value.trim();
    // const nopPersonalData = document.getElementById("personal_data").checked;

    let selectedGender;

    for (const radio of genderRadios) {
      if (radio.checked) {
        selectedGender = radio.value;
        break;
      }
    }

    //3. Verify the data
    if (
      nopTag == "" 
    ) {
      nopTag = "Journal"
    }

    //3. Add the data to the array opinions and local storage

    const newOpinion = {
      first_name: nopFirstName,
      last_name: nopLastName,
      // email: nopEmail,
      url_photo: getRandomImage(),
      gender: selectedGender,
      tag: nopTag,
      comment: nopComment,
      // personal_data: nopPersonalData,
      created: new Date(),
    };

    let opinions = [];

    if(localStorage.myTreesComments){
      opinions=JSON.parse(localStorage.myTreesComments);
    }
    

    opinions.push(newOpinion);

    localStorage.myTreesComments = JSON.stringify(opinions);

    //4. Notify the user
    // window.alert("Your opinion has been stored. Look to the console");
    console.log("New opinion added");
    console.log(opinions);


    //4. Update HTML
    //TODO add the new opinion to HTML
    // this.opinionsElm.innerHTML+=this.opinion2html(newOpinion);


    //5. Reset the form
  // this.opinionsFrmElm.reset(); //resets the form
  
  //5. Go to the opinions
  activateLink("link2");
  window.location.hash = "#comments";
}

export function getRandomImage() {
    const imagePaths = [
        "fig/avatar_default-1.png",
        "fig/avatar_default-2.png",
        "fig/avatar_default-3.png",
        "fig/avatar_default-4.png",
        "fig/avatar_default-5.png"
    ];

    const randomIndex = Math.floor(Math.random() * imagePaths.length);

    return imagePaths[randomIndex];
}

