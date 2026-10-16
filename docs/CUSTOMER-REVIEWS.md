# Homepage reviews and music

## Customer feedback

Edit `js/customer-reviews.js` to add genuine customer feedback to the homepage.
The list is intentionally empty until real feedback is available. While empty,
the storefront shows six generic design examples from `sampleReviews`, with one
section-level notice explaining they are not published on Google. Relative dates
are illustrative, not actual posting dates. Left/right controls wrap through the
reviews, showing three on desktop, two on tablets, and one on phones.
Adding genuine feedback replaces
these examples automatically. Remove or edit the examples in that same file.

Each review accepts these fields:

```js
{
  name: "Customer's display name",
  date: "October 2026",
  rating: 5,
  text: "The customer's actual review, with permission to publish.",
  photo: "images/uploads/customer-photo.jpg"
}
```

The photo is optional; the customer's initial is used if it is missing or broken.
Keep profile pictures inside the images folder and obtain permission to use them.

When the store has a real Google business listing, set `googleBusinessReviewsUrl`
to its HTTPS Google Maps review link. Only add `source: "google"` for feedback
actually published there. Those entries receive the Google badge; other feedback
does not. Setting the link does not automatically fetch or synchronize reviews.

## Music

The homepage uses `audio/lobby.mp3` at 20% volume, looping in the background.
`wireBackgroundMusic()` in `js/app.js` attempts playback on page load. If the
browser blocks audible autoplay, playback is retried after a click or key press.
The bottom-left control pauses or resumes playback and remembers the visitor's
choice in that browser. Music does not unmute the homepage product video.
