<?php
/**
 * Plugin Name:       Carmo Bulk
 * Description:       An interactive block with the Interactivity API.
 * Version:           0.1.0
 * Requires at least: 6.7
 * Requires PHP:      7.4
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       carmo-bulk
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

function carmo_bulk_impersonate_user_role() {
    // Verifica se o utilizador atual é administrador
    if (!current_user_can('administrator')) {
        return;
    }

    // Obtém o role selecionado do parâmetro GET
    // Exemplo: ?view_as=retailer_europe
    $role_to_impersonate = isset($_GET['view_as']) ? sanitize_text_field($_GET['view_as']) : null;
    
    if ($role_to_impersonate) {
        // Temporariamente adiciona as capacidades do role selecionado ao utilizador atual
        // Isto permite que o sistema de preços do WooCommerce calcule os preços corretos
        add_filter('user_has_cap', function($allcaps, $caps, $args, $user) use ($role_to_impersonate) {
            if (!empty($user->ID)) {
                $allcaps[$role_to_impersonate] = true;
            }
            return $allcaps;
        }, 10, 4);

        // Modifica o preço regular (que será mostrado riscado)
        // Este será o preço com desconto calculado para o role selecionado
        add_filter('woocommerce_product_get_regular_price', function($regular_price, $product) {
            // Previne loops infinitos no cálculo de preços
            static $is_calculating = false;
            if ($is_calculating) return $regular_price;
            
            $is_calculating = true;
            // Obtém o preço calculado com base no role atual
            $calculated_price = $product->get_price();
            $is_calculating = false;
            
            return $calculated_price;
        }, 10, 2);

        // Define o preço de venda como o preço base original
        // Este será o preço mostrado como principal (não riscado)
        add_filter('woocommerce_product_get_sale_price', function($sale_price, $product) {
            // Retorna o preço base armazenado nos metadados do produto
            return $product->get_meta('_regular_price');
        }, 99, 2);

        // Força o WooCommerce a mostrar ambos os preços
        add_filter('woocommerce_product_is_on_sale', '__return_true');

        // Adiciona uma notificação na área administrativa
        // Isto ajuda a identificar quando está visualizando como outro role
        add_action('admin_notices', function() use ($role_to_impersonate) {
            echo '<div class="notice notice-warning is-dismissible">';
            echo sprintf('<p>Visualizando como: %s</p>', esc_html($role_to_impersonate));
            echo '</div>';
        });
    }
}
add_action('init', 'carmo_bulk_impersonate_user_role');

// Adiciona seletor de role na interface admin
function carmo_bulk_add_role_selector() {
    if (!current_user_can('administrator')) {
        return;
    }

    $current_role = isset($_GET['view_as']) ? $_GET['view_as'] : '';
    $roles = [
        '' => 'Normal',
        'retailer_europe' => 'Retailer Europe',
        'retailer_northamerica' => 'Retailer North America',
        'retailer_uk' => 'Retailer UK'
    ];

    echo '<div class="carmo-role-selector" style="margin: 10px 0;">';
    echo '<label>Ver como: </label>';
    echo '<select onchange="window.location.href=this.value">';
    
    foreach ($roles as $role => $label) {
        $url = $role ? add_query_arg('view_as', $role) : remove_query_arg('view_as');
        $selected = ($current_role === $role) ? 'selected' : '';
        echo sprintf(
            '<option value="%s" %s>%s</option>',
            esc_url($url),
            $selected,
            esc_html($label)
        );
    }
    
    echo '</select>';
    echo '</div>';
}
add_action('admin_bar_menu', 'carmo_bulk_add_role_selector', 999); 



function get_product_parent_category_name($category_id) {
    $term = get_term($category_id, 'product_cat'); // Get the category term

    if (!is_wp_error($term) && $term->parent != 0) {
        $parent_term = get_term($term->parent, 'product_cat'); // Get the parent category term
        return !is_wp_error($parent_term) ? $parent_term->name : '';
    }

    return ''; // Return empty if no parent
}
