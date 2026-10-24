# Chat and music controls

The homepage music control is moved into the sticky navigation by
`wireBackgroundMusic()` in `js/app.js`. Existing audio, volume, autoplay fallback,
pause/play controls and saved preference remain unchanged. Other pages do not
start a new music player. The bottom of the page no longer has a music overlay.

The site-wide chat keeps its existing topics and local replies. The robot is an
icon-only button, with a smiling image for hover, keyboard focus and open chat.
The welcome appears once per browser-tab session, closes after 12 seconds, and
can be dismissed immediately. Opening chat clears it. The welcome is hidden
while shopping feedback is visible. On small screens shopping feedback sits
above the robot. Escape closes chat and returns focus to its launcher.

## Assets

Generated using the built-in image generation tool on October 23, 2026:

- `images/branding/support-robot-normal.png`
- `images/branding/support-robot-hover.png`

Normal prompt: a friendly white and icy-blue rounded robot head and shoulders,
black visor with two cyan oval eyes, curved tuft, circular bright-blue badge,
simple polished 3D illustration readable at 60px, centered with transparent
padding outside the badge, no lettering or scenery.

Hover edit prompt: preserve the normal image's badge, composition, white robot,
lighting and transparency; change only the eyes into cheerful upward-curved
closed cyan smiles. The supplied screenshots guided the visual brief.

The notification close icon is Lucide's ISC-licensed `x` icon:
https://github.com/lucide-icons/lucide/blob/main/icons/x.svg .

Run `node tests/check-chat-controls.cjs` to check desktop/mobile spacing, keyboard
interaction, welcome-session behavior, music placement and the retained chat.

## October 25 visibility and motion update

The robot cycles through four different prompts for each page context: shopping, building, delivery/account, support and the journal (20 lines total). Each new welcome/hover appearance advances to the next line; it does not interrupt a visible or currently typing prompt. The per-context position survives page navigation in session storage, with an in-memory fallback when storage is unavailable.

The welcome prompt still appears automatically once per tab, but hovering over the robot or focusing it from the keyboard can bring it back. Opening chat, dismissing the prompt or entering the footer hides it. Prompt text, the first chat greeting and assistant replies reveal progressively. A hidden layout copy reserves the text height to prevent jumping; screen readers receive the full message once. Reduced motion shows text immediately. Failed API requests retain their actual error messages and are not replaced with invented replies.
