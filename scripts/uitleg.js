function voorbeeld_knop() {
    let e = document.getElementById("knop_voorbeeld_tekst");

    if (e.innerHTML !== "Ik ben veranderd!") {
        e.innerHTML = "Ik ben veranderd!";
    } else if (e.style.color !== "red") {
        e.style.color = "red";
    } else {
        e.style.color = "black";
        e.innerHTML = "Ik wordt veranderd!"
    }
}