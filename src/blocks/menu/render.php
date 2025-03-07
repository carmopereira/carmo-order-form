<?php
/**
 * Renderização do bloco Menu de Categorias
 */

// Prevenir acesso direto
if (!defined('ABSPATH')) {
    exit;
}

// Obter as classes do bloco
$wrapper_attributes = get_block_wrapper_attributes([
    'class' => 'carmo-menu-container',
    'id' => 'carmo-menu-' . uniqid()
]);
?>

<div <?php echo $wrapper_attributes; ?>>
    <h2>Hello World</h2>
</div> 