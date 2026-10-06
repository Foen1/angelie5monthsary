const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 4173);
const messagePath = path.join(root, "message.js");
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".gif": "image/gif",
  ".svg": "image/svg+xml"
};
const editableFields = ["title", "introduction", "loveNote", "signoff", "signature"];

function send(response, status, body, contentType = "application/json; charset=utf-8") {
  response.writeHead(status, { "Content-Type": contentType, "X-Content-Type-Options": "nosniff", "Cache-Control": "no-store" });
  response.end(body);
}

function currentMessage() {
  delete require.cache[require.resolve(messagePath)];
  return require(messagePath);
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host || "localhost"}`);
  if (url.pathname === "/api/message" && request.method === "GET") {
    try { send(response, 200, JSON.stringify(currentMessage())); }
    catch { send(response, 500, JSON.stringify({ error: "The message file could not be read." })); }
    return;
  }

  if (url.pathname === "/api/message" && request.method === "POST") {
    let body = "";
    request.setEncoding("utf8");
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 24000) request.destroy();
    });
    request.on("end", async () => {
      try {
        const received = JSON.parse(body);
        const message = {};
        for (const field of editableFields) {
          if (typeof received[field] !== "string" || received[field].length > 7000) {
            send(response, 400, JSON.stringify({ error: "Please check the message fields and try again." }));
            return;
          }
          message[field] = received[field];
        }
        const source = `// Saved from editor.html. You can also edit these words by hand.\nconst mesiversaryMessage = ${JSON.stringify(message, null, 2)};\n\nif (typeof module !== "undefined" && module.exports) module.exports = mesiversaryMessage;\nif (typeof window !== "undefined") window.MESIVERSARY_MESSAGE = mesiversaryMessage;\n`;
        await fs.writeFile(messagePath, source, "utf8");
        send(response, 200, JSON.stringify({ saved: true }));
      } catch {
        send(response, 400, JSON.stringify({ error: "Your message could not be saved. Please try again." }));
      }
    });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    send(response, 405, JSON.stringify({ error: "That request is not available." }));
    return;
  }

  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { send(response, 400, "Bad request", "text/plain; charset=utf-8"); return; }
  if (pathname === "/") pathname = "/index.html";
  const filePath = path.resolve(root, `.${pathname}`);
  if (!filePath.startsWith(root + path.sep)) { send(response, 403, "Forbidden", "text/plain; charset=utf-8"); return; }
  try {
    const contents = await fs.readFile(filePath);
    response.writeHead(200, { "Content-Type": types[path.extname(filePath).toLowerCase()] || "application/octet-stream", "X-Content-Type-Options": "nosniff" });
    response.end(request.method === "HEAD" ? undefined : contents);
  } catch {
    send(response, 404, "Not found", "text/plain; charset=utf-8");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Angelie's fifth monthiversary page is ready at http://localhost:${port}`);
  console.log("Keep this window open while using the page and its editor.");
});
