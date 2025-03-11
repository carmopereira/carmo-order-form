/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @param {Object}   props               Properties passed to the function.
 * @param {Object}   props.attributes    Available block attributes.
 * @param {Function} props.setAttributes Function that updates individual attributes.
 *
 * @return {Element} Element to render.
 */

import {
	PanelBody,
	SelectControl,
	CheckboxControl,
	TextControl,
	ToggleControl
} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';

export default function Edit(props) {
	const { attributes, setAttributes } = props;
	const { selectedCategory, imageWidth, showImages = true } = attributes;
	const [products, setProducts] = useState([]);
	const [categoryName, setCategoryName] = useState('');
	const [parentCategoryName, setParentCategoryName] = useState('');

	// Obter categorias de produtos
	const categories = useSelect((select) => {
		return select('core').getEntityRecords('taxonomy', 'product_cat', {
			per_page: -1,
		});
	}, []);

	useEffect(() => {
		if (selectedCategory) {
			fetchProducts(selectedCategory);
			
			// Atualizar nome da categoria
			if (categories) {
				const category = categories.find(cat => cat.id.toString() === selectedCategory.toString());
				if (category) {
					setCategoryName(category.name);
					
					// Verificar se tem categoria pai
					if (category.parent) {
						const parentCategory = categories.find(cat => cat.id === category.parent);
						if (parentCategory) {
							setParentCategoryName(parentCategory.name);
						}
					}
				}
			}
		}
	}, [selectedCategory, categories]);

	const fetchProducts = (category) => {
		wp.apiFetch({
			path: `/wc/v3/products?category=${category}&per_page=50`,
		}).then((data) => {
			setProducts(data);
		});
	};

	// Função auxiliar para obter o tipo de produto em português
	const getProductTypeLabel = (type) => {
		switch (type) {
			case 'simple':
				return __('Simple', 'carmo-order-form');
			case 'variable':
				return __('Variable', 'carmo-order-form');
			default:
				return type.charAt(0).toUpperCase() + type.slice(1);
		}
	};

	return (
		<div {...useBlockProps()}>
			<InspectorControls>
				<PanelBody title={__('Settings', 'carmo-order-form')}>
					<SelectControl
						label={__('Product Category', 'carmo-order-form')}
						value={selectedCategory}
						options={
							categories
								? categories.map((category) => ({
										label: category.name,
										value: category.id.toString(),
								  }))
								: []
						}
						onChange={(value) =>
							setAttributes({ selectedCategory: value })
						}
					/>
					<ToggleControl
						label={__('Show Images', 'carmo-order-form')}
						checked={showImages}
						onChange={(value) => setAttributes({ showImages: value })}
					/>
					<TextControl
						label={__(
							'Product Image Width (px)',
							'carmo-order-form'
						)}
						value={imageWidth}
						onChange={(value) =>
							setAttributes({ imageWidth: value })
						}
					/>
				</PanelBody>
			</InspectorControls>

			<div className="carmo-bulk-container">
				{selectedCategory && categoryName && (
					<div className="category-header">
						<div className="category-title-wrapper">
							<h3 className="category-title">
								{parentCategoryName && (
									<>
										{parentCategoryName}
										<span className="category-separator"> - </span>
									</>
								)}
								{categoryName}
							</h3>
						</div>
						
						<div className="category-controls">
							<div className="category-input-group">
								<label htmlFor={`category-quantity-${selectedCategory}`}>
									{__('Set all products to:', 'carmo-order-form')}
								</label>
								<input 
									type="number" 
									id={`category-quantity-${selectedCategory}`} 
									className="category-quantity-input" 
									min="0"
									data-category-id={selectedCategory}
								/>
								<button 
									type="button" 
									className="category-apply-button" 
									data-category-id={selectedCategory}
								>
									{__('Apply', 'carmo-order-form')}
								</button>
								<button 
									type="button" 
									className="category-reset-button" 
									data-category-id={selectedCategory}
								>
									{__('Reset Category', 'carmo-order-form')}
								</button>
							</div>
						</div>
					</div>
				)}

				<table className="carmo-order-table">
					<thead>
						<tr>
							{showImages && <th className="product-image"></th>}
							<th className="product-name">{__('Product', 'carmo-order-form')}</th>
							<th className="product-type">{__('Type', 'carmo-order-form')}</th>
							<th className="product-price">{__('Price', 'carmo-order-form')}</th>
							<th className="product-quantity">{__('Quantity', 'carmo-order-form')}</th>
							<th className="product-increment">{__('Add Quantity', 'carmo-order-form')}</th>
						</tr>
					</thead>
					<tbody>
						{products.length > 0 ? (
							products.map((product) => (
								<tr key={product.id} data-product-id={product.id} data-category-id={selectedCategory}>
									{showImages && (
										<td className="product-image">
											<img
												src={product.images[0]?.src || ''}
												alt={product.name}
												className="product-thumbnail"
												style={{ width: `${imageWidth}px` }}
											/>
										</td>
									)}
									<td className="product-name">{product.name}</td>
									<td className="product-type">
										{getProductTypeLabel(product.type)}
									</td>
									<td className="product-price" dangerouslySetInnerHTML={{ __html: product.price_html }} />
									<td className="product-quantity">
										<input
											type="number"
											className="quantity-input"
											data-product-id={product.id}
											data-category-id={selectedCategory}
											defaultValue="0"
											min="0"
										/>
									</td>
									<td className="product-increment">
										<div className="quantity-buttons">
											<button className="quantity-button product-plus-one">+1</button>
											<button className="quantity-button product-plus-five">+5</button>
											<button className="quantity-button product-plus-ten">+10</button>
										</div>
									</td>
								</tr>
							))
						) : (
							<tr>
								<td colSpan={showImages ? 6 : 5} className="no-products">
									{selectedCategory 
										? __('No products found in this category.', 'carmo-order-form')
										: __('Please select a category to display products.', 'carmo-order-form')
									}
								</td>
							</tr>
						)}
					</tbody>
				</table>
				
				<div className="carmo-notification"></div>
			</div>
		</div>
	);
}
