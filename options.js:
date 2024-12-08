document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("delay-form");

  // Load saved values
  chrome.storage.sync.get(["delayRange"], ({ delayRange }) => {
    if (delayRange) {
      document.getElementById("minDelay").value = delayRange.min;
      document.getElementById("maxDelay").value = delayRange.max;
    }
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const minDelay = parseInt(document.getElementById("minDelay").value, 10);
    const maxDelay = parseInt(document.getElementById("maxDelay").value, 10);

    // Validate and save
    if (minDelay > 0 && maxDelay > minDelay) {
      chrome.storage.sync.set({ delayRange: { min: minDelay, max: maxDelay } }, () => {
        alert("Delay settings saved!");
      });
    } else {
      alert("Invalid delay values. Ensure min < max and both are positive.");
    }
  });
});
