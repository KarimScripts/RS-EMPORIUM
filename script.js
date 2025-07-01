// Intersection Observer for section animations
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
      }
    });
  },
  {
    threshold: 0.1,
  }
);

// Observe all sections
document.querySelectorAll("section").forEach((section) => {
  observer.observe(section);
});

// Form submission handling
const contactForm = document.querySelector("#contactForm");
contactForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Get form data
  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const message = document.getElementById("message").value;

  // Show loading state
  const submitButton = this.querySelector('button[type="submit"]');
  const originalButtonText = submitButton.textContent;
  submitButton.textContent = "Sending...";
  submitButton.disabled = true;

  // Prepare template parameters to match EmailJS template
  const templateParams = {
    name: name,
    title: message, // Using message as the title
    email: email,
  };

  // Log all details for debugging
  console.log("Sending email with these details:");
  console.log("Service ID:", "service_4jglnjc");
  console.log("Template ID:", "template_89rnqea");
  console.log("Public Key:", "0BIJxzdMXUs4O0Yj_");
  console.log("Template Parameters:", templateParams);

  // Send email using EmailJS
  console.log("Attempting to send email with params:", templateParams);

  emailjs
    .send(
      "service_4jglnjc",
      "template_89rnqea",
      templateParams,
      "0BIJxzdMXUs4O0Yj_" // Add public key here as well
    )
    .then(
      function (response) {
        console.log("SUCCESS!", response.status, response.text);
        showThankYouModal();
        document.getElementById("contactForm").reset();
      },
      function (error) {
        console.error("FAILED...", error);
        console.error("Error details:", {
          name: error.name,
          message: error.message,
          text: error.text,
          status: error.status,
        });
        alert("Failed to send message. Error: " + error.message);
      }
    )
    .finally(function () {
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    });
});

// Smooth scroll for navigation links
document.querySelectorAll("nav a").forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const targetId = this.getAttribute("href");
    const targetSection = document.querySelector(targetId);
    targetSection.scrollIntoView({ behavior: "smooth" });
  });
});

// Mobile navigation toggle
const createMobileNav = () => {
  const nav = document.querySelector("nav");
  const mobileNav = document.createElement("div");
  mobileNav.className = "md:hidden fixed top-0 right-0 p-4";
  mobileNav.innerHTML = `
        <button id="mobileMenuBtn" class="text-gray-600 hover:text-gray-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
            </svg>
        </button>
        <div id="mobileMenu" class="hidden fixed top-16 right-0 w-48 bg-white shadow-lg rounded-lg p-4">
            <a href="#about" class="block py-2 text-gray-600 hover:text-gray-900">About</a>
            <a href="#services" class="block py-2 text-gray-600 hover:text-gray-900">Services</a>
            <a href="#process" class="block py-2 text-gray-600 hover:text-gray-900">Process</a>
            <a href="#contact" class="block py-2 text-gray-600 hover:text-gray-900">Contact</a>
        </div>
    `;
  nav.appendChild(mobileNav);

  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const mobileMenu = document.getElementById("mobileMenu");

  mobileMenuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
  });

  // Close mobile menu when clicking outside
  document.addEventListener("click", (e) => {
    if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
      mobileMenu.classList.add("hidden");
    }
  });
};

// Initialize mobile navigation
createMobileNav();

// --- Modal and Carousel Setup ---
const modal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const modalPrev = document.getElementById("modalPrev");
const modalNext = document.getElementById("modalNext");

let modalCarouselImages = [];
let modalCarouselIndex = 0;
let globalCarouselIndex = 0;
let carouselAutoInterval = null;
let carouselUserInteracted = false;
let carouselSyncTimeout = null;
const CAROUSEL_SLIDE_INTERVAL = 10000; // 10 seconds
const CAROUSEL_SYNC_DELAY = 5000; // 5 seconds after user interaction

function slideImage(imgElement, newSrc, direction = "next", altText = null) {
  imgElement.classList.remove(
    "carousel-slide-active",
    "carousel-slide-next",
    "carousel-slide-prev"
  );
  imgElement.classList.add(
    "carousel-slide",
    direction === "next" ? "carousel-slide-next" : "carousel-slide-prev"
  );
  setTimeout(() => {
    imgElement.src = newSrc;
    if (altText) imgElement.alt = altText;
    imgElement.classList.remove("carousel-slide-next", "carousel-slide-prev");
    imgElement.classList.add("carousel-slide-active");
  }, 50);
}

function setAllCarouselsToIndex(index, direction = "next") {
  document.querySelectorAll(".portfolio-carousel").forEach((carousel) => {
    const images = JSON.parse(carousel.getAttribute("data-images"));
    const imgElement = carousel.querySelector(".carousel-image");
    slideImage(imgElement, images[index % images.length], direction);
    carousel.setAttribute("data-current-index", index % images.length);
  });
}

function startCarouselAutoSlide() {
  if (carouselAutoInterval) clearInterval(carouselAutoInterval);
  carouselAutoInterval = setInterval(() => {
    if (!carouselUserInteracted && !modal.classList.contains("active")) {
      const prevIndex = globalCarouselIndex;
      globalCarouselIndex = (globalCarouselIndex + 1) % 4; // 4 images per carousel
      setAllCarouselsToIndex(globalCarouselIndex, "next");
    }
  }, CAROUSEL_SLIDE_INTERVAL);
}

function userInteractedWithCarousel() {
  carouselUserInteracted = true;
  if (carouselSyncTimeout) clearTimeout(carouselSyncTimeout);
  carouselSyncTimeout = setTimeout(() => {
    carouselUserInteracted = false;
    setAllCarouselsToIndex(globalCarouselIndex);
  }, CAROUSEL_SYNC_DELAY);
}

function openModalWithCarousel(images, startIndex, altText) {
  modalCarouselImages = images;
  modalCarouselIndex = startIndex;
  modal.classList.add("active");
  modalImg.alt = altText;
  modalImg.classList.add("carousel-slide", "carousel-slide-active");
  modalImg.src = images[startIndex];
  document.body.style.overflow = "hidden";
}

function updateModalImage(direction = "next") {
  if (modalCarouselImages.length > 0) {
    slideImage(modalImg, modalCarouselImages[modalCarouselIndex], direction);
  }
}

modalPrev.addEventListener("click", function (e) {
  e.stopPropagation();
  if (modalCarouselImages.length > 0) {
    modalCarouselIndex =
      (modalCarouselIndex - 1 + modalCarouselImages.length) %
      modalCarouselImages.length;
    updateModalImage("prev");
  }
});

modalNext.addEventListener("click", function (e) {
  e.stopPropagation();
  if (modalCarouselImages.length > 0) {
    modalCarouselIndex = (modalCarouselIndex + 1) % modalCarouselImages.length;
    updateModalImage("next");
  }
});

modal.addEventListener("click", function (e) {
  if (e.target === modal || e.target.classList.contains("modal-close")) {
    closeModal();
  }
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && modal.classList.contains("active")) {
    closeModal();
  }
});
function closeModal() {
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

// --- Portfolio Carousel Logic ---
function initPortfolioCarousels() {
  const carousels = document.querySelectorAll(".portfolio-carousel");
  carousels.forEach((carousel) => {
    const images = JSON.parse(carousel.getAttribute("data-images"));
    let currentIndex = globalCarouselIndex;
    const imgElement = carousel.querySelector(".carousel-image");
    const prevBtn = carousel.querySelector(".carousel-prev");
    const nextBtn = carousel.querySelector(".carousel-next");

    imgElement.classList.add("carousel-slide", "carousel-slide-active");
    imgElement.src = images[currentIndex];
    carousel.setAttribute("data-current-index", currentIndex);

    function updateImage(direction = "next") {
      slideImage(imgElement, images[currentIndex], direction);
      carousel.setAttribute("data-current-index", currentIndex);
    }

    prevBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      globalCarouselIndex = currentIndex;
      updateImage("prev");
      userInteractedWithCarousel();
    });
    nextBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex + 1) % images.length;
      globalCarouselIndex = currentIndex;
      updateImage("next");
      userInteractedWithCarousel();
    });

    imgElement.addEventListener("click", function () {
      // Get the current index from the carousel's attribute
      const currentIndexAttr =
        parseInt(carousel.getAttribute("data-current-index"), 10) || 0;
      openModalWithCarousel(images, currentIndexAttr, imgElement.alt);
      userInteractedWithCarousel();
    });
  });
}

window.addEventListener("DOMContentLoaded", () => {
  initPortfolioCarousels();
  startCarouselAutoSlide();
});

// Thank you modal handling
function showThankYouModal() {
  const overlay = document.getElementById("thankYouOverlay");
  const modal = overlay.querySelector(".thank-you-modal");
  overlay.classList.add("active");
  modal.classList.add("active");
}

function closeThankYouModal() {
  const overlay = document.getElementById("thankYouOverlay");
  const modal = overlay.querySelector(".thank-you-modal");
  overlay.classList.remove("active");
  modal.classList.remove("active");
  document.body.style.overflow = ""; // Restore scroll bar
}

// Mobile menu toggle
const mobileMenuButton = document.getElementById("mobile-menu-button");
const mobileMenu = document.getElementById("mobile-menu");
const hamburgerIcon = document.getElementById("hamburger-icon");
const closeIcon = document.getElementById("close-icon");

mobileMenuButton.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
  hamburgerIcon.classList.toggle("hidden");
  closeIcon.classList.toggle("hidden");
});

// Close mobile menu when a link is clicked
const mobileMenuLinks = mobileMenu.querySelectorAll("a");
mobileMenuLinks.forEach((link) => {
  link.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
    hamburgerIcon.classList.remove("hidden");
    closeIcon.classList.add("hidden");
  });
});
