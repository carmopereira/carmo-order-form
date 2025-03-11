<?php
/**
 * Rendering of Categories Menu Block
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Generate unique ID for the block
$block_id = 'carmo-menu-' . uniqid();

// Get block classes
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'carmo-menu-accordion',
    'id' => $block_id
]);
?>

<div <?php echo $wrapper_attributes; ?>>
    <h2 class="carmo-menu-title">Categories</h2>
    
    <nav class="menu-accordion">
        <ul>
            <li>
                <a href="#carmo-bulk-category-350" class="category-link">
                    <i class="menu-icon"></i>Retail
                </a>
            </li>
            <li>
                <a href="#carmo-bulk-category-349" class="category-link">
                    <i class="menu-icon"></i>Boxed Sets
                </a>
            </li>
            <li>
                <a href="#carmo-bulk-category-298" class="category-link">
                    <i class="menu-icon"></i>Laser Plants
                </a>
            </li>
            
            <!-- Collapsible Menu: Grass Tufts -->
            <li class="has-children">
                <div class="submenu-toggle">
                    <div class="menu-label">
                        <i class="menu-icon"></i>
                        Grass Tufts
                    </div>
                    <span class="toggle-icon">+</span>
                </div>
                <ul class="submenu">
                    <li>
                        <a href="#carmo-bulk-category-196" class="category-link">6mm</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-200" class="category-link">2mm</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-197" class="category-link">4/5mm</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-202" class="category-link">XL</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-206" class="category-link">Shrubs and Flowers</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-199" class="category-link">Alien</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-201" class="category-link">Tiny</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-204" class="category-link">Tuft Sets</a>
                    </li>
                </ul>
            </li>
            
            <li>
                <a href="#carmo-bulk-category-207" class="category-link">
                    <i class="menu-icon"></i>Basing Bits
                </a>
            </li>
            
            <!-- Collapsible Menu: Battle Ready Bases -->
            <li class="has-children">
                <div class="submenu-toggle">
                    <div class="menu-label">
                        <i class="menu-icon"></i>
                        Battle Ready Bases
                    </div>
                    <span class="toggle-icon">+</span>
                </div>
                <ul class="submenu">
                    <li>
                        <a href="#carmo-bulk-category-344" class="category-link">Deserts of Maahl</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-210" class="category-link">Highland</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-215" class="category-link">Winter</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-216" class="category-link">Badlands</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-218" class="category-link">Temple</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-219" class="category-link">Urban Warfare</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-213" class="category-link">Spaceship Corridor</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-340" class="category-link">Alien Infestation</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-347" class="category-link">Infinity the Game</a>
                    </li>
                </ul>
            </li>
        </ul>
    </nav>
</div> 