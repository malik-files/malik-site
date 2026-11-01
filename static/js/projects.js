/* =====================================================
   YOUR PROJECTS: add a new project by copying one block
   and pasting it at the end of the list.
     title:       project name
     description: one or two sentences
     image:       path to an image, e.g. "static/img/projects/mygame.png"
                  (leave "" to get a coloured placeholder)
     url:         link to the GitHub repo
   ===================================================== */
const PROJECTS = [
  {
    title: "Project One",
    description: "A short description of what this project does and what you used to build it.",
    image: "",
    url: "https://github.com/your-username/project-one",
  },
  {
    title: "Project Two",
    description: "Another short description. Two sentences at most keeps the tiles tidy.",
    image: "",
    url: "https://github.com/your-username/project-two",
  },
  {
    title: "Project Three",
    description: "Replace these placeholders with your real GitHub projects.",
    image: "",
    url: "https://github.com/your-username/project-three",
  },
];

/* ---------- Rendering (no need to edit below) ---------- */
function placeholder(i) {
  const hue = (i * 57 + 190) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="200"><rect width="320" height="200" fill="hsl(${hue},55%,82%)"/><path d="M0 200 L90 110 L150 165 L210 105 L320 200Z" fill="hsl(${hue},55%,68%)"/></svg>`;
  return "data:image/svg+xml;utf8," + encodeURIComponent(svg);
}

function renderProjects(list) {
  const grid = document.getElementById("project-grid");
  grid.innerHTML = "";
  list.forEach((p, i) => {
    const tile = document.createElement("a");
    tile.className = "tile";
    tile.href = p.url;
    tile.target = "_blank";
    tile.rel = "noopener";

    const img = document.createElement("img");
    img.src = p.image || placeholder(i);
    img.alt = p.title;

    const body = document.createElement("div");
    body.className = "tile-body";
    const h = document.createElement("h2");
    h.textContent = p.title;
    const d = document.createElement("p");
    d.textContent = p.description;

    body.append(h, d);
    tile.append(img, body);
    grid.appendChild(tile);
  });
}

/* Later, with a Go/Django backend, replace this with:
   fetch("/api/projects").then(r => r.json()).then(renderProjects); */
renderProjects(PROJECTS);
