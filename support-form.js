// Shared by the full contact page and the small homepage embed.
// Topic links select the matching question without creating another form.
document.querySelectorAll("[data-support-topic]").forEach((link) => {
  link.addEventListener("click", () => {
    document.getElementById("topic").value = link.dataset.supportTopic;
    document.getElementById("message").focus({ preventScroll: true });
  });
});

const photoInput = document.getElementById("supportPhoto");
let photoUrl = "";
if (photoInput) {
  const preview = document.querySelector(".support-photo-preview");
  const photoStatus = document.getElementById("photoStatus");
  function clearPhoto() {
    if (photoUrl) URL.revokeObjectURL(photoUrl);
    photoUrl = "";
    preview.hidden = true;
    preview.querySelector("img").removeAttribute("src");
    photoStatus.textContent = "";
    photoInput.setCustomValidity("");
  }
  photoInput.addEventListener("change", () => {
    clearPhoto();
    const file = photoInput.files[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) {
      photoInput.setCustomValidity("Choose a JPG, PNG, or WebP image no larger than 5 MB.");
      photoStatus.textContent = photoInput.validationMessage;
      return;
    }
    photoUrl = URL.createObjectURL(file);
    const image = preview.querySelector("img");
    image.onerror = () => {
      clearPhoto();
      photoInput.setCustomValidity("This file cannot be opened as an image. Choose another photo.");
      photoStatus.textContent = photoInput.validationMessage;
    };
    image.src = photoUrl;
    preview.querySelector("figcaption").textContent = file.name;
    preview.hidden = false;
    photoStatus.textContent = "Photo ready for local preview. It has not been uploaded.";
  });
  document.getElementById("removeSupportPhoto").addEventListener("click", () => {
    photoInput.value = "";
    clearPhoto();
  });
}

const startRequest = document.getElementById("startSupportRequest");
if (startRequest) startRequest.addEventListener("click", () => {
  const email = document.getElementById("addr");
  if (!email.reportValidity()) return;
  document.getElementById("email").value = email.value;
  document.getElementById("message").focus();
});

document.querySelectorAll("[data-support-form]").forEach((form) => {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const values = new FormData(form);
    const draft = form.querySelector(".support-draft");
    // textContent prevents user-entered markup from becoming HTML.
    draft.querySelector("p").textContent = [
      "From: " + values.get("name").trim(),
      "Email: " + values.get("email").trim(),
      "Topic: " + values.get("topic"),
      ...(photoInput?.files[0] ? ["Local attachment: " + photoInput.files[0].name + " (not uploaded)"] : []),
      "",
      values.get("message").trim()
    ].join("\n");
    draft.hidden = false;
    form.querySelector(".support-form-status").textContent = "Your draft is ready. No message has been sent.";
  });
});

const supportFrame = document.querySelector(".home-support iframe");
if (supportFrame) {
  window.addEventListener("message", (event) => {
    // Only our own iframe can request a layout resize; no personal data is passed.
    if (event.source !== supportFrame.contentWindow || event.data?.type !== "support-widget-height") return;
    const height = Number(event.data.height);
    if (Number.isFinite(height)) supportFrame.style.height = Math.max(500, Math.min(1800, height)) + "px";
  });
}
if (document.body.classList.contains("support-widget-page") && window.parent !== window) {
  new ResizeObserver(() => {
    window.parent.postMessage({
      type: "support-widget-height",
      height: Math.ceil(document.querySelector("main").getBoundingClientRect().height) + 4
    }, "*");
  }).observe(document.querySelector("main"));
}
