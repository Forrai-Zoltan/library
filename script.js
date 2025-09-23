const popUpBig = document.querySelector(".pop-up-big");
const recBox = document.querySelector(".rec-box");
const popupBox = document.querySelector(".pop-up-box");
const popupContent = popupBox.querySelector(".popup-content");
const closeBtns = document.querySelectorAll(".pop-up-big .close-btn");
const recommendLink = document.querySelector(".rec-link");

// Store works globally for building author corpus
let allWorks = [];

// Show/hide rec-box
function showPopup() {
  popUpBig.style.display = "block";
  recBox.style.display = "block";
  document.body.style.overflow = "hidden";
}
function hidePopup() {
  popUpBig.style.display = "none";
  recBox.style.display = "none";
  popupBox.style.display = "none";
  document.body.style.overflow = "";
}

// Info popup
function showInfoPopup(item, type = "author") {
  popupContent.innerHTML = "";

  if (type === "author") {
    // Author name as H1
    const h1 = document.createElement("h1");
    h1.textContent = item.name;
    popupContent.appendChild(h1);

    if (item.bio) {
      const pBio = document.createElement("p");
      pBio.textContent = item.bio;
      popupContent.appendChild(pBio);
    }

    // Build corpus table if there are works
    const authorWorks = allWorks.filter((w) =>
      (w.authors || []).includes(item.id)
    );
    if (authorWorks.length > 0) {
      // Add "Corpus" heading
      const corpusH2 = document.createElement("h2");
      corpusH2.textContent = "Corpus";
      popupContent.appendChild(corpusH2);

      const table = document.createElement("table");
      table.style.width = "100%";
      table.style.borderCollapse = "collapse";

      const thead = document.createElement("thead");
      const trHead = document.createElement("tr");
      ["Title", "Tags", "Status", "Rating"].forEach((thText) => {
        const th = document.createElement("th");
        th.textContent = thText;
        th.style.padding = "5px 10px";
        th.style.textAlign = "left"; // left justify headers
        trHead.appendChild(th);
      });
      thead.appendChild(trHead);
      table.appendChild(thead);

      const tbody = document.createElement("tbody");
      let zebraIndex = 0;
      authorWorks.forEach((work, index) => {
        const tr = document.createElement("tr");
        const isRead = work.status?.toLowerCase() === "read";
        const isPinned = work.status?.trim() === "📌";
        if (isRead) {
          tr.classList.add("status-read");
        }
        if (isPinned) {
          tr.classList.add("status-pinned");
        }

        // Zebra striping: skip pinned/read rows, only apply to others
        if (!isRead && !isPinned) {
          tr.style.backgroundColor =
            zebraIndex % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.0)";
          zebraIndex++;
        }

        const tdTitle = document.createElement("td");
        const titleLink = document.createElement("a");
        titleLink.href = "#";
        titleLink.textContent = work.title;
        titleLink.addEventListener("click", (e) => {
          e.preventDefault();
          showInfoPopup(work, "work");
        });
        tdTitle.appendChild(titleLink);
        tdTitle.style.padding = "5px 10px";
        tr.appendChild(tdTitle);

        const tdTags = document.createElement("td");
        tdTags.textContent = work.tags || "";
        tdTags.style.padding = "5px 10px";
        tr.appendChild(tdTags);

        const tdStatus = document.createElement("td");
        tdStatus.textContent = work.status || "";
        tdStatus.style.padding = "5px 10px";
        tr.appendChild(tdStatus);

        const tdRating = document.createElement("td");
        tdRating.textContent =
          work.rating !== null && work.rating !== undefined ? work.rating : "";
        tdRating.style.padding = "5px 10px";
        tr.appendChild(tdRating);

        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      popupContent.appendChild(table);
    }
  } else if (type === "work") {
    // Title as h1
    const h1 = document.createElement("h1");
    h1.textContent = item.title || "";
    popupContent.appendChild(h1);

    // Authors as clickable links
    const divAuthors = document.createElement("div");
    const strongAuthors = document.createElement("strong");
    strongAuthors.textContent = "Authors: ";
    divAuthors.appendChild(strongAuthors);
    (item.authors || []).forEach((id, i) => {
      const author = window._authorsMap[id];
      if (author) {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = author.name;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          showInfoPopup(author, "author");
        });
        divAuthors.appendChild(a);
        if (i < item.authors.length - 1)
          divAuthors.appendChild(document.createTextNode(", "));
      }
    });
    popupContent.appendChild(divAuthors);

    // key-value pairs for other fields except title and notes and authors
    const fields = [
      ["Tags", item.tags],
      ["Status", item.status],
      ["Rating", item.rating ?? ""],
    ];
    fields.forEach(([key, value]) => {
      const div = document.createElement("div");
      const strong = document.createElement("strong");
      strong.textContent = key + ": ";
      div.appendChild(strong);
      div.appendChild(document.createTextNode(value));
      popupContent.appendChild(div);
    });

    if (item.notes) {
      const notesP = document.createElement("p");
      notesP.innerHTML = item.notes; // render HTML from JSON
      popupContent.appendChild(notesP);
    }
  }

  popUpBig.style.display = "block";
  popupBox.style.display = "block";
  document.body.style.overflow = "hidden";
}

// Event listeners
if (recommendLink)
  recommendLink.addEventListener("click", (e) => {
    e.preventDefault();
    showPopup();
  });
closeBtns.forEach((btn) => btn.addEventListener("click", hidePopup));
popUpBig.addEventListener("click", (e) => {
  if (e.target === popUpBig) hidePopup();
});

// View switching
const viewButtons = document.querySelectorAll(".view-button");
function setActiveView(view) {
  viewButtons.forEach((btn) =>
    btn.classList.toggle("active", btn.dataset.view === view)
  );
  document.querySelector("#books-content").style.display =
    view === "books" ? "block" : "none";
  document.querySelector("#authors-content").style.display =
    view === "authors" ? "block" : "none";
}
let currentView = localStorage.getItem("currentView") || "authors";
setActiveView(currentView);
viewButtons.forEach((btn) =>
  btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    setActiveView(view);
    localStorage.setItem("currentView", view);
  })
);
function sortTable(table, colIndex) {
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.rows);
  if (!table._sortDirections) table._sortDirections = {};

  // Always start alphabetical (asc) on first click
  const currentDirection = table._sortDirections[colIndex] || "desc";

  // Toggle direction
  const newDirection = currentDirection === "asc" ? "desc" : "asc";
  table._sortDirections[colIndex] = newDirection;

  rows.sort((a, b) => {
    let aText = a.cells[colIndex]?.textContent.trim().toLowerCase() || "";
    let bText = b.cells[colIndex]?.textContent.trim().toLowerCase() || "";

    const aNum = parseFloat(aText);
    const bNum = parseFloat(bText);
    if (!isNaN(aNum) && !isNaN(bNum)) {
      aText = aNum;
      bText = bNum;
    }

    if (aText < bText) return newDirection === "asc" ? -1 : 1;
    if (aText > bText) return newDirection === "asc" ? 1 : -1;
    return 0;
  });

  rows.forEach((row) => tbody.appendChild(row));

  let visibleIndex = 0;
  rows.forEach((row) => {
    if (!row.classList.contains("status-read")) {
      row.style.backgroundColor =
        visibleIndex % 2 === 0
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.0)";
      visibleIndex++;
    } else {
      row.style.backgroundColor = "";
    }
  });

  const headers = table.querySelectorAll("thead th");
  headers.forEach((th, i) => {
    th.textContent = th.textContent.replace(/\s*[▲▼]$/, "");
    if (i === colIndex) {
      const arrowSpan = document.createElement("span");
      arrowSpan.className = "sort-arrow";
      arrowSpan.textContent = newDirection === "asc" ? "▼" : "▲";
      th.appendChild(arrowSpan);
    }
  });
}

// Fetch data
fetch("/library/data.json")
  .then((res) => res.json())
  .then((data) => {
    // Build author map
    const authorsMap = {};
    data.authors.forEach((a) => {
      authorsMap[a.id] = a;
    });
    window._authorsMap = authorsMap;

    // Store works globally
    allWorks = data.works;

    // Populate authors table
    const authorTableBody = document.querySelector("#author-table tbody");
    data.authors.forEach((author, index) => {
      const row = document.createElement("tr");
      const td = document.createElement("td");
      const a = document.createElement("a");
      a.href = "#";
      a.textContent = author.name;
      a.addEventListener("click", (e) => {
        e.preventDefault();
        showInfoPopup(author, "author");
      });
      td.appendChild(a);
      row.appendChild(td);

      const bioTd = document.createElement("td");
      bioTd.textContent = author.bio || "";
      row.appendChild(bioTd);

      row.style.backgroundColor =
        index % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.0)";
      authorTableBody.appendChild(row);
    });

    // Add sorting to author table headers
    const authorTable = document.querySelector("#author-table");
    if (authorTable) {
      const headers = authorTable.querySelectorAll("thead th");
      headers.forEach((th, index) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
          sortTable(authorTable, index);
        });
      });
      // Remove any sort indicators initially
      headers.forEach((th) => {
        th.textContent = th.textContent.replace(/\s*[▲▼]$/, "");
      });
    }

    // Populate works table
    const worksTableBody = document.querySelector("#works-table tbody");
    let zebraIndex = 0;
    data.works.forEach((work, index) => {
      const row = document.createElement("tr");

      // Add authorNames array to work for easier display
      work.authorNames = (work.authors || []).map(
        (id) => authorsMap[id]?.name || id
      );

      const isRead = work.status?.toLowerCase() === "read";
      const isPinned = work.status?.trim() === "📌";
      if (isRead) {
        row.classList.add("status-read");
      }
      if (isPinned) {
        row.classList.add("status-pinned");
      }

      // Zebra striping: skip pinned/read rows, only apply to others
      if (!isRead && !isPinned) {
        row.style.backgroundColor =
          zebraIndex % 2 === 0 ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.0)";
        zebraIndex++;
      }

      const titleCell = document.createElement("td");
      const titleLink = document.createElement("a");
      titleLink.href = "#";
      titleLink.textContent = work.title;
      titleLink.addEventListener("click", (e) => {
        e.preventDefault();
        showInfoPopup(work, "work");
      });
      titleCell.appendChild(titleLink);
      row.appendChild(titleCell);

      const authorsCell = document.createElement("td");
      work.authorNames.forEach((name, i) => {
        const a = document.createElement("a");
        a.href = "#";
        a.textContent = name;
        a.addEventListener("click", (e) => {
          e.preventDefault();
          showInfoPopup(authorsMap[work.authors[i]], "author");
        });
        authorsCell.appendChild(a);
        if (i < work.authorNames.length - 1)
          authorsCell.appendChild(document.createTextNode(", "));
      });
      row.appendChild(authorsCell);

      ["tags", "status", "rating"].forEach((field) => {
        const td = document.createElement("td");
        td.textContent = work[field] ?? "";
        row.appendChild(td);
      });

      worksTableBody.appendChild(row);
    });

    // Add sorting to works table headers
    const worksTable = document.querySelector("#works-table");
    if (worksTable) {
      const headers = worksTable.querySelectorAll("thead th");
      headers.forEach((th, index) => {
        th.style.cursor = "pointer";
        th.addEventListener("click", () => {
          sortTable(worksTable, index);
        });
      });
      // Remove any sort indicators initially
      headers.forEach((th) => {
        th.textContent = th.textContent.replace(/\s*[▲▼]$/, "");
      });
    }
  })
  .catch((err) => console.error("Error loading data.json:", err));

// Table Search Filter
const searchInput = document.getElementById("Search");
if (searchInput) {
  searchInput.addEventListener("input", function () {
    const cleanedInput = this.value.replace(/[#,\s]+/g, " ").toLowerCase();
    const rawTokens = cleanedInput
      .split(" ")
      .filter((token) => token.trim() !== "" && token !== "-");

    const includeTokens = [];
    const excludeTokens = [];

    rawTokens.forEach((token) => {
      if (token.startsWith("-") && token.length > 1) {
        excludeTokens.push(token.slice(1));
      } else {
        includeTokens.push(token);
      }
    });

    const authorRows = document.querySelectorAll("#author-table tbody tr");
    const workRows = document.querySelectorAll("#works-table tbody tr");

    let matchCount = 0;

    function filterRows(rows) {
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const combined = text;

        const includesAll = includeTokens.every((token) =>
          combined.includes(token)
        );
        const excludesAll = excludeTokens.every(
          (token) => !combined.includes(token)
        );

        if (includesAll && excludesAll) {
          row.style.display = "";
          matchCount++;
        } else {
          row.style.display = "none";
        }
      });
    }

    filterRows(authorRows);
    filterRows(workRows);

    const noResults = document.getElementById("NoResults");
    if (noResults) {
      noResults.style.display = matchCount === 0 ? "block" : "none";
    }
  });
}

function showPopup() {
  popUpBig.style.display = "block";
  recBox.style.display = "block";

  // Focus the textarea after showing the pop-up
  const textarea = document.getElementById("message");
  if (textarea) textarea.focus();

  document.body.style.overflow = "hidden";
}
