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
  if (googleUrl) { link.href = googleUrl; link.hidden = false; }

  for (const review of customerReviews) {
    if (!review.name || !review.text || !Number.isInteger(review.rating) || review.rating < 1 || review.rating > 5) continue;
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
    // A Google badge is only shown when the entry has a genuine Google review link.
    if (googleUrl && review.source === "google") {
      const logo = document.createElement("img");
      logo.className = "review-google-logo";
      logo.src = "images/branding/google.png";
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
  document.querySelector("#reviewsEmpty").hidden = container.childElementCount > 0;
}

renderCustomerReviews();
