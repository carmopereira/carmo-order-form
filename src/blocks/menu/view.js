/**
 * Script simplificado para o bloco Menu
 */
(function() {
    'use strict';
    
    // Função para demonstrar que o script está funcionando
    function initMenuBlock() {
        console.log('🟢 Bloco Menu carregado e funcionando!');
        
        // Criar um elemento visual para mostrar que o script está funcionando
        setTimeout(function() {
            const menuBlocks = document.querySelectorAll('.carmo-menu-container');
            if (menuBlocks.length > 0) {
                menuBlocks.forEach(function(menuBlock) {
                    // Adicionar um indicador visual de script carregado
                    const indicator = document.createElement('div');
                    indicator.style.backgroundColor = '#4CAF50';
                    indicator.style.color = 'white';
                    indicator.style.padding = '5px';
                    indicator.style.marginTop = '10px';
                    indicator.style.borderRadius = '4px';
                    indicator.style.fontSize = '12px';
                    indicator.textContent = '✓ JavaScript ativo';
                    menuBlock.appendChild(indicator);
                });
            }
        }, 500);
    }
    
    // Executar quando o DOM estiver pronto
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMenuBlock);
    } else {
        initMenuBlock();
    }
})(); 