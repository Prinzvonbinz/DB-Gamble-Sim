// ========== Game State ==========
let coins = 10;
let tickets = 0;
let currentCountry = "Deutschland";
let visitedCountries = new Set();
let trainData = [];
let selectedTrain = null;

const countries = ["Deutschland","Frankreich","Italien","Spanien","Schweiz","Österreich","Niederlande","Belgien"];
const countryMultipliers = {
    "Deutschland":1,
    "Frankreich":1.2,
    "Italien":1.3,
    "Spanien":1.5,
    "Schweiz":1.4,
    "Österreich":1.3,
    "Niederlande":1.2,
    "Belgien":1.2
};

const stationNames = ["Berlin Hbf","Hamburg Hbf","München Hbf","Köln Hbf","Frankfurt Hbf","Stuttgart Hbf","Dresden Hbf"];
const trainDestinations = ["Paris","Rom","Madrid","Zürich","Wien","Amsterdam","Brüssel"];

// ========== DOM ==========
const coinsDisplay = document.getElementById("coinsDisplay");
const countryDisplay = document.getElementById("countryDisplay");
const slot1 = document.getElementById("slot1");
const slot2 = document.getElementById("slot2");
const slot3 = document.getElementById("slot3");
const spinBtn = document.getElementById("spinBtn");
const ticketStatus = document.getElementById("ticketStatus");

const trainList = document.getElementById("trainList");
const guessSection = document.getElementById("guessSection");
const delayGuess = document.getElementById("delayGuess");
const submitGuess = document.getElementById("submitGuess");
const travelBtn = document.getElementById("travelBtn");

// ========== Update Display ==========
function updateDisplay(){
    coinsDisplay.textContent = `Münzen: ${coins}`;
    countryDisplay.textContent = `Aktuelles Land: ${currentCountry}`;
    ticketStatus.textContent = `Tickets: ${tickets}`;
}

// ========== Slot Machine ==========
spinBtn.addEventListener("click", ()=>{
    if(coins < 3) return alert("Nicht genug Münzen!");
    coins -= 3;
    updateDisplay();

    const symbols = ["🎫","❌"];
    const result = [
        symbols[Math.floor(Math.random()*2)],
        symbols[Math.floor(Math.random()*2)],
        symbols[Math.floor(Math.random()*2)]
    ];

    slot1.textContent = result[0];
    slot2.textContent = result[1];
    slot3.textContent = result[2];

    if(result.every(s => s === "🎫")){
        tickets++;
        updateDisplay();
        alert("Du hast ein Ticket gewonnen!");
    }
});

// ========== Generate Random Trains ==========
function fetchRandomTrains(){
    trainList.innerHTML = "";
    selectedTrain = null;
    guessSection.classList.add("hidden");

    trainData = [];

    for(let i=0; i<5; i++){ // 5 zufällige Züge
        const station = stationNames[Math.floor(Math.random()*stationNames.length)];
        const destination = trainDestinations[Math.floor(Math.random()*trainDestinations.length)];
        const departureTime = new Date(Date.now() + Math.floor(Math.random()*60)*60000); // in 0-59 Minuten
        const delay = Math.floor(Math.random()*31); // 0-30 Minuten

        trainData.push({
            train: { name: `ICE ${Math.floor(Math.random()*900)+100}` },
            from: { name: station },
            to: { name: destination },
            plannedDeparture: departureTime,
            delay: delay
        });
    }

    renderTrainList();
}

function renderTrainList(){
    trainList.innerHTML = "";
    trainData.forEach((train, index) => {
        const li = document.createElement("li");
        li.textContent = `${train.train.name} von ${train.from.name} nach ${train.to.name} (${train.plannedDeparture.toLocaleTimeString()})`;
        li.addEventListener("click", ()=>selectTrain(index));
        trainList.appendChild(li);
    });
}

// ========== Select Train ==========
function selectTrain(index){
    selectedTrain = trainData[index];
    guessSection.classList.remove("hidden");
}

// ========== Submit Guess ==========
submitGuess.addEventListener("click", ()=>{
    if(!selectedTrain) return;
    let guess = parseInt(delayGuess.value);
    if(isNaN(guess)) return alert("Bitte Zahl eingeben!");

    let actual = selectedTrain.delay;
    let diff = Math.abs(guess - actual);
    let multiplier = countryMultipliers[currentCountry] || 1;
    let reward = 0;

    if(diff === 0) reward = 20 * multiplier;
    else if(diff <= 1) reward = 15 * multiplier;
    else if(diff <= 5) reward = 10 * multiplier;
    else if(diff <= 10) reward = 5 * multiplier;
    else reward = 1 * multiplier;

    coins += Math.round(reward);
    updateDisplay();
    alert(`Tatsächliche Verspätung: ${actual} Minuten\nDu erhältst ${Math.round(reward)} Münzen`);
    
    delayGuess.value = "";
    guessSection.classList.add("hidden");
    fetchRandomTrains();
    travelBtn.classList.remove("hidden");
});

// ========== Travel with Ticket ==========
travelBtn.addEventListener("click", ()=>{
    if(tickets <= 0) return alert("Kein Ticket vorhanden!");
    tickets--;

    const remaining = countries.filter(c => !visitedCountries.has(c));
    if(remaining.length === 0){
        alert("Glückwunsch! Du hast alle Länder bereist und das Spiel gewonnen!");
        return;
    }

    const newCountry = remaining[Math.floor(Math.random()*remaining.length)];
    currentCountry = newCountry;
    visitedCountries.add(newCountry);
    updateDisplay();
    fetchRandomTrains();
    travelBtn.classList.add("hidden");
});

// ========== Start ==========
updateDisplay();
fetchRandomTrains();
