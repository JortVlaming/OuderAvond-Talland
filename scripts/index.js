const reload = document.getElementById("reloadButton");
let inputs = []

const exerciseText = document.getElementById("exercise");
let resultFrame = document.getElementById("result").contentDocument;

const server = "ws://127.0.0.1:5002";

let websocket;
let permissionGranted = false;

class ExerciseManager {
    constructor() {
        this.currentExercise = 1;
        this.exerciseCount = 0;
        this.exercises = [];
    }

    getCurrentExercise() {
        return this.exercises[this.currentExercise - 1];
    }

    updateExerciseText() {
        const exercise = this.getCurrentExercise();
        if (exercise) {
            exerciseText.innerText = `${this.currentExercise}/${this.exerciseCount}: ${exercise.name} - ${exercise.description}`;
        } else {
            exerciseText.style.color = "green";
            exerciseText.innerText = "U heeft alle oefeningen correct gemaakt!";
            websocket.send(JSON.stringify({"type": "klaar", "packet": this.currentPacket}));
        }
    }

    advanceExercise() {
        this.currentExercise++;
        this.updateExerciseText();
    }
}

const exerciseManager = new ExerciseManager();

function showPopup(message) {
    const popup = document.createElement("div");
    popup.id = "popup";
    popup.style.position = "fixed";
    popup.style.top = "50%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.padding = "20px";
    popup.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
    popup.style.color = "#fff";
    popup.style.fontSize = "18px";
    popup.style.textAlign = "center";
    popup.style.zIndex = "1000";
    popup.innerText = message;
    document.body.appendChild(popup);
}

function showBlastPopup(message) {
    const popup = document.createElement("div");
    popup.id = "blast_popup";
    popup.style.position = "fixed";
    popup.style.top = "10%";
    popup.style.left = "50%";
    popup.style.transform = "translate(-50%, -50%)";
    popup.style.padding = "20px";
    popup.style.backgroundColor = "rgba(1, 0, 0, 0.7)";
    popup.style.color = "#fff";
    popup.style.fontSize = "18px";
    popup.style.textAlign = "center";
    popup.style.zIndex = "1000";
    popup.innerText = message;
    document.body.appendChild(popup);
}

function removePopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        document.body.removeChild(popup);
    }
}

function removeBlastPopup() {
    const popup = document.getElementById("blast_popup");
    if (popup) {
        document.body.removeChild(popup);
    }
}

let packet_options;
let waiting_for_check = false;

function startWebSocket() {
    websocket = new WebSocket(server);

    websocket.onopen = () => {
        console.log("Connected to server.");
    };

    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "key") {
            localStorage.setItem("key", data.secret_key);
        } else if (data.type === "start") {
            permissionGranted = true;
            removePopup();
            if (packet_options.length === 1) {
                websocket.send(JSON.stringify({type: "choose_packet", packet: packet_options, key: localStorage.getItem("key")}));
            } else {
                displayPacketOptions(packet_options);
            }
        } else if (data.type === "packets") {
            // Wait for the "start" signal before showing packets
            packet_options = data.available;
        } else if (data.type === "exercises") {
            exerciseManager.exercises = data.packet;
            exerciseManager.exerciseCount = data.packet.length;
            exerciseManager.currentExercise = 1;
            exerciseManager.updateExerciseText();
            data.name.toString().split(", ").forEach(lang => {
                let input = document.createElement("div");

                input.innerHTML =
                    `   <h3 class=\"black-nochange\">${lang}</h3>\n` +
                    `   <textarea name=\"${lang.toLowerCase()}Input\" id=\"${lang.toLowerCase()}Input\" class=\"code_input\"></textarea>\n`

                input.classList.add("column");

                document.getElementById("codingForm").appendChild(input);

                inputs.push(input.getElementsByClassName("code_input")[0]);
            })
            document.getElementById("interactive").style.display = prevDisplay;
        } else if (data.type === "error") {
            console.error("Error from server:", data.message);
        } else if (data.type === "validation_result") {
            let validations = data.validations;
            let failed = false;
            let failed_checks = "De volgende condities zijn niet gehaald:";

            for (let condition in validations) {
                console.log(condition)
                let valids = validations[condition];

                if (valids[0] === false) {
                    failed = true;
                    failed_checks += `\n${condition}: ${valids[1]}`;
                    console.error(`Failed condition ${condition}! ${valids[1]}`)
                }
            }

            waiting_for_check = false;
            if (!failed) {
                console.log(`Exercise ${data.exercise_id} passed validation!`);
                exerciseManager.advanceExercise();
            } else {
                showBlastPopup(failed_checks);
                console.error(`Exercise ${data.exercise_id} failed validation.`);
            }
        } else if (data.type === "error") {
            console.error("Error from server:", data.message);
        }
    };

    websocket.onclose = () => {
        console.log("Disconnected from server.");
        setTimeout(function() {
            startWebSocket();
        }, 1000);
    };
}

let currentPacket;

function displayPacketOptions(packets) {
    if (document.getElementById("interactive").style.display !== "none" || document.getElementById("packetSelector") != null) return;
    const packetSelector = document.createElement("div");
    packetSelector.id = "packetSelector";
    packetSelector.style.display = "flex";
    packetSelector.style.flexDirection = "row";
    packetSelector.style.justifyContent = "center";
    packetSelector.style.width = "100%";
    packetSelector.style.gap = "10px";

    packetSelector.style.marginTop = "100px";

    packets.forEach((packet) => {
        const button = document.createElement("button");
        button.innerText = packet;
        button.onclick = () => {
            websocket.send(JSON.stringify({ type: "choose_packet", packet: packet, key: localStorage.getItem("key") }));
            currentPacket = packet;
            packetSelector.remove();
            exerciseManager.currentPacket = packet;
        };
        button.style.width = "250px";
        button.style.height = "250px";
        packetSelector.appendChild(button);
    });

    document.body.appendChild(packetSelector);
}

reload.addEventListener("click", () => {
    if (inputs.length === 3) {
        const resultCode = `
            <body>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        font-family: 'Poppins', sans-serif;
                    }
        
                    ${inputs[1].value}
                </style>
                ${inputs[0].value}
                <script>${inputs[2].value}</script>
            </body>
        `;

        if (resultFrame === undefined) {
            resultFrame = document.getElementById("result");
        }

        const iframeDoc = resultFrame;
        iframeDoc.open();
        iframeDoc.write(resultCode);
        iframeDoc.close();
    }
    if (waiting_for_check === true) {
        return
    }
    try {
        removeBlastPopup();

        const currentExercise = exerciseManager.getCurrentExercise();
        if (currentExercise) {
            let code_inputs = document.getElementsByClassName("code_input");
            let code_values = [];

            for (let input in code_inputs) {
                code_values.push(code_inputs[input].value);
            }

            // Send validation request to the server
            websocket.send(JSON.stringify({
                type: "validate",
                packet: currentPacket,
                exercise_id: currentExercise.id,
                code: code_values,
                secret_key: localStorage.getItem("key")
            }));
            waiting_for_check = true;
        }
    } catch (error) {
        console.error("Error rendering user content:", error);
    }
});

function download() {

    if (exerciseManager.currentPacket === "Python") {
        websocket.send(JSON.stringify({type: "save_file", language: "python", code: inputs[0].value}))

        showPopup("De bestanden zijn gedownload, het is te vinden bij: `/home/pi/Desktop/result`, voor hulp vraag aan een student");

        setTimeout(() => {
            removePopup();
        }, 2500);
    } else {
        const resultCode = `
            <head>
                <title>Uw code</title>
            </head>
            <body>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=Source+Code+Pro:ital,wght@0,200..900;1,200..900&display=swap');
                    
                    * {
                        margin: 0;
                        padding: 0;
                        font-family: 'Poppins', sans-serif;
                    }
        
                    ${inputs[1].value}
                </style>
                ${inputs[0].value}
                <script>${inputs[2].value}</script>
            </body>
        `;
        websocket.send(JSON.stringify({type: "save_file", language: "html", code: resultCode}))

        setTimeout(() => {
            window.open("http://127.0.0.1:5000", "_blank").focus();
        }, 1000);
    }
}

let prevDisplay = document.getElementById("interactive").style.display;
document.getElementById("interactive").style.display = "none";

showPopup("Waiting for server permission...");
startWebSocket(); // Establish WebSocket connection
