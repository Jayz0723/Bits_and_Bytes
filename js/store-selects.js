// Keep native preference values while giving the menus a consistent dark appearance.
function wireStorePickers() {
  for (const id of ["languageSelect", "currencySelect"]) {
    const select = document.getElementById(id);
    if (!select || select.dataset.enhanced) continue;
    select.dataset.enhanced = "true";
    select.classList.add("enhanced-native-select");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    const picker = document.createElement("div");
    picker.className = "store-picker";
    const trigger = document.createElement("button");
    trigger.className = "store-picker-trigger";
    trigger.type = "button";
    trigger.id = id + "Trigger";
    trigger.setAttribute("aria-label", id === "languageSelect" ? "Language" : "Currency");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-controls", id + "Options");
    const label = document.createElement("b");
    label.textContent = select.selectedOptions[0]?.textContent || "";
    const chevron = document.createElement("img");
    chevron.src = "images/icons/chevron-right.svg";
    chevron.alt = "";
    chevron.width = chevron.height = 14;
    trigger.append(label, chevron);
    const menu = document.createElement("div");
    menu.className = "store-picker-options";
    menu.id = id + "Options";
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", id === "languageSelect" ? "Language" : "Currency");
    menu.hidden = true;
    const buttons = [...select.options].map(option => {
      const button = document.createElement("button");
      button.type = "button";
      button.setAttribute("role", "option");
      button.setAttribute("aria-selected", String(option.selected));
      button.tabIndex = -1;
      const code = document.createElement("b");
      code.textContent = option.value.toUpperCase();
      const name = document.createElement("strong");
      name.textContent = option.textContent;
      name.setAttribute("translate", "no");
      const check = document.createElement("img");
      check.src = "images/icons/circle-check.svg";
      check.alt = "";
      check.width = check.height = 16;
      button.append(code, name, check);
      button.addEventListener("click", () => {
        close(false);
        if (select.value !== option.value) {
          select.value = option.value;
          select.dispatchEvent(new Event("change", { bubbles: true }));
        }
      });
      menu.append(button);
      return button;
    });
    function close(restoreFocus = false) {
      menu.hidden = true;
      trigger.setAttribute("aria-expanded", "false");
      if (restoreFocus) trigger.focus();
    }
    function open() {
      window.dispatchEvent(new Event("store-picker-open"));
      menu.hidden = false;
      trigger.setAttribute("aria-expanded", "true");
      menu.style.left = "";
      menu.style.right = "";
      if (innerWidth > 760 && menu.getBoundingClientRect().left < 16) {
        menu.style.left = "0";
        menu.style.right = "auto";
      }
      buttons[select.selectedIndex]?.focus();
    }
    trigger.addEventListener("click", event => { event.preventDefault(); menu.hidden ? open() : close(); });
    trigger.addEventListener("keydown", event => {
      if (["ArrowDown", "ArrowUp"].includes(event.key)) { event.preventDefault(); open(); }
    });
    menu.addEventListener("keydown", event => {
      const index = buttons.indexOf(document.activeElement);
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const next = event.key === "Home" ? 0 : event.key === "End" ? buttons.length - 1 : (index + (event.key === "ArrowDown" ? 1 : -1) + buttons.length) % buttons.length;
        buttons[next].focus();
      }
      if (event.key === "Escape") { event.preventDefault(); event.stopPropagation(); close(true); }
      if (event.key === "Tab") close();
    });
    document.addEventListener("pointerdown", event => { if (!picker.contains(event.target)) close(); });
    picker.addEventListener("focusout", event => { if (!picker.contains(event.relatedTarget)) close(); });
    window.addEventListener("store-picker-open", () => close());
    window.addEventListener("resize", () => close());
    select.addEventListener("change", () => {
      label.textContent = select.selectedOptions[0].textContent;
      buttons.forEach((button, index) => button.setAttribute("aria-selected", String(index === select.selectedIndex)));
    });
    picker.append(trigger, menu);
    select.after(picker);
  }
}
