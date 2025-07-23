// Performance Optimizations and Service Worker Registration
// ==============================================

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', async () => {
        try {
            const registration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            console.log('✅ SW registered successfully:', registration.scope);
            
            // Listen for updates
            registration.addEventListener('updatefound', () => {
                const newWorker = registration.installing;
                newWorker.addEventListener('statechange', () => {
                    if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                        // New content available, prompt user to refresh
                        showUpdateNotification();
                    }
                });
            });
        } catch (error) {
            console.log('❌ SW registration failed:', error);
        }
    });
}

// Performance Monitoring
// ==============================================
function initPerformanceMonitoring() {
    // Measure Core Web Vitals
    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
                const loadTime = entry.loadEventEnd - entry.loadEventStart;
                console.log('⚡ Page Load Time:', loadTime + 'ms');
                
                // Send to analytics
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'page_load_time', {
                        value: Math.round(loadTime),
                        event_category: 'performance'
                    });
                }
            }
            
            if (entry.entryType === 'largest-contentful-paint') {
                console.log('🎯 LCP:', entry.startTime + 'ms');
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'lcp', {
                        value: Math.round(entry.startTime),
                        event_category: 'web_vitals'
                    });
                }
            }
            
            if (entry.entryType === 'first-input') {
                console.log('👆 FID:', entry.processingStart - entry.startTime + 'ms');
                if (typeof gtag !== 'undefined') {
                    gtag('event', 'fid', {
                        value: Math.round(entry.processingStart - entry.startTime),
                        event_category: 'web_vitals'
                    });
                }
            }
            
            if (entry.entryType === 'layout-shift') {
                if (!entry.hadRecentInput) {
                    console.log('📐 CLS:', entry.value);
                    if (typeof gtag !== 'undefined') {
                        gtag('event', 'cls', {
                            value: entry.value,
                            event_category: 'web_vitals'
                        });
                    }
                }
            }
        }
    });

    observer.observe({entryTypes: ['navigation', 'largest-contentful-paint', 'first-input', 'layout-shift']});
}

// Image Optimization and Lazy Loading
// ==============================================
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            
            // Check for WebP support and use appropriate format
            if (supportsWebP() && img.dataset.webp) {
                img.src = img.dataset.webp;
            } else if (img.dataset.src) {
                img.src = img.dataset.src;
            }
            
            img.classList.remove('lazy-load');
            img.classList.add('lazy-loaded');
            observer.unobserve(img);
        }
    });
}, {
    rootMargin: '50px 0px',
    threshold: 0.01
});

// WebP Support Detection
function supportsWebP() {
    if (window.webpSupport !== undefined) return window.webpSupport;
    
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    window.webpSupport = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    return window.webpSupport;
}

// Preload Critical Resources
// ==============================================
function preloadCriticalResources() {
    const criticalResources = [
        { href: 'Pictures/profile.jpg', as: 'image' },
        { href: 'Pictures/1.jpg', as: 'image' },
        { href: 'Pictures/2.jpg', as: 'image' },
        { href: 'Ahmed_M__Abdelmoneim.pdf', as: 'document' }
    ];
    
    criticalResources.forEach(resource => {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.href = resource.href;
        link.as = resource.as;
        if (resource.as === 'image') {
            link.type = supportsWebP() ? 'image/webp' : 'image/jpeg';
        }
        document.head.appendChild(link);
    });
}

// Throttling and Debouncing Utilities
// ==============================================
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Mobile Navigation with Enhanced UX
// ==============================================
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        const isActive = hamburger.classList.contains('active');
        
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Prevent body scroll when menu is open
        document.body.style.overflow = isActive ? 'auto' : 'hidden';
        
        // Add analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'menu_toggle', {
                event_category: 'navigation',
                event_label: isActive ? 'close' : 'open'
            });
        }
    });

    // Close menu when clicking on links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navMenu.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = 'auto';
        }
    });
}

// Enhanced Typing Animation
// ==============================================
const typingText = document.querySelector('.typing-text');
const texts = [
    'AI Engineer',
    'Data Engineer', 
    'Machine Learning Engineer',
    'Research Assistant',
    'Python Developer',
    'MLOps Engineer',
    'Deep Learning Specialist',
    'NLP Engineer'
];

let textIndex = 0;
let charIndex = 0;
let isDeleting = false;

function typeWriter() {
    if (!typingText) return;
    
    const currentText = texts[textIndex];
    
    if (isDeleting) {
        typingText.textContent = currentText.substring(0, charIndex - 1);
        charIndex--;
    } else {
        typingText.textContent = currentText.substring(0, charIndex + 1);
        charIndex++;
    }
    
    let typeSpeed = isDeleting ? 50 : 100;
    
    if (!isDeleting && charIndex === currentText.length) {
        typeSpeed = 2000;
        isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        textIndex = (textIndex + 1) % texts.length;
        typeSpeed = 500;
    }
    
    requestAnimationFrame(() => {
        setTimeout(typeWriter, typeSpeed);
    });
}

// Advanced Project Filtering with Animations
// ==============================================
function initializeProjectFiltering() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    if (!filterButtons.length || !projectCards.length) return;

    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            const filterValue = button.getAttribute('data-filter');
            
            // Track filter usage
            if (typeof gtag !== 'undefined') {
                gtag('event', 'project_filter', {
                    event_category: 'portfolio',
                    event_label: filterValue
                });
            }

            // Animate cards
            projectCards.forEach((card, index) => {
                const shouldShow = filterValue === 'all' || 
                                 card.getAttribute('data-category') === filterValue;
                
                if (shouldShow) {
                    card.style.display = 'block';
                    card.style.animationDelay = `${index * 0.1}s`;
                    card.classList.remove('hide');
                } else {
                    card.classList.add('hide');
                    setTimeout(() => {
                        if (card.classList.contains('hide')) {
                            card.style.display = 'none';
                        }
                    }, 300);
                }
            });
        });
    });
}

// Enhanced Modal with Keyboard Navigation
// ==============================================
function initializeModalFunctionality() {
    const projectCards = document.querySelectorAll('.project-card');
    const modal = document.getElementById('projectModal');
    const closeModal = document.querySelector('.close');

    if (!modal) return;

    projectCards.forEach(card => {
        card.addEventListener('click', (e) => {
            if (e.target.closest('.project-link') || e.target.closest('.show-more-btn')) {
                return;
            }

            openProjectModal(card);
        });
        
        // Add keyboard accessibility
        card.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openProjectModal(card);
            }
        });
    });

    function openProjectModal(card) {
        const title = card.querySelector('h3').textContent;
        const date = card.querySelector('.project-date')?.textContent || '';
        const description = card.querySelector('.project-description').textContent;
        const image = card.querySelector('.project-image img').src;
        const techTags = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent);
        const links = Array.from(card.querySelectorAll('.project-link'));

        // Populate modal
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalDate').textContent = date;
        document.getElementById('modalDescription').textContent = description;
        document.getElementById('modalImage').src = image;

        // Tech tags
        const modalTech = document.getElementById('modalTech');
        modalTech.innerHTML = '';
        techTags.forEach(tech => {
            const span = document.createElement('span');
            span.className = 'tech-tag';
            span.textContent = tech;
            modalTech.appendChild(span);
        });

        // Links
        const modalLinks = document.getElementById('modalLinks');
        modalLinks.innerHTML = '';
        links.forEach(link => {
            const newLink = link.cloneNode(true);
            modalLinks.appendChild(newLink);
        });

        // Show modal
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        
        // Focus management
        closeModal?.focus();
        
        // Analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', 'project_view', {
                event_category: 'portfolio',
                event_label: title
            });
        }
    }

    // Close modal handlers
    function closeProjectModal() {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = 'auto';
    }

    closeModal?.addEventListener('click', closeProjectModal);
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (modal.style.display === 'block' && e.key === 'Escape') {
            closeProjectModal();
        }
    });

    // Click outside to close
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeProjectModal();
        }
    });
}

// Optimized Scroll Animations
// ==============================================
const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate');
            
            // Trigger specific animations
            if (entry.target.classList.contains('about')) {
                animateCounters();
            }
            if (entry.target.classList.contains('skills')) {
                animateSkillBars();
            }
            
            scrollObserver.unobserve(entry.target);
        }
    });
}, { 
    threshold: 0.1,
    rootMargin: '0px 0px -10% 0px'
});

// Counter Animation
function animateCounters() {
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            counter.textContent = Math.floor(current);
            
            if (current >= target) {
                counter.textContent = target;
                clearInterval(timer);
            }
        }, 16);
    });
}

// Skill Bar Animation
function animateSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');
    skillBars.forEach((bar, index) => {
        setTimeout(() => {
            const width = bar.getAttribute('data-width');
            bar.style.width = width;
        }, index * 100);
    });
}

// Optimized Scroll Handler
// ==============================================
const throttledScrollHandler = throttle(() => {
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        const scrolled = window.pageYOffset > 100;
        navbar.style.background = scrolled ? 
            'rgba(255, 255, 255, 0.98)' : 
            'rgba(255, 255, 255, 0.95)';
        navbar.style.boxShadow = scrolled ? 
            '0 2px 20px rgba(0, 0, 0, 0.1)' : 
            'none';
    }
}, 16);

// Copy Email with Enhanced UX
// ==============================================
function initializeCopyEmail() {
    window.copyEmail = async function() {
        const email = 'menem.dev@gmail.com';
        const button = document.querySelector('.copy-email-btn');
        
        if (!button) return;
        
        try {
            await navigator.clipboard.writeText(email);
            showCopyFeedback(button, 'success');
            
            if (typeof gtag !== 'undefined') {
                gtag('event', 'email_copy', {
                    event_category: 'contact',
                    event_label: 'success'
                });
            }
        } catch (err) {
            console.warn('Clipboard API failed, using fallback');
            fallbackCopyText(email);
            showCopyFeedback(button, 'success');
        }
    };
    
    function showCopyFeedback(button, type) {
        const originalHTML = button.innerHTML;
        const icon = type === 'success' ? 'fa-check' : 'fa-times';
        const color = type === 'success' ? '#10b981' : '#ef4444';
        
        button.innerHTML = `<i class="fas ${icon}"></i>`;
        button.style.color = color;
        
        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.color = '';
        }, 2000);
    }
    
    function fallbackCopyText(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }
}

// Update Notification
// ==============================================
function showUpdateNotification() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 1rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        max-width: 300px;
    `;
    notification.innerHTML = `
        <p>New content available! <button onclick="window.location.reload()" style="background: none; border: 1px solid white; color: white; padding: 4px 8px; margin-left: 8px; border-radius: 4px; cursor: pointer;">Refresh</button></p>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 10000);
}

// Initialize Everything
// ==============================================
document.addEventListener('DOMContentLoaded', function() {
    // Performance monitoring
    initPerformanceMonitoring();
    
    // Preload critical resources
    preloadCriticalResources();
    
    // Initialize lazy loading
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    lazyImages.forEach(img => imageObserver.observe(img));
    
    // Initialize all functionality
    initializeProjectFiltering();
    initializeModalFunctionality();
    initializeCopyEmail();
    
    // Initialize scroll animations
    const animatedElements = document.querySelectorAll('section, .project-card, .leadership-item, .certification-card');
    animatedElements.forEach(el => {
        el.classList.add('fade-in-up');
        scrollObserver.observe(el);
    });
    
    // Start typing animation
    if (typingText) {
        setTimeout(typeWriter, 1000);
    }
});

// Event Listeners
window.addEventListener('scroll', throttledScrollHandler, { passive: true });
window.addEventListener('load', () => {
    // Remove loading states
    document.body.classList.add('loaded');
});

// Error Handling
window.addEventListener('error', (e) => {
    console.error('JS Error:', e.error);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: e.error.message,
            fatal: false
        });
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled Promise Rejection:', e.reason);
    if (typeof gtag !== 'undefined') {
        gtag('event', 'exception', {
            description: String(e.reason),
            fatal: false
        });
    }
});

// Show More Projects Functionality
// ==============================================
class ProjectsManager {
    constructor() {
        this.isExpanded = false;
        this.button = document.getElementById('showMoreProjectsBtn');
        this.allProjects = document.querySelectorAll('.project-card');
        this.visibleCount = this.getInitialVisibleCount();
        
        this.init();
    }
    
    getInitialVisibleCount() {
        const screenWidth = window.innerWidth;
        if (screenWidth <= 480) return 3;      // Mobile: 3 projects
        if (screenWidth <= 768) return 4;      // Tablet: 4 projects
        return 6;                              // Desktop: 6 projects
    }
    
    init() {
        // Set initial visibility
        this.setInitialVisibility();
        
        // Add event listener
        if (this.button) {
            this.button.addEventListener('click', () => this.toggleProjects());
        }
        
        // Handle window resize
        window.addEventListener('resize', debounce(() => {
            this.handleResize();
        }, 250));
    }
    
    setInitialVisibility() {
        this.allProjects.forEach((project, index) => {
            if (index >= this.visibleCount) {
                project.classList.add('project-hidden');
            } else {
                project.classList.remove('project-hidden');
            }
        });
        
        // Update button visibility
        this.updateButtonState();
    }
    
    toggleProjects() {
        if (!this.button) return;
        
        // Disable button during animation
        this.button.disabled = true;
        
        if (this.isExpanded) {
            this.hideProjects();
        } else {
            this.showProjects();
        }
        
        // Re-enable button after animation
        setTimeout(() => {
            this.button.disabled = false;
        }, 800);
    }
    
    showProjects() {
        const hiddenProjects = Array.from(this.allProjects).slice(this.visibleCount);
        
        hiddenProjects.forEach((project, index) => {
            setTimeout(() => {
                project.classList.remove('project-hidden');
                project.classList.add('project-showing');
            }, index * 100); // Stagger animation
        });
        
        this.isExpanded = true;
        this.updateButtonText();
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'show_more_projects', {
                event_category: 'user_interaction',
                event_label: 'projects_expanded'
            });
        }
    }
    
    hideProjects() {
        const projectsToHide = Array.from(this.allProjects).slice(this.visibleCount);
        
        // Reverse order for hide animation
        projectsToHide.reverse().forEach((project, index) => {
            setTimeout(() => {
                project.classList.remove('project-showing');
                project.classList.add('project-hidden');
            }, index * 100);
        });
        
        this.isExpanded = false;
        this.updateButtonText();
        
        // Smooth scroll back to projects section
        setTimeout(() => {
            const projectsSection = document.getElementById('projects');
            if (projectsSection) {
                projectsSection.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'start' 
                });
            }
        }, 400);
        
        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'show_less_projects', {
                event_category: 'user_interaction',
                event_label: 'projects_collapsed'
            });
        }
    }
    
    updateButtonText() {
        if (!this.button) return;
        
        const textSpan = this.button.querySelector('.btn-text');
        const chevron = this.button.querySelector('.chevron');
        
        if (this.isExpanded) {
            textSpan.textContent = 'Show Less Projects';
            this.button.classList.add('expanded');
        } else {
            textSpan.textContent = 'Show More Projects';
            this.button.classList.remove('expanded');
        }
    }
    
    updateButtonState() {
        if (!this.button) return;
        
        // Hide button if all projects can fit initially
        const totalProjects = this.allProjects.length;
        if (totalProjects <= this.visibleCount) {
            this.button.style.display = 'none';
        } else {
            this.button.style.display = 'inline-flex';
        }
    }
    
    handleResize() {
        const newVisibleCount = this.getInitialVisibleCount();
        
        // Only update if visible count changed
        if (newVisibleCount !== this.visibleCount) {
            this.visibleCount = newVisibleCount;
            
            // Reset to collapsed state
            this.isExpanded = false;
            this.setInitialVisibility();
        }
    }
}

// Utility function for debouncing
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Initialize Projects Manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new ProjectsManager();
});
