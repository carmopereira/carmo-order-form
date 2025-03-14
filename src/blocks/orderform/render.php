<?php
/**
 * PHP file to use when rendering the block type on the server to show on the front end.
 *
 * The following variables are exposed to the file:
 *     $attributes (array): The block attributes.
 *     $content (string): The block default content.
 *     $block (WP_Block): The block instance.
 *
 * @see https://github.com/WordPress/gutenberg/blob/trunk/docs/reference-guides/block-api/block-metadata.md#render
 */

defined('ABSPATH') || exit;

// Check if WooCommerce is active
if (!class_exists('WooCommerce')) {
	return;
}


// Check if the Store API is available
if (!class_exists('Automattic\WooCommerce\StoreApi\Routes\V1\AbstractRoute')) {
	return;
}

// Define default values for attributes
$attributes = wp_parse_args($attributes, [
    'selectedCategory' => '',
    'showImages' => true,
    'showCategoryTitle' => true,
    'imageWidth' => 100,
    'addCartVisible' => true
]);

// Generates a unique id for aria-controls.
$unique_id = wp_unique_id( 'p-' );

// Get products from category
$category_name = '';
if (!empty($attributes['selectedCategory'])) {
    $category = get_term_by('id', $attributes['selectedCategory'], 'product_cat');


    // If there is a parent category, use the parent category name
    $parent_category_name = get_product_parent_category_name($attributes['selectedCategory']);

    if ($category) {
        $category_name = $category->name;
        $args = [
            'post_type' => 'product',
            'posts_per_page' => -1,
            'status' => 'publish',
            'tax_query' => [
                [
                    'taxonomy' => 'product_cat',
                    'field' => 'id',
                    'terms' => $attributes['selectedCategory']
                ]
            ]
        ];
        $products = wc_get_products($args);
    }
}

// Get the classes of the block
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'carmo-bulk-container',
    'id' => 'carmo-bulk-category-' . (isset($attributes['selectedCategory']) ? esc_attr($attributes['selectedCategory']) : 'default')
]);
?>

<div <?php echo $wrapper_attributes; ?> style="--image-width: <?php echo esc_attr($attributes['imageWidth']); ?>px;">
    <div class="carmo-bulk-category-container">
        <?php if (!empty($category_name)): ?>
            <div class="carmo-bulk-category-header">
                <div class="carmo-bulk-category-title-wrapper">
                    
                    <h3 class="carmo-bulk-category-title">
                        <?php echo esc_html($parent_category_name); ?>
                        <?php if (!empty($parent_category_name)): ?>
                            <span class="carmo-bulk-category-separator"> - </span>
                        <?php endif; ?>
                        <?php echo esc_html($category_name); ?>
                    </h3>
                </div>
                
                <div class="carmo-bulk-category-controls">
                    <div class="carmo-bulk-category-input-group">
                        <label for="carmo-bulk-category-quantity-<?php echo esc_attr($category->term_id); ?>">
                            <?php echo esc_html__('Set all products quantity:', 'carmo-order-form'); ?>
                        </label>
                        <input name="carmo-bulk-category-quantity.<?php echo esc_attr($unique_id); ?>" type="number" id="carmo-bulk-category-quantity-<?php echo esc_attr($category->term_id); ?>" class="carmo-bulk-category-quantity-input" min="0" data-category-id="<?php echo esc_attr($category->term_id); ?>">
                        <button name="carmo-bulk-category-apply.<?php echo esc_attr($unique_id); ?>" type="button" class="carmo-bulk-category-apply-button" data-category-id="<?php echo esc_attr($category->term_id); ?>"><?php echo esc_html__('Apply', 'carmo-order-form'); ?></button>
                        <button name="carmo-bulk-category-reset.<?php echo esc_attr($unique_id); ?>" type="button" class="carmo-bulk-category-reset-button" data-category-id="<?php echo esc_attr($category->term_id); ?>"><?php echo esc_html__('Reset Category', 'carmo-order-form'); ?></button>
                    </div>
                    <!-- <div class="carmo-bulk-category-buttons">
                        <button type="button" class="carmo-bulk-category-button" data-category-id="<?php echo esc_attr($category->term_id); ?>" data-quantity="1">+1</button>
                        <button type="button" class="category-button" data-category-id="<?php echo esc_attr($category->term_id); ?>" data-quantity="5">+5</button>
                        <button type="button" class="category-button" data-category-id="<?php echo esc_attr($category->term_id); ?>" data-quantity="10">+10</button>
                        
                    </div> -->
                </div>
            </div>
        <?php endif; ?>

        <table class="carmo-bulk-order-table">
            <thead>
                <tr>
                    <?php if ($attributes['showImages']): ?>
                        <th class="carmo-bulk-product-image"></th>
                    <?php endif; ?>
                    <th class="carmo-bulk-product-sku"><?php echo esc_html__('SKU', 'carmo-order-form'); ?></th>
                    <th class="carmo-bulk-product-name"><?php echo esc_html__('Product', 'carmo-order-form'); ?></th>
                    <th class="carmo-bulk-product-price"><?php echo esc_html__('Price', 'carmo-order-form'); ?></th>
                    <th class="carmo-bulk-product-quantity"><?php echo esc_html__('Quantity', 'carmo-order-form'); ?></th>
                    <th class="carmo-bulk-product-increment"><?php echo esc_html__('', 'carmo-order-form'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php 
                if (!empty($products)):
                    foreach ($products as $product): 
                        $cart_item_key = '';
                        $cart_quantity = 0;
                        
                        // Get the product type
                        $product_type = $product->get_type();
                        // Translate the type to Portuguese
                        $type_label = '';
                        switch ($product_type) {
                            case 'simple':
                                $type_label = __('Simple', 'carmo-order-form');
                                break;
                            case 'variable':
                                $type_label = __('Variable', 'carmo-order-form');
                                break;
                            default:
                                $type_label = ucfirst($product_type);
                        }

                        // Check if the product is in stock
                        $is_in_stock = $product->is_in_stock();
                        $product_id = $product->get_id();
                        $product_sku = $product->get_sku();
                        $product_name = $product->get_name();
                        $stock_quantity = $product->get_stock_quantity();
                        $stock_status = $product->get_stock_status(); // 'instock', 'outofstock', or 'onbackorder'
                        
                        // Check if the product is a variable product with only one variation
                        $variation_id = false;
                        if ($product->is_type('variable')) {
                            // Priorize variations with attribute Shape="Wild", or use the only available variation
                            $variation_id = carmo_bulk_get_single_variation_id($product_id);
                            
                            // If a priority variation is found, use this variation instead of the parent product
                            if ($variation_id) {
                                $variation = wc_get_product($variation_id);
                                
                                // Update the product data with the data of the unique variation
                                if ($variation) {
                                    // Keep the parent product name, but update other data
                                    $product_sku = $variation->get_sku();
                                    $is_in_stock = $variation->is_in_stock();
                                    $stock_quantity = $variation->get_stock_quantity();
                                    $stock_status = $variation->get_stock_status();
                                }
                            }
                        }
                        
                ?>
                    <tr>
                        <?php if ($attributes['showImages']): ?>
                            <td class="carmo-bulk-product-image">
                                <img 
                                    src="<?php echo esc_url($product->get_image_id() ? wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') : wc_placeholder_img_src()); ?>"
                                    alt="<?php echo esc_attr($product->get_name()); ?>"
                                    class="carmo-bulk-product-thumbnail"
                                >
                            </td>
                        <?php endif; ?>
                        <td class="carmo-bulk-product-sku">
                            <?php 
                            // Get the appropriate SKU based on the product type
                            $display_sku = $product_sku;
                            
                            // If the product is a variable product, check if there is a SKU for the parent product
                            if ($product->is_type('variable')) {
                                $parent_sku = $product->get_sku();
                                if (!empty($parent_sku)) {
                                    $display_sku = $parent_sku;
                                } else {
                                    // If the parent product does not have a SKU, try to get the SKU with the attribute shape="Wild" of the variations
                                    // Search for variations with shape="Wild"
                                    $variations = $product->get_available_variations();
                                    foreach ($variations as $variation_data) {
                                        $variation_obj = wc_get_product($variation_data['variation_id']);
                                        
                                        // Check if the variation has the attribute shape="Wild"
                                        $is_wild_shape = false;
                                        
                                        // Check in the different possible formats
                                        if (
                                            (isset($variation_data['attributes']['attribute_shape']) && 
                                             $variation_data['attributes']['attribute_shape'] === 'Wild') ||
                                            
                                            (isset($variation_data['attributes']['shape']) && 
                                             $variation_data['attributes']['shape'] === 'Wild') ||
                                             
                                            (isset($variation_data['attributes']['attribute_pa_shape']) && 
                                             $variation_data['attributes']['attribute_pa_shape'] === 'Wild')
                                        ) {
                                            $is_wild_shape = true;
                                        }
                                        
                                        if ($is_wild_shape && $variation_obj && !empty($variation_obj->get_sku())) {
                                            $display_sku = $variation_obj->get_sku();
                                            break;
                                        }
                                    }
                                    
                                    // If still no SKU is found and there is only one variation, use the SKU of the variation
                                    if (empty($display_sku) && count($variations) === 1) {
                                        $single_variation = wc_get_product($variations[0]['variation_id']);
                                        if ($single_variation && !empty($single_variation->get_sku())) {
                                            $display_sku = $single_variation->get_sku();
                                        }
                                    }
                                    }
                                }
                            
                            
                            echo esc_html($display_sku);
                            ?>
                        </td>
                        <td class="carmo-bulk-product-name">
                            <?php echo esc_html($product_name); ?>
                        </td>
                        <?php if ($is_in_stock): ?>                        
                            <td class="carmo-bulk-product-price">
                                <?php 
                                if ($variation_id) {
                                    $variation = wc_get_product($variation_id);
                                    echo $variation->get_price_html();
                                } else {
                                    echo $product->get_price_html();
                                }
                                ?>
                            </td>
                            <td class="carmo-bulk-product-quantity">
                                <?php 
                                if ($cart_quantity > 0) {
                                    echo '<input name="product-quantity.'. esc_attr($unique_id) .'" type="hidden" class="carmo-bulk-cart-item-key" value="' . esc_attr($cart_item_key) . '" />';
                                }
                                ?>
                                <input 
                                    name="product-quantity.<?php echo esc_attr($product->get_id()) ?>.<?php echo esc_attr($unique_id); ?>"
                                    type="number" 
                                    class="carmo-bulk-quantity-input" 
                                    <?php if ($variation_id): ?>
                                    data-product-id="<?php echo esc_attr($variation_id); ?>"
                                    <?php else: ?>
                                    data-product-id="<?php echo esc_attr($product->get_id()); ?>"
                                    <?php endif; ?>
                                    data-category-id="<?php echo esc_attr($category->term_id); ?>" 
                                    <?php if ($variation_id): ?>
                                    <?php endif; ?>
                                    value="<?php echo esc_attr($cart_quantity); ?>" 
                                    min="0"
                                >
                            </td>
                            <td class="carmo-bulk-product-increment">
                                <div class="carmo-bulk-quantity-buttons">
                                    <button class="carmo-bulk-quantity-button carmo-bulk-product-plus-one">+1</button>
                                    <button class="carmo-bulk-quantity-button carmo-bulk-product-plus-five">+5</button>
                                    <button class="carmo-bulk-quantity-button carmo-bulk-product-plus-ten">+10</button>
                                </div>
                            </td>
                        <?php else: ?>
                            <td colspan="5" class="carmo-bulk-out-of-stock-message">
                                <?php echo esc_html__('out of stock', 'carmo-order-form'); ?>
                            </td>
                        <?php endif; ?>
                    </tr>
                <?php 
                    endforeach;
                endif;
                ?>
            </tbody>
        </table>
    <div class="carmo-bulk-jump-top-container" style="text-align: right;">
        <button type="button" class="carmo-bulk-jump-top-button" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
            <?php echo esc_html__('Jump to top', 'carmo-order-form'); ?>
        </button>
    </div>
    </div>
    <!-- Specific notification for this block -->
     <div id="carmo-bulk-notification" class="carmo-bulk-notification"></div>
    <form id="carmo-bulk-form" data-nonce="<?php echo wp_create_nonce('wp_rest'); ?>"></form>

</div>