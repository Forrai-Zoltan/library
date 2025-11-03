document.addEventListener("DOMContentLoaded", () => {
  const btnWorks = document.getElementById("btn-works");
  const btnAuthors = document.getElementById("btn-authors");
  const btnRecommend = document.getElementById("recommend");
  const authorTable = document.getElementById("author-table");
  const worksTable = document.getElementById("works-table");
  const searchInput = document.querySelector('input[type="search"]');

  let originalRowsMap = {};
  let authorsMap = {};

  function updateRowStriping(tableId) {
    const allRows = Array.from(document.querySelectorAll(`#${tableId} tbody tr`));
    const visibleRows = allRows.filter(r => r.style.display !== "none");

    visibleRows.forEach((row, idx) => {
      row.classList.toggle("even", idx % 2 === 1);
      row.classList.toggle("odd", idx % 2 === 0);

      // Detect "Read" status and apply green background
      const statusCell = row.querySelector("td:nth-child(4)");
      if (statusCell && statusCell.textContent.trim().toLowerCase() === "read") {
        row.classList.add("read-row");
      } else {
        row.classList.remove("read-row");
      }
    });

    // Remove striping and read class from hidden rows
    allRows.forEach(r => {
      if (r.style.display === "none") {
        r.classList.remove("even", "odd", "read-row");
      }
    });
  }

  function saveOriginalOrder(tableId, tbody) {
    originalRowsMap[tableId] = Array.from(tbody.querySelectorAll("tr"));
  }

  function restoreOriginalOrder(tableId, tbody) {
    const originalRows = originalRowsMap[tableId];
    if (!originalRows) return;
    tbody.innerHTML = "";
    originalRows.forEach((row) => tbody.appendChild(row));
  }

  btnWorks.addEventListener("click", () => {
    btnWorks.classList.toggle("active-button");

    if (btnWorks.classList.contains("active-button")) {
      worksTable.classList.remove("hidden");
    } else {
      worksTable.classList.add("hidden");
    }

    // Ensure at least one active (default to Works)
    if (
      !btnWorks.classList.contains("active-button") &&
      !btnAuthors.classList.contains("active-button")
    ) {
      btnWorks.classList.add("active-button");
      worksTable.classList.remove("hidden");
    }
  });

  btnAuthors.addEventListener("click", () => {
    btnAuthors.classList.toggle("active-button");

    if (btnAuthors.classList.contains("active-button")) {
      authorTable.classList.remove("hidden");
    } else {
      authorTable.classList.add("hidden");
    }

    // Ensure at least one active (default to Works)
    if (
      !btnWorks.classList.contains("active-button") &&
      !btnAuthors.classList.contains("active-button")
    ) {
      btnWorks.classList.add("active-button");
      worksTable.classList.remove("hidden");
    }
  });

  btnRecommend.addEventListener("click", () => {
    const defaultSection = document.getElementById("default-section");
    const recommendSection = document.getElementById("recommend-section");

    btnRecommend.classList.toggle("active-button");

    // Toggle visibility between sections
    if (btnRecommend.classList.contains("active-button")) {
      defaultSection.classList.add("hidden");
      recommendSection.classList.remove("hidden");
    } else {
      recommendSection.classList.add("hidden");
      defaultSection.classList.remove("hidden");
    }
  });

  // THIS LOADS THE AUTHORS

  function loadAuthors() {
    return fetch("/personal/library/authors.json")
      .then((response) => response.json())
      .then((data) => {
        const authorTableBody = document.querySelector("#author-table tbody");
        authorTableBody.innerHTML = "";

        // Populate authorsMap
        authorsMap = {};
        data.authors.forEach((author) => {
          authorsMap[author.id] = author.name;
        });

        data.authors.forEach((author) => {
          const row = document.createElement("tr");
          const nameCell = document.createElement("td");
          const bioCell = document.createElement("td");

          nameCell.textContent = author.name;
          bioCell.textContent = author.bio;

          row.appendChild(nameCell);
          row.appendChild(bioCell);
          authorTableBody.appendChild(row);
        });
        saveOriginalOrder("author-table", authorTableBody);
        updateRowStriping("author-table");
      })
      .catch((error) => console.error("Error loading authors:", error));
  }

  // THIS LOADS THE WORKS

  function loadWorks() {
    fetch("/personal/library/works.json")
      .then((response) => response.json())
      .then((data) => {
        const worksTableBody = document.querySelector("#works-table tbody");
        worksTableBody.innerHTML = "";

        data.works.forEach((work) => {
          const row = document.createElement("tr");
          const titleCell = document.createElement("td");
          const authorCell = document.createElement("td");
          const tagsCell = document.createElement("td");
          const statusCell = document.createElement("td");
          const ratingCell = document.createElement("td");

          titleCell.textContent = work.title;
          const authorNames = work.authors.map(a => authorsMap[a] || a);
          authorCell.textContent = authorNames.join(", ");
          tagsCell.textContent = work.tags;
          statusCell.textContent = work.status;
          ratingCell.textContent = work.rating !== null ? work.rating : "";

          row.appendChild(titleCell);
          row.appendChild(authorCell);
          row.appendChild(tagsCell);
          row.appendChild(statusCell);
          row.appendChild(ratingCell);

          worksTableBody.appendChild(row);
        });
        saveOriginalOrder("works-table", worksTableBody);
        updateRowStriping("works-table");
      })
      .catch((error) => console.error("Error loading works:", error));
  }

  // Load authors, then works (so works can use author names)
  loadAuthors().then(loadWorks);
  // loadWorks(); // Standalone call removed, now loaded after authors

  // TABLE SORTING FEATURE

  function enableTableSorting(tableId) {
    const table = document.getElementById(tableId);
    const headers = table.querySelectorAll("th");
    const tbody = table.querySelector("tbody");
    let activeHeader = null;

    headers.forEach((header, index) => {
      header.dataset.sortState = "none"; // none, asc, desc
      header.addEventListener("click", () => {
        // Remove existing sort icons from all headers
        headers.forEach((hdr) => {
          const existingIcon = hdr.querySelector(".sort-icon");
          if (existingIcon) {
            hdr.removeChild(existingIcon);
          }
        });

        // Reset previous sort if new header clicked
        if (activeHeader && activeHeader !== header) {
          activeHeader.dataset.sortState = "none";
        }
        activeHeader = header;

        let sortState = header.dataset.sortState;
        if (sortState === "none") sortState = "asc";
        else if (sortState === "asc") sortState = "desc";
        else sortState = "none";
        header.dataset.sortState = sortState;

        if (sortState !== "none") {
          const icon = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg"
          );
          icon.setAttribute("xmlns", "http://www.w3.org/2000/svg");
          icon.setAttribute("width", "20");
          icon.setAttribute("height", "20");
          icon.setAttribute("viewBox", "0 0 24 24");
          icon.setAttribute("fill", "none");
          icon.setAttribute("stroke", "currentColor");
          icon.setAttribute("stroke-width", "2");
          icon.setAttribute("stroke-linecap", "round");
          icon.setAttribute("stroke-linejoin", "round");
          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path"
          );
          path.setAttribute("d", "m6 9 6 6 6-6");
          icon.appendChild(path);
          icon.classList.add("sort-icon");

          if (sortState === "desc") {
            icon.style.transform = "translateY(-50%) rotate(180deg)";
            icon.style.transition = "transform 0.2s ease";
          }

          header.appendChild(icon);
        }

        if (sortState === "none") {
          restoreOriginalOrder(tableId, tbody);
          updateRowStriping(tableId);
          return;
        }

        const rows = Array.from(tbody.querySelectorAll("tr"));
        rows.sort((a, b) => {
          const aText = a.children[index].textContent.trim().toLowerCase();
          const bText = b.children[index].textContent.trim().toLowerCase();

          if (aText < bText) return sortState === "asc" ? -1 : 1;
          if (aText > bText) return sortState === "asc" ? 1 : -1;
          return 0;
        });

        tbody.innerHTML = "";
        rows.forEach((row) => tbody.appendChild(row));
        updateRowStriping(tableId);
      });
    });
  }

  // Enable sorting for both tables
  enableTableSorting("author-table");
  enableTableSorting("works-table");

  // SEARCH FILTER FUNCTIONALITY

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

    // Apply filter to both tables
    [authorTable, worksTable].forEach((table) => {
      const rows = table.querySelectorAll("tbody tr");
      rows.forEach((row) => {
        const text = row.textContent.toLowerCase();
        const includesAll = includeTokens.every((token) =>
          text.includes(token)
        );
        const excludesAll = excludeTokens.every(
          (token) => !text.includes(token)
        );

        if (includesAll && excludesAll) {
          row.style.display = "";
        } else {
          row.style.display = "none";
        }
      });
      updateRowStriping(table.id);
    });
  });

  const style = document.createElement("style");
  style.textContent = `
    .sort-icon {
      position: absolute;
      right: 6px;
      top: 50%;
      transform: translateY(-50%);
      transform-origin: center;
      pointer-events: none;
      z-index: 2;
      stroke-width: 3;
      opacity: 0.9;
    }
  `;
  document.head.appendChild(style);
});
