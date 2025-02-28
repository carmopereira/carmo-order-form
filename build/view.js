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
      console.log('Debug: Input não encontrado');
      return Promise.reject(new Error('Input não encontrado'));
    }
    const productId = input.dataset.productId;
    console.log('Debug: Alterando quantidade para produto', {
      productId: productId,
      newValue: newValue,
      inputValue: input.value
    });
    if (!productId) {
      console.log('Debug: ID do produto não encontrado');
      return Promise.reject(new Error('ID do produto não encontrado'));
    }
    const row = input.closest('tr');
    if (!row) {
      console.log('Debug: Linha da tabela não encontrada');
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
        cartItemKeyInput.value = '';
        return {
          removed: true
        };
      });
    }
    return updateCart(productId, null, newValue, cartItemKey).then(response => {
      // Atualiza o cart item key após sucesso
      if (response && response.key && cartItemKeyInput) {
        cartItemKeyInput.value = response.key;
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
  function showNotification(message, type = 'success') {
    const notification = document.getElementById('carmo-notification');
    if (notification) {
      notification.textContent = message;
      notification.className = 'carmo-notification ' + type;
      notification.style.display = 'block';
      setTimeout(() => {
        notification.style.display = 'none';
      }, 3000);
    }
  }
  function updateFooterCart() {
    // Remover aria-hidden antes de atualizar
    const siteBlocks = document.querySelector('.wp-site-blocks');
    if (siteBlocks) {
      siteBlocks.removeAttribute('aria-hidden');
    }

    // Atualizar o carrinho diretamente
    jQuery.ajax({
      url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
      type: 'POST',
      success: function (data) {
        if (data && data.fragments) {
          jQuery.each(data.fragments, function (key, value) {
            jQuery(key).replaceWith(value);
          });
          jQuery(document.body).trigger('wc_fragments_refreshed');
        }
      }
    });
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
    jQuery.ajax({
      url: '/wp-json/wc/store/v1/cart',
      method: 'GET',
      beforeSend: function (xhr) {
        xhr.setRequestHeader('X-WC-Store-API-Nonce', document.getElementById('carmo-bulk-form').dataset.nonce);
      },
      success: function (response) {
        if (response && response.items && response.items.length > 0) {
          response.items.forEach(item => {
            const productId = item.id.toString();
            const variationId = item.variation_id ? item.variation_id.toString() : null;
            const quantity = item.quantity;
            let quantityInput;
            let keyInput;
            if (variationId) {
              const row = document.querySelector(`input[type="hidden"][value="${variationId}"]`)?.closest('tr');
              if (row) {
                quantityInput = row.querySelector('.quantity-input');
                keyInput = row.querySelector('.cart-item-key');
              }
            } else {
              quantityInput = document.querySelector(`input.quantity-input[data-product-id="${productId}"]`);
              keyInput = quantityInput?.closest('.quantity-controls').querySelector('.cart-item-key');
            }
            if (quantityInput && keyInput) {
              quantityInput.value = quantity;
              keyInput.value = item.key;
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
});
})();


//# sourceMappingURL=view.js.map