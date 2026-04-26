let selected = [];
let currentPage = "start";

const pages = {
  start: [
    { text: "jag", color: "blue" },
    { text: "du", color: "blue" },
    { text: "vill", color: "red" },
    { text: "kan", color: "red" },
    { text: "behöver", color: "red" },
    { text: "hjälp", color: "green" },
    { text: "fråga", color: "yellow" },
    { text: "äta", color: "red" },
    { text: "dricka", color: "red" },
    { text: "ont", color: "green" },
    { text: "trött", color: "green" },
    { text: "vänta", color: "green" },
    { text: "ja", color: "gray" },
    { text: "nej", color: "gray" },
    { text: "tid", color: "yellow" },
    { text: "färdtjänst", color: "yellow" },
    { text: "ringa", color: "red" },
    { text: "boka", color: "red" }
  ],

  fraser: [
    { text: "Hallå", color: "pink", phrase: "Hallå" },
    { text: "Hej du", color: "pink", phrase: "Hej du" },
    { text: "Vad sa du?", color: "green", phrase: "Vad sa du?" },
    { text: "Jag förstår inte", color: "green", phrase: "Jag förstår inte" },
    { text: "Vänta", color: "green", phrase: "Vänta lite" },
    { text: "Hur dags?", color: "green", phrase: "Hur dags?" },
    { text: "Förlåt", color: "green", phrase: "Förlåt" },
    { text: "Tack", color: "pink", phrase: "Tack" },
    { text: "Jag är trött", color: "green", phrase: "Jag är trött" },
    { text: "Jag vill vila", color: "green", phrase: "Jag vill vila" },
    { text: "Bra", color: "green", phrase: "Bra" },
    { text: "Inte bra", color: "green", phrase: "Inte bra" }
  ],

  vardag: [
    { text: "mat", color: "yellow" },
    { text: "vatten", color: "yellow" },
    { text: "toalett", color: "yellow" },
    { text: "vila", color: "green" },
    { text: "sova", color: "green" },
    { text: "tv", color: "yellow" },
    { text: "musik", color: "yellow" },
    { text: "telefon", color: "yellow" },
    { text: "hem", color: "yellow" },
    { text: "klar", color: "green" },
    { text: "mer", color: "green" },
    { text: "sluta", color: "red" }
  ]
};

function fileName(word) {
  return word
    .toLowerCase()
    .replaceAll("å", "a")
    .replaceAll("ä", "a")
    .replaceAll("ö", "o")
    .replaceAll(" ", "_")
    .replaceAll("?", "")
    .replaceAll("!", "");
}

function renderGrid() {
  const grid = document.getElementById("grid");
  grid.innerHTML = "";

  pages[currentPage].forEach(item => {
    const div = document.createElement("div");
    div.className = "cell " + item.color;

    const imgName = fileName(item.text);

    div.innerHTML = `
      <div class="cell-word">${item.text}</div>
      <div class="cell-symbol">
        <img src="bliss/${imgName}.png" 
          onerror="
            this.style.display='none';
            this.parentElement.innerHTML='<div class=&quot;missing-symbol&quot;>lägg in<br>${imgName}.png</div>';
          ">
      </div>
      <div class="cell-type">${item.type || ""}</div>
    `;

    div.onclick = () => {
      if (item.phrase) {
        choosePhrase(item.phrase);
      } else {
        selectWord(item.text);
      }
    };

    grid.appendChild(div);
  });
}

function setPage(page) {
  currentPage = page;
  document.getElementById("pageTitle").innerText =
    page === "start" ? "STARTSIDA" :
    page === "fraser" ? "FRASER" :
    "VARDAG";
  renderGrid();
}

function selectWord(word) {
  selected.push(word);
  updateSentence();
  updateAI();
}

function choosePhrase(phrase) {
  selected.push(phrase);
  document.getElementById("sentence").innerText = phrase;
  document.getElementById("selected").innerText =
    selected.map(x => "[" + x + "]").join(" ");
  speakText(phrase);
  updateAI();
}

function updateSentence() {
  document.getElementById("sentence").innerText =
    selected.length ? selected.join(" ") : "...";

  document.getElementById("selected").innerText =
    selected.length ? selected.map(x => "[" + x + "]").join(" ") : "Valda symboler visas här";
}

function updateAI() {
  const text = selected.join(" ").toLowerCase();
  let suggestions = [];

  if (text.includes("jag") && text.includes("vill") && text.includes("färdtjänst")) {
    suggestions = [
      "Jag vill boka färdtjänst",
      "Kan du ringa färdtjänst?",
      "Fråga vilken tid bilen kommer"
    ];
  } else if (text.includes("jag") && text.includes("vill")) {
    suggestions = [
      "Jag vill vila",
      "Jag vill äta",
      "Jag vill dricka",
      "Jag vill ha hjälp"
    ];
  } else if (text.includes("du") || text.includes("kan")) {
    suggestions = [
      "Kan du hjälpa mig?",
      "Kan du vänta lite?",
      "Kan du säga igen?",
      "Kan du ringa?"
    ];
  } else if (text.includes("ont")) {
    suggestions = [
      "Jag har ont",
      "Kan du hjälpa mig?",
      "Jag behöver vila"
    ];
  } else if (text.includes("tid") || text.includes("hur dags")) {
    suggestions = [
      "Vilken tid?",
      "Hur dags?",
      "När kommer det?"
    ];
  } else if (text.includes("toalett")) {
    suggestions = [
      "Jag behöver gå på toaletten",
      "Kan du hjälpa mig till toaletten?"
    ];
  } else {
    suggestions = [
      "Jag vill säga något",
      "Kan du hjälpa mig?",
      "Jag förstår inte"
    ];
  }

  const aiBar = document.getElementById("aiBar");
  aiBar.innerHTML = "";

  suggestions.forEach(s => {
    const btn = document.createElement("div");
    btn.className = "ai-button";
    btn.innerText = s;
    btn.onclick = () => choosePhrase(s);
    aiBar.appendChild(btn);
  });
}

function speak() {
  const text = document.getElementById("sentence").innerText;
  if (text && text !== "...") speakText(text);
}

function speakText(text) {
  const speech = new SpeechSynthesisUtterance(text);
  speech.lang = "sv-SE";
  speechSynthesis.cancel();
  speechSynthesis.speak(speech);
}

function undo() {
  selected.pop();
  updateSentence();
  updateAI();
}

function clearAll() {
  selected = [];
  updateSentence();
  updateAI();
}

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("service-worker.js");
}

renderGrid();
updateAI();
