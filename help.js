(function () {
  function openById(id) {
    var target = id ? document.getElementById(id) : null;
    if (!target || target.tagName !== "DETAILS") {
      return false;
    }
    target.open = true;
    target.scrollIntoView();
    return true;
  }

  function openFromHash() {
    if (location.hash) {
      openById(location.hash.slice(1));
    }
  }

  document.addEventListener("click", function (event) {
    var link = event.target.closest('a[href^="#"]');
    if (!link) {
      return;
    }
    var id = link.getAttribute("href").slice(1);
    if (openById(id)) {
      event.preventDefault();
      if (location.hash !== "#" + id) {
        history.pushState(null, "", "#" + id);
      }
    }
  });

  openFromHash();
  window.addEventListener("hashchange", openFromHash);
})();
