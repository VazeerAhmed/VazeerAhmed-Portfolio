// element toggle function
const elementToggleFunc = function (elem) { elem.classList.toggle("active"); }

// sidebar variables
const sidebar = document.querySelector("[data-sidebar]");
const sidebarBtn = document.querySelector("[data-sidebar-btn]");

// sidebar toggle functionality for mobile
sidebarBtn.addEventListener("click", function () { elementToggleFunc(sidebar); });

// testimonials variables
const testimonialsItem = document.querySelectorAll("[data-testimonials-item]");
const modalContainer = document.querySelector("[data-modal-container]");
const modalCloseBtn = document.querySelector("[data-modal-close-btn]");
const overlay = document.querySelector("[data-overlay]");

// modal variable
const modalImg = document.querySelector("[data-modal-img]");
const modalTitle = document.querySelector("[data-modal-title]");
const modalText = document.querySelector("[data-modal-text]");

// modal toggle function
const testimonialsModalFunc = function () {
  modalContainer.classList.toggle("active");
  overlay.classList.toggle("active");
}

// add click event to all modal items
for (let i = 0; i < testimonialsItem.length; i++) {
  testimonialsItem[i].addEventListener("click", function () {
    modalImg.src = this.querySelector("[data-testimonials-avatar]").src;
    modalImg.alt = this.querySelector("[data-testimonials-avatar]").alt;
    modalTitle.innerHTML = this.querySelector("[data-testimonials-title]").innerHTML;
    modalText.innerHTML = this.querySelector("[data-testimonials-text]").innerHTML;
    testimonialsModalFunc();
  });
}

// add click event to modal close button
modalCloseBtn.addEventListener("click", testimonialsModalFunc);
overlay.addEventListener("click", testimonialsModalFunc);

// Blog detail view variables
const blogLinks = document.querySelectorAll("[data-blog-link]");
const backButtons = document.querySelectorAll("[data-back]");
const blogGrid = document.querySelector("#blog-grid");

// Function to show blog detail (hide grid, show detail)
const showBlogDetail = function (detailId) {
  blogGrid.style.display = "none";
  const detailElement = document.getElementById(detailId);
  if (detailElement) {
    detailElement.style.display = "block";
    window.scrollTo(0, 0); // Scroll to top for full-page feel
  }
}

// Function to hide blog detail (show grid, hide detail)
const hideBlogDetail = function (detailId) {
  blogGrid.style.display = "block";
  const detailElement = document.getElementById(detailId);
  if (detailElement) {
    detailElement.style.display = "none";
  }
}

// Add click event to all blog links
for (let i = 0; i < blogLinks.length; i++) {
  blogLinks[i].addEventListener("click", function (e) {
    e.preventDefault();
    const detailId = this.getAttribute("data-detail-target");
    if (detailId) {
      showBlogDetail(detailId);
    }
  });
}

// Add click event to all back buttons
for (let i = 0; i < backButtons.length; i++) {
  backButtons[i].addEventListener("click", function () {
    const detail = this.closest(".blog-detail");
    if (detail) {
      hideBlogDetail(detail.id);
    }
  });
}

document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    blogModals.forEach(modal => modal.classList.remove("active"));
    overlay.classList.remove("active");
  }
});

// custom select variables
const select = document.querySelector("[data-select]");
const selectItems = document.querySelectorAll("[data-select-item]");
const selectValue = document.querySelector("[data-selecct-value]");
const filterBtn = document.querySelectorAll("[data-filter-btn]");

select.addEventListener("click", function () { elementToggleFunc(this); });

// add event in all select items
for (let i = 0; i < selectItems.length; i++) {
  selectItems[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    elementToggleFunc(select);
    filterFunc(selectedValue);
  });
}

// filter variables
const filterItems = document.querySelectorAll("[data-filter-item]");

const filterFunc = function (selectedValue) {
  for (let i = 0; i < filterItems.length; i++) {
    if (selectedValue === "all") {
      filterItems[i].classList.add("active");
    } else if (selectedValue === filterItems[i].dataset.category) {
      filterItems[i].classList.add("active");
    } else {
      filterItems[i].classList.remove("active");
    }
  }
}

// add event in all filter button items for large screen
let lastClickedBtn = filterBtn[0];

for (let i = 0; i < filterBtn.length; i++) {
  filterBtn[i].addEventListener("click", function () {
    let selectedValue = this.innerText.toLowerCase();
    selectValue.innerText = this.innerText;
    filterFunc(selectedValue);
    lastClickedBtn.classList.remove("active");
    this.classList.add("active");
    lastClickedBtn = this;
  });
}

// Contact form variables
const form = document.querySelector("[data-form]");
const formInputs = document.querySelectorAll("[data-form-input]");
const formBtn = document.querySelector("[data-form-btn]");

// Function to check form validity
function checkFormValidity() {
  console.log("Checking validity..."); // Debug log - open browser console (F12) to see
  if (form.checkValidity()) {
    console.log("Form is valid - enabling button"); // Debug log
    formBtn.removeAttribute("disabled");
  } else {
    console.log("Form is invalid - disabling button"); // Debug log
    formBtn.setAttribute("disabled", "");
  }
}

// Add event listener to each input field
formInputs.forEach(input => {
  input.addEventListener("input", checkFormValidity);
});

// Check form validity when page loads
window.addEventListener("load", checkFormValidity);

// Handle form submission
form.addEventListener("submit", (e) => {
  console.log("Form submitted!"); // Debug log
  if (form.checkValidity()) {
    formBtn.setAttribute("disabled", "");
    // Formspree will handle sending to https://formspree.io/f/mblanlan
  }
});

// Append message (no timestamp)
  function appendMessage(text, isUser = false) {
    const messagesDiv = document.getElementById('chat-messages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${isUser ? 'user' : 'ai'}`;

    if (!isUser) {
      const avatar = document.createElement('div');
      avatar.className = 'message-avatar';
      avatar.textContent = 'A';
      msgDiv.appendChild(avatar);
    }

    const bubble = document.createElement('div');
    bubble.className = 'message-bubble';
    bubble.innerHTML = text.replace(/\n/g, '<br>');

    msgDiv.appendChild(bubble);
    messagesDiv.appendChild(msgDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }

  function showTyping() {
    const indicator = document.getElementById('typing-indicator');
    const messagesDiv = document.getElementById('chat-messages');
    
    // Move the indicator to the very end of the list so it appears below the latest message
    messagesDiv.appendChild(indicator);
    
    indicator.style.display = 'flex';
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
  }
  function hideTyping() {
    document.getElementById('typing-indicator').style.display = 'none';
  }

  // Send message
  async function sendMessage() {
    const input = document.getElementById('user-message');
    const msg = input.value.trim();
    if (!msg) return;

    appendMessage(msg, true);
    input.value = '';
    showTyping();

    try {
      const res = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();
      hideTyping();
      appendMessage(data.response, false);
    } catch (err) {
      hideTyping();
      appendMessage('Connection error. Please try again.', false);
    }
  }

  // Event Listeners
  document.getElementById('send-btn').addEventListener('click', sendMessage);
  document.getElementById('user-message').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendMessage();
  });

  // Optional: Welcome message on load
  window.addEventListener('load', () => {
    setTimeout(() => {
      appendMessage("Hello! I'm <strong>A.R.I.S.E</strong> — your guide to Vazeer’s tech world.", false);
    }, 500);
  });
// page navigation variables
const navigationLinks = document.querySelectorAll("[data-nav-link]");
const pages = document.querySelectorAll("[data-page]");

// add event to all nav link
for (let i = 0; i < navigationLinks.length; i++) {
  navigationLinks[i].addEventListener("click", function () {
    for (let i = 0; i < pages.length; i++) {
      if (this.innerHTML.toLowerCase() === pages[i].dataset.page) {
        pages[i].classList.add("active");
        navigationLinks[i].classList.add("active");
        window.scrollTo(0, 0);
      } else {
        pages[i].classList.remove("active");
        navigationLinks[i].classList.remove("active");
      }
    }
  });
}


//skills
const carousel = document.getElementById('skillsCarousel');
    const prevBtn = document.getElementById('prevBtn');
    const nextBtn = document.getElementById('nextBtn');
    const categoryBtns = document.querySelectorAll('.category-btn');
    const skillCards = document.querySelectorAll('.skill-card');

    // Carousel navigation
    prevBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: -220, behavior: 'smooth' });
    });

    nextBtn.addEventListener('click', () => {
      carousel.scrollBy({ left: 220, behavior: 'smooth' });
    });

    // Category filtering
    categoryBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const category = btn.getAttribute('data-category');
        
        // Update active button
        categoryBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        // Filter cards
        skillCards.forEach(card => {
          if (category === 'all' || card.getAttribute('data-category') === category) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });

        // Reset scroll
        carousel.scrollTo({ left: 0, behavior: 'smooth' });
      });
    });

    // Auto-scroll on mouse wheel
    carousel.addEventListener('wheel', (e) => {
      e.preventDefault();
      carousel.scrollBy({ left: e.deltaY < 0 ? -220 : 220, behavior: 'smooth' });
    });

    // Enhanced touch/drag scroll with touch device support
    let isDown = false;
    let startX;
    let scrollLeft;
    let momentumID;
    let velocity = 0;
    let lastPageX = 0;

    function startDragging(e) {
        isDown = true;
        carousel.style.cursor = 'grabbing';
        carousel.style.scrollBehavior = 'auto';
        startX = (e.pageX || e.touches[0].pageX) - carousel.offsetLeft;
        scrollLeft = carousel.scrollLeft;
        lastPageX = e.pageX || e.touches[0].pageX;
        
        // Clear any existing momentum scrolling
        cancelAnimationFrame(momentumID);
    }

    function stopDragging() {
        if (!isDown) return;
        isDown = false;
        carousel.style.cursor = 'grab';
        carousel.style.scrollBehavior = 'smooth';
        
        // Apply momentum
        const momentumScroll = () => {
            if (Math.abs(velocity) > 0.1) {
                carousel.scrollLeft += velocity;
                velocity *= 0.95; // Decay factor
                momentumID = requestAnimationFrame(momentumScroll);
            }
        };
        momentumScroll();
    }

    function dragging(e) {
        if (!isDown) return;
        e.preventDefault();
        const x = (e.pageX || e.touches[0].pageX) - carousel.offsetLeft;
        const walk = (x - startX) * 2;
        carousel.scrollLeft = scrollLeft - walk;
        
        // Calculate velocity
        const currentPageX = e.pageX || e.touches[0].pageX;
        velocity = (lastPageX - currentPageX) * 0.5;
        lastPageX = currentPageX;
    }

    // Mouse events
    carousel.addEventListener('mousedown', startDragging);
    carousel.addEventListener('mouseleave', stopDragging);
    carousel.addEventListener('mouseup', stopDragging);
    carousel.addEventListener('mousemove', dragging);

    // Touch events
    carousel.addEventListener('touchstart', startDragging);
    carousel.addEventListener('touchend', stopDragging);
    carousel.addEventListener('touchmove', dragging);

    

  //// ───────── Terms & Privacy Modal ─────────
// ───────── Sidebar Page Switcher ─────────

// Function to switch pages from Sidebar (Terms/Privacy)
function switchToPage(pageId) {
  // 1. Get all articles (pages) and navigation links
  const pages = document.querySelectorAll("[data-page]");
  const navLinks = document.querySelectorAll("[data-nav-link]");

  // 2. Deactivate all pages
  for (let i = 0; i < pages.length; i++) {
    pages[i].classList.remove("active");
  }

  // 3. Deactivate all navbar links (since Terms/Privacy aren't in the top navbar)
  for (let i = 0; i < navLinks.length; i++) {
    navLinks[i].classList.remove("active");
  }

  // 4. Activate the specific target page
  const targetPage = document.querySelector(`[data-page="${pageId}"]`);
  if (targetPage) {
    targetPage.classList.add("active");
    window.scrollTo(0, 0); // Scroll to top
  }
}



