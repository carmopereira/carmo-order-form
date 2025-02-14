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
  function addToCart(event) {
    event.preventDefault();
    const button = event.currentTarget;
    const productId = button.dataset.productId;
    const isVariable = button.dataset.isVariable === 'true';
    const quantityInput = button.closest('tr').querySelector('.quantity-input');
    const quantity = parseInt(quantityInput.value);

    // Para produtos variáveis
    let variationId = null;
    let variations = {};
    if (isVariable) {
      const row = button.closest('tr');
      const variationSelects = row.querySelectorAll('.variation-select');

      // Se tiver apenas uma variação (input hidden)
      const hiddenVariationInput = row.querySelector('.variation-id');
      if (hiddenVariationInput) {
        variationId = hiddenVariationInput.value;
      }
      // Se tiver múltiplas variações (selects)
      else if (variationSelects.length > 0) {
        let allSelected = true;
        variationSelects.forEach(select => {
          if (!select.value) {
            allSelected = false;
            alert('Por favor, selecione todas as opções do produto');
            return;
          }
          variations[select.dataset.attribute] = select.value;
        });
        if (!allSelected) return;
      }
    }
    const formData = new FormData();
    formData.append('product_id', productId);
    formData.append('quantity', quantity);
    if (isVariable && variationId) {
      formData.append('variation_id', variationId);
    } else if (isVariable) {
      Object.keys(variations).forEach(key => {
        formData.append(`attribute_${key}`, variations[key]);
      });
    }
    jQuery.ajax({
      url: wc_add_to_cart_params.wc_ajax_url.toString().replace('%%endpoint%%', 'add_to_cart'),
      method: 'POST',
      data: formData,
      processData: false,
      contentType: false,
      success: function (response) {
        if (response.error) {
          console.error('Erro:', response.message);
          return;
        }

        // Força a atualização dos fragmentos do carrinho
        jQuery.ajax({
          url: wc_add_to_cart_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
          method: 'POST',
          success: function (response) {
            if (response && response.fragments) {
              jQuery.each(response.fragments, function (key, value) {
                jQuery(key).replaceWith(value);
              });
              jQuery(document.body).trigger('wc_fragments_refreshed');
            }
            const productName = button.closest('tr').querySelector('td:nth-child(2)').textContent;
            console.log(`Produto adicionado: ${productName} (${quantity} unidades)`);
          }
        });
      },
      error: function (jqXHR, textStatus, errorThrown) {
        console.error('Erro ao adicionar ao carrinho:', jqXHR.responseText);
      }
    });
  }

  // Adiciona event listeners aos botões
  const addToCartButtons = document.querySelectorAll('.carmo-atc');
  addToCartButtons.forEach(button => {
    button.addEventListener('click', addToCart);
  });
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