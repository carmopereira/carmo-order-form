const isDebug = typeof URLSearchParams !== 'undefined' && new URLSearchParams(window.location.search).has('debug');

if (isDebug) console.log('🟢 Bloco Menu carregado!');

/**
 * Accordion Menu for the Categories Menu Block with scroll highlighting
 */
document.addEventListener('DOMContentLoaded', function() {
    const menuToggles = document.querySelectorAll('.carmo-bulk-menu-accordion .submenu-toggle');
    
    // Function to open/close submenus
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const parent = this.parentElement;
            
            // If already open, close it
            if (parent.classList.contains('open')) {
                parent.classList.remove('open');
            } else {
                // Close all other submenus at the same level
                closeAllSubmenusAtLevel(parent.parentElement);
                
                // Open this submenu
                parent.classList.add('open');
            }
        });
    });
    
    // Function to close all submenus at a specific level
    function closeAllSubmenusAtLevel(parentElement) {
        const submenus = parentElement.querySelectorAll('.has-children.open');
        submenus.forEach(submenu => {
            submenu.classList.remove('open');
        });
    }
    
    // Add handler for category links to highlight active item and implement smooth scroll
    const categoryLinks = document.querySelectorAll('.carmo-bulk-menu-accordion .carmo-bulk-category-link');
    
    // Create a map of target IDs to menu links for easy lookup
    const menuLinkMap = {};
    
    categoryLinks.forEach(link => {
        // Store references to links by their target IDs
        const targetId = link.getAttribute('href').substring(1); // Remove the # from the href
        menuLinkMap[targetId] = link;
        
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior
            
            // Remove active class from all links
            removeAllActiveClasses();
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // If in submenu, ensure parent is open and close others
            ensureParentMenuOpen(this);
            
            // Get the target element from href attribute
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Smooth scroll to target
                scrollToTarget(targetElement);
            }
        });
    });
    
    // Helper function to remove all active classes
    function removeAllActiveClasses() {
        document.querySelectorAll('.carmo-bulk-menu-accordion .carmo-bulk-category-link.active').forEach(activeLink => {
            activeLink.classList.remove('active');
        });
    }
    
    // Helper function to ensure parent menu is open and close other submenus
    function ensureParentMenuOpen(link) {
        const parentSubMenu = link.closest('.submenu');
        if (parentSubMenu) {
            const parentLi = parentSubMenu.parentElement;
            
            // Close all submenus at this level first
            const mainUl = parentLi.parentElement;
            if (mainUl) {
                closeAllSubmenusAtLevel(mainUl);
            }
            
            // Then open the parent of this link
            parentLi.classList.add('open');
        }
    }
    
    // Helper function for smooth scrolling
    function scrollToTarget(targetElement) {
        const yOffset = -50; // Offset to account for fixed headers if needed
        const y = targetElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
        
        window.scrollTo({
            top: y,
            behavior: 'smooth'
        });
        
        // Optional: Add a highlight effect to the target element
        targetElement.classList.add('target-highlight');
        setTimeout(() => {
            targetElement.classList.remove('target-highlight');
        }, 2000);
    }
    
    // Set up Intersection Observer to highlight menu items based on scroll position
    const categoryTargets = [];
    categoryLinks.forEach(link => {
        const targetId = link.getAttribute('href').substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            categoryTargets.push(targetElement);
        }
    });
    
    // Create the observer with appropriate options
    const observerOptions = {
        root: null, // viewport
        rootMargin: '-130px 0px -60% 0px', // Adjust these values as needed
        threshold: 0 // Trigger when any part of the element is visible
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Get the ID of the visible section
                const visibleId = entry.target.id;
                
                // Find and highlight the corresponding menu item
                if (menuLinkMap[visibleId]) {
                    removeAllActiveClasses();
                    menuLinkMap[visibleId].classList.add('active');
                    ensureParentMenuOpen(menuLinkMap[visibleId]);
                }
            }
        });
    }, observerOptions);
    
    // Start observing all category targets
    categoryTargets.forEach(target => {
        observer.observe(target);
    });
});