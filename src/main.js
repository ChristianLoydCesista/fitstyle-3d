import "./styles.css";
import { HumanViewer } from "./three/HumanViewer.js";

const $ = (selector) => document.querySelector(selector);

const canvas = $("#humanCanvas");
const viewerContainer = $("#viewerContainer");
const statusText = $("#statusText");
const viewerSubtitle = $("#viewerSubtitle");
const viewerMessage = $("#viewerMessage");

const modelSourceValue = $("#modelSourceValue");
const meshCountValue = $("#meshCountValue");
const boneCountValue = $("#boneCountValue");
const garmentLayerValue = $("#garmentLayerValue");
const accessoryList = $("#accessoryList");

const retryModelButton = $("#retryModelButton");
const resetViewButton = $("#resetViewButton");
const frontViewButton = $("#frontViewButton");
const sideViewButton = $("#sideViewButton");
const backViewButton = $("#backViewButton");
const threeQuarterViewButton = $("#threeQuarterViewButton");
const toggleAnchorsButton = $("#toggleAnchorsButton");

function showMessage(message) {
  viewerMessage.hidden = false;
  viewerMessage.textContent = message;
}

function clearMessage() {
  viewerMessage.hidden = true;
  viewerMessage.textContent = "";
}

function renderDiagnostics(diagnostics) {
  meshCountValue.textContent = String(diagnostics?.meshCount ?? 0);
  boneCountValue.textContent = String(diagnostics?.boneCount ?? 0);

  const garmentLayers = diagnostics?.garmentLayers ?? [];
  garmentLayerValue.textContent = garmentLayers.join(", ") || "None";

  const accessories = diagnostics?.accessories ?? [];
  accessoryList.innerHTML = "";

  accessories.forEach((item) => {
    const row = document.createElement("div");
    row.className = "slot-row";

    const slot = document.createElement("span");
    slot.textContent = item.slot;

    const value = document.createElement("strong");
    value.textContent = item.bone ? item.bone : "Fallback position";

    row.append(slot, value);
    accessoryList.append(row);
  });
}

const viewer = new HumanViewer({
  canvas,
  container: viewerContainer,

  onStatus(event) {
    const diagnostics = event.diagnostics;

    if (event.status === "loading") {
      statusText.textContent = "Loading Michelle";
      viewerSubtitle.textContent = event.detail;
      modelSourceValue.textContent = "Michelle GLB";
      return;
    }

    if (event.status === "ready") {
      clearMessage();
      statusText.textContent = "Michelle ready";
      viewerSubtitle.textContent = event.detail;
      modelSourceValue.textContent = event.source;
      renderDiagnostics(diagnostics);
      return;
    }

    if (event.status === "fallback") {
      statusText.textContent = "Fallback active";
      viewerSubtitle.textContent = event.detail;
      modelSourceValue.textContent = event.source;
      renderDiagnostics(diagnostics);
    }
  },

  onError(message) {
    showMessage(message);
  },
});

async function reloadMichelle() {
  retryModelButton.disabled = true;
  clearMessage();

  try {
    await viewer.loadPrimaryHuman();
  } finally {
    retryModelButton.disabled = false;
  }
}

retryModelButton.addEventListener("click", reloadMichelle);
resetViewButton.addEventListener("click", () => viewer.resetView());
frontViewButton.addEventListener("click", () => viewer.setView("front"));
sideViewButton.addEventListener("click", () => viewer.setView("side"));
backViewButton.addEventListener("click", () => viewer.setView("back"));
threeQuarterViewButton.addEventListener("click", () =>
  viewer.setView("threeQuarter"),
);

toggleAnchorsButton.addEventListener("click", () => {
  const visible = viewer.toggleAttachmentPoints();

  toggleAnchorsButton.textContent = visible
    ? "Hide accessory anchors"
    : "Show accessory anchors";
});

window.addEventListener(
  "beforeunload",
  () => {
    viewer.dispose();
  },
  { once: true },
);

await reloadMichelle();
