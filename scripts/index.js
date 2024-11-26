const reload = document.getElementById("reloadButton");
const htmlInput = document.getElementById("htmlInput");
const cssInput = document.getElementById("cssInput");
const jsInput = document.getElementById("jsInput");

const exerciseText = document.getElementById("exercise");
const resultFrame = document.getElementById("result").contentDocument;

const server = "ws://192.168.2.213:5001";

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

function removePopup() {
    const popup = document.getElementById("popup");
    if (popup) {
        document.body.removeChild(popup);
    }
}

let packet_options

function startWebSocket() {
    websocket = new WebSocket(server);

    websocket.onopen = () => {
        console.log("Connected to server.");
    };

    websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "start") {
            permissionGranted = true;
            localStorage.setItem("permissionGranted", "true");
            removePopup();
            displayPacketOptions(packet_options);
        } else if (data.type === "packets") {
            // Wait for the "start" signal before showing packets
            packet_options = data.available
        } else if (data.type === "exercises") {
            exerciseManager.exercises = data.packet;
            exerciseManager.exerciseCount = data.packet.length;
            exerciseManager.currentExercise = 1;
            exerciseManager.updateExerciseText();
        } else if (data.type === "error") {
            console.error("Error from server:", data.message);
        }
    };

    websocket.onclose = () => {
        console.log("Disconnected from server.");
    };
}

function displayPacketOptions(packets) {
    const packetSelector = document.createElement("div");
    packetSelector.id = "packetSelector";

    packets.forEach((packet) => {
        const button = document.createElement("button");
        button.innerText = packet;
        button.onclick = () => {
            websocket.send(JSON.stringify({ type: "choose_packet", packet: packet }));
            packetSelector.remove();
        };
        packetSelector.appendChild(button);
    });

    document.body.appendChild(packetSelector);
}

reload.addEventListener("click", () => {
    const resultCode = `
        <style>${cssInput.value}</style>
        ${htmlInput.value}
        <script>${jsInput.value}<\/script>
    `;
    try {
        const iframeDoc = resultFrame;
        iframeDoc.open();
        iframeDoc.write(resultCode);
        iframeDoc.close();

        const currentExercise = exerciseManager.getCurrentExercise();
        if (currentExercise && currentExercise.validator(htmlInput.value)) {
            exerciseManager.advanceExercise();
        }
    } catch (error) {
        console.error("Error rendering user content:", error);
    }
});

// Check if permission was granted previously
if (localStorage.getItem("permissionGranted") === "true") {
    permissionGranted = true;
    removePopup(); // Remove the waiting popup if permission was granted before
    startWebSocket(); // Establish WebSocket connection
} else {
    showPopup("Waiting for server permission...");
    startWebSocket(); // Establish WebSocket connection
}
