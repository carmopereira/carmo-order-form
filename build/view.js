import * as __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__ from "@wordpress/interactivity";
/******/ var __webpack_modules__ = ({

/***/ "@wordpress/interactivity":
/*!*******************************************!*\
  !*** external "@wordpress/interactivity" ***!
  \*******************************************/
/***/ ((module) => {

module.exports = __WEBPACK_EXTERNAL_MODULE__wordpress_interactivity_8e89b257__;

/***/ })

/******/ });
/************************************************************************/
/******/ // The module cache
/******/ var __webpack_module_cache__ = {};
/******/ 
/******/ // The require function
/******/ function __webpack_require__(moduleId) {
/******/ 	// Check if module is in cache
/******/ 	var cachedModule = __webpack_module_cache__[moduleId];
/******/ 	if (cachedModule !== undefined) {
/******/ 		return cachedModule.exports;
/******/ 	}
/******/ 	// Create a new module (and put it into the cache)
/******/ 	var module = __webpack_module_cache__[moduleId] = {
/******/ 		// no module.id needed
/******/ 		// no module.loaded needed
/******/ 		exports: {}
/******/ 	};
/******/ 
/******/ 	// Execute the module function
/******/ 	__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 
/******/ 	// Return the exports of the module
/******/ 	return module.exports;
/******/ }
/******/ 
/************************************************************************/
/******/ /* webpack/runtime/make namespace object */
/******/ (() => {
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = (exports) => {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/ })();
/******/ 
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*********************!*\
  !*** ./src/view.js ***!
  \*********************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/interactivity */ "@wordpress/interactivity");
/**
 * WordPress dependencies
 */


// Namespace global para o plugin
window.CarmoBulk = window.CarmoBulk || {};
const {
  state
} = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.store)('create-block', {
  state: {
    get themeText() {
      return state.isDark ? state.darkText : state.lightText;
    }
  },
  actions: {
    toggleOpen() {
      const context = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      context.isOpen = !context.isOpen;
    },
    toggleTheme() {
      state.isDark = !state.isDark;
    },
    clearCart() {
      if (confirm('Tem certeza que deseja limpar o carrinho?')) {
        jQuery.ajax({
          url: '/wp-json/wc/store/v1/cart/items',
          method: 'DELETE',
          beforeSend: function (xhr) {
            xhr.setRequestHeader('X-WC-Store-API-Nonce', document.getElementById('carmo-bulk-form').dataset.nonce);
          },
          success: function (response) {
            document.querySelectorAll('.quantity-input').forEach(input => {
              input.value = '0';
            });
            document.querySelectorAll('.cart-item-key').forEach(input => {
              input.value = '';
            });
            updateFooterCart();
            showNotification('Carrinho limpo com sucesso');
          },
          error: function (jqXHR) {
            showNotification('Erro ao limpar carrinho', 'error');
          }
        });
      }
    }
  },
  callbacks: {
    logIsOpen: () => {
      const {
        isOpen
      } = (0,_wordpress_interactivity__WEBPACK_IMPORTED_MODULE_0__.getContext)();
      // Log the value of `isOpen` each time it changes.
      console.log(`Is open: ${isOpen}`);
    }
  }
});
document.addEventListener('DOMContentLoaded', function () {
  // Função para criar o carrinho flutuante
  window.CarmoBulk.createFloatingCart = function () {
    // Implementar lógica do carrinho flutuante aqui
    console.log('Carrinho flutuante criado');
  };
  function handleQuantityChange(input, newValue) {
    if (!input) {
      return Promise.reject(new Error('Input não encontrado'));
    }
    const productId = input.dataset.productId;
    console.log('Debug: Alterando quantidade para produto', {
      productId: productId,
      newValue: newValue,
      inputValue: input.value
    });
    if (!productId) {
      return Promise.reject(new Error('ID do produto não encontrado'));
    }
    const row = input.closest('tr');
    if (!row) {
      return Promise.reject(new Error('Linha da tabela não encontrada'));
    }
    const cartItemKeyInput = row.querySelector('.cart-item-key');
    const cartItemKey = cartItemKeyInput ? cartItemKeyInput.value : '';
    console.log('Debug: Cart Item Key', {
      cartItemKey: cartItemKey,
      exists: !!cartItemKey
    });

    // Se a quantidade for zero e temos um cartItemKey, removemos o item
    if (newValue === 0 && cartItemKey) {
      return removeFromCart(cartItemKey).then(() => {
        if (cartItemKeyInput) {
          cartItemKeyInput.value = '';
        }
        return {
          removed: true
        };
      });
    }
    return updateCart(productId, null, newValue, cartItemKey).then(response => {
      // Aqui está a correção: atualizar o cartItemKey após o sucesso da operação
      if (response && response.key) {
        // Se não existe o input para o cartItemKey, criamos um
        if (!cartItemKeyInput) {
          const newCartItemKeyInput = document.createElement('input');
          newCartItemKeyInput.type = 'hidden';
          newCartItemKeyInput.className = 'cart-item-key';
          row.querySelector('.product-quantity').appendChild(newCartItemKeyInput);
          newCartItemKeyInput.value = response.key;
        } else {
          cartItemKeyInput.value = response.key;
        }
      }
      return response;
    });
  }

  // Nova função para remover item do carrinho
  function removeFromCart(cartItemKey) {
    console.log('Debug: Removendo item do carrinho', cartItemKey);
    return new Promise((resolve, reject) => {
      jQuery.ajax({
        url: '/wp-json/wc/store/v1/cart/items/' + cartItemKey,
        method: 'DELETE',
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-WC-Store-API-Nonce', document.getElementById('carmo-bulk-form').dataset.nonce);
        },
        success: function (response) {
          console.log('Debug: Item removido com sucesso', response);
          resolve(response);
        },
        error: function (error) {
          console.log('Debug: Erro ao remover item', error);
          reject(error);
        }
      });
    });
  }
  function updateCart(productId, variationId, quantity, cartItemKey) {
    console.log('Debug: Iniciando updateCart', {
      productId,
      variationId,
      quantity,
      cartItemKey
    });
    return new Promise((resolve, reject) => {
      const data = {
        id: productId,
        quantity: quantity
      };
      if (variationId) {
        data.variation_id = variationId;
      }
      let ajaxConfig = {
        beforeSend: function (xhr) {
          xhr.setRequestHeader('X-WC-Store-API-Nonce', document.getElementById('carmo-bulk-form').dataset.nonce);
        },
        data: JSON.stringify(data),
        contentType: 'application/json',
        success: function (response) {
          console.log('Debug: Sucesso na atualização', response);
          resolve(response);
        },
        error: function (error) {
          console.log('Debug: Erro na atualização', error);
          reject(error);
        }
      };
      if (cartItemKey) {
        console.log('Debug: Atualizando item existente', cartItemKey);
        jQuery.ajax({
          ...ajaxConfig,
          url: '/wp-json/wc/store/v1/cart/items/' + cartItemKey,
          method: 'PUT'
        });
      } else {
        console.log('Debug: Adicionando novo item');
        jQuery.ajax({
          ...ajaxConfig,
          url: '/wp-json/wc/store/v1/cart/items',
          method: 'POST'
        });
      }
    });
  }

  /**
   * Mostra uma notificação dentro do contêiner do bloco
   * @param {string} message - Mensagem a ser exibida
   * @param {string} type - Tipo de notificação (success/error)
   * @param {HTMLElement} triggerElement - Elemento que disparou a ação (para identificar o bloco)
   */
  function showNotification(message, type = 'success', triggerElement = null) {
    // Encontrar o bloco que contém o elemento que disparou a ação
    let blockContainer;
    if (triggerElement) {
      // Buscar o container de bloco mais próximo
      blockContainer = triggerElement.closest('.carmo-bulk-container');
      console.log(`Debug: Encontrado container de bloco a partir do elemento de trigger: ${blockContainer ? 'Sim' : 'Não'}`);
    }

    // Se não encontrou o container a partir do elemento de trigger
    if (!blockContainer) {
      // Tentar usar o elemento atualmente com foco
      const activeElement = document.activeElement;
      if (activeElement) {
        blockContainer = activeElement.closest('.carmo-bulk-container');
        console.log(`Debug: Encontrado container de bloco a partir do elemento ativo: ${blockContainer ? 'Sim' : 'Não'}`);
      }
    }

    // Se ainda não encontrou, tentar o primeiro bloco como fallback
    if (!blockContainer) {
      blockContainer = document.querySelector('.carmo-bulk-container');
      console.log('Debug: Usando primeiro container de bloco como fallback');
    }

    // Se realmente não encontrou nenhum container, não fazer nada
    if (!blockContainer) {
      console.error('Erro: Não foi possível encontrar um container de bloco para a notificação');
      return;
    }

    // Obter ou criar a notificação no container
    let notification = blockContainer.querySelector('.carmo-notification');

    // Se não existe um elemento de notificação, criar um
    if (!notification) {
      notification = document.createElement('div');
      notification.className = 'carmo-notification';
      blockContainer.appendChild(notification);
      console.log('Debug: Criado novo elemento de notificação no container');
    }

    // Configurar a notificação
    notification.textContent = message;
    notification.className = `carmo-notification ${type}`;
    notification.style.display = 'block';
    console.log(`Debug: Exibindo notificação "${message}" (${type}) no container`);

    // Esconder após 3 segundos
    setTimeout(() => {
      notification.style.display = 'none';
    }, 3000);
  }
  function updateFooterCart() {
    // Abordagem oficial do WooCommerce
    if (typeof wc_cart_fragments_params !== 'undefined') {
      // Dispara o evento que o WooCommerce usa para atualizar fragmentos
      jQuery(document.body).trigger('wc_fragment_refresh');
      console.log('Debug: Evento de refresh de fragmentos disparado');
    }
  }

  // Função separada para atualizar os fragmentos
  function refreshFragments() {
    if (typeof wc_cart_fragments_params !== 'undefined') {
      jQuery.ajax({
        url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
        type: 'POST',
        data: {
          time: new Date().getTime()
        },
        // Evita cache
        dataType: 'json',
        success: function (data) {
          if (data && data.fragments) {
            // Atualiza cada fragmento no DOM
            jQuery.each(data.fragments, function (key, value) {
              jQuery(key).replaceWith(value);
            });

            // Armazena os fragmentos
            sessionStorage.setItem('wc_fragments', JSON.stringify(data.fragments));
            sessionStorage.setItem('wc_cart_hash', data.cart_hash);

            // Dispara eventos para notificar outros scripts
            jQuery(document.body).trigger('wc_fragments_refreshed');
            jQuery(document.body).trigger('wc_fragments_loaded');
            jQuery(document.body).trigger('updated_wc_div');
            jQuery(document.body).trigger('updated_cart_totals');
          }
        },
        error: function (error) {
          console.log('Debug: Erro ao atualizar fragmentos', error);
          forceFragmentRefresh();
        }
      });
    } else {
      forceFragmentRefresh();
    }
  }

  // Método alternativo para forçar a atualização dos fragmentos
  function forceFragmentRefresh() {
    console.log('Debug: Usando método alternativo para atualizar mini carrinho');

    // Método 2: Usar jQuery para buscar a página atual e extrair os fragmentos
    jQuery.get(window.location.href, function (response) {
      const miniCart = jQuery(response).find('.widget_shopping_cart_content').html();
      if (miniCart) {
        jQuery('.widget_shopping_cart_content').html(miniCart);
        console.log('Debug: Mini carrinho atualizado via método alternativo');
      }

      // Atualizar outros elementos relacionados ao carrinho
      const cartCount = jQuery(response).find('.cart-count-wrap').html();
      if (cartCount) {
        jQuery('.cart-count-wrap').html(cartCount);
      }
    });

    // Método 3: Último recurso - recarregar a página após um pequeno atraso
    // Comentado para não interferir na experiência do usuário, mas pode ser descomentado se necessário
    /*
    setTimeout(function() {
    	window.location.reload();
    }, 2000);
    */
  }

  // Adicionar listener para quando os fragmentos são atualizados
  jQuery(document.body).on('wc_fragments_refreshed', function () {
    // Restaurar o foco ao elemento apropriado
    const activeElement = document.activeElement;
    if (activeElement && activeElement.classList.contains('quantity-button')) {
      setTimeout(() => {
        activeElement.focus();
      }, 0);
    }
  });

  // Manipulador para os botões de produto
  document.body.addEventListener('click', async function (e) {
    const productButton = e.target.closest('.quantity-button');
    if (!productButton) return;
    e.preventDefault();

    // Encontra a linha da tabela (tr) primeiro
    const row = productButton.closest('tr');
    if (!row) return;

    // Encontra o input de quantidade na mesma linha
    const input = row.querySelector('.quantity-input');
    if (!input) return;
    const currentValue = parseInt(input.value) || 0;
    let increment = 0;

    // Verifica qual botão foi clicado
    if (productButton.classList.contains('product-plus-one')) increment = 1;else if (productButton.classList.contains('product-plus-five')) increment = 5;else if (productButton.classList.contains('product-plus-ten')) increment = 10;
    if (increment > 0) {
      const newValue = currentValue + increment;
      input.value = newValue;
      try {
        await handleQuantityChange(input, newValue);
        showNotification('Quantidade atualizada com sucesso');
        updateFooterCart();
      } catch (error) {
        showNotification('Erro ao atualizar quantidade', 'error');
        input.value = currentValue; // Reverte para o valor anterior em caso de erro
      }
    }

    // Novo listener para o botão de reset de categoria
    if (e.target.matches('.category-reset-button')) {
      const categoryId = e.target.dataset.categoryId;
      if (categoryId) {
        await resetCategory(categoryId);
      }
    }
  });

  // Manipulador para o evento keypress nos inputs de quantidade
  document.body.addEventListener('keypress', async function (e) {
    if (e.target.matches('.quantity-input') && e.key === 'Enter') {
      e.preventDefault(); // Previne o comportamento padrão do Enter

      const input = e.target;
      const newValue = parseInt(input.value) || 0;
      const oldValue = parseInt(input.dataset.lastValue) || 0;
      console.log('Debug: Keypress event', {
        key: e.key,
        oldValue: oldValue,
        newValue: newValue,
        inputValue: input.value,
        datasetLastValue: input.dataset.lastValue,
        hasCartKey: !!input.closest('tr').querySelector('.cart-item-key').value
      });

      // Se o valor for zero e existe um cartItemKey, sempre processa
      const cartItemKey = input.closest('tr').querySelector('.cart-item-key').value;
      const forceProcess = newValue === 0 && cartItemKey;

      // Processa se o valor mudou OU se estamos forçando a remoção com zero
      if (newValue !== oldValue || forceProcess) {
        try {
          const result = await handleQuantityChange(input, newValue);
          input.dataset.lastValue = newValue;
          if (result.removed) {
            showNotification('Produto removido do carrinho');
          } else {
            showNotification('Quantidade atualizada com sucesso');
          }
          updateFooterCart();
          input.blur(); // Remove o foco do input
        } catch (error) {
          console.log('Debug: Erro no keypress event', error);
          showNotification('Erro ao atualizar quantidade', 'error');
          input.value = oldValue; // Reverte para o valor anterior em caso de erro
        }
      } else {
        input.blur(); // Remove o foco mesmo se não houver mudança
      }
    }
  });

  // Atualiza o valor inicial dos inputs
  document.querySelectorAll('.quantity-input').forEach(input => {
    input.dataset.lastValue = input.value;
  });

  // Atualiza o último valor válido quando o input perde o foco
  document.body.addEventListener('blur', function (e) {
    if (e.target.matches('.quantity-input')) {
      const input = e.target;
      const currentValue = parseInt(input.value) || 0;
      input.dataset.lastValue = currentValue;
    }
  }, true);

  // Também atualizamos o evento change para manter consistência
  document.body.addEventListener('change', async function (e) {
    if (e.target.matches('.quantity-input')) {
      const input = e.target;
      const newValue = parseInt(input.value) || 0;
      const oldValue = parseInt(input.dataset.lastValue) || 0;
      const cartItemKey = input.closest('tr').querySelector('.cart-item-key').value;
      const forceProcess = newValue === 0 && cartItemKey;
      if (newValue !== oldValue || forceProcess) {
        console.log('Debug: Change event', {
          oldValue: oldValue,
          newValue: newValue,
          inputValue: input.value,
          datasetLastValue: input.dataset.lastValue,
          hasCartKey: !!cartItemKey
        });
        try {
          const result = await handleQuantityChange(input, newValue);
          input.dataset.lastValue = newValue;
          if (result.removed) {
            showNotification('Produto removido do carrinho');
          } else {
            showNotification('Quantidade atualizada com sucesso');
          }
          updateFooterCart();
        } catch (error) {
          console.log('Debug: Erro no change event', error);
          showNotification('Erro ao atualizar quantidade', 'error');
          input.value = oldValue;
        }
      }
    }
  });

  // Inicializa os valores do carrinho
  function updateQuantitiesFromCart() {
    console.log('Debug: Iniciando updateQuantitiesFromCart');

    // Tentar uma abordagem diferente usando o endpoint do Store API do WooCommerce
    jQuery.ajax({
      url: '/wp-json/wc/store/v1/cart',
      type: 'GET',
      beforeSend: function (xhr) {
        const nonceElement = document.getElementById('carmo-bulk-form');
        if (nonceElement && nonceElement.dataset.nonce) {
          xhr.setRequestHeader('X-WC-Store-API-Nonce', nonceElement.dataset.nonce);
        }
      },
      success: function (response) {
        console.log('Debug: Resposta da Store API recebida');

        // Mapear produtos no carrinho
        const productsInCart = {};
        if (response && response.items && Array.isArray(response.items)) {
          console.log('Debug: Encontrados', response.items.length, 'itens no carrinho');
          response.items.forEach(item => {
            // O ID pode estar em diferentes locais dependendo da estrutura
            const productId = item.id || (item.product_id ? item.product_id.toString() : null) || (item.product && item.product.id ? item.product.id.toString() : null);
            if (productId) {
              productsInCart[productId] = {
                quantity: item.quantity,
                key: item.key
              };
            }
          });
        } else {
          console.log('Debug: Estrutura de resposta não reconhecida ou carrinho vazio');
        }

        // Encontrar todos os inputs de quantidade
        const inputs = document.querySelectorAll('.quantity-input');
        console.log('Debug: Total de inputs encontrados', inputs.length);

        // Reset todos os inputs primeiro (opção 1: zerar tudo)
        inputs.forEach(function (input) {
          const productId = input.dataset.productId;
          const row = input.closest('tr');
          if (!row) return;

          // Verifica se o produto está no carrinho
          if (productsInCart[productId]) {
            const cartInfo = productsInCart[productId];

            // Atualiza o input com a quantidade
            input.value = cartInfo.quantity;
            input.dataset.lastValue = cartInfo.quantity;

            // Atualiza ou cria o cartItemKey
            let cartItemKeyInput = row.querySelector('.cart-item-key');
            if (!cartItemKeyInput) {
              cartItemKeyInput = document.createElement('input');
              cartItemKeyInput.type = 'hidden';
              cartItemKeyInput.className = 'cart-item-key';
              row.querySelector('.product-quantity').appendChild(cartItemKeyInput);
            }
            cartItemKeyInput.value = cartInfo.key;
          } else {
            // Zera o input
            input.value = 0;
            input.dataset.lastValue = 0;

            // Limpa o cartItemKey se existir
            const cartItemKeyInput = row.querySelector('.cart-item-key');
            if (cartItemKeyInput) {
              cartItemKeyInput.value = '';
            }
          }
        });
      },
      error: function (error) {
        console.log('Debug: Erro ao obter carrinho via Store API', error);

        // Tenta o método alternativo como fallback
        if (typeof wc_cart_fragments_params !== 'undefined') {
          jQuery.ajax({
            url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
            type: 'POST',
            success: function (data) {
              console.log('Debug: Fragments obtidos');

              // Atualiza os fragmentos
              if (data && data.fragments) {
                jQuery.each(data.fragments, function (key, value) {
                  jQuery(key).replaceWith(value);
                });
              }

              // Trigger eventos do WooCommerce
              jQuery(document.body).trigger('wc_fragments_refreshed');
              jQuery(document.body).trigger('updated_cart_totals');
            }
          });
        }
      }
    });
  }

  // Inicializa o estado do carrinho
  updateQuantitiesFromCart();
  const orderbySelect = document.querySelector('.carmo-orderby');
  if (orderbySelect) {
    orderbySelect.addEventListener('change', function (e) {
      const category = this.dataset.category;
      const orderby = this.value;

      // Recarrega a página com os novos parâmetros de ordenação
      const url = new URL(window.location);
      url.searchParams.set('orderby', orderby);
      url.searchParams.set('category', category);
      window.location.href = url.toString();
    });
  }

  // Adicione uma função para processar o reset de categoria
  async function resetCategory(categoryId) {
    const inputs = document.querySelectorAll(`.quantity-input[data-category-id="${categoryId}"]`);
    if (!inputs.length) {
      console.warn(`Nenhum produto encontrado para a categoria ${categoryId}`);
      return;
    }
    console.log(`Resetando ${inputs.length} produtos da categoria ${categoryId}`);
    let removedKeys = [];

    // Primeiro, reunimos todos os produtos que serão zerados
    const productsToReset = [];
    inputs.forEach(input => {
      if (input.value && input.value !== '0') {
        const productId = input.dataset.productId;
        const variationId = input.dataset.variationId || 0;
        const cartItemKey = input.dataset.cartItemKey || '';
        if (cartItemKey) {
          removedKeys.push(cartItemKey);
        }
        productsToReset.push({
          input,
          productId,
          variationId,
          cartItemKey
        });
      }
    });

    // Verificar se não há produtos para resetar
    if (productsToReset.length === 0) {
      console.warn(`Nenhum produto com quantidade a resetar na categoria ${categoryId}`);
      return;
    }

    // Notifica o usuário que o processo começou
    const triggerElement = document.querySelector(`.category-reset-button[data-category-id="${categoryId}"]`);
    showNotification(`Removendo ${productsToReset.length} produtos do carrinho...`, 'success', triggerElement);

    // Zero as quantidades nos inputs
    productsToReset.forEach(product => {
      product.input.value = '0';
    });

    // Agora executamos a remoção real do carrinho
    try {
      // Usar AJAX para remover todos os itens de uma vez
      const response = await jQuery.ajax({
        url: carmo_bulk_data.ajax_url,
        type: 'POST',
        data: {
          action: 'carmo_bulk_reset_category',
          category_id: categoryId,
          security: carmo_bulk_data.nonce
        }
      });
      if (response.success) {
        // Atualiza o footer do carrinho após a conclusão
        updateFooterCart();

        // Verificar se há chaves de itens do carrinho específicas para remover
        if (removedKeys.length > 0) {
          // Verifica se os itens foram realmente removidos
          verifyCartItems(removedKeys);
        }

        // Notifica o usuário sobre o sucesso
        showNotification(`${productsToReset.length} produtos removidos do carrinho`, 'success', triggerElement);

        // Redefinir as chaves do carrinho nos inputs
        productsToReset.forEach(product => {
          if (product.input.dataset.cartItemKey) {
            product.input.dataset.cartItemKey = '';
          }
        });
      } else {
        console.error('Erro ao resetar categoria:', response.data);
        showNotification('Erro ao remover produtos do carrinho', 'error', triggerElement);
      }
    } catch (error) {
      console.error('Erro ao processar reset da categoria:', error);
      showNotification('Erro ao processar a remoção de produtos', 'error', triggerElement);
    }
  }

  // Nova função para verificar se os itens foram realmente removidos
  function verifyCartItems(removedKeys) {
    if (!removedKeys || !removedKeys.length) return;

    // Obtém informações atualizadas do carrinho
    jQuery.ajax({
      url: carmo_bulk_data.ajax_url,
      type: 'POST',
      data: {
        action: 'carmo_bulk_get_cart',
        security: carmo_bulk_data.nonce
      },
      success: function (response) {
        if (!response.success) {
          console.error('Erro ao verificar carrinho:', response.data);
          return;
        }
        const currentCart = response.data;
        const keysStillInCart = [];
        removedKeys.forEach(key => {
          if (currentCart.cart_contents && currentCart.cart_contents[key]) {
            keysStillInCart.push(key);
          }
        });
        if (keysStillInCart.length > 0) {
          console.warn('Alguns produtos não foram removidos corretamente:', keysStillInCart);
          showNotification('Alguns produtos não foram removidos corretamente do carrinho', 'error');

          // Força uma atualização completa dos fragmentos
          forceFragmentRefresh();
        } else {
          console.log('Todos os produtos foram removidos com sucesso do carrinho');
        }
      },
      error: function (error) {
        console.error('Erro ao verificar itens do carrinho:', error);
      }
    });
  }

  // Adiciona o event listener para o botão de reset
  document.body.addEventListener('click', function (e) {
    console.log('Debug: Click event', {
      target: e.target.tagName,
      className: e.target.className,
      isResetButton: e.target.matches('.category-reset-button')
    });

    // Novo listener para o botão de reset de categoria
    if (e.target.matches('.category-reset-button')) {
      const categoryId = e.target.dataset.categoryId;
      console.log('Debug: Botão reset clicado', {
        categoryId
      });
      if (categoryId) {
        resetCategory(categoryId).catch(error => {
          console.log('Debug: Erro ao executar resetCategory', error);
        });
      } else {
        console.log('Debug: categoryId não encontrado no botão');
      }
    }

    // Lógica existente para outros botões...
  });

  /**
   * Diagnóstico e implementação da funcionalidade de aplicar a todos
   */
  function handleCategoryApply() {
    const categoryApplyButtons = document.querySelectorAll('.category-apply-button');
    console.log(`Debug: Encontrados ${categoryApplyButtons.length} botões de aplicar categoria`);
    categoryApplyButtons.forEach(button => {
      button.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        const categoryId = this.dataset.categoryId;
        console.log(`Debug: Botão de categoria ${categoryId} clicado`);

        // Buscar o input de categoria usando diferentes seletores (verificação mais robusta)
        let categoryInput = null;

        // Tentar encontrar por seletor específico
        categoryInput = document.querySelector(`.category-quantity-input[data-category-id="${categoryId}"]`);

        // Se não encontrou, tenta buscar input próximo ao botão
        if (!categoryInput) {
          const parentElement = this.parentElement;
          if (parentElement) {
            categoryInput = parentElement.querySelector('input[type="number"]');
            console.log(`Debug: Procurando input no elemento pai: ${categoryInput ? 'Encontrado' : 'Não encontrado'}`);
          }
        }

        // Último recurso: buscar qualquer input com o mesmo data-category-id
        if (!categoryInput) {
          categoryInput = document.querySelector(`input[data-category-id="${categoryId}"]`);
          console.log(`Debug: Procurando qualquer input com data-category-id: ${categoryInput ? 'Encontrado' : 'Não encontrado'}`);
        }

        // Determinar o valor a ser aplicado
        let valueToApply = '1'; // Valor padrão

        if (categoryInput && categoryInput.value && categoryInput.value !== '') {
          valueToApply = categoryInput.value;
          console.log(`Debug: INPUT ENCONTRADO! Valor a ser aplicado: ${valueToApply}`);
        } else {
          console.log(`Debug: Nenhum input válido encontrado. Usando valor padrão: ${valueToApply}`);

          // Encontrar todos os inputs numéricos para diagnóstico
          const allInputs = document.querySelectorAll('input[type="number"]');
          console.log(`Debug: Total de inputs numéricos na página: ${allInputs.length}`);

          // Listar os primeiros 5 inputs para diagnóstico
          console.log('Debug: Amostra de inputs disponíveis:');
          Array.from(allInputs).slice(0, 5).forEach((input, i) => {
            console.log(`Input ${i + 1}: ID=${input.id}, Classes=${input.className}, Value=${input.value}, Data:`, input.dataset);
          });
        }

        // Encontrar todos os inputs da categoria
        const categoryInputs = document.querySelectorAll(`.quantity-input[data-category-id="${categoryId}"]`);
        if (categoryInputs.length === 0) {
          console.log(`Debug: Nenhum input de produto encontrado para a categoria ${categoryId}`);
          alert(`Erro: Não foi possível encontrar produtos para esta categoria (${categoryId})`);
          return;
        }
        console.log(`Debug: Aplicando valor ${valueToApply} a ${categoryInputs.length} produtos da categoria ${categoryId}`);

        // Aplicar o valor a todos os produtos sequencialmente
        applyValueSequentially(Array.from(categoryInputs), 0, valueToApply, categoryId);
      });
    });
  }

  /**
   * Aplica um valor específico a inputs sequencialmente
   * Com checagem de modificação de valor reforçada
   */
  function applyValueSequentially(inputs, index, valueToApply, categoryId) {
    // Se terminou todos os inputs
    if (index >= inputs.length) {
      console.log(`Debug: Atualizados ${inputs.length} produtos da categoria ${categoryId}`);
      //alert(`Aplicado o valor ${valueToApply} a ${inputs.length} produtos da categoria`);
      updateFooterCart();
      return;
    }
    const input = inputs[index];
    const productId = input.dataset.productId;
    const oldValue = input.value;
    console.log(`Debug [${index + 1}/${inputs.length}]: Aplicando valor ${valueToApply} ao produto ${productId} (valor anterior: ${oldValue})`);
    try {
      // IMPORTANTE: Primeiro definir o valor explicitamente no input
      input.value = valueToApply;

      // Verificar se o valor foi realmente alterado no DOM
      console.log(`Debug: Valor do input após atribuição: ${input.value}`);

      // Depois disparar o evento de mudança
      if (typeof handleQuantityChange === 'function') {
        console.log(`Debug: Chamando handleQuantityChange diretamente`);
        handleQuantityChange(input, valueToApply);
      } else {
        console.log(`Debug: Disparando evento change manualmente`);
        const event = new Event('change', {
          bubbles: true
        });
        input.dispatchEvent(event);
      }

      // Processar o próximo após um pequeno delay
      setTimeout(function () {
        applyValueSequentially(inputs, index + 1, valueToApply, categoryId);
      }, 200);

      // Adicione isso antes do setTimeout
      if (index === inputs.length - 1) {
        // Usando o último input como referência para o contêiner do bloco
        showNotification(`Aplicado valor ${valueToApply} a todos os produtos da categoria`, 'success', input);
      }
    } catch (e) {
      console.error(`Erro ao aplicar valor: ${e.message}`);
      showNotification('Erro ao aplicar valor aos produtos', 'error', input);
    }
  }

  // Garantir que os eventos sejam registrados quando o DOM estiver pronto
  document.addEventListener('DOMContentLoaded', function () {
    console.log('Debug: DOM carregado, inicializando manipuladores de eventos');

    // Inicializar manipuladores de eventos para botões de categoria
    handleCategoryApply();

    // Adicionar também após um curto delay (para casos onde o conteúdo é carregado dinamicamente)
    setTimeout(function () {
      console.log('Debug: Verificando botões após delay');
      handleCategoryApply();
    }, 1000);
  });

  // Adicionar também no evento load (para quando imagens e outros recursos terminarem de carregar)
  window.addEventListener('load', function () {
    console.log('Debug: Página totalmente carregada, verificando botões novamente');
    handleCategoryApply();
  });
});
})();


//# sourceMappingURL=view.js.map