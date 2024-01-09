document.addEventListener("DOMContentLoaded", function () {
  const allButtons = document.querySelectorAll(".searchBtn");
  const searchBar = document.querySelector(".searchBar");
  const searchInput = document.getElementById("searchInput");
  const searchClose = document.getElementById("searchClose");

  for (var i = 0; i < allButtons.length; i++) {
    allButtons[i].addEventListener("click", function () {
      searchBar.style.visibility = "visible";
      searchBar.classList.add("open");
      this.setAttribute("aria-expanded", "true");
      searchInput.focus();
    });
  }

  searchClose.addEventListener("click", function () {
    searchBar.style.visibility = "hidden";
    searchBar.classList.remove("open");
    this.setAttribute("aria-expanded", "false");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("/data/quotes.json")
    .then((response) => response.json())
    .then((data) => {
      const randomQuote = data[Math.floor(Math.random() * data.length)];
      document.getElementById("quoteText").innerText = randomQuote.text;
      document.getElementById("quoteAuthor").innerText = randomQuote.author;

      var modal = document.getElementById("quoteModal");
      modal.classList.add("show"); // Add class to show the modal and start text animation

      // Start the fade-out after 3 seconds
      setTimeout(function () {
        modal.classList.remove("show");
        modal.classList.add("fade-out");
      }, 4000);

      // Once the modal has faded, hide it completely and show main content
      modal.addEventListener("transitionend", function () {
        modal.style.display = "none";
        document.body.style.visibility = "visible"; // Reveal the main content
      });
    })
    .catch((error) => console.error("Error fetching quote:", error));
});
