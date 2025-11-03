document.addEventListener("DOMContentLoaded", () => {
  // --- Helper Functions for Info Panels ---
  function openWorkInfo(workObj) {
    const infoSectionB = document.getElementById("info-section-b");
    const titleElem = infoSectionB.querySelector("#b-title");
    const authorsElem = infoSectionB.querySelector("#b-authors .data");
    const tagsElem = infoSectionB.querySelector("#b-tags .data");
    const statusElem = infoSectionB.querySelector("#b-status .data");
    const ratingElem = infoSectionB.querySelector("#b-rating .data");
    const notesElem = infoSectionB.querySelector("#b-notes");

    if (titleElem) titleElem.textContent = workObj.title;

    if (authorsElem) {
      authorsElem.innerHTML = "";
      workObj.authors.forEach((a, idx) => {
        const authorName = authorsMap[a] || a;
        const link = document.createElement("a");
        link.href = "#";
        link.textContent = authorName;
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const authorObj = authorsData.find(aObj => aObj.name === authorName);
          if (!authorObj) return;
          openAuthorInfo(authorObj);
        });
        authorsElem.appendChild(link);
        if (idx < workObj.authors.length - 1) authorsElem.appendChild(document.createTextNode(", "));
      });
    }

    if (tagsElem) tagsElem.textContent = workObj.tags;
    if (statusElem) statusElem.textContent = workObj.status;
    if (ratingElem) ratingElem.textContent = workObj.rating !== null ? workObj.rating : "";
    if (notesElem) notesElem.innerHTML = workObj.notes || "";

    showOnlySection("info-section-b");
  }

  function openAuthorInfo(authorObj) {
    const infoSectionA = document.getElementById("info-section-a");
    const nameElem = infoSectionA.querySelector("#a-name");
    const bioElem = infoSectionA.querySelector("#a-bio");
    const worksTableBody = infoSectionA.querySelector("#a-works tbody");

    if (nameElem) nameElem.textContent = authorObj.name;
    if (bioElem) bioElem.textContent = authorObj.bio;

    if (worksTableBody) {
      worksTableBody.innerHTML = "";
      const filteredWorks = worksData.filter(work => work.authors.includes(authorObj.id));
      filteredWorks.forEach((work) => {
        const row = document.createElement("tr");
        const titleCell = document.createElement("td");
        const statusCell = document.createElement("td");

        const titleLink = document.createElement("a");
        titleLink.href = "#";
        titleLink.textContent = work.title;
        titleLink.addEventListener("click", (e) => {
          e.preventDefault();
          openWorkInfo(work);
        });

        titleCell.appendChild(titleLink);
        statusCell.textContent = work.status;
        row.appendChild(titleCell);
        row.appendChild(statusCell);
        worksTableBody.appendChild(row);
      });
      updateRowStriping("a-works");
    }

    showOnlySection("info-section-a");
  }
  // Helper to show only a single section by id, hiding the others
  function showOnlySection(sectionId) {
    const sections = [
      "default-section",
      "recommend-section",
      "info-section-a",
      "info-section-b",
    ];
    sections.forEach((id) => {
      const elem = document.getElementById(id);
      if (elem) {
        if (id === sectionId) elem.classList.remove("hidden");
        else elem.classList.add("hidden");
      }
    });
  }
  const btnWorks = document.getElementById("btn-works");
  const btnAuthors = document.getElementById("btn-authors");
  const btnRecommend = document.getElementById("recommend");
  const authorTable = document.getElementById("author-table");
  const worksTable = document.getElementById("works-table");
  const searchInput = document.querySelector('input[type="search"]');

  let originalRowsMap = {};
  let authorsMap = {};
  let authorsData = [];
  let worksData = [];

  function updateRowStriping(tableId) {
    const allRows = Array.from(
      document.querySelectorAll(`#${tableId} tbody tr`)
    );
    const visibleRows = allRows.filter((r) => r.style.display !== "none");

    visibleRows.forEach((row, idx) => {
      row.classList.toggle("even", idx % 2 === 1);
      row.classList.toggle("odd", idx % 2 === 0);

      // Detect "Read" status and apply green background
      const statusCell = row.querySelector("td:nth-child(4)");
      if (
        statusCell &&
        statusCell.textContent.trim().toLowerCase() === "read"
      ) {
        row.classList.add("read-row");
      } else {
        row.classList.remove("read-row");
      }
    });

    // Remove striping and read class from hidden rows
    allRows.forEach((r) => {
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
    btnRecommend.classList.toggle("active-button");
    // Toggle visibility between sections
    if (btnRecommend.classList.contains("active-button")) {
      showOnlySection("recommend-section");
    } else {
      showOnlySection("default-section");
    }
  });

  // THIS LOADS THE AUTHORS

  function loadAuthors() {
    return fetch("/personal/library/authors.json")
      .then((response) => response.json())
      .then((data) => {
        const authorTableBody = document.querySelector("#author-table tbody");
        authorTableBody.innerHTML = "";

        // Populate authorsMap and authorsData
        authorsMap = {};
        authorsData = data.authors;
        data.authors.forEach((author) => {
          authorsMap[author.id] = author.name;
        });

        data.authors.forEach((author) => {
          const row = document.createElement("tr");
          const nameCell = document.createElement("td");
          const bioCell = document.createElement("td");

          // Create <a> tag for author name linking to '#'
          const nameLink = document.createElement("a");
          nameLink.href = "#";
          nameLink.textContent = author.name;
          nameCell.appendChild(nameLink);

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
    return fetch("/personal/library/works.json")
      .then((response) => response.json())
      .then((data) => {
        const worksTableBody = document.querySelector("#works-table tbody");
        worksTableBody.innerHTML = "";

        worksData = data.works;

        data.works.forEach((work) => {
          const row = document.createElement("tr");
          const titleCell = document.createElement("td");
          const authorCell = document.createElement("td");
          const tagsCell = document.createElement("td");
          const statusCell = document.createElement("td");
          const ratingCell = document.createElement("td");

          // Create <a> tag for work title linking to '#'
          const titleLink = document.createElement("a");
          titleLink.href = "#";
          titleLink.textContent = work.title;
          titleCell.appendChild(titleLink);

          // Create <a> tags for each author name linking to '#'
          const authorLinks = work.authors.map((a) => {
            const link = document.createElement("a");
            link.href = "#";
            link.textContent = authorsMap[a] || a;
            return link;
          });
          // Append author links separated by ", "
          authorLinks.forEach((link, idx) => {
            authorCell.appendChild(link);
            if (idx < authorLinks.length - 1) {
              authorCell.appendChild(document.createTextNode(", "));
            }
          });

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
  loadAuthors().then(() =>
    loadWorks().then(() => {
      // Attach click handler for author links in author-table using event delegation
      authorTable.addEventListener("click", (event) => {
        const target = event.target;
        if (target.tagName === "A") {
          event.preventDefault();
          const authorName = target.textContent;
          const authorObj = authorsData.find((a) => a.name === authorName);
          if (!authorObj) return;
          openAuthorInfo(authorObj);
        }
      });

      // Attach click handler for both author and title links in works-table using event delegation
      worksTable.addEventListener("click", (event) => {
        const target = event.target;
        if (target.tagName === "A") {
          event.preventDefault();
          const row = target.closest("tr");
          const titleCell = row.children[0];
          const authorCell = row.children[1];
          // Check if clicked link is the title link
          if (titleCell.contains(target)) {
            // Find the work object by title
            const workObj = worksData.find(
              (w) => w.title === target.textContent
            );
            if (!workObj) return;
            openWorkInfo(workObj);
          } else {
            // Otherwise, it’s an author link: populate info-section-a
            const authorName = target.textContent;
            const authorObj = authorsData.find((a) => a.name === authorName);
            if (!authorObj) return;
            openAuthorInfo(authorObj);
          }
        }
      });
    })
  );

  // Add close button event listeners for info-section-a and info-section-b
  const infoSectionA = document.getElementById("info-section-a");
  const infoSectionB = document.getElementById("info-section-b");
  if (infoSectionA) {
    const closeBtnA = infoSectionA.querySelector(".close");
    if (closeBtnA) {
      closeBtnA.addEventListener("click", () => {
        showOnlySection("default-section");
      });
    }
  }
  if (infoSectionB) {
    const closeBtnB = infoSectionB.querySelector(".close");
    if (closeBtnB) {
      closeBtnB.addEventListener("click", () => {
        showOnlySection("default-section");
      });
    }
  }

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
