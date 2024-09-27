const reload = document.getElementById("reloadButton");
const result = document.getElementById("result");

const htmlInput = document.getElementById("htmlInput");
const cssInput = document.getElementById("cssInput");

reload.addEventListener("click", (ev) => {
    let resultCode = "<style>" + cssInput.value + "</style>" + htmlInput.value;
    result.innerHTML = resultCode;
});