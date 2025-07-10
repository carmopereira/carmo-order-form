<?php
/**
 * Plugin Name:       Carmo Order Form
 * Description:       A block to display products for a specific category. You can display multiple categories and add products easily to the cart
 * Version:           0.9.3
 * Requires at least: 6.7
 * Requires PHP:      8
 * Author:            carmopereira
 * Author URI:        https://carmo.pt
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       carmo-order-form
 *
 * @package           create-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

add_filter( 'block_categories_all' , function( $categories ) {

    // Adding a new category.
	$categories[] = array(
		'slug'  => 'carmo-blocks',
		'title' => 'Carmo Blocks'
	);

	return $categories;
} );

/**
 * Registers the block using the metadata loaded from the `block.json` file.
 * Behind the scenes, it registers also all assets so they can be enqueued
 * through the block editor in the corresponding context.
 *
 * @see https://developer.wordpress.org/reference/functions/register_block_type/
 */
function create_block_carmo_bulk_block_init(): void {
	// Registra o bloco principal
	register_block_type( __DIR__ . '/build/blocks/orderform' );
	// Registra o bloco de Menu de Categorias
	register_block_type( __DIR__ . '/build/blocks/menu' );
}
add_action( 'init', 'create_block_carmo_bulk_block_init' );

// Adiciona suporte ao CORS e configura a Store API
add_action('rest_api_init', function() {
	// Adiciona suporte ao CORS
	add_filter('rest_pre_serve_request', function($value) {
		if (isset($_SERVER['HTTP_ORIGIN'])) {
			header('Access-Control-Allow-Origin: ' . esc_url_raw($_SERVER['HTTP_ORIGIN']));
			header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
			header('Access-Control-Allow-Credentials: true');
			header('Access-Control-Allow-Headers: Authorization, Content-Type, X-WC-Store-API-Nonce, Nonce');
			header('Access-Control-Expose-Headers: X-WC-Store-API-Nonce');
			
			// Handle preflight requests
			if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
				status_header(200);
				exit();
			}
		}
		return $value;
	});
});

// Desabilita temporariamente a verificação de nonce para debug
add_filter('woocommerce_store_api_disable_nonce_check', '__return_true');

// Adiciona suporte ao nonce em todos os endpoints
add_action('rest_api_init', function() {
	add_filter('rest_authentication_errors', function($result) {
		// If a previous authentication check was applied,
		// pass that result along without modification.
		if (true === $result || is_wp_error($result)) {
			return $result;
		}
		
		return true;
	});
});

// Garante que a Store API está carregada
add_action('before_woocommerce_init', function() {
	if (class_exists('\Automattic\WooCommerce\Utilities\FeaturesUtil')) {
		\Automattic\WooCommerce\Utilities\FeaturesUtil::declare_compatibility('cart_checkout_blocks', __FILE__);
	}
});

// Registra os scripts necessários
add_action('wp_enqueue_scripts', function() {
	if (!function_exists('WC')) {
		return;
	}
	
	wp_enqueue_script('jquery');
	wp_enqueue_script('wc-cart');
	wp_enqueue_script('wc-cart-fragments');
	
	if (function_exists('wp_enqueue_script')) {
		wp_enqueue_script('wc-blocks-registry');
		wp_enqueue_script('wc-blocks-middleware');
	}
});

function carmo_bulk_dequeue_paypal_script() {
    // Verifica se estamos em uma página que contém nosso bloco
    if (has_block('create-block/carmo-bulk')) {
        wp_dequeue_script('ppcp-blocks-advanced-card-fields');
        wp_deregister_script('ppcp-blocks-advanced-card-fields');
    }
}
add_action('wp_enqueue_scripts', 'carmo_bulk_dequeue_paypal_script', 100);

// Adiciona seletor de role na interface admin
function get_product_parent_category_name($category_id) {
    $term = get_term($category_id, 'product_cat'); // Get the category term

    if (!is_wp_error($term) && $term->parent != 0) {
        $parent_term = get_term($term->parent, 'product_cat'); // Get the parent category term
        return !is_wp_error($parent_term) ? $parent_term->name : '';
    }

    return ''; // Return empty if no parent
}

/**
 * Obtém o ID da variação para produtos variáveis
 * Prioriza variações com atributo Shape="Wild", caso contrário retorna a variação única se houver apenas uma
 * 
 * @param int $product_id ID do produto
 * @return int|false ID da variação priorizada, false caso contrário
 */
function carmo_bulk_get_single_variation_id($product_id) {
    $product = wc_get_product($product_id);
    
    // Se não for um produto ou não for variável, retorna false
    if (!$product || !$product->is_type('variable')) {
        return false;
    }
    
    // Obtém todas as variações disponíveis
    $variations = $product->get_available_variations();
    
    // Se não houver variações, retorna false
    if (empty($variations)) {
        return false;
    }
    
    // Primeiro, tenta encontrar a variação com Shape="Wild"
    foreach ($variations as $variation) {
        // Verifica os diferentes formatos possíveis para o atributo Shape
        if (
            // Verifica no formato normal de atributos WooCommerce (attribute_shape)
            (isset($variation['attributes']['attribute_shape']) && 
             $variation['attributes']['attribute_shape'] === 'Wild') ||
            
            // Verifica formatos alternativos que podem ser usados
            (isset($variation['attributes']['shape']) && 
             $variation['attributes']['shape'] === 'Wild') ||
             
            // Verifica em pa_ prefix (formato comum no WooCommerce)
            (isset($variation['attributes']['attribute_pa_shape']) && 
             $variation['attributes']['attribute_pa_shape'] === 'Wild')
        ) {
            return $variation['variation_id'];
        }
    }
    
    // Se não encontrou a variação "Wild" mas só tem uma variação, retorna essa
    if (count($variations) === 1) {
        return $variations[0]['variation_id'];
    }
    
    // Caso contrário, retorna false
    return false;
}

add_action('wp_ajax_update_cart_item_quantity', 'carmo_update_cart_item_quantity');
add_action('wp_ajax_nopriv_update_cart_item_quantity', 'carmo_update_cart_item_quantity');

function carmo_update_cart_item_quantity() {
    check_ajax_referer('carmo_order_form_nonce', 'nonce');
    
    $cart_item_key = sanitize_text_field($_POST['cart_item_key']);
    $product_id = intval($_POST['product_id']);
    $quantity = max(0, intval($_POST['quantity']));
    
    try {
        // Remove item if quantity is zero
        if ($quantity === 0) {
            WC()->cart->remove_cart_item($cart_item_key);
            wp_send_json_success([
                'message' => 'Produto removido do carrinho',
                'removed' => true,
                'quantity' => 0
            ]);
        }
        
        // Update cart item quantity
        $result = WC()->cart->set_quantity($cart_item_key, $quantity);
        
        if ($result) {
            wp_send_json_success([
                'message' => 'Quantidade atualizada com sucesso',
                'removed' => false,
                'quantity' => $quantity
            ]);
        } else {
            wp_send_json_error([
                'message' => 'Falha ao atualizar quantidade',
                'quantity' => $quantity
            ]);
        }
    } catch (Exception $e) {
        wp_send_json_error([
            'message' => $e->getMessage(),
            'quantity' => $quantity
        ]);
    }
}