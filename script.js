/* ================================
   ASADIA BRAND — SCRIPT.JS
   Version: 1.0
   Author: Asadia Team
   Description:
   Main JavaScript for interactivity, animations, form handling,
   language selection, and user engagement.
================================= */

/* ========== 🌐 GLOBAL VARIABLES ========== */
const contactForm = document.querySelector("form");
const langSelect = document.getElementById("languageSelect");
const newsletterForm = document.getElementById("newsletterForm");
const toTopBtn = document.createElement("button");

/* ========== 🌀 SMOOTH SCROLLING ========== */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute("href")).scrollIntoView({
            behavior: "smooth"
        });
    });
});

/* ========== 🔝 BACK TO TOP BUTTON ========== */
toTopBtn.innerHTML = "⬆";
toTopBtn.id = "backToTop";
toTopBtn.style.cssText = `
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(45deg, #c00000, #900000);
  color: white;
  border: none;
  border-radius: 50%;
  width: 45px;
  height: 45px;
  font-size: 20px;
  cursor: pointer;
  display: none;
  box-shadow: 0 0 10px rgba(255,0,0,0.6);
  transition: all 0.3s ease;
`;
document.body.appendChild(toTopBtn);

window.addEventListener("scroll", () => {
    if (window.scrollY > 250) {
        toTopBtn.style.display = "block";
    } else {
        toTopBtn.style.display = "none";
    }
});
toTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ========== 💌 NEWSLETTER FORM ========== */
if (newsletterForm) {
    newsletterForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const email = newsletterForm.querySelector("input[type='email']").value.trim();

        if (!email) {
            alert("Please enter your email.");
            return;
        }

        // Simulate submission success (replace with backend/API)
        alert(`Thank you for subscribing, ${email}!`);
        newsletterForm.reset();
    });
}

/* ========== ✉️ CONTACT FORM (Formspree) ========== */
if (contactForm) {
    contactForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        const formData = new FormData(contactForm);

        const response = await fetch("https://formspree.io/f/xanlypzr", {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" }
        });

        if (response.ok) {
            alert("✅ Thank you! Your message has been sent successfully.");
            contactForm.reset();
        } else {
            alert("⚠️ There was a problem sending your message. Try again later.");
        }
    });
}

/* ========== 🌍 MULTI-LANGUAGE SYSTEM ========== */
const translations = {
    en: {
        home: "Home",
        products: "Products",
        contact: "Contact",
        mission: "Our Mission",
        subscribe: "Subscribe",
        blog: "Blog",
        testimonial: "Testimonials"
    },
    az: {
        home: "Əsas",
        products: "Məhsullar",
        contact: "Əlaqə",
        mission: "Missiyamız",
        subscribe: "Abunə ol",
        blog: "Bloq",
        testimonial: "Rəylər"
    },
    ur: {
        home: "ہوم",
        products: "پروڈکٹس",
        contact: "رابطہ",
        mission: "ہمارا مشن",
        subscribe: "سبسکرائب کریں",
        blog: "بلاگ",
        testimonial: "تعریفیں"
    }
};

// Change language dynamically
if (langSelect) {
    langSelect.addEventListener("change", (e) => {
        const lang = e.target.value;
        document.querySelectorAll("[data-translate]").forEach(el => {
            const key = el.getAttribute("data-translate");
            el.textContent = translations[lang][key];
        });
    });
}

/* ========== 🧠 TESTIMONIALS ROTATION ========== */
const testimonials = [
    { name: "Sana Malik", text: "ASADIA’s quality is unmatched — premium and elegant!" },
    { name: "Alex Jensen", text: "The designs speak power and confidence. Absolutely love it!" },
    { name: "Fatima Noor", text: "Customer service was super kind and responsive!" }
];
let currentTestimonial = 0;

function showNextTestimonial() {
    const t = testimonials[currentTestimonial];
    const el = document.getElementById("testimonialBox");
    if (el) {
        el.innerHTML = `<p>"${t.text}"</p><h4>— ${t.name}</h4>`;
        currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }
}
setInterval(showNextTestimonial, 5000);
showNextTestimonial();

/* ========== 📰 BLOG POST LOADER ========== */
async function loadBlogs() {
    try {
        const res = await fetch("data/blog-posts.json");
        const blogs = await res.json();
        const blogContainer = document.getElementById("blogContainer");

        if (blogContainer) {
            blogs.forEach(post => {
                const div = document.createElement("div");
                div.classList.add("blog-post");
                div.innerHTML = `
                    <h3>${post.title}</h3>
                    <p>${post.summary}</p>
                    <a href="${post.link}" target="_blank">Read more →</a>
                `;
                blogContainer.appendChild(div);
            });
        }
    } catch (err) {
        console.error("Error loading blogs:", err);
    }
}
loadBlogs();

/* ========== ⚙️ SIMPLE UI ANIMATIONS ========== */
window.addEventListener("scroll", () => {
    document.querySelectorAll(".fade-in").forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 50) {
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
        }
    });
});

/* ========== 🕒 FOOTER YEAR AUTO UPDATE ========== */
const footerYear = document.querySelector("footer p");
if (footerYear) {
    const year = new Date().getFullYear();
    footerYear.innerHTML = `&copy; ${year} ASADIA. All rights reserved.`;
}
