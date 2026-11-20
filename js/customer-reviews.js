// Add only genuine, permission-cleared customer feedback here.
// Each entry uses: name, date, rating (1-5), text, and optional photo (local image path).
// Leave this empty until real reviews are available; never invent Google reviews.
const customerReviews = [];
const googleBusinessReviewsUrl = "";

function renderCustomerReviews() {
  const container = document.querySelector("#customerReviewCards");
  if (!container) return;
  container.replaceChildren();
  const link = document.querySelector("#googleReviewsLink");
  let googleUrl;
  try {
    const url = new URL(googleBusinessReviewsUrl);
    if (url.protocol === "https:" && /(^|\.)google\.com$|^maps\.app\.goo\.gl$/.test(url.hostname)) googleUrl = url.href;
  } catch {}
  link.hidden = !googleUrl;
  if (googleUrl) link.href = googleUrl;
  else link.removeAttribute("href");

  for (const review of customerReviews) {
    if (!review || review.sample || typeof review.name !== "string" || !review.name.trim() || typeof review.text !== "string" || !review.text.trim() || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) continue;
    const card = document.createElement("article");
    card.className = "google-review-card";
    const person = document.createElement("div");
    person.className = "review-person";
    const avatar = document.createElement("span");
    avatar.className = "review-avatar";
    avatar.textContent = review.name.charAt(0).toUpperCase();
    if (review.photo && /^images\/[\w/.-]+$/.test(review.photo) && !review.photo.includes("..")) {
      const photo = document.createElement("img");
      photo.src = review.photo;
      photo.alt = "";
      photo.addEventListener("error", () => photo.remove());
      avatar.append(photo);
    }
    const identity = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = review.name;
    const date = document.createElement("small");
    date.textContent = review.date || "";
    identity.append(name, date);
    person.append(avatar, identity);
    // Attribute Google only when the real review has a configured Google source.
    if (googleUrl && review.source === "google") {
      const logo = document.createElement("img");
      logo.className = "review-google-logo";
      logo.src = "images/branding/google-transparent.svg";
      logo.alt = "Google review";
      person.append(logo);
    }
    const stars = document.createElement("div");
    stars.className = "review-stars";
    stars.setAttribute("aria-label", review.rating + " out of 5 stars");
    stars.textContent = "\u2605".repeat(review.rating) + "\u2606".repeat(5 - review.rating);
    const text = document.createElement("p");
    text.textContent = review.text;
    card.append(person, stars, text);
    container.append(card);
  }
  const hasReviews = container.childElementCount > 0;
  document.querySelector("#reviewsEmpty").hidden = hasReviews;
  container.closest(".google-review-viewport").hidden = !hasReviews;
  updateCustomerReviewCarousel();
}

let customerReviewIndex = 0;

function updateCustomerReviewCarousel(direction = 0) {
  const track = document.querySelector("#customerReviewCards");
  if (!track) return;
  const cards = Array.from(track.children);
  const visible = window.innerWidth <= 680 ? 1 : window.innerWidth <= 1020 ? 2 : 3;
  const lastIndex = Math.max(0, cards.length - visible);
  customerReviewIndex = Math.min(customerReviewIndex, lastIndex);
  // Wrap both directions so the left arrow also works from the first review.
  customerReviewIndex = (customerReviewIndex + direction + lastIndex + 1) % (lastIndex + 1);
  const step = cards.length ? cards[0].getBoundingClientRect().width + 16 : 0;
  track.style.transform = `translateX(-${customerReviewIndex * step}px)`;
  cards.forEach((card, index) => {
    card.setAttribute("aria-hidden", String(index < customerReviewIndex || index >= customerReviewIndex + visible));
  });
  document.querySelector("#customerReviewControls").hidden = cards.length <= visible;
  document.querySelector("#customerReviewPosition").textContent = cards.length ?
    `${customerReviewIndex + 1}-${Math.min(cards.length, customerReviewIndex + visible)} of ${cards.length}` : "";
}

document.querySelector("#customerReviewPrevious")?.addEventListener("click", () => updateCustomerReviewCarousel(-1));
document.querySelector("#customerReviewNext")?.addEventListener("click", () => updateCustomerReviewCarousel(1));
window.addEventListener("resize", () => updateCustomerReviewCarousel());
renderCustomerReviews();
