// Add only genuine, permission-cleared customer feedback here.
// Each entry uses: name, date, rating (1-5), text, and optional photo (local image path).
// Leave this empty until real reviews are available; never invent Google reviews.
const customerReviews = [];
const googleBusinessReviewsUrl = "";

// Design examples are shown only until genuine customer feedback is added.
const sampleReviews = [
  {
    name: "Alex M.", rating: 5, sample: true,
    text: "The gaming PC feels smooth and responsive, and the setup looks great on my desk. A lovely upgrade for evenings spent gaming."
  },
  {
    name: "Jamie R.", rating: 5, sample: true,
    text: "A lightweight laptop with enough power for classes and everyday work. Having the specifications in one place makes comparing options much easier."
  },
  {
    name: "Chris D.", rating: 5, sample: true,
    text: "The memory and storage options make it easy to plan a balanced build. I like being able to choose parts around the way I use my computer."
  }
];

function renderCustomerReviews() {
  const container = document.querySelector("#customerReviewCards");
  if (!container) return;
  container.replaceChildren();
  const showingSamples = customerReviews.length === 0;
  document.querySelector("#sampleReviewsNote").hidden = !showingSamples;
  const link = document.querySelector("#googleReviewsLink");
  let googleUrl;
  try {
    const url = new URL(googleBusinessReviewsUrl);
    if (url.protocol === "https:" && /(^|\.)google\.com$|^maps\.app\.goo\.gl$/.test(url.hostname)) googleUrl = url.href;
  } catch {}
  if (googleUrl) { link.href = googleUrl; link.hidden = false; }

  for (const review of showingSamples ? sampleReviews : customerReviews) {
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
    date.textContent = review.sample ? "Sample review" : review.date || "";
    identity.append(name, date);
    person.append(avatar, identity);
    // Samples illustrate the requested layout without claiming a Google endorsement.
    if (review.sample || (googleUrl && review.source === "google")) {
      const logo = document.createElement("img");
      logo.className = "review-google-logo";
      logo.src = "images/branding/google-transparent.svg";
      logo.alt = review.sample ? "Google logo, sample layout" : "Google review";
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
