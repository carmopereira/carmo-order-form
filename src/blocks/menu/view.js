console.log('🟢 Bloco Menu carregado!');

/**
 * Menu Acordeão para o bloco Menu de Categorias
 */
document.addEventListener('DOMContentLoaded', function() {
    const menuToggles = document.querySelectorAll('.carmo-menu-accordion .submenu-toggle');
    
    // Função para abrir/fechar submenus
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            const parent = this.parentElement;
            
            // Se já estiver aberto, fechar
            if (parent.classList.contains('open')) {
                parent.classList.remove('open');
            } else {
                // Fechar outros submenus abertos no mesmo nível
                const siblings = parent.parentElement.querySelectorAll('.has-children.open');
                siblings.forEach(sibling => {
                    if (sibling !== parent) {
                        sibling.classList.remove('open');
                    }
                });
                
                // Abrir este submenu
                parent.classList.add('open');
            }
        });
    });
    
    // Adicionar handler para os links de categorias para destacar o item ativo
    const categoryLinks = document.querySelectorAll('.carmo-menu-accordion .category-link');
    categoryLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Remover classe ativa de todos os links
            document.querySelectorAll('.carmo-menu-accordion .category-link.active').forEach(activeLink => {
                activeLink.classList.remove('active');
            });
            
            // Adicionar classe ativa ao link clicado
            this.classList.add('active');
            
            // Se estiver em submenu, garantir que o pai esteja aberto
            const parentSubMenu = this.closest('.submenu');
            if (parentSubMenu) {
                const parentLi = parentSubMenu.parentElement;
                if (!parentLi.classList.contains('open')) {
                    parentLi.classList.add('open');
                }
            }
            
            // Fechar o menu em dispositivos móveis (opcional)
            if (window.innerWidth <= 768) {
                // Implementar lógica para fechar menu em mobile se necessário
            }
        });
    });
    
    console.log('🟢 Menu acordeão inicializado!');
});