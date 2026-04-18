import { levels, type Level, type Planet } from "./planets.js";
import { drawPlanetCanvas } from "./drawPlanets.js";
 
function hasOzoneLayer(p: Planet): boolean {
  const o = p as Planet & { ozoneLayer?: boolean; ozonLayer?: boolean };
  if (typeof o.ozoneLayer === "boolean") return o.ozoneLayer;
  if (typeof o.ozonLayer === "boolean") return o.ozonLayer;
  return false;
}
 
function planetTooltip(p: Planet): string {
  const lines: string[] = [`${p.name} (${p.id})`, p.type];
  if (p.temperature != null) lines.push(`Temperature: ${p.temperature}°C`);
  if (p.waterCoverage != null) lines.push(`Water coverage: ${p.waterCoverage}%`);
  if (p.atmosphere) {
    lines.push(
      `Atmosphere: ${p.atmosphere}${p.atmosphereThickness ? ` (${p.atmosphereThickness})` : ""}`,
    );
  }
  if (p.mass != null) lines.push(`Mass: ${p.mass}× Earth`);
  if (p.weather) lines.push(`Weather: ${p.weather}`);
  lines.push(`Ozone layer: ${hasOzoneLayer(p) ? "Yes" : "No"}`);
  if (p.description) lines.push(p.description);
  return lines.join("\n");
}
 
function appendStatRow(container: HTMLElement, label: string, value: string) {
  const row = document.createElement("div");
  row.className = "planet-panel__stat";
  const lab = document.createElement("span");
  lab.className = "planet-panel__label";
  lab.textContent = label;
  const val = document.createElement("span");
  val.className = "planet-panel__value";
  val.textContent = value;
  row.append(lab, val);
  container.append(row);
}
 
function renderPlanetPanel(p: Planet): void {
  const title = document.getElementById("planetPanelTitle");
  const meta = document.getElementById("planetPanelMeta");
  const desc = document.getElementById("planetPanelDesc");
  const stats = document.getElementById("planetPanelStats");
  if (!title || !meta || !desc || !stats) return;
 
  title.textContent = p.name;
  meta.textContent = `${p.id} · ${p.type}`;
 
  desc.textContent = p.description ?? "";
 
  stats.replaceChildren();
  if (p.temperature != null) appendStatRow(stats, "Temperature", `${p.temperature}°C`);
  if (p.waterCoverage != null) appendStatRow(stats, "Water coverage", `${p.waterCoverage}%`);
  if (p.atmosphere) {
    appendStatRow(
      stats,
      "Atmosphere",
      p.atmosphereThickness ? `${p.atmosphere} (${p.atmosphereThickness})` : p.atmosphere,
    );
  }
  if (p.mass != null) appendStatRow(stats, "Mass", `${p.mass}× Earth`);
  if (p.weather) appendStatRow(stats, "Weather", p.weather);
  if (p.type === "Meteor" && p.size) appendStatRow(stats, "Size", p.size);
  appendStatRow(stats, "Ozone layer", hasOzoneLayer(p) ? "Yes" : "No");
}
 
const level1 = levels.find((l: Level) => l.id === 1);
if (!level1) {
  throw new Error("planets.js: level 1 (System Solara) not found");
}
 
const viewportEl = document.getElementById("viewport");
const sunEl = document.getElementById("sun");
const zoomHint = document.getElementById("zoomHint");
const planetPanelEl = document.getElementById("planetPanel");
const planetPanelClose = document.getElementById("planetPanelClose");
 
if (!viewportEl || !(sunEl instanceof HTMLButtonElement) || !planetPanelEl) {
  throw new Error("Landing DOM: #viewport, #sun, or #planetPanel missing");
}
 
const viewport = viewportEl;
const sun = sunEl;
const planetPanel = planetPanelEl;
 
sun.title = `${level1.star.name} — ${level1.star.type}`;
if (zoomHint) {
  zoomHint.textContent = `${level1.name} — click the sun to zoom back in`;
}
 
const planetById = new Map(level1.planets.map((p: Planet) => [p.id, p]));
let selectedPlanetId: string | null = null;
 
function setPanelOpen(open: boolean) {
  planetPanel.classList.toggle("planet-panel--open", open);
  planetPanel.setAttribute("aria-hidden", open ? "false" : "true");
}
 
function clearPlanetSelection() {
  selectedPlanetId = null;
  document.querySelectorAll(".planet.planet--selected").forEach((el) => {
    el.classList.remove("planet--selected");
  });
  setPanelOpen(false);
}
 
function selectPlanet(id: string) {
  const planet = planetById.get(id);
  if (!planet) return;
 
  selectedPlanetId = id;
  document.querySelectorAll(".planet.planet--selected").forEach((el) => {
    el.classList.remove("planet--selected");
  });
  const dot = document.querySelector(`.planet[data-planet-id="${id}"]`);
  if (dot instanceof HTMLElement) dot.classList.add("planet--selected");
 
  renderPlanetPanel(planet);
  setPanelOpen(true);
  planetPanelClose?.focus();
}
 
const orbitEls = document.querySelectorAll(".system .orbit");
level1.planets.forEach((planet: Planet, index: number) => {
  const orbit = orbitEls[index];
  if (!(orbit instanceof HTMLElement)) return;
  const dot = orbit.querySelector(".planet");
  if (!(dot instanceof HTMLElement)) return;
 
  dot.className = "planet";
  dot.dataset.planetId = planet.id;
  dot.title = planetTooltip(planet);
  dot.setAttribute(
    "aria-label",
    `${planet.name}, ${planet.type}. ${planet.id}: orbit ${index + 1} from the star.`,
  );
  dot.setAttribute("role", "button");
  dot.tabIndex = -1;
 
  // Determine size based on planet type
  const isMeteor = planet.type === "Meteor";
  const sz = isMeteor
    ? planet.size === "Medium" ? 12 : 10
    : planet.type === "Ice Planet" ? 15 : 17;
 
  // Create a canvas and draw the planet art onto it
  const canvas = document.createElement("canvas");
  canvas.width = sz * 2;
  canvas.height = sz * 2;
  canvas.style.width = `${sz * 2}px`;
  canvas.style.height = `${sz * 2}px`;
  canvas.style.borderRadius = "50%";
  canvas.style.display = "block";
 
  dot.style.width = `${sz * 2}px`;
  dot.style.height = `${sz * 2}px`;
  dot.style.background = "none";
  dot.appendChild(canvas);
 
  const c2d = canvas.getContext("2d");
  if (c2d) drawPlanetCanvas(c2d, (planet as any).artKey ?? "meteor", sz);
 
  dot.addEventListener("click", (e) => {
    e.stopPropagation();
    if (!viewport.classList.contains("is-zoomed-out")) return;
    selectPlanet(planet.id);
  });
 
  dot.addEventListener("keydown", (e) => {
    if (!viewport.classList.contains("is-zoomed-out")) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      selectPlanet(planet.id);
    }
  });
});
 
function setZoomedOut(on: boolean) {
  viewport.classList.toggle("is-zoomed-out", on);
  sun.setAttribute(
    "aria-label",
    on ? "Zoom in: return to landing view" : "Zoom out: show full star system",
  );
  document.querySelectorAll(".planet").forEach((el) => {
    if (el instanceof HTMLElement) el.tabIndex = on ? 0 : -1;
  });
  if (!on) {
    clearPlanetSelection();
  }
}
 
sun.addEventListener("click", () => {
  setZoomedOut(!viewport.classList.contains("is-zoomed-out"));
});
 
planetPanelClose?.addEventListener("click", () => {
  clearPlanetSelection();
});
 
viewport.addEventListener("click", (e) => {
  const t = e.target;
  if (!(t instanceof Node)) return;
  if (planetPanel.contains(t) || sun.contains(t)) return;
  if (t instanceof Element && t.closest(".planet")) return;
  if (viewport.classList.contains("is-zoomed-out") && selectedPlanetId) {
    clearPlanetSelection();
  }
});