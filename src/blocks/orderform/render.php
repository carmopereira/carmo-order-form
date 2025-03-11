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

// Verifica se WooCommerce está ativo
if (!class_exists('WooCommerce')) {
	return;
}

// Verifica se a Store API está disponível
if (!class_exists('Automattic\WooCommerce\StoreApi\Routes\V1\AbstractRoute')) {
	return;
}

// Definir valores padrão para os atributos
$attributes = wp_parse_args($attributes, [
    'selectedCategory' => '',
    'showImages' => true,
    'showCategoryTitle' => true,
    'imageWidth' => 100,
    'addCartVisible' => true
]);

// Generates a unique id for aria-controls.
$unique_id = wp_unique_id( 'p-' );

// Obter produtos da categoria
$category_name = '';
if (!empty($attributes['selectedCategory'])) {
    $category = get_term_by('id', $attributes['selectedCategory'], 'product_cat');


// Se tiver um parent category, use o nome do parent category
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

// Obter as classes do bloco
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'carmo-bulk-container',
    'id' => 'carmo-bulk-category-' . (isset($attributes['selectedCategory']) ? esc_attr($attributes['selectedCategory']) : 'default')
]);
?>

<div <?php echo $wrapper_attributes; ?> style="--image-width: <?php echo esc_attr($attributes['imageWidth']); ?>px;">
    <div class="category-container">
        <?php if (!empty($category_name)): ?>
            <div class="category-header">
                <div class="category-title-wrapper">
                    
                    <h3 class="category-title">
                        <?php echo esc_html($parent_category_name); ?>
                        <?php if (!empty($parent_category_name)): ?>
                            <span class="category-separator"> - </span>
                        <?php endif; ?>
                        <?php echo esc_html($category_name); ?>
                    </h3>
                </div>
                
                <div class="category-controls">
                    <div class="category-input-group">
                        <label for="category-quantity-<?php echo esc_attr($category->term_id); ?>">
                            <?php echo esc_html__('Set all products quantity:', 'carmo-order-form'); ?>
                        </label>
                        <input name="category-quantity.<?php echo esc_attr($unique_id); ?>" type="number" id="category-quantity-<?php echo esc_attr($category->term_id); ?>" class="category-quantity-input" min="0" data-category-id="<?php echo esc_attr($category->term_id); ?>">
                        <button name="category-apply.<?php echo esc_attr($unique_id); ?>" type="button" class="category-apply-button" data-category-id="<?php echo esc_attr($category->term_id); ?>"><?php echo esc_html__('Apply', 'carmo-order-form'); ?></button>
                        <button name="category-reset.<?php echo esc_attr($unique_id); ?>" type="button" class="category-reset-button" data-category-id="<?php echo esc_attr($category->term_id); ?>"><?php echo esc_html__('Reset Category', 'carmo-order-form'); ?></button>
                    </div>
                    <!-- <div class="category-buttons">
                        <button type="button" class="category-button" data-category-id="<?php echo esc_attr($category->term_id); ?>" data-quantity="1">+1</button>
                        <button type="button" class="category-button" data-category-id="<?php echo esc_attr($category->term_id); ?>" data-quantity="5">+5</button>
                        <button type="button" class="category-button" data-category-id="<?php echo esc_attr($category->term_id); ?>" data-quantity="10">+10</button>
                        
                    </div> -->
                </div>
            </div>
        <?php endif; ?>

        <table class="carmo-order-table">
            <thead>
                <tr>
                    <?php if ($attributes['showImages']): ?>
                        <th class="product-image"></th>
                    <?php endif; ?>
                    <th class="product-sku"><?php echo esc_html__('SKU', 'carmo-order-form'); ?></th>
                    <th class="product-name"><?php echo esc_html__('Product', 'carmo-order-form'); ?></th>
                    <th class="product-price"><?php echo esc_html__('Price', 'carmo-order-form'); ?></th>
                    <th class="product-quantity"><?php echo esc_html__('Quantity', 'carmo-order-form'); ?></th>
                    <th class="product-increment"><?php echo esc_html__('', 'carmo-order-form'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php 
                if (!empty($products)):
                    foreach ($products as $product): 
                        $cart_item_key = '';
                        $cart_quantity = 0;
                        
                        // Obtém o tipo do produto
                        $product_type = $product->get_type();
                        // Traduz o tipo para português
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

                        // Verificar se o produto está em estoque
                        $is_in_stock = $product->is_in_stock();
                        $product_id = $product->get_id();
                        $product_sku = $product->get_sku();
                        $product_name = $product->get_name();
                        $stock_quantity = $product->get_stock_quantity();
                        $stock_status = $product->get_stock_status(); // 'instock', 'outofstock', or 'onbackorder'
                        
                        // Verificar se é um produto variável com apenas uma variação
                        $variation_id = false;
                        if ($product->is_type('variable')) {
                            // Prioriza variações com atributo Shape="Wild", ou usa a única variação disponível
                            $variation_id = carmo_bulk_get_single_variation_id($product_id);
                            
                            // Se encontrou uma variação prioritária, usamos esta variação em vez do produto pai
                            if ($variation_id) {
                                $variation = wc_get_product($variation_id);
                                
                                // Atualiza os dados do produto com os da variação única
                                if ($variation) {
                                    // Mantem o nome do produto pai, mas atualiza outros dados
                                    $product_sku = $variation->get_sku();
                                    $is_in_stock = $variation->is_in_stock();
                                    $stock_quantity = $variation->get_stock_quantity();
                                    $stock_status = $variation->get_stock_status();
                                }
                            }
                        }
                        
                        // Informações detalhadas no HTML como comentários
                        echo "<!-- DEBUG PRODUTO: $product_name (ID: $product_id) -->";
                        echo "<!-- Stock Status: $stock_status -->";
                        echo "<!-- Quantidade em estoque: " . ($stock_quantity !== null ? $stock_quantity : 'N/A') . " -->";
                        echo "<!-- is_in_stock(): " . ($is_in_stock ? 'true' : 'false') . " -->";
                        
                        // Para debug visível na interface (temporário)
                        if (isset($_GET['debug_stock'])) {
                            echo '<div style="background:#ffe; padding:5px; border:1px solid #ddd; margin:5px; font-size:12px;">';
                            echo "Debug: $product_name (ID: $product_id)<br>";
                            echo "Status: $stock_status | ";
                            echo "Em estoque: " . ($is_in_stock ? 'Sim' : 'Não') . " | ";
                            echo "Quantidade: " . ($stock_quantity !== null ? $stock_quantity : 'N/A');
                            echo '</div>';
                        }
                ?>
                    <tr>
                        <?php if ($attributes['showImages']): ?>
                            <td class="product-image">
                                <img 
                                    src="<?php echo esc_url($product->get_image_id() ? wp_get_attachment_image_url($product->get_image_id(), 'thumbnail') : wc_placeholder_img_src()); ?>"
                                    alt="<?php echo esc_attr($product->get_name()); ?>"
                                    class="product-thumbnail"
                                >
                            </td>
                            <td class="product-sku">
                                <?php 
                                // Obtém o SKU apropriado com base no tipo de produto
                                $display_sku = $product_sku;
                                
                                // Se for um produto variável, verifica se existe um SKU para o produto pai
                                if ($product->is_type('variable')) {
                                    $parent_sku = $product->get_sku();
                                    if (!empty($parent_sku)) {
                                        $display_sku = $parent_sku;
                                    } else {
                                        // Se o produto pai não tiver SKU, tenta obter o SKU com o atributo shape="Wild" das variações
                                        // Procura por variações com shape="Wild"
                                        $variations = $product->get_available_variations();
                                        foreach ($variations as $variation_data) {
                                            $variation_obj = wc_get_product($variation_data['variation_id']);
                                            
                                            // Verifica se a variação tem o atributo shape="Wild"
                                            $is_wild_shape = false;
                                            
                                            // Verifica nos diferentes formatos possíveis
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
                                        
                                        // Se ainda não encontrou um SKU e só existe uma variação, usa o SKU dela
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
                            <td class="product-name">
                                <?php echo esc_html($product_name); ?>
                            </td>
                        <?php endif; ?>
                        <?php if ($is_in_stock): ?>                        
                            <td class="product-price">
                                <?php 
                                if ($variation_id) {
                                    $variation = wc_get_product($variation_id);
                                    echo $variation->get_price_html();
                                } else {
                                    echo $product->get_price_html();
                                }
                                ?>
                            </td>
                            <td class="product-quantity">
                                <?php 
                                if ($cart_quantity > 0) {
                                    echo '<input name="product-quantity.'. esc_attr($unique_id) .'" type="hidden" class="cart-item-key" value="' . esc_attr($cart_item_key) . '" />';
                                }
                                ?>
                                <input 
                                    name="product-quantity.<?php echo esc_attr($product->get_id()) ?>.<?php echo esc_attr($unique_id); ?>"
                                    type="number" 
                                    class="quantity-input" 
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
                            <td class="product-increment">
                                <div class="quantity-buttons">
                                    <button class="quantity-button product-plus-one">+1</button>
                                    <button class="quantity-button product-plus-five">+5</button>
                                    <button class="quantity-button product-plus-ten">+10</button>
                                </div>
                            </td>
                        <?php else: ?>
                            <td colspan="5" class="out-of-stock-message">
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
    <div class="carmo-jump-top-container" style="text-align: right;">
        <button type="button" class="carmo-jump-top-button" onclick="window.scrollTo({top: 0, behavior: 'smooth'})">
            <?php echo esc_html__('Jump to top', 'carmo-order-form'); ?>
        </button>
    </div>
    </div>
    <!-- Notificação específica para este bloco -->
     <div id="carmo-notification" class="carmo-notification"></div>
    <form id="carmo-bulk-form" data-nonce="<?php echo wp_create_nonce('wp_rest'); ?>"></form>

</div>