/**
 * Funções JavaScript para o bloco OrderForm
 */
(function() {
	'use strict';
	
	// Namespace global para o plugin
	window.CarmoBulk = window.CarmoBulk || {};
	
	// Criar as funções no namespace
	const CarmoBulk = window.CarmoBulk;
	
	document.addEventListener('DOMContentLoaded', function() {
		console.log('🟢 OrderForm: Script inicializado');
		
		// Inicializa os valores do carrinho
		updateQuantitiesFromCart();
		
		// Adicionar manipuladores de eventos para botões de quantidade
		setupQuantityButtons();
		
		// Adicionar manipuladores para o carrinho
		setupCartHandlers();
		
		// Inicializar manipuladores de eventos para botões de categoria
		handleCategoryApply();
		
		// Adicionar indicador visual de script carregado
		addScriptLoadedIndicator();
	});
	
	// Funções auxiliares
	
	function addScriptLoadedIndicator() {
		const containers = document.querySelectorAll('.carmo-bulk-container');
		if (containers.length > 0) {
			containers.forEach(function(container) {
				const indicator = document.createElement('div');
				indicator.style.backgroundColor = '#4CAF50';
				indicator.style.color = 'white';
				indicator.style.padding = '5px';
				indicator.style.marginTop = '10px';
				indicator.style.borderRadius = '4px';
				indicator.style.fontSize = '12px';
				indicator.style.position = 'fixed';
				indicator.style.right = '10px';
				indicator.style.top = '10px';
				indicator.style.zIndex = '9999';
				indicator.textContent = '✓ OrderForm JS ativo';
				container.appendChild(indicator);
				
				// Auto-remover após 5 segundos
				setTimeout(() => {
					indicator.style.display = 'none';
				}, 5000);
			});
		}
	}
	
	function setupQuantityButtons() {
		// Manipulador para os botões de produto
		document.body.addEventListener('click', async function(e) {
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
			if (productButton.classList.contains('product-plus-one')) increment = 1;
			else if (productButton.classList.contains('product-plus-five')) increment = 5;
			else if (productButton.classList.contains('product-plus-ten')) increment = 10;
			
			if (increment > 0) {
				const newValue = currentValue + increment;
				input.value = newValue;
				
				try {
					await handleQuantityChange(input, newValue);
					showNotification('Quantidade atualizada com sucesso');
				} catch (error) {
					showNotification('Erro ao atualizar quantidade', 'error');
					input.value = currentValue; // Reverte para o valor anterior em caso de erro
				}
			}
		});
		
		console.log('Botões de quantidade configurados');
	}
	
	function setupCartHandlers() {
		// Manipulador para o evento keypress nos inputs de quantidade
		document.body.addEventListener('keypress', async function(e) {
			if (e.target.matches('.quantity-input') && e.key === 'Enter') {
				e.preventDefault(); // Previne o comportamento padrão do Enter
				
				const input = e.target;
				const newValue = parseInt(input.value) || 0;
				const oldValue = parseInt(input.dataset.lastValue) || 0;
				
				// Se o valor for zero e existe um cartItemKey, sempre processa
				const cartItemKeyInput = input.closest('tr').querySelector('.cart-item-key');
				const cartItemKey = cartItemKeyInput ? cartItemKeyInput.value : '';
				const forceProcess = newValue === 0 && cartItemKey;
				
				// Processa se o valor mudou OU se estamos forçando a remoção com zero
				if (newValue !== oldValue || forceProcess) {
					try {
						const result = await handleQuantityChange(input, newValue);
						input.dataset.lastValue = newValue;
						if (result && result.removed) {
							showNotification('Produto removido do carrinho');
						} else {
							showNotification('Quantidade atualizada com sucesso');
						}
						input.blur(); // Remove o foco do input
					} catch (error) {
						console.log('Erro no keypress event', error);
						showNotification('Erro ao atualizar quantidade', 'error');
						input.value = oldValue; // Reverte para o valor anterior em caso de erro
					}
				} else {
					input.blur(); // Remove o foco mesmo se não houver mudança
				}
			}
		});
		
		// Também atualizamos o evento change para manter consistência
		document.body.addEventListener('change', async function(e) {
			if (e.target.matches('.quantity-input')) {
				const input = e.target;
				const newValue = parseInt(input.value) || 0;
				const oldValue = parseInt(input.dataset.lastValue) || 0;
				
				const cartItemKeyInput = input.closest('tr').querySelector('.cart-item-key');
				const cartItemKey = cartItemKeyInput ? cartItemKeyInput.value : '';
				const forceProcess = newValue === 0 && cartItemKey;
				
				if (newValue !== oldValue || forceProcess) {
					try {
						const result = await handleQuantityChange(input, newValue);
						input.dataset.lastValue = newValue;
						if (result && result.removed) {
							showNotification('Produto removido do carrinho');
						} else {
							showNotification('Quantidade atualizada com sucesso');
						}
					} catch (error) {
						console.log('Erro no change event', error);
						showNotification('Erro ao atualizar quantidade', 'error');
						input.value = oldValue;
					}
				}
			}
		});
		
		// Atualiza o último valor válido quando o input perde o foco
		document.body.addEventListener('blur', function(e) {
			if (e.target.matches('.quantity-input')) {
				const input = e.target;
				const currentValue = parseInt(input.value) || 0;
				input.dataset.lastValue = currentValue;
			}
		}, true);
		
		// Botão de reset de categoria
		document.body.addEventListener('click', function(e) {
			// Novo listener para o botão de reset de categoria
			if (e.target.matches('.category-reset-button')) {
				const categoryId = e.target.dataset.categoryId;
				console.log('Botão reset clicado', { categoryId });
				
				if (categoryId) {
					resetCategory(categoryId).catch(error => {
						console.log('Erro ao executar resetCategory', error);
					});
				} else {
					console.log('categoryId não encontrado no botão');
				}
			}
		});
		
		console.log('Manipuladores do carrinho configurados');
	}
	
	function handleCategoryApply() {
		const categoryApplyButtons = document.querySelectorAll('.category-apply-button');
		
		console.log(`Encontrados ${categoryApplyButtons.length} botões de aplicar categoria`);
		
		categoryApplyButtons.forEach(button => {
			button.addEventListener('click', function(event) {
				event.preventDefault();
				event.stopPropagation();
				
				const categoryId = this.dataset.categoryId;
				console.log(`Botão de categoria ${categoryId} clicado`);
				
				// Buscar o input de categoria
				let categoryInput = document.querySelector(`.category-quantity-input[data-category-id="${categoryId}"]`);
				
				// Se não encontrou, tenta buscar input próximo ao botão
				if (!categoryInput) {
					const parentElement = this.parentElement;
					if (parentElement) {
						categoryInput = parentElement.querySelector('input[type="number"]');
					}
				}
				
				// Determinar o valor a ser aplicado
				let valueToApply = '1';  // Valor padrão
				
				if (categoryInput && categoryInput.value && categoryInput.value !== '') {
					valueToApply = categoryInput.value;
					console.log(`Valor a ser aplicado: ${valueToApply}`);
				} else {
					console.log(`Nenhum input válido encontrado. Usando valor padrão: ${valueToApply}`);
				}
				
				// Encontrar todos os inputs da categoria
				const categoryInputs = document.querySelectorAll(`.quantity-input[data-category-id="${categoryId}"]`);
				
				if (categoryInputs.length === 0) {
					console.log(`Nenhum input de produto encontrado para a categoria ${categoryId}`);
					alert(`Erro: Não foi possível encontrar produtos para esta categoria (${categoryId})`);
					return;
				}
				
				console.log(`Aplicando valor ${valueToApply} a ${categoryInputs.length} produtos da categoria ${categoryId}`);
				
				// Aplicar o valor a todos os produtos sequencialmente
				applyValueSequentially(Array.from(categoryInputs), 0, valueToApply, categoryId);
			});
		});
	}
	
	/**
	 * Aplica um valor específico a inputs sequencialmente
	 */
	function applyValueSequentially(inputs, index, valueToApply, categoryId) {
		// Se terminou todos os inputs
		if (index >= inputs.length) {
			console.log(`Atualizados ${inputs.length} produtos da categoria ${categoryId}`);
			return;
		}
		
		const input = inputs[index];
		const productId = input.dataset.productId;
		const oldValue = input.value;
		
		console.log(`[${index+1}/${inputs.length}]: Aplicando valor ${valueToApply} ao produto ${productId} (valor anterior: ${oldValue})`);
		
		try {
			// Primeiro definir o valor explicitamente no input
			input.value = valueToApply;
			
			// Depois disparar o evento de mudança
			handleQuantityChange(input, valueToApply);
			
			// Processar o próximo após um pequeno delay
			setTimeout(function() {
				applyValueSequentially(inputs, index + 1, valueToApply, categoryId);
			}, 400);
			
			// Adicionar notificação
			if (index === inputs.length - 1) {
				// Usando o último input como referência para o contêiner do bloco
				showNotification(`Aplicado valor ${valueToApply} a todos os produtos da categoria`, 'success', input);
			}
		} catch (e) {
			console.error(`Erro ao aplicar valor: ${e.message}`);
			showNotification('Erro ao aplicar valor aos produtos', 'error', input);
		}
	}
	
	/**
	 * Reset de categoria
	 */
	async function resetCategory(categoryId) {
		console.log('Iniciando resetCategory', { categoryId });
		
		// Encontra todos os inputs de quantidade para esta categoria
		const categoryInputs = document.querySelectorAll(`.quantity-input[data-category-id="${categoryId}"]`);
		
		if (!categoryInputs.length) {
			console.log('Nenhum produto encontrado na categoria');
			return;
		}
		
		let promises = [];
		let productsRemoved = 0;
		let itemsToRemove = [];
		
		// Primeiro coletamos todos os itens que precisam ser removidos
		for (const input of categoryInputs) {
			const row = input.closest('tr');
			if (!row) continue;
			
			// Zeramos o input de qualquer forma
			input.value = 0;
			input.dataset.lastValue = 0;
			
			// Verifica se existe cartItemKey
			const cartItemKeyInput = row.querySelector('.cart-item-key');
			if (!cartItemKeyInput || !cartItemKeyInput.value) {
				continue; // Não está no carrinho, pula para o próximo
			}
			
			const cartItemKey = cartItemKeyInput.value;
			itemsToRemove.push({
				input: input,
				cartItemKey: cartItemKey,
				cartItemKeyInput: cartItemKeyInput,
				productId: input.dataset.productId
			});
		}
		
		console.log('Itens para remover', itemsToRemove.length);
		
		// Agora removemos um por um, sequencialmente para evitar problemas
		for (const item of itemsToRemove) {
			try {
				console.log('Removendo item do carrinho', item.cartItemKey, 'produto ID:', item.productId);
				await removeFromCart(item.cartItemKey);
				
				// Limpa o cartItemKey
				item.cartItemKeyInput.value = '';
				productsRemoved++;
				
				// Pequena pausa para garantir que o servidor processe cada remoção
				await new Promise(resolve => setTimeout(resolve, 100));
			} catch (error) {
				console.log('Erro ao remover produto', { 
					cartItemKey: item.cartItemKey, 
					productId: item.productId, 
					error 
				});
			}
		}
		
		if (productsRemoved > 0) {
			showNotification(`${productsRemoved} produtos removidos da categoria`);

			const customEvent = new CustomEvent('wc-blocks_added_to_cart');
			document.body.dispatchEvent(customEvent);
		} else {
			showNotification('Nenhum produto no carrinho para remover');
		}
	}
	
	// Funções principais para manipulação do carrinho
	
	function handleQuantityChange(input, newValue) {
		if (!input) {
			return Promise.reject(new Error('Input não encontrado'));
		}
		
		const productId = input.dataset.productId;
		console.log('Alterando quantidade para produto', {
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
		
		// Se a quantidade for zero e temos um cartItemKey, removemos o item
		if (newValue === 0 && cartItemKey) {
			return removeFromCart(cartItemKey).then(() => {
				if (cartItemKeyInput) {
					cartItemKeyInput.value = '';
				}
				return { removed: true };
			});
		}
		
		return updateCart(productId, null, newValue, cartItemKey).then(response => {
			// Atualizar o cartItemKey após o sucesso da operação
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
	
	// Função para remover item do carrinho
	function removeFromCart(cartItemKey) {
		console.log('Removendo item do carrinho', cartItemKey);
		
		return new Promise((resolve, reject) => {
			jQuery.ajax({
				url: '/wp-json/wc/store/v1/cart/items/' + cartItemKey,
				method: 'DELETE',
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-WC-Store-API-Nonce', document.getElementById('carmo-bulk-form').dataset.nonce);
				},
				success: function(response) {
					console.log('Item removido com sucesso', response);
					resolve(response);

					const customEvent = new CustomEvent('wc-blocks_added_to_cart');
					document.body.dispatchEvent(customEvent);
				},
				error: function(error) {
					console.log('Erro ao remover item', error);
					reject(error);
				}
			});
		});
	}
	
	function updateCart(productId, variationId, quantity, cartItemKey) {
		console.log('Iniciando updateCart', {
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
				beforeSend: function(xhr) {
					xhr.setRequestHeader('X-WC-Store-API-Nonce', document.getElementById('carmo-bulk-form').dataset.nonce);
				},
				data: JSON.stringify(data),
				contentType: 'application/json',
				success: function(response) {
					console.log('Sucesso na atualização', response);
					resolve(response);

					const customEvent = new CustomEvent('wc-blocks_added_to_cart');
					document.body.dispatchEvent(customEvent);
				},
				error: function(error) {
					console.log('Erro na atualização', error);
					reject(error);
				}
			};
			
			if (cartItemKey) {
				console.log('Atualizando item existente', cartItemKey);
				jQuery.ajax({
					...ajaxConfig,
					url: '/wp-json/wc/store/v1/cart/items/' + cartItemKey,
					method: 'PUT'
				});
			} else {
				console.log('Adicionando novo item');
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
	 */
	function showNotification(message, type = 'success', triggerElement = null) {
		// Encontrar o bloco que contém o elemento que disparou a ação
		let blockContainer;
		
		if (triggerElement) {
			// Buscar o container de bloco mais próximo
			blockContainer = triggerElement.closest('.carmo-bulk-container');
		}
		
		// Se não encontrou o container a partir do elemento de trigger
		if (!blockContainer) {
			// Tentar usar o elemento atualmente com foco
			const activeElement = document.activeElement;
			if (activeElement) {
				blockContainer = activeElement.closest('.carmo-bulk-container');
			}
		}
		
		// Se ainda não encontrou, tentar o primeiro bloco como fallback
		if (!blockContainer) {
			blockContainer = document.querySelector('.carmo-bulk-container');
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
		}
		
		// Configurar a notificação
		notification.textContent = message;
		notification.className = `carmo-notification ${type}`;
		notification.style.display = 'block';
		
		// Esconder após 3 segundos
		setTimeout(() => {
			notification.style.display = 'none';
		}, 3000);
	}
	
	// Inicializa os valores do carrinho
	function updateQuantitiesFromCart() {
		console.log('Iniciando updateQuantitiesFromCart');
		
		// Usar o endpoint do Store API do WooCommerce
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
				console.log('Resposta da Store API recebida');
				
				// Mapear produtos no carrinho
				const productsInCart = {};
				
				if (response && response.items && Array.isArray(response.items)) {
					console.log('Encontrados', response.items.length, 'itens no carrinho');
					
					response.items.forEach(item => {
						// O ID pode estar em diferentes locais dependendo da estrutura
						const productId = item.id || 
									(item.product_id ? item.product_id.toString() : null) || 
									(item.product && item.product.id ? item.product.id.toString() : null);
						
						if (productId) {
							productsInCart[productId] = {
								quantity: item.quantity,
								key: item.key
							};
						}
					});
				} else {
					console.log('Estrutura de resposta não reconhecida ou carrinho vazio');
				}
				
				// Encontrar todos os inputs de quantidade
				const inputs = document.querySelectorAll('.quantity-input');
				console.log('Total de inputs encontrados', inputs.length);
				
				// Reset todos os inputs primeiro (opção 1: zerar tudo)
				inputs.forEach(function(input) {
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

				const customEvent = new CustomEvent('wc-blocks_added_to_cart');
				document.body.dispatchEvent(customEvent);
			},
			error: function(error) {
				console.log('Erro ao obter carrinho via Store API', error);
				
				// Tenta o método alternativo como fallback
				if (typeof wc_cart_fragments_params !== 'undefined') {
					jQuery.ajax({
						url: wc_cart_fragments_params.wc_ajax_url.toString().replace('%%endpoint%%', 'get_refreshed_fragments'),
						type: 'POST',
						success: function(data) {
							console.log('Fragments obtidos');
							
							// Atualiza os fragmentos
							if (data && data.fragments) {
								jQuery.each(data.fragments, function(key, value) {
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
	
})();
