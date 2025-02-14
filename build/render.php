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

if (!defined('ABSPATH')) {
	exit;
}

// Verifica se WooCommerce está ativo
if (!class_exists('WooCommerce')) {
	return;
}

// Verifica se a Store API está disponível
if (!class_exists('Automattic\WooCommerce\StoreApi\Routes\V1\AbstractRoute')) {
	return;
}

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

// Pegar a categoria e largura da imagem dos atributos do bloco
$selected_category = isset($attributes['selectedCategory']) ? $attributes['selectedCategory'] : 0;
$image_width = isset($attributes['imageWidth']) ? $attributes['imageWidth'] : 100;

// Buscar produtos WooCommerce apenas da categoria selecionada
$products = wc_get_products(array(
	'status' => 'publish',
	'limit' => -1,
	'product_category_id' => $selected_category,
	'orderby' => 'menu_order',
	'order' => 'ASC'
));

// faz echo da categoria selecionada
echo '<p>' . esc_html__('Selected Category:', 'carmo-order-form') . ' ' . esc_html($selected_category) . '</p>';

// Se não houver produtos, mostra uma mensagem
if (empty($products)) {
	echo '<p>' . esc_html__('No products found in this category.', 'carmo-order-form') . '</p>';
	return;
}

// Adicione isto no início do arquivo, após as verificações iniciais
add_action('wp_enqueue_scripts', function() {
    if (!function_exists('WC')) {
        return;
    }
    
    // Enqueue WooCommerce scripts
    wp_enqueue_script('wc-cart');
    wp_enqueue_script('wc-cart-fragments');
    
    // Enqueue jQuery
    wp_enqueue_script('jquery');
    wp_enqueue_script('jquery-blockui');
    
    // Enqueue WooCommerce Blocks scripts
    if (function_exists('wp_enqueue_script')) {
        wp_enqueue_script('wc-blocks-registry');
        wp_enqueue_script('wc-blocks-middleware');
    }
});

// Adicione isto antes da tabela
$orderby_options = array(
    'menu_order' => __('Default sorting', 'carmo-order-form'),
    'popularity' => __('Sort by popularity', 'carmo-order-form'),
    'rating'     => __('Sort by average rating', 'carmo-order-form'),
    'date'       => __('Sort by latest', 'carmo-order-form'),
    'price'      => __('Sort by price: low to high', 'carmo-order-form'),
    'price-desc' => __('Sort by price: high to low', 'carmo-order-form'),
);
?>

<style>
.carmo-order-table {
	width: 100%;
	border-collapse: collapse;
	margin: 25px 0;
	font-size: 0.9em;
	box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
}

.carmo-order-table thead tr {
	background-color: #009879;
	color: #ffffff;
	text-align: left;
}

.carmo-order-table th,
.carmo-order-table td {
	padding: 2px 10px;
}

.carmo-order-table tbody tr {
	border-bottom: 1px solid #dddddd;
}

.carmo-order-table tbody tr:nth-of-type(even) {
	background-color: #f3f3f3;
}

.carmo-order-table tbody tr:last-of-type {
	border-bottom: 2px solid #009879;
}

.add-to-cart-button {
	background: none;
	border: none;
	cursor: pointer;
	padding: 0px;
}

.cart-icon {
	width: 24px;
	height: 24px;
	fill: #009879;
	transition: fill 0.3s ease;
	padding: 0px;
}

.add-to-cart-button:hover .cart-icon {
	fill: #006b56;  /* Uma cor mais escura para o hover */
}

/* Estilo para o input numérico */
.quantity-input {
    width: 60px;
    padding: 4px 8px;
    border: 1px solid #009879;
    border-radius: 4px;
    font-size: 14px;
    text-align: center;
    -moz-appearance: textfield; /* Firefox */
}

/* Remove as setas do input number no Chrome, Safari, Edge, Opera */
.quantity-input::-webkit-outer-spin-button,
.quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
}

/* Estilo hover e focus */
.quantity-input:hover,
.quantity-input:focus {
    border-color: #006b56;
    outline: none;
    box-shadow: 0 0 3px rgba(0, 152, 121, 0.3);
}

/* Estilo para o select de variações */
.variation-select {
    width: 100%;
    padding: 4px 8px;
    border: 1px solid #009879;
    border-radius: 4px;
    font-size: 14px;
    margin-bottom: 5px;
}

.variation-select:hover,
.variation-select:focus {
    border-color: #006b56;
    outline: none;
    box-shadow: 0 0 3px rgba(0, 152, 121, 0.3);
}
</style>

<div
	<?php echo get_block_wrapper_attributes(); ?>
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


<div class="wp-block-create-block-carmo-order-form" 
     id="carmo-bulk-form"
     data-nonce="<?php echo esc_attr(wp_create_nonce('wc_store_api_authentication')); ?>">
	
	<table class="carmo-order-table">
		<thead>
			<tr>
				<th><?php esc_html_e('Image', 'carmo-order-form'); ?></th>
				<th><?php esc_html_e('Name', 'carmo-order-form'); ?></th>
				<th><?php esc_html_e('Type', 'carmo-order-form'); ?></th>
				<th><?php esc_html_e('Quantity', 'carmo-order-form'); ?></th>
				<th><?php esc_html_e('Cart', 'carmo-order-form'); ?></th>
			</tr>
		</thead>
		<tbody>
			<?php foreach ($products as $product) : ?>
				<tr>
					<td style="width: <?php echo esc_attr($image_width); ?>px">
						<?php 
						$image = $product->get_image(array($image_width, $image_width));
						echo preg_replace('/width="[0-9]+"/', 'width="' . $image_width . '"', $image);
						?>
					</td>
					<td><?php echo esc_html($product->get_name()); ?></td>
					<?php if (!$product->is_in_stock()) : ?>
						<td colspan="3" style="text-align: center;">
							<?php esc_html_e('Out of Stock', 'carmo-order-form'); ?>
						</td>
					<?php else : ?>
						<td><?php echo esc_html(ucfirst($product->get_type())); ?></td>
						<td>
							<?php if ($product->is_type('variable')) : ?>
								<?php 
								$available_variations = $product->get_available_variations();
								$attributes = $product->get_variation_attributes();
								
								// Se houver apenas uma variação, não precisa de select
								if (count($available_variations) === 1) {
									$variation = $available_variations[0];
									echo '<input type="hidden" class="variation-id" value="' . esc_attr($variation['variation_id']) . '">';
								} else {
									foreach ($attributes as $attribute_name => $options) {
										$attribute_label = wc_attribute_label($attribute_name);
										?>
										<select 
											class="variation-select" 
											data-product-id="<?php echo esc_attr($product->get_id()); ?>"
											data-attribute="<?php echo esc_attr($attribute_name); ?>"
										>
											<option value=""><?php echo esc_html(sprintf(__('Select %s', 'carmo-order-form'), $attribute_label)); ?></option>
											<?php foreach ($options as $option) : ?>
												<option value="<?php echo esc_attr($option); ?>">
													<?php echo esc_html($option); ?>
												</option>
											<?php endforeach; ?>
										</select>
										<?php
									}
								}
								?>
							<?php endif; ?>
							<input 
								type="number" 
								class="quantity-input" 
								data-product-id="<?php echo esc_attr($product->get_id()); ?>" 
								min="1" 
								value="1"
							>
						</td>
						<td>
							<button 
								class="add-to-cart-button carmo-atc" 
								data-product-id="<?php echo esc_attr($product->get_id()); ?>"
								data-is-variable="<?php echo esc_attr($product->is_type('variable') ? 'true' : 'false'); ?>"
								title="<?php esc_attr_e('Add to Cart', 'carmo-order-form'); ?>"
							>
								<svg class="cart-icon" viewBox="0 0 24 24">
									<path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49c.08-.14.12-.31.12-.48 0-.55-.45-1-1-1H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
								</svg>
							</button>
						</td>
					<?php endif; ?>
				</tr>
			<?php endforeach; ?>
		</tbody>
	</table>
</div>

<script>
// Remover todo o código jQuery inline aqui, já que está sendo manipulado em view.js
</script>

</div>