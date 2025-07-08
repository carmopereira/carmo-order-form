/**
 * JavaScript functions for the OrderForm block
 */
(function() {
	'use strict';
	
	// Global namespace for the plugin
	window.CarmoBulk = window.CarmoBulk || {};
	
	// Create functions in the namespace
	const CarmoBulk = window.CarmoBulk;
	
	const isDebug = typeof URLSearchParams !== 'undefined' && new URLSearchParams(window.location.search).has('debug');

	document.addEventListener('DOMContentLoaded', function() {
		if (isDebug) console.log('🟢 OrderForm: Script initialized');
		
		// Initialize cart values
		updateQuantitiesFromCart();
		
		// Add event handlers for quantity buttons
		setupQuantityButtons();
		
		// Add handlers for the cart
		setupCartHandlers();
		
		// Initialize event handlers for category buttons
		handleCategoryApply();

		// Initialize lastValue for all inputs
		document.querySelectorAll('.carmo-bulk-quantity-input').forEach(input => {
			input.dataset.lastValue = input.value || '0';
		});
	});
	
	// Helper functions
	
	function setupQuantityButtons() {
		// Handler for product buttons
		document.body.addEventListener('click', async function(e) {
			const productButton = e.target.closest('.carmo-bulk-quantity-button');
			if (!productButton) return;
			
			e.preventDefault();
			
			// Find the table row (tr) first
			const row = productButton.closest('tr');
			if (!row) return;
			
			// Find the quantity input in the same row
			const input = row.querySelector('.carmo-bulk-quantity-input');
			if (!input) return;
			
			const currentValue = parseInt(input.value) || 0;
			let increment = 0;
			
			// Check which button was clicked
			if (productButton.classList.contains('carmo-bulk-product-plus-one')) increment = 1;
			else if (productButton.classList.contains('carmo-bulk-product-plus-five')) increment = 5;
			else if (productButton.classList.contains('carmo-bulk-product-plus-ten')) increment = 10;
			
			if (increment > 0) {
				const newValue = currentValue + increment;
				input.value = newValue;
				
				try {
					await handleQuantityChange(input, newValue);
					showNotification('Quantity updated successfully');
				} catch (error) {
					showNotification('Error updating quantity', 'error');
					input.value = currentValue; // Revert to previous value in case of error
				}
			}
		});
		
		if (isDebug) console.log('Quantity buttons configured');
	}
	
	function setupCartHandlers() {
		// Handler for keypress event on quantity inputs
		document.body.addEventListener('keypress', async function(e) {
			if (e.target.matches('.carmo-bulk-quantity-input') && e.key === 'Enter') {
				e.preventDefault(); // Prevent default Enter behavior
				
				const input = e.target;
				const newValue = parseInt(input.value) || 0;
				const oldValue = parseInt(input.dataset.lastValue) || 0;
				
				// If the value is zero and there is a cartItemKey, always process
				const cartItemKeyInput = input.closest('tr').querySelector('.carmo-bulk-cart-item-key');
				const cartItemKey = cartItemKeyInput ? cartItemKeyInput.value : '';
				const forceProcess = newValue === 0 && cartItemKey;
				
				// Process if the value changed OR if we're forcing removal with zero
				if (newValue !== oldValue || forceProcess) {
					try {
						const result = await handleQuantityChange(input, newValue);
						input.dataset.lastValue = newValue;
						if (result && result.removed) {
							showNotification('Product removed from cart');
						} else {
							showNotification('Quantity updated successfully');
						}
						input.blur(); // Remove focus from input
					} catch (error) {
						console.log('Error in keypress event', error);
						showNotification('Error updating quantity', 'error');
						input.value = oldValue; // Revert to previous value in case of error
					}
				} else {
					input.blur(); // Remove focus even if there's no change
				}
			}
		});
		
		// We also update the change event for consistency
		document.body.addEventListener('change', async function(e) {
			if (e.target.matches('.carmo-bulk-quantity-input')) {
				const input = e.target;
				const newValue = parseInt(input.value) || 0;
				const oldValue = parseInt(input.dataset.lastValue) || 0;
				
				const cartItemKeyInput = input.closest('tr').querySelector('.carmo-bulk-cart-item-key');
				const cartItemKey = cartItemKeyInput ? cartItemKeyInput.value : '';
				const forceProcess = newValue === 0 && cartItemKey;
				
				if (newValue !== oldValue || forceProcess) {
					try {
						const result = await handleQuantityChange(input, newValue);
						input.dataset.lastValue = newValue;
						if (result && result.removed) {
							showNotification('Product removed from cart');
						} else {
							showNotification('Quantity updated successfully');
						}
					} catch (error) {
						console.log('Error in change event', error);
						showNotification('Error updating quantity', 'error');
						input.value = oldValue;
					}
				}
			}
		});
		
		// Update the last valid value when the input loses focus
		document.body.addEventListener('blur', function(e) {
			if (e.target.matches('.carmo-bulk-quantity-input')) {
				const input = e.target;
				const currentValue = parseInt(input.value) || 0;
				input.dataset.lastValue = currentValue;
			}
		}, true);
		
		// Category reset button
		document.body.addEventListener('click', function(e) {
			// New listener for the category reset button
			if (e.target.matches('.carmo-bulk-category-reset-button')) {
				const categoryId = e.target.dataset.categoryId;
				console.log('Reset button clicked', { categoryId });
				
				if (categoryId) {
					resetCategory(categoryId).catch(error => {
						console.log('Error executing resetCategory', error);
					});
				} else {
					console.log('categoryId not found on the button');
				}
			}
		});
		
		if (isDebug) console.log('Cart handlers configured');
	}
	
	/**
	 * Applies a specific value to inputs sequentially
	 */


	/* TEST async */

	// Add this to your view.js for comprehensive debugging
	document.addEventListener('carmo:quantity-update', (event) => {
		console.log('Quantity Update Event:', {
			detail: event.detail,
			target: event.target
		});
	});

	function hideProgressBarWithDelay(progressElement, delay = 4000) {
		if (!progressElement) return;
		
		// First, indicate completion by setting the progress to 100%
		const progressBar = progressElement.querySelector('.carmo-bulk-progress-bar');
		if (progressBar) {
			progressBar.style.width = '100%';
		}
		
		// Set a timeout to hide the progress bar after the delay
		setTimeout(() => {
			// Option 1: Hide with CSS
			progressElement.style.opacity = '0';
			progressElement.style.transition = 'opacity 0.5s ease';
			
			// After fade out animation, actually remove from DOM
			setTimeout(() => {
				if (progressElement.parentNode) {
					progressElement.parentNode.removeChild(progressElement);
				}
			}, 500); // Wait for fade out to complete
		}, delay);
	}

	async function applyValueSequentially(inputs, currentIndex, valueToApply, categoryId) {
		// Early exit conditions
		if (!inputs || inputs.length === 0 || currentIndex >= inputs.length) {
			if (isDebug) console.log('Bulk update completed');
			showNotification(`Category updated`, 'success');
			return;
		}

		// Ensure progress indicator exists
		let progressElement = document.querySelector(`.carmo-bulk-progress[data-category-id="${categoryId}"]`);
		if (!progressElement) {
			progressElement = createProgressIndicator(categoryId);
			//hide progress after 4seconds

		// Hide it with delay
		hideProgressBarWithDelay(progressElement);

		}

		// Current input being processed
		const currentInput = inputs[currentIndex];

		try {
			// Validate input and value
			const newQuantity = parseInt(valueToApply, 10);
			if (isNaN(newQuantity) || newQuantity < 0) {
				console.warn(`Invalid quantity: ${valueToApply}`);
				throw new Error('Invalid Quantity');
			}

			if (isDebug) console.log("currentInput: " + currentInput.value + " and newQuantity: " + newQuantity);
			// Perform quantity change with error handling
			const result = await handleQuantityChange(currentInput, newQuantity);

			// Ensure input value is updated
			if (isDebug) console.log('result ', result);
			if (result && Object.keys(result).length > 0) {
				if (isDebug) console.log('entrou no sucess');
				// Directly set the value and last value
				currentInput.value = newQuantity;
				currentInput.setAttribute('value', newQuantity);  // Update HTML attribute
				currentInput.dataset.lastValue = newQuantity;
				
				// Trigger change event to ensure any dependent logic runs
				const changeEvent = new Event('change', { bubbles: true });
				currentInput.dispatchEvent(changeEvent);
				
				// Visual feedback
				currentInput.classList.add('updated-success');
				setTimeout(() => {
					currentInput.classList.remove('updated-success');
				}, 1000);
			} else {
				// Handle specific failure scenarios
				currentInput.classList.add('updated-error');
				console.warn(`Failed to update product: ${currentInput.dataset.productId}`);
			}

			// Progress tracking
			const progress = Math.round(((currentIndex + 1) / inputs.length) * 100);
			updateProgressIndicator(categoryId, progress);

			// Recursive call with small delay
			await new Promise(resolve => setTimeout(resolve, 100)); // 100ms between updates
			await applyValueSequentially(inputs, currentIndex + 1, valueToApply, categoryId);

		} catch (error) {
			// Comprehensive error handling
			console.error('Error in sequential update:', error);
			
			// User-friendly error notification
			showNotification(`Erro ao atualizar produto: ${error.message}`, 'error');

			// Mark input as errored
			currentInput.classList.add('updated-error');
			
			// Continue with next input
			await applyValueSequentially(inputs, currentIndex + 1, valueToApply, categoryId);
		}
	}

	// Enhanced handleCategoryApply to use new approach
	function handleCategoryApply() {
		const categoryApplyButtons = document.querySelectorAll('.carmo-bulk-category-apply-button');
		
		categoryApplyButtons.forEach(button => {
			button.addEventListener('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				
				const categoryId = this.dataset.categoryId;
				if (isDebug) console.log(`Category button ${categoryId} clicked`);
				
				// Find category input
				let categoryInput = document.querySelector(`.carmo-bulk-category-quantity-input[data-category-id="${categoryId}"]`);
				
				
				if (categoryInput.value === '') {
					if (isDebug) console.log('vazzzzio');
					showNotification("No value was filled in");
					// get out of the function and do not continue
					return;
				}

				// Determine value to apply
				const valueToApply = (categoryInput && categoryInput.value) ? categoryInput.value : '1';
				
				// Find all inputs for the category
				const categoryInputs = document.querySelectorAll(`.carmo-bulk-quantity-input[data-category-id="${categoryId}"]`);
							
				if (isDebug) console.log(`Applying value ${valueToApply} to ${categoryInputs.length} products in category ${categoryId}`);
				
				// Start sequential processing
				applyValueSequentially(Array.from(categoryInputs), 0, valueToApply, categoryId);
			});
		});
	}

	// Progress Indicator Function
	function updateProgressIndicator(categoryId, progress) {
		// Find progress element by category ID
		const progressElement = document.querySelector(`.carmo-bulk-progress[data-category-id="${categoryId}"]`);
		
		if (progressElement) {
			// Update width
			progressElement.style.width = `${progress}%`;
			
			// Update ARIA attributes for accessibility
			progressElement.setAttribute('aria-valuenow', progress);
			progressElement.setAttribute('aria-valuetext', `${progress}% concluído`);
			
			// Optional: Add text representation
			progressElement.textContent = `${progress}%`;
		} else {
			// Fallback logging if no progress element found
			if (isDebug) {
				console.log(`No progress element found for category ${categoryId}`);
			}
		}
	}

	// Optional: Add HTML structure for progress indicator
	function createProgressIndicator(categoryId) {
		const container = document.createElement('div');
		container.className = 'carmo-bulk-progress-container';
		
		const progressElement = document.createElement('div');
		progressElement.className = 'carmo-bulk-progress';
		progressElement.dataset.categoryId = categoryId;
		progressElement.setAttribute('role', 'progressbar');
		progressElement.setAttribute('aria-valuenow', '0');
		progressElement.setAttribute('aria-valuemin', '0');
		progressElement.setAttribute('aria-valuemax', '100');
		
		container.appendChild(progressElement);
		
		// Optional: Add to a specific location or body
		document.body.appendChild(container);
		
		return progressElement;
	}

	/**
	 * Category reset
	 */
	async function resetCategory(categoryId) {
		if (isDebug) console.log('Starting resetCategory', { categoryId });
		
		// Find all quantity inputs for this category
		const categoryInputs = document.querySelectorAll(`.carmo-bulk-quantity-input[data-category-id="${categoryId}"]`);
		
		if (!categoryInputs.length) {
			if (isDebug) console.log('No products found in the category');
			return;
		}
		
		let promises = [];
		let itemsToRemove = [];
		// First we collect all items that need to be removed
		for (const input of categoryInputs) {
			const row = input.closest('tr');
			if (!row) continue;
			
			// We zero the input in any case
			input.value = 0;
			input.dataset.lastValue = 0;
			
			// Check if cartItemKey exists
			const cartItemKeyInput = row.querySelector('.carmo-bulk-cart-item-key');
			if (!cartItemKeyInput || !cartItemKeyInput.value) {
				continue; // Not in the cart, skip to the next one
			}
			
			const cartItemKey = cartItemKeyInput.value;
			itemsToRemove.push({
				input: input,
				cartItemKey: cartItemKey,
				cartItemKeyInput: cartItemKeyInput,
				productId: input.dataset.productId
			});
		}
		
		if (isDebug) console.log('Items to remove', itemsToRemove.length);
		
		// Process in batches of 5
		const BATCH_SIZE = 1;
		const BATCH_DELAY = 200; // Only 200ms between batches instead of 800ms per item
		try {
			showNotification(`Removing ${itemsToRemove.length} products...`, 'info');
			let productsRemoved = 0;

			// Process in batches
			for (let i = 0; i < itemsToRemove.length; i += BATCH_SIZE) {
				const batch = itemsToRemove.slice(i, i + BATCH_SIZE);

				const results = await Promise.all(
					batch.map(item =>
						removeFromCart(item.cartItemKey)
							.then(() => {
				// Clear the cartItemKey
				item.cartItemKeyInput.value = '';
								return true;
							})
							.catch(error => {
				if (isDebug) console.log('Error removing product', { 
					cartItemKey: item.cartItemKey, 
					productId: item.productId, 
					error 
				});
								return false;
							})
					)
				);

				productsRemoved += results.filter(result => result).length;

				// Small delay between batches
				if (i + BATCH_SIZE < itemsToRemove.length) {
					await new Promise(resolve => setTimeout(resolve, BATCH_DELAY));
			}
		}
		
		if (productsRemoved > 0) {
			showNotification(`${productsRemoved} products removed from category`);

			const customEvent = new CustomEvent('wc-blocks_added_to_cart');
			document.body.dispatchEvent(customEvent);
		} else {
			showNotification('No products in cart to remove');
		}
		} catch (error) {
			showNotification('Error removing products', 'error');
			if (isDebug) console.error('Error in bulk remove operation', error);
	}
	}
	
	// Main function for handling quantity changes
	async function handleQuantityChange(input, newValue) {
		if (!input) {
			return Promise.reject(new Error('Input not found'));
		}
		
		const productId = input.dataset.productId;
		
		if (isDebug) console.log('Changing quantity for product', {
			productId: productId,
			newValue: newValue,
			inputValue: input.value
		});
		
if (newValue == inputValue) {
	if (isDebug) console.log('Product already with that value');
	return Promise.reject(new Warning('Product already with that value'));
}

		if (!productId) {
			if (isDebug) console.error('Product ID not found in input:', input);
			return Promise.reject(new Error('Product ID not found'));
		}
		
		const row = input.closest('tr');
		if (!row) {
			return Promise.reject(new Error('Table row not found'));
		}
		
		const cartItemKeyInput = row.querySelector('.carmo-bulk-cart-item-key');
		const cartItemKey = cartItemKeyInput ? cartItemKeyInput.value : '';
		
		// If the quantity is zero and we have a cartItemKey, we remove the item
		if (newValue === 0 && cartItemKey) {
			return removeFromCart(cartItemKey).then(() => {
				if (cartItemKeyInput) {
					cartItemKeyInput.value = '';
				}
				return { removed: true };
			});
		}
		
		// Passar o ID da variação para a função updateCart
		return updateCart(productId, newValue, cartItemKey).then(response => {
			// Update the cartItemKey after the operation is successful
			if (response && response.key) {
				// If the input for cartItemKey doesn't exist, we create one
				if (!cartItemKeyInput) {
					const newCartItemKeyInput = document.createElement('input');
					newCartItemKeyInput.type = 'hidden';
					newCartItemKeyInput.className = 'carmo-bulk-cart-item-key';
					row.querySelector('.carmo-bulk-product-quantity').appendChild(newCartItemKeyInput);
					newCartItemKeyInput.value = response.key;
				} else {
					cartItemKeyInput.value = response.key;
				}
			}
			return response;
		});
	}
	
	// Function to remove item from cart
	function removeFromCart(cartItemKey) {
		if (isDebug) console.log('Removing item from cart', {
			cartItemKey: cartItemKey
		});
		
		return new Promise((resolve, reject) => {
			if (!cartItemKey) {
				//console.error('No cart item key provided for removal');
				return reject(new Error('No cart item key provided'));
			}
			
		jQuery.ajax({
		url: '/wp-json/wc/store/v1/cart/items/' + cartItemKey,
		method: 'DELETE',
		beforeSend: function(xhr) {
			xhr.setRequestHeader('X-WC-Store-API-Nonce', document.getElementById('carmo-bulk-form').dataset.nonce);
		},
		success: function(response, textStatus, jqXHR) {    
			// Even if response is undefined, we can consider the operation successful
			// if we reached the success callback
			resolve({ success: true, status: jqXHR.status });
			
			const customEvent = new CustomEvent('wc-blocks_added_to_cart');
			document.body.dispatchEvent(customEvent);
		},
		// Add error handling
		error: function(jqXHR, textStatus, errorThrown) {
			if (isDebug) {
			console.error('Error removing item:', textStatus, errorThrown);
			}
			reject({ success: false, error: textStatus });
		}
		});
		});
	}
	
	function updateCart(productId, quantity, cartItemKey) {
		if (isDebug) console.log('Starting updateCart', {productId,	quantity, cartItemKey});
		
		return new Promise((resolve, reject) => {
			const data = {
				id: productId,
				quantity: quantity
			};
					
			let ajaxConfig = {
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-WC-Store-API-Nonce', document.getElementById('carmo-bulk-form').dataset.nonce);
				},
				data: JSON.stringify(data),
				custom_data:{
					origin_page: window.location.href,
					origin_page_id: document.body.dataset.pageId || '',  // You might need to add this data attribute
					origin_page_title: document.title,
					block_id: 'orderform',  // Identify your specific block
					timestamp: Date.now()
				},
				contentType: 'application/json',
				success: function(response) {
					if (isDebug) console.log('Update successful', response);
					resolve(response);

					const customEvent = new CustomEvent('wc-blocks_added_to_cart');
					document.body.dispatchEvent(customEvent);
				},
				error: function(error) {
					if (isDebug) console.log('Update error', error);
					reject(error);
				}
			};
			
			if (cartItemKey) {
				if (isDebug) console.log('Updating existing item', cartItemKey);
				jQuery.ajax({
					...ajaxConfig,
					url: '/wp-json/wc/store/v1/cart/items/' + cartItemKey,
					method: 'PUT'
				});
			} else {
				if (isDebug) console.log('Adding new item');
				jQuery.ajax({
					...ajaxConfig,
					url: '/wp-json/wc/store/v1/cart/items',
					method: 'POST'
				});
			}
		});
	}
	
	/**
	 * Shows a notification inside the block container
	 */
	function showNotification(message, type = 'success', triggerElement = null) {
		// Find the block that contains the element that triggered the action
		let blockContainer;
		
		if (triggerElement) {
			// Search for the closest block container
			blockContainer = triggerElement.closest('.carmo-bulk-container');
		}
		
		// If container not found from the trigger element
		if (!blockContainer) {
			// Try to use the currently focused element
			const activeElement = document.activeElement;
			if (activeElement) {
				blockContainer = activeElement.closest('.carmo-bulk-container');
			}
		}
		
		// If still not found, try the first block as a fallback
		if (!blockContainer) {
			blockContainer = document.querySelector('.carmo-bulk-container');
		}
		
		// If really didn't find any container, do nothing
		if (!blockContainer) {
			console.error('Error: Could not find a block container for notification');
			return;
		}
		
		// Get or create notification in the container
		let notification = blockContainer.querySelector('.carmo-bulk-notification');
		
		// If notification element doesn't exist, create one
		if (!notification) {
			notification = document.createElement('div');
			notification.className = 'carmo-bulk-notification';
			blockContainer.appendChild(notification);
		}
		
		// Configure the notification
		notification.textContent = message;
		notification.className = `carmo-bulk-notification ${type}`;
		notification.style.display = 'block';
		
		// Hide after 3 seconds
		setTimeout(() => {
			notification.style.display = 'none';
		}, 3000);
	}
	
	// Initialize cart values
	function updateQuantitiesFromCart() {
		if (isDebug) console.log('Starting updateQuantitiesFromCart');
		
		// Use the WooCommerce Store API endpoint
		jQuery.ajax({
			url: '/wp-json/wc/store/v1/cart',
			type: 'GET',
			beforeSend: function(xhr) {
				const nonceElement = document.getElementById('carmo-bulk-form');
				if (nonceElement && nonceElement.dataset.nonce) {
					xhr.setRequestHeader('X-WC-Store-API-Nonce', nonceElement.dataset.nonce);
				}
			},
			success: function(response) {
				if (isDebug) console.log('Store API response received');
				
				// Map products in cart
				const productsInCart = {};
				
				if (response && response.items && Array.isArray(response.items)) {
					if (isDebug) console.log('Found', response.items.length, 'items in cart');
					
					response.items.forEach(item => {
						// ID pode ser o product_id para produtos simples ou variation_id para variáveis
						const productId = item.id || 
									(item.product_id ? item.product_id.toString() : null) || 
									(item.product && item.product.id ? item.product.id.toString() : null);
						
						// Verificar se é um produto variável (possui variation_id)
						const variationId = item.variation_id || 
									(item.variation && item.variation.id ? item.variation.id.toString() : null);
												
						if (productId) {
							// Usar o variation_id como chave se for um produto variável
							const mapKey = variationId ? `${productId}_${variationId}` : productId;
							
							productsInCart[mapKey] = {
								productId: productId,
								variationId: variationId,
								quantity: item.quantity,
								key: item.key
							};
						}
					});
				} else {
					if (isDebug) console.log('Unrecognized response structure or empty cart');
				}
				
				// Find all quantity inputs
				const inputs = document.querySelectorAll('.carmo-bulk-quantity-input');
				if (isDebug) console.log('Total inputs found', inputs.length);
				
				// Reset all inputs first (zerar os campos)
				inputs.forEach(function(input) {
					input.value = 0;
					input.dataset.lastValue = 0;
					
					// Remover o cart item key, se existir
					const row = input.closest('tr');
					if (row) {
						const cartItemKeyInput = row.querySelector('.carmo-bulk-cart-item-key');
						if (cartItemKeyInput) {
							cartItemKeyInput.value = '';
						}
					}
				});
				
				// Atualizar com os valores do carrinho
				inputs.forEach(function(input) {
					const productId = input.dataset.productId;
					const variationId = input.dataset.variationId;
					const row = input.closest('tr');
					if (!row) return;
					
					// Determinar a chave a ser usada no mapa
					let mapKey = productId;
					
					// Se o input tem variation_id, usar a combinação product_variation como chave
					if (variationId) {
						mapKey = `${productId}_${variationId}`;
					}
					
					// Verificar se o produto está no carrinho
					if (productsInCart[mapKey]) {
						const cartInfo = productsInCart[mapKey];
						
						// Atualizar o input com a quantidade
						input.value = cartInfo.quantity;
						input.dataset.lastValue = cartInfo.quantity;
						
						// Atualizar ou criar o cartItemKey
						let cartItemKeyInput = row.querySelector('.carmo-bulk-cart-item-key');
						if (!cartItemKeyInput) {
							cartItemKeyInput = document.createElement('input');
							cartItemKeyInput.className = 'carmo-bulk-cart-item-key';
							cartItemKeyInput.type = 'hidden';
							cartItemKeyInput.name = 'product-quantity.' + (productId || '');
							row.querySelector('.carmo-bulk-product-quantity').appendChild(cartItemKeyInput);
						}
						
						cartItemKeyInput.value = cartInfo.key;
					}
				});

				const customEvent = new CustomEvent('wc-blocks_added_to_cart');
				document.body.dispatchEvent(customEvent);
			},
			error: function(error) {
				if (isDebug) console.log('Error getting cart via Store API', error);
				
				// Try alternative method as fallback
				if (typeof wc_cart_fragments_params !== 'undefined') {
					jQuery.ajax({
						url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
						type: 'POST',
						success: function(data) {
							if (isDebug) console.log('Fragments obtained');
							
							// Update fragments
							if (data && data.fragments) {
								jQuery.each(data.fragments, function(key, value) {
									jQuery(key).replaceWith(value);
								});
							}
							
							// Trigger WooCommerce events
							jQuery(document.body).trigger('wc_fragments_refreshed');
							jQuery(document.body).trigger('updated_cart_totals');
						}
					});
				}
			}
		});
	}
	
})();
