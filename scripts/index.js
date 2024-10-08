const reload = document.getElementById("reloadButton");
const result = document.getElementById("result");

const htmlInput = document.getElementById("htmlInput");
const cssInput = document.getElementById("cssInput");

let currentExercise = 1;
const exercise_count = 4;
const exerciseText = document.getElementById("exercise");

reload.addEventListener("click", (ev) => {
    let resultCode = "<style>" + cssInput.value + "</style>" + htmlInput.value;
    result.innerHTML = resultCode;
    verifyExercise();
});

function getExerciseName() {
    switch (currentExercise) {
        case 1:
            return "Jouw webisite, jouw portfolio!"
        case 2:
            return "Goede titel"
        case 3:
            return "Ken uzelf!"
        case 4:
            return "Wikipedia weet het!"
        default:
            return undefined
    }
}

function getExerciseDescription() {
    switch (currentExercise) {
        case 1:
            return "Door middel van tekst elementen schrijf uw naam op de website."
        case 2:
            return "Door middel van header elementen maak uw naam groter"
        case 3:
            return "Door middel van lijst elementen maak een lijst van uw hobby's"
        case 4:
            return "Door middel van link elementen maak een link naar wikipedia"

        default:
            return undefined
    }
}

function verifyExercise() {
    switch (currentExercise) {
        case 1:
            if (htmlInput.value.length !== 0) {
                currentExercise = currentExercise + 1;

                let name = getExerciseName();
                let description = getExerciseDescription();

                exerciseText.innerText = `${currentExercise}/${exercise_count}: ${name} - ${description}`;
            }
            break;
        case 2:
            if (htmlInput.value.includes("<h") && htmlInput.value.includes("</h")) {
                currentExercise = currentExercise + 1;

                let name = getExerciseName();
                let description = getExerciseDescription();

                exerciseText.innerText = `${currentExercise}/${exercise_count}: ${name} - ${description}`;
            }
            break;
        case 3:
            if (htmlInput.value.includes("<ol>") && htmlInput.value.includes("</ol>") || htmlInput.value.includes("<ul>") && htmlInput.value.includes("</ul>")) {
                currentExercise = currentExercise + 1;

                let name = getExerciseName();
                let description = getExerciseDescription();

                exerciseText.innerText = `${currentExercise}/${exercise_count}: ${name} - ${description}`;
            }
            break;
        case 4:
            if (htmlInput.value.includes("<a href=\"") && htmlInput.value.includes("</a>")) {
                exerciseText.style.color = "green";
                exerciseText.innerText = "U heeft alle oefeningen correct gemaakt!";
            }
            break;
    }
}

currentExercise = 1;
let name = getExerciseName();
let description = getExerciseDescription();

exerciseText.innerText = `${currentExercise}/${exercise_count}: ${name} - ${description}`;
