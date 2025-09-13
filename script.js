// ICON
const favicon = document.createElement("link");
favicon.rel = "icon";
favicon.type = "image/x-icon";
favicon.href = "/library/favicon.ico";
document.head.appendChild(favicon);

// Elements
const recommendLink = document.querySelector(".rec-link");
const popUpBig = document.querySelector(".pop-up-big");
const recBox = document.querySelector(".rec-box");
const closeBtn = document.querySelector(".rec-box .close-btn");

// Function to show popup
function showPopup() {
  popUpBig.style.display = "block";
  recBox.style.display = "block"; // keeps flex layout intact
  document.body.style.overflow = "hidden"; // disable scroll
}

// Function to hide popup
function hidePopup() {
  popUpBig.style.display = "none";
  recBox.style.display = "none";
  document.body.style.overflow = ""; // restore scroll
}

// Open popup on link click
recommendLink.addEventListener("click", (e) => {
  e.preventDefault();
  showPopup();
});

// Close popup on overlay click
popUpBig.addEventListener("click", (e) => {
  if (e.target === popUpBig) {
    hidePopup();
  }
});

// Close popup on close button click
closeBtn.addEventListener("click", hidePopup);

const viewButtons = document.querySelectorAll(".view-button");

// Load saved view from localStorage (default to 'authors')
let currentView = localStorage.getItem("currentView") || "authors";
setActiveView(currentView);

// Add click listeners
viewButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    setActiveView(view);
    localStorage.setItem("currentView", view);
  });
});

// Function to update UI
function setActiveView(view) {
  viewButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.view === view);
  });

  document.querySelector("#books-content").style.display = view === "books" ? "block" : "none";
  document.querySelector("#authors-content").style.display = view === "authors" ? "block" : "none";
}
