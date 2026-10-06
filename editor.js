(() => {
  const form = document.getElementById("message-form");
  const status = document.getElementById("save-status");
  const button = document.getElementById("save-button");
  const fields = ["title", "introduction", "loveNote", "signoff", "signature"];

  function showStatus(text, kind = "") {
    status.textContent = text;
    status.className = `save-status${kind ? ` ${kind}` : ""}`;
  }

  async function loadMessage() {
    try {
      const response = await fetch("/api/message", { cache: "no-store" });
      if (!response.ok) throw new Error("Could not load the message.");
      const message = await response.json();
      fields.forEach((field) => { form.elements[field].value = message[field] || ""; });
      showStatus("Your current message is ready to edit.");
    } catch {
      showStatus("Open this page with start.bat so the editor can connect to message.js.", "error");
      button.disabled = true;
    }
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const updated = Object.fromEntries(fields.map((field) => [field, form.elements[field].value.trim()]));
    button.disabled = true;
    button.textContent = "Saving your words…";
    showStatus("Writing your message into message.js…");
    try {
      const response = await fetch("/api/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated)
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your message could not be saved.");
      showStatus("Saved! Refresh the main page to see your updated love note.", "success");
    } catch (error) {
      showStatus(error.message || "Something went wrong. Please try saving again.", "error");
    } finally {
      button.disabled = false;
      button.innerHTML = 'Save my message <span aria-hidden="true">♥</span>';
    }
  });

  loadMessage();
})();
