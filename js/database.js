// Served pages use SQLite through same-origin API calls. File previews keep their local mode.
const storeDatabase = {
  enabled: ["http:", "https:"].includes(location.protocol) && ["localhost", "127.0.0.1"].includes(location.hostname),
  user: null,
  book: { addresses: [], defaultId: "", revision: 0 },
  async request(url, method = "GET", body) {
    const response = await fetch(url, { method, credentials: "same-origin", headers: { "Content-Type": "application/json" }, ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
    const result = await response.json();
    if (!response.ok) {
      if (result.book) { this.book = result.book; window.dispatchEvent(new Event("store-addressbook-change")); }
      if (response.status === 401 && url !== "/api/login") { this.user = null; this.book = { addresses: [], defaultId: "", revision: 0 }; window.dispatchEvent(new Event("store-account-change")); }
      throw new Error(result.error || "Could not connect to the account database.");
    }
    return result;
  },
  async authenticate(url, body) {
    const result = await this.request(url, "POST", body);
    this.user = result.user;
    this.book = result.book;
    window.dispatchEvent(new Event("store-account-change"));
  },
  async saveBook(book) {
    const result = await this.request("/api/addresses", "PUT", book);
    this.book = result.book;
    window.dispatchEvent(new Event("store-addressbook-change"));
  },
  async signOut() { await this.authenticate("/api/logout", {}); },
  async updateName(name) {
    const result = await this.request("/api/profile", "PATCH", { name });
    this.user = result.user;
    window.dispatchEvent(new Event("store-account-change"));
  }
};
storeDatabase.ready = storeDatabase.enabled ? storeDatabase.request("/api/session").then(result => {
  storeDatabase.user = result.user;
  storeDatabase.book = result.book;
  window.dispatchEvent(new Event("store-account-change"));
}).catch(() => {
  const notify = () => {
    const status = document.createElement("p");
    status.className = "currency-notice";
    status.setAttribute("role", "alert");
    status.textContent = "Account database unavailable. Start the store server and reload.";
    document.querySelector("main")?.prepend(status);
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", notify); else notify();
}) : Promise.resolve();
