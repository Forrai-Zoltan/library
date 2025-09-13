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
const closeBtn = recBox.querySelector(".close-btn");

// Function to show popup
function showPopup() {
  popUpBig.style.display = "block";
  recBox.style.display = "block"; // keeps flex layout intact
}

// Function to hide popup
function hidePopup() {
  popUpBig.style.display = "none";
  recBox.style.display = "none";
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
