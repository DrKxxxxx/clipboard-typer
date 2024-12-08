const State = {
  Start: "0",
  Stop: "1",
};

let delayRange = { min: 50, max: 200 }; // Default-Werte

// Lade gespeicherte Delay-Werte
chrome.storage.sync.get(["delayRange"], (result) => {
  if (result.delayRange) {
    delayRange = result.delayRange;
  }
  console.log("Initial delayRange:", delayRange); // Debug
});

// Beobachte Änderungen an den Delay-Werten
chrome.storage.onChanged.addListener((changes) => {
  if (changes.delayRange) {
    delayRange = changes.delayRange.newValue;
    console.log("Updated delayRange:", delayRange); // Debug
  }
});

// Kontextmenüs erstellen oder erneuern
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.removeAll(() => {
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
    console.log("Context menus created."); // Debug
  });
});

chrome.contextMenus.onClicked.addListener(({ menuItemId }, tab) => {
  console.log("Menu clicked:", menuItemId); // Debug
  if (menuItemId == State.Start) {
    startTyping(tab.id);
  } else if (menuItemId == State.Stop) {
    stopTyping(tab.id);
  }
});

let tasks = {};

const startTyping = async (tabId) => {
  const taskId = Math.random();
  tasks[tabId] = taskId;

  try {
    await chrome.debugger.attach({ tabId }, "1.3");
  } catch (e) {
    console.error("Debugger attach failed:", e); // Debug
    return;
  }

  const text = [...(await readClipboard(tabId))];

  let i = 0;
  while (tasks[tabId] === taskId && i < text.length) {
    console.log(`Typing character: ${text[i]}, Delay: ${delayRange.min}-${delayRange.max}`); // Debug
    await typeCharacter(tabId, text[i]);
    await wait(randomNumber(delayRange.min, delayRange.max));
    i++;
  }

  stopTyping(tabId);
};

const stopTyping = (tabId) => {
  delete tasks[tabId];
  console.log(`Typing stopped for tab ${tabId}`); // Debug
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

const randomNumber = (min, max) => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  console.log(`Random delay generated: ${delay}ms (Range: ${min}-${max})`); // Debug
  return delay;
};

