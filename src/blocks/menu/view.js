console.log('🟢 Bloco Menu carregado!');

/**
 * Accordion Menu for the Categories Menu Block
 */
document.addEventListener('DOMContentLoaded', function() {
    const menuToggles = document.querySelectorAll('.carmo-menu-accordion .submenu-toggle');
    
    // Function to open/close submenus
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const parent = this.parentElement;
            
            // If already open, close it
            if (parent.classList.contains('open')) {
                parent.classList.remove('open');
            } else {
                // Close other open submenus at the same level
                const siblings = parent.parentElement.querySelectorAll('.has-children.open');
                siblings.forEach(sibling => {
                    if (sibling !== parent) {
                        sibling.classList.remove('open');
                    }
                });
                
                // Open this submenu
                parent.classList.add('open');
            }
        });
    });
    
    // Add handler for category links to highlight active item and implement smooth scroll
    const categoryLinks = document.querySelectorAll('.carmo-menu-accordion .category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default anchor behavior
            
            // Remove active class from all links
            document.querySelectorAll('.carmo-menu-accordion .category-link.active').forEach(activeLink => {
                activeLink.classList.remove('active');
            });
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // If in submenu, ensure parent is open
            const parentSubMenu = this.closest('.submenu');
            if (parentSubMenu) {
                const parentLi = parentSubMenu.parentElement;
                if (!parentLi.classList.contains('open')) {
                    parentLi.classList.add('open');
                }
            }
            
            // Get the target element from href attribute
            const targetId = this.getAttribute('href').substring(1); // Remove the # from the href
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                // Smooth scroll to target
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
        });
    });
    
    console.log('🟢 Accordion menu initialized with smooth scrolling!');
});