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
    'class' => 'carmo-bulk-menu-accordion',
    'id' => $block_id
]);
?>

<div <?php echo $wrapper_attributes; ?>>

    <nav class="carmo-bulk-menu-accordion">
        <ul>
            <li>
                <a href="#carmo-bulk-category-350" class="carmo-bulk-category-link">
                    <i class="menu-icon"></i>Retail
                </a>
            </li>
            <li>
                <a href="#carmo-bulk-category-349" class="carmo-bulk-category-link">
                    <i class="menu-icon"></i>Boxed Sets
                </a>
            </li>
            <li>
                <a href="#carmo-bulk-category-298" class="carmo-bulk-category-link">
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
                        <a href="#carmo-bulk-category-196" class="carmo-bulk-category-link">6mm</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-200" class="carmo-bulk-category-link">2mm</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-197" class="carmo-bulk-category-link">4/5mm</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-202" class="carmo-bulk-category-link">XL</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-206" class="carmo-bulk-category-link">Shrubs and Flowers</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-199" class="carmo-bulk-category-link">Alien</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-201" class="carmo-bulk-category-link">Tiny</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-204" class="carmo-bulk-category-link">Tuft Sets</a>
                    </li>
                </ul>
            </li>
            
            <li>
                <a href="#carmo-bulk-category-207" class="carmo-bulk-category-link">
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
                        <a href="#carmo-bulk-category-344" class="carmo-bulk-category-link">Deserts of Maahl</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-210" class="carmo-bulk-category-link">Highland</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-215" class="carmo-bulk-category-link">Winter</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-216" class="carmo-bulk-category-link">Badlands</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-218" class="carmo-bulk-category-link">Temple</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-219" class="carmo-bulk-category-link">Urban Warfare</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-341" class="carmo-bulk-category-link">Spaceship Corridor</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-340" class="carmo-bulk-category-link">Alien Infestation</a>
                    </li>
                    <li>
                        <a href="#carmo-bulk-category-347" class="carmo-bulk-category-link">Infinity the Game</a>
                    </li>
                </ul>
            </li>
            <li><hr></li>
            <li>
            <div class="carmo-minicart" style="text-align:center;"><?php echo do_blocks('<!-- wp:woocommerce/mini-cart {"addToCartBehaviour":"none"} /-->'); ?></div>
        <div style="text-align:center;"><a style="font-size:12pt" href="/checkout" target="_self">Proceed to Checkout</a></div>    
        </li>

        </ul>
    </nav>
</div> 
<div class="carmo-bulk-container" id="checkout-footer" style="align-self:flex-end; display: flex; align-items: center; float:right; justify-content: right; padding-bottom:40px">
    <?php echo do_blocks('<!-- wp:woocommerce/mini-cart {"addToCartBehaviour":"none"} /-->'); ?>&nbsp;<a style="font-size:12pt" href="/checkout" target="_self">Proceed to Checkout</a>
</div>