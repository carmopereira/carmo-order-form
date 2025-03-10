console.log('🟢 Bloco Menu carregado!');

document.addEventListener('DOMContentLoaded', function() {
    // Encontra todos os toggles de menu
    const menuToggles = document.querySelectorAll('.carmo-menu-container .menu-toggle');
    
    // Adiciona event listeners para cada toggle
    menuToggles.forEach(toggle => {
        toggle.addEventListener('click', function() {
            // Encontra o item de menu pai
            const parentItem = this.closest('.menu-item-has-children');
            
            // Toggle da classe collapsed
            parentItem.classList.toggle('collapsed');
        });
    });
    
    // Inicialmente, colapsa os submenus (opcional - remova se quiser que comecem expandidos)
    document.querySelectorAll('.menu-item-has-children').forEach(item => {
        item.classList.add('collapsed');
    });
    
    console.log('🟢 Menu colapsável inicializado!');
});