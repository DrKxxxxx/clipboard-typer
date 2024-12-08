document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("delay-form");

    // Lade gespeicherte Werte und setze sie in das Formular ein
    chrome.storage.sync.get(["delayRange"], (result) => {
        if (result.delayRange) {
            document.getElementById("minDelay").value = result.delayRange.min;
            document.getElementById("maxDelay").value = result.delayRange.max;
        }
    });

    form.addEventListener("submit", (event) => {
        event.preventDefault();
        const minDelay = parseInt(document.getElementById("minDelay").value, 10);
        const maxDelay = parseInt(document.getElementById("maxDelay").value, 10);

        if (minDelay > 0 && maxDelay > minDelay) {
            chrome.storage.sync.set({ delayRange: { min: minDelay, max: maxDelay } }, () => {
              console.log("Delay range saved:", { min: minDelay, max: maxDelay }); // Debug
            });
        } else {
            alert("Invalid input: Minimum delay must be greater than 0 and less than Maximum delay.");
        }
    });
});
