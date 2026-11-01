(() => {
  const entryKey = "page-pull-enter";
  try {
    if (sessionStorage.getItem(entryKey) === "1"
        && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      sessionStorage.removeItem(entryKey);
      document.documentElement.classList.add("page-pull-enter");
      document.documentElement.addEventListener("animationend", (event) => {
        if (event.animationName === "page-pull-arrive") {
          document.documentElement.classList.remove("page-pull-enter");
        }
      }, { once: true });
    }
  } catch {}

  document.addEventListener("click", async (event) => {
    const link = event.target.closest?.("a.side-tab");
    if (!link || event.defaultPrevented || event.button !== 0
        || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey
        || (link.target && link.target !== "_self")
        || link.hasAttribute("download")
        || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const destination = new URL(link.href, location.href);
    if (destination.origin !== location.origin || destination.href === location.href) return;

    event.preventDefault();
    try {
      sessionStorage.setItem(entryKey, "1");
    } catch {}

    const rect = link.getBoundingClientRect();
    const wipe = document.createElement("div");
    wipe.className = "page-pull";
    document.body.appendChild(wipe);

    const handle = link.cloneNode(true);
    handle.classList.add("page-pull-handle");
    handle.style.left = `${rect.left}px`;
    handle.style.top = `${rect.top}px`;
    handle.style.width = `${rect.width}px`;
    handle.style.height = `${rect.height}px`;
    document.body.appendChild(handle);

    const startClip = `inset(${rect.top}px ${innerWidth - rect.right}px ${innerHeight - rect.bottom}px ${rect.left}px round 0px 10px 10px 0px)`;
    const duration = 620;
    const easing = "cubic-bezier(0.7, 0, 0.3, 1)";
    const animations = [
      wipe.animate([
        { clipPath: startClip },
        { clipPath: "inset(0px 0px 0px 0px round 0px)" },
      ], { duration, easing, fill: "forwards" }),
      handle.animate([
        { transform: "translateX(0)", opacity: 1 },
        { transform: `translateX(${innerWidth - rect.left}px)`, opacity: 0 },
      ], { duration, easing, fill: "forwards" }),
    ];

    await Promise.all(animations.map((animation) => animation.finished));
    location.assign(destination.href);
  });
})();