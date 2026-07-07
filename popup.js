const populateBtn = document.getElementById("populateBtn");
const statusMsg = document.getElementById("statusMsg");
const toggleFiles = document.getElementById("toggleFiles");
const toggleLongText = document.getElementById("toggleLongText");
const toggleChoices = document.getElementById("toggleChoices");

function showStatus(text, isError = false) {
  statusMsg.textContent = text;
  statusMsg.style.color = isError ? "#ff453a" : "";
  if (text) {
    setTimeout(() => {
      statusMsg.textContent = "";
    }, 2200);
  }
}

populateBtn.addEventListener("click", async () => {
  const settings = {
    includeFiles: toggleFiles.checked,
    longText: toggleLongText.checked,
    fillChoices: toggleChoices.checked,
  };

  populateBtn.disabled = true;
  const originalLabel = populateBtn.querySelector(".btn-label").textContent;
  populateBtn.querySelector(".btn-label").textContent = "Remplissage...";

  try {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    if (!tab || !tab.id) {
      throw new Error("Aucun onglet actif détecté.");
    }
    if (tab.url && (tab.url.startsWith("chrome://") || tab.url.startsWith("chrome-extension://") || tab.url.startsWith("edge://"))) {
      throw new Error("Cette page ne peut pas être remplie.");
    }

    // 1. Injecte le moteur (content.js) dans la page active
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"],
    });

    // 2. Exécute la fonction de remplissage avec les réglages choisis
    const results = await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: (opts) => window.__formPopRun(opts),
      args: [settings],
    });

    const count = results && results[0] && typeof results[0].result === "number" ? results[0].result : 0;

    if (count > 0) {
      showStatus(`✅ ${count} champ${count > 1 ? "s" : ""} rempli${count > 1 ? "s" : ""} !`);
    } else {
      showStatus("Aucun champ trouvé sur cette page.", true);
    }
  } catch (err) {
    console.error("FormPop error:", err);
    showStatus("Impossible de remplir cette page.", true);
  } finally {
    populateBtn.disabled = false;
    populateBtn.querySelector(".btn-label").textContent = originalLabel;
  }
});
