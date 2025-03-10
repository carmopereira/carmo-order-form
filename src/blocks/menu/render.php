<?php
/**
 * Renderização do bloco Menu de Categorias
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Gerar ID único para o bloco
$block_id = 'carmo-menu-' . uniqid();

// Obter as classes do bloco
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'carmo-menu-container',
    'id' => $block_id
]);
?>

<div <?php echo $wrapper_attributes; ?>>
    <h2 class="carmo-menu-title">Menu</h2>
    
    <nav class="carmo-menu-nav">
        <ul class="carmo-menu-list">
            <!-- Categorias principais -->
            <li class="menu-item">
                <a href="#carmo-bulk-category-retail" class="category-link">Retail</a>
            </li>
            <li class="menu-item">
                <a href="#carmo-bulk-category-boxed-sets" class="category-link">Boxed Sets</a>
            </li>
            <li class="menu-item">
                <a href="#carmo-bulk-category-laser-plants" class="category-link">Laser Plants</a>
            </li>
            
            <!-- Categoria colapsável: Grass Tufts -->
            <li class="menu-item menu-item-has-children">
                <span class="menu-toggle">
                    Grass Tufts
                    <span class="toggle-icon">▼</span>
                </span>
                <ul class="sub-menu">
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-6mm" class="category-link">6mm</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-2mm" class="category-link">2mm</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-4-5mm" class="category-link">4/5mm</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-xl" class="category-link">XL</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-shrubs-flowers" class="category-link">Shrubs and Flowers</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-alien" class="category-link">Alien</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-tiny" class="category-link">Tiny</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-tuft-sets" class="category-link">Tuft Sets</a>
                    </li>
                </ul>
            </li>
            
            <li class="menu-item">
                <a href="#carmo-bulk-category-basing-bits" class="category-link">Basing Bits</a>
            </li>
            
            <!-- Categoria colapsável: Battle Ready Bases -->
            <li class="menu-item menu-item-has-children">
                <span class="menu-toggle">
                    Battle Ready Bases
                    <span class="toggle-icon">▼</span>
                </span>
                <ul class="sub-menu">
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-deserts-maahl" class="category-link">Deserts of Maahl</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-highland" class="category-link">Highland</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-winter" class="category-link">Winter</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-badlands" class="category-link">Badlands</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-temple" class="category-link">Temple</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-urban-warfare" class="category-link">Urban Warfare</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-spaceship-corridor" class="category-link">Spaceship Corridor</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-alien-infestation" class="category-link">Alien Infestation</a>
                    </li>
                    <li class="menu-item">
                        <a href="#carmo-bulk-category-infinity-game" class="category-link">Infinity the Game</a>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
</div> 