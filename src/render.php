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


// Adds the global state.
wp_interactivity_state(
    'create-block',
    array(
        'isDark'    => false,
        'darkText'  => esc_html__( 'Switch to Light', 'carmo-bulk' ),
        'lightText' => esc_html__( 'Switch to Dark', 'carmo-bulk' ),
        'themeText' => esc_html__( 'Switch to Dark', 'carmo-bulk' ),
    )
);

// Obter produtos da categoria
$category_name = '';
if (!empty($attributes['selectedCategory'])) {
    $category = get_term_by('id', $attributes['selectedCategory'], 'product_cat');
    if ($category) {
        $category_name = $category->name;
        $args = [
            'post_type' => 'product',
            'posts_per_page' => -1,
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
    'class' => 'carmo-bulk-container'
]);
?>

<div <?php echo $wrapper_attributes; ?> style="--image-width: <?php echo esc_attr($attributes['imageWidth']); ?>px;">
    <div class="category-container">
        <?php if (!empty($category_name)): ?>
            <div class="category-header">
                <div class="category-title-wrapper">
                    <h2 class="category-title wp-block-heading"><?php echo esc_html($category_name); ?></h2>
                </div>
                
                <div class="category-controls">
                    <div class="category-input-group">
                        <input 
                            type="number" 
                            class="category-quantity-input" 
                            min="0" 
                            value="0"
                            placeholder="Qtd."
                        >
                        <button class="category-apply-button">Aplicar</button>
                    </div>
                    <div class="category-buttons">
                        <button class="category-button category-plus-one">+1</button>
                        <button class="category-button category-plus-five">+5</button>
                        <button class="category-button category-plus-ten">+10</button>
                        <button class="category-button category-plus-fifty">+50</button>
                    </div>
                </div>
            </div>
        <?php endif; ?>

        <table class="carmo-order-table">
            <thead>
                <tr>
                    <?php if ($attributes['showImages']): ?>
                        <th class="product-image"><?php echo esc_html__('Imagem', 'carmo-bulk'); ?></th>
                    <?php endif; ?>
                    <th class="product-name"><?php echo esc_html__('Produto', 'carmo-bulk'); ?></th>
                    <th class="product-price"><?php echo esc_html__('Preço', 'carmo-bulk'); ?></th>
                    <th class="product-quantity"><?php echo esc_html__('Quantidade', 'carmo-bulk'); ?></th>
                    <th class="product-increment"><?php echo esc_html__('Adicionar Quantidade', 'carmo-bulk'); ?></th>
                </tr>
            </thead>
            <tbody>
                <?php 
                if (!empty($products)):
                    foreach ($products as $product): 
                        $cart_item_key = '';
                        $cart_quantity = 0;
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
                        <?php endif; ?>
                        <td class="product-name">
                            <?php echo esc_html($product->get_name()); ?>
                        </td>
                        <td class="product-price">
                            <?php echo $product->get_price_html(); ?>
                        </td>
                        <td class="product-quantity">
                            <div class="quantity-controls">
                                <input 
                                    type="number" 
                                    class="quantity-input" 
                                    min="0" 
                                    value="0"
                                    data-product-id="<?php echo esc_attr($product->get_id()); ?>"
                                >
                                <input 
                                    type="hidden" 
                                    class="cart-item-key" 
                                    value=""
                                >
                            </div>
                        </td>
                        <td class="product-increment">
                            <div class="quantity-buttons">
                                <button class="quantity-button product-plus-one">+1</button>
                                <button class="quantity-button product-plus-five">+5</button>
                                <button class="quantity-button product-plus-ten">+10</button>
                            </div>
                        </td>
                    </tr>
                <?php 
                    endforeach;
                endif;
                ?>
            </tbody>
        </table>
    </div>

    <div id="carmo-notification" class="carmo-notification"></div>

    <div class="carmo-footer">
        <button type="button" class="carmo-footer-button clear-cart">
            <?php echo esc_html__('Limpar Carrinho', 'carmo-bulk'); ?>
        </button>
    </div>

    <form id="carmo-bulk-form" data-nonce="<?php echo wp_create_nonce('wp_rest'); ?>"></form>

    <div
        data-wp-interactive="create-block"
        <?php echo wp_interactivity_data_wp_context( array( 'isOpen' => false ) ); ?>
        data-wp-watch="callbacks.logIsOpen"
        data-wp-class--dark-theme="state.isDark"
    >
        <button
            data-wp-on--click="actions.toggleTheme"
            data-wp-text="state.themeText"
        ></button>

        <button
            data-wp-on--click="actions.toggleOpen"
            data-wp-bind--aria-expanded="context.isOpen"
            aria-controls="<?php echo esc_attr( $unique_id ); ?>"
        >
            <?php esc_html_e( 'Toggle', 'carmo-bulk' ); ?>
        </button>

        <p
            id="<?php echo esc_attr( $unique_id ); ?>"
            data-wp-bind--hidden="!context.isOpen"
        >
            <?php
                esc_html_e( 'Carmo Bulk - hello from an interactive block!', 'carmo-bulk' );
            ?>
        </p>
    </div>
</div>

<script>
// Remover todo o código jQuery inline aqui, já que está sendo manipulado em view.js
</script>