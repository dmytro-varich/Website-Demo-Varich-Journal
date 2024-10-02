export default class OpinionsHandler {

    /**
     * constructor
     * @param opinionsFormElmId - id of a form element where a new visitor opinion is entered
     * @param opinionsListElmId - id of a html element to which the list of visitor opinions is rendered
     */
    constructor(opinionsFormElmId, opinionsListElmId){ //("opnFrm","opinionsContainer")
        this.opinions = [];

        //TODO Add opinionsElm property, referencing the div with id given by the parameter opinionsListElmId
        //TODO Add opinionsFrmElm property, referencing the form with id given by the parameter opinionsFormElmId
        this.opinionsElm = document.getElementById(opinionsListElmId);
		this.opinionsFrmElm = document.getElementById(opinionsFormElmId);
    }

    /**
     * initialisation of the list of visitor opinions and form submit setup
     */
    init(){
        if (localStorage.myTreesComments) {
            this.opinions = JSON.parse(localStorage.myTreesComments);
        }

        //TODO render opinions to html
        this.opinionsElm.innerHTML = this.opinionArray2html(this.opinions);

        this.opinionsFrmElm.addEventListener("submit", event => this.processOpnFrmData(event));
    }

    /**
     * Processing of the form data with a new visitor opinion
     * @param event - event object, used to prevent normal event (form sending) processing
     */
    processOpnFrmData(event) {
        //1.prevent normal event (form sending) processing
        event.preventDefault();

        //2. Read and adjust data from the form (here we remove white spaces before and after the strings)
        const nopFirstName = document.getElementById("first_name").value.trim();
        const nopLastName = document.getElementById("last_name").value.trim();
        // const nopEmail = document.getElementById("email").value.trim();
        // const nopUrlPhoto = document.getElementById("photo").value.trim();
        const genderRadios = document.getElementsByName("user_gender");
        const nopTag = document.getElementById("tag").value.trim();
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
          // url_photo: nopUrlPhoto,
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
        

        this.opinions.push(newOpinion);

        localStorage.myTreesComments = JSON.stringify(this.opinions);

        //4. Notify the user
        // window.alert("Your opinion has been stored. Look to the console");
        console.log("New opinion added");
        console.log(this.opinions);


        //4. Update HTML
        //TODO add the new opinion to HTML
        // this.opinionsElm.innerHTML+=this.opinion2html(newOpinion);


        //5. Reset the form
      // this.opinionsFrmElm.reset(); //resets the form
      
      //5. Go to the opinions
      window.location.hash="#comments";
    }

    /**
     * creates html code for one opinion using a template literal
     * @param opinion - object with the opinion
     * @returns {string} - html code with the opinion
     */
    opinion2html(opinion){
        //TODO finish opinion2html
        const opinionTemplate=
		`
			<section>
          <div>
              <h4>${opinion.first_name} ${opinion.last_name} <span>${opinion.timeAgoResult} <span> ${opinion.tag}</span></span></h4>
            <p>${opinion.comment}</p>
        </div>
			</section>`;
		return opinionTemplate;
    }

    /**
     * creates html code for all opinions in an array using the opinion2html method
     * @param sourceData -  an array of visitor opinions
     * @returns {string} - html code with all the opinions
     */
    opinionArray2html(sourceData){
        //TODO finish opinionArray2html
        //return sourceData.reduce((htmlWithOpinions,opn) => htmlWithOpinions+ this.opinion2html(opn),"");
        let htmlWithOpinions="";

		for(const opn of sourceData){
			htmlWithOpinions += this.opinion2html(opn);
		}

		return htmlWithOpinions;
    }

}



