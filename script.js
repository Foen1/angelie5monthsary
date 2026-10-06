(() => {
  const message = window.MESIVERSARY_MESSAGE || {};
  const title = document.getElementById("letter-title");
  const introduction = document.getElementById("message-introduction");
  const body = document.getElementById("love-message");
  const closing = document.getElementById("signoff");
  const signature = document.getElementById("signature");

  if (title) title.textContent = message.title || "Five months of choosing you";
  if (introduction) introduction.textContent = message.introduction || "These five months together mean so much to me.";
  if (body) {
    const text = message.loveNote || "I love you so much, Angelie.";
    body.replaceChildren(...text.split(/\n\s*\n/).map((paragraph) => {
      const p = document.createElement("p");
      p.textContent = paragraph;
      return p;
    }));
  }
  if (closing) closing.textContent = message.signoff || "Happy five months, my love.";
  if (signature) signature.textContent = message.signature || "All my love, always ♡";

  const photoWall = document.getElementById("memory-photos");
  const photos = Array.isArray(window.MESIVERSARY_PHOTOS) ? window.MESIVERSARY_PHOTOS.slice(0, 4) : [];
  if (photoWall) {
    photos.forEach((photo, index) => {
      const frame = document.createElement("figure");
      frame.className = `photo-frame photo-frame-${index + 1}`;
      const picture = document.createElement("div");
      picture.className = "photo-picture";

      const placeholder = document.createElement("div");
      placeholder.className = "photo-placeholder-art";
      placeholder.setAttribute("aria-hidden", "true");
      placeholder.innerHTML = '<span>♥</span><i>✿</i><b>♥</b>';

      if (photo.active && photo.src) {
        const image = document.createElement("img");
        image.className = "photo-image";
        image.src = photo.src;
        image.alt = photo.alt || "A favorite photo of Angelie";
        image.addEventListener("error", () => picture.replaceChildren(placeholder), { once: true });
        picture.append(image);
      } else {
        picture.append(placeholder);
        frame.classList.add("photo-frame-empty");
      }

      const caption = document.createElement("figcaption");
      caption.textContent = photo.caption || "my Angelie ♡";
      frame.append(picture, caption);
      photoWall.append(frame);
    });
  }
})();
