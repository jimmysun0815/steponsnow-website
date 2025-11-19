// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar background on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.nav');
    if (window.scrollY > 50) {
        nav.style.background = 'rgba(10, 14, 19, 0.95)';
    } else {
        nav.style.background = 'rgba(10, 14, 19, 0.8)';
    }
});

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Apply fade-in to feature cards and screenshot items
document.addEventListener('DOMContentLoaded', () => {
    const elements = document.querySelectorAll('.feature-card, .screenshot-item, .highlight-item');
    elements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        observer.observe(el);
    });

    // Hide scroll indicator after user scrolls
    window.addEventListener('scroll', () => {
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (window.scrollY > 100) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    }, { passive: true });
});

// Add a simple parallax effect to hero image
window.addEventListener('scroll', () => {
    const heroImage = document.querySelector('.phone-mockup');
    if (heroImage) {
        const scrolled = window.pageYOffset;
        const rate = scrolled * 0.3;
        heroImage.style.transform = `translateY(${rate}px)`;
    }
}, { passive: true });

// Update download links (placeholder - update with actual app store links)
const updateStoreLinks = () => {
    const appStoreLink = 'https://apps.apple.com/app/your-app-id'; // TODO: Update with actual link
    const playStoreLink = 'https://play.google.com/store/apps/details?id=your.package.name'; // TODO: Update with actual link
    
    // You can update these dynamically if needed
    console.log('Store links configured');
};

updateStoreLinks();

