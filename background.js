const State = {
  Start: "0",
  Stop: "1",
};

// Default-Delay-Werte
let delayRange = { min: 50, max: 200 };

// Lade gespeicherte Delay-Werte
chrome.storage.sync.get(["delayRange"], (result) => {
  if (result.delayRange) {
    delayRange = result.delayRange;
  }
  console.log("Initial delayRange:", delayRange); // Debug: Anfangswerte
});

// Überwache Änderungen am Speicher
chrome.storage.onChanged.addListener((changes) => {
  if (changes.delayRange) {
    delayRange = changes.delayRange.newValue;
    console.log("Updated delayRange:", delayRange); // Debug: Geänderte Werte
  }
});

// Kontextmenüs erstellen
chrome.contextMenus.removeAll(() => {
  // Erstellt Kontextmenüs neu
  chrome.contextMenus.create({
    id: State.Start,
    title: "Start typing",
    contexts: ["all"],
  });

  chrome.contextMenus.create({
    id: State.Stop,
    title: "Stop typing",
    contexts: ["all"],
  });
});

chrome.contextMenus.onClicked.addListener(({ menuItemId }, tab) => {
  if (menuItemId == State.Start) {
    startTyping(tab.id);
  } else {
    stopTyping(tab.id);
  }
});

let tasks = {};

const startTyping = async (tabId) => {
  const taskId = Math.random();

  tasks[tabId] = taskId;

  await chrome.debugger.attach({ tabId }, "1.3").catch(() => {});

  const text = [...(await readClipboard(tabId))];

  let i = 0;

  while (tasks[tabId] === taskId && i < text.length) {
    console.log(`Typing character: ${text[i]}, Delay: ${delayRange.min}-${delayRange.max}`); // Debug
    await wait(randomNumber(delayRange.min, delayRange.max));
    i++;
  }

  stopTyping(tabId);
};

const stopTyping = (tabId) => {
  delete tasks[tabId];
};

const typeCharacter = async (tabId, character) => {
  await chrome.debugger.sendCommand({ tabId }, "Input.insertText", { text: character });
};

const readClipboard = async (tabId) => {
  return chrome.scripting
    .executeScript({
      target: { tabId },
      func: () => navigator.clipboard.readText(),
    })
    .then(([{ result }]) => result);
};

const wait = (milliseconds) =>
  new Promise((resolve) => setTimeout(resolve, milliseconds));

const randomNumber = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
