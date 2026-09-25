(function () {
  var icons = {
    prev: '<span class="ico i-arrow-left" aria-hidden="true"></span>',
    next: '<span class="ico i-arrow-right" aria-hidden="true"></span>',
    close: '<span class="ico i-close" aria-hidden="true"></span>'
  };

  function makeButton(kind, label, className) {
    var button = document.createElement("button");
    button.type = "button";
    button.className = className || "arrow " + kind;
    button.setAttribute("aria-label", label);
    button.innerHTML = icons[kind];
    return button;
  }

  function onSwipe(element, handler) {
    var startX = null;
    element.addEventListener("touchstart", function (event) {
      startX = event.touches[0].clientX;
    }, { passive: true });
    element.addEventListener("touchend", function (event) {
      if (startX === null) {
        return;
      }
      var dx = event.changedTouches[0].clientX - startX;
      startX = null;
      if (Math.abs(dx) > 40) {
        handler(dx < 0 ? 1 : -1);
      }
    });
  }

  var lightbox = (function () {
    var root = document.createElement("div");
    root.className = "lightbox";
    root.hidden = true;
    root.setAttribute("role", "dialog");
    root.setAttribute("aria-modal", "true");
    root.setAttribute("aria-label", "Screenshot");

    var close = makeButton("close", "Close", "lightbox-close");
    var prev = makeButton("prev", "Previous screenshot");
    var next = makeButton("next", "Next screenshot");
    var stage = document.createElement("figure");
    stage.className = "lightbox-stage";
    var image = document.createElement("img");
    var caption = document.createElement("figcaption");
    var title = document.createElement("span");
    var position = document.createElement("span");
    position.className = "lightbox-count";
    caption.appendChild(title);
    caption.appendChild(position);
    stage.appendChild(image);
    stage.appendChild(caption);
    root.appendChild(close);
    root.appendChild(prev);
    root.appendChild(stage);
    root.appendChild(next);
    document.body.appendChild(root);

    var current = null;
    var returnFocus = null;

    function render() {
      var item = current.items[current.index];
      image.src = item.src;
      image.alt = item.alt;
      title.textContent = item.caption;
      position.textContent = (current.index + 1) + " / " + current.items.length;
      prev.disabled = current.index === 0;
      next.disabled = current.index === current.items.length - 1;
      root.classList.toggle("single", current.items.length === 1);
    }

    function go(step) {
      var target = current.index + step;
      if (target < 0 || target >= current.items.length) {
        return;
      }
      current.index = target;
      current.onChange(target);
      render();
    }

    function hide() {
      root.hidden = true;
      document.documentElement.classList.remove("lightbox-open");
      image.removeAttribute("src");
      current = null;
      if (returnFocus) {
        returnFocus.focus();
      }
    }

    close.addEventListener("click", hide);
    prev.addEventListener("click", function () { go(-1); });
    next.addEventListener("click", function () { go(1); });
    root.addEventListener("click", function (event) {
      if (event.target === root || event.target === stage) {
        hide();
      }
    });
    root.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        hide();
      } else if (event.key === "ArrowLeft") {
        go(-1);
      } else if (event.key === "ArrowRight") {
        go(1);
      } else {
        return;
      }
      event.preventDefault();
    });
    onSwipe(root, go);

    return {
      open: function (items, index, onChange) {
        returnFocus = document.activeElement;
        current = { items: items, index: index, onChange: onChange };
        render();
        root.hidden = false;
        document.documentElement.classList.add("lightbox-open");
        close.focus();
      }
    };
  })();

  function setUp(gallery) {
    var strip = gallery.querySelector(".strip");
    var slides = strip.querySelectorAll(".shot");
    var count = slides.length;
    if (count === 0) {
      return;
    }

    var carousel = document.createElement("div");
    carousel.className = "carousel";
    var viewport = document.createElement("div");
    viewport.className = "viewport";
    var prev = makeButton("prev", "Previous screenshot");
    var next = makeButton("next", "Next screenshot");
    var counter = document.createElement("p");
    counter.className = "counter";
    counter.setAttribute("aria-live", "polite");

    strip.parentNode.insertBefore(carousel, strip);
    viewport.appendChild(strip);
    carousel.appendChild(prev);
    carousel.appendChild(viewport);
    carousel.appendChild(next);
    gallery.appendChild(counter);
    gallery.classList.add("is-carousel");
    if (count === 1) {
      gallery.classList.add("single");
    }

    var index = 0;
    var lastSwipe = 0;
    var thumbStrip = null;
    var thumbButtons = [];

    function revealThumb(thumb) {
      var left = thumb.offsetLeft;
      var right = left + thumb.offsetWidth;
      if (left < thumbStrip.scrollLeft || right > thumbStrip.scrollLeft + thumbStrip.clientWidth) {
        thumbStrip.scrollLeft = left - (thumbStrip.clientWidth - thumb.offsetWidth) / 2;
      }
    }

    function show(target) {
      index = Math.max(0, Math.min(count - 1, target));
      strip.style.transform = "translateX(" + (-100 * index) + "%)";
      for (var i = 0; i < count; i++) {
        slides[i].setAttribute("aria-hidden", i === index ? "false" : "true");
      }
      prev.disabled = index === 0;
      next.disabled = index === count - 1;
      counter.textContent = (index + 1) + " / " + count;
      for (var t = 0; t < thumbButtons.length; t++) {
        var current = thumbButtons[t].slide === index;
        thumbButtons[t].element.setAttribute("aria-current", current ? "true" : "false");
        if (current && thumbStrip.clientWidth > 0) {
          revealThumb(thumbButtons[t].element);
        }
      }
    }

    prev.addEventListener("click", function () { show(index - 1); });
    next.addEventListener("click", function () { show(index + 1); });

    gallery.tabIndex = 0;
    gallery.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        show(index - 1);
      } else if (event.key === "ArrowRight") {
        show(index + 1);
      } else if (event.key === "Enter" && event.target === gallery) {
        openAt(index);
      } else {
        return;
      }
      event.preventDefault();
    });

    onSwipe(viewport, function (step) {
      lastSwipe = Date.now();
      show(index + step);
    });

    var items = [];
    var positions = [];
    for (var i = 0; i < count; i++) {
      var img = slides[i].querySelector("img");
      if (!img) {
        continue;
      }
      var figcaption = slides[i].querySelector("figcaption");
      positions.push(i);
      items.push({
        src: img.getAttribute("src"),
        alt: img.getAttribute("alt") || "",
        caption: figcaption ? figcaption.textContent : ""
      });
      img.classList.add("zoomable");
      img.addEventListener("click", (function (slide) {
        return function () {
          if (Date.now() - lastSwipe < 400) {
            return;
          }
          openAt(slide);
        };
      })(i));
    }

    if (items.length > 1) {
      thumbStrip = document.createElement("div");
      thumbStrip.className = "thumbs";
      positions.forEach(function (slide, itemIndex) {
        var thumb = document.createElement("button");
        thumb.type = "button";
        thumb.className = "thumb";
        thumb.setAttribute("aria-label", items[itemIndex].caption || "Screenshot " + (itemIndex + 1));
        var picture = document.createElement("img");
        picture.src = items[itemIndex].src;
        picture.alt = "";
        picture.loading = "lazy";
        thumb.appendChild(picture);
        thumb.addEventListener("click", function () {
          show(slide);
        });
        thumbStrip.appendChild(thumb);
        thumbButtons.push({ element: thumb, slide: slide });
      });
      gallery.insertBefore(thumbStrip, counter);
      gallery.classList.add("has-thumbs");
    }

    function openAt(slide) {
      var at = positions.indexOf(slide);
      if (at === -1) {
        return;
      }
      lightbox.open(items, at, function (itemIndex) {
        show(positions[itemIndex]);
      });
    }

    show(0);
  }

  var galleries = document.querySelectorAll(".gallery");
  for (var i = 0; i < galleries.length; i++) {
    setUp(galleries[i]);
  }

  function setUpTabs(host, panels) {
    if (!host || panels.length < 2) {
      return;
    }
    var bar = document.createElement("div");
    bar.className = "device-tabs";
    bar.setAttribute("role", "tablist");
    bar.setAttribute("aria-label", "Screenshots by device");
    var tabs = [];

    function select(index, moveFocus) {
      for (var t = 0; t < tabs.length; t++) {
        var active = t === index;
        tabs[t].setAttribute("aria-selected", active ? "true" : "false");
        tabs[t].tabIndex = active ? 0 : -1;
        panels[t].hidden = !active;
      }
      if (moveFocus) {
        tabs[index].focus();
      }
    }

    Array.prototype.forEach.call(panels, function (panel, index) {
      var heading = panel.querySelector("h3");
      var shots = panel.querySelectorAll(".shot img").length;
      var tab = document.createElement("button");
      tab.type = "button";
      tab.className = "device-tab";
      tab.id = "device-tab-" + index;
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-controls", "device-panel-" + index);
      var label = document.createElement("span");
      label.textContent = heading ? heading.textContent : "Screenshots";
      tab.appendChild(label);
      if (shots > 0) {
        var badge = document.createElement("span");
        badge.className = "device-tab-count";
        badge.textContent = shots;
        tab.appendChild(badge);
      }
      tab.addEventListener("click", function () {
        select(index, false);
      });
      tab.addEventListener("keydown", function (event) {
        var target = null;
        if (event.key === "ArrowRight") {
          target = (index + 1) % tabs.length;
        } else if (event.key === "ArrowLeft") {
          target = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === "Home") {
          target = 0;
        } else if (event.key === "End") {
          target = tabs.length - 1;
        }
        if (target !== null) {
          event.preventDefault();
          select(target, true);
        }
      });
      panel.id = "device-panel-" + index;
      panel.setAttribute("role", "tabpanel");
      panel.setAttribute("aria-labelledby", tab.id);
      tabs.push(tab);
      bar.appendChild(tab);
    });

    host.insertBefore(bar, panels[0]);
    host.classList.add("has-tabs");
    select(0, false);
  }

  setUpTabs(document.querySelector(".screenshots"), galleries);

  function revealLinkedSection() {
    var id = window.location.hash.slice(1);
    var target = id ? document.getElementById(id) : null;
    if (target) {
      target.scrollIntoView({ block: "start" });
    }
  }

  if (window.location.hash) {
    revealLinkedSection();
    window.addEventListener("load", revealLinkedSection);
  }
})();
