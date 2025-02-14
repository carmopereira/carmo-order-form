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

/*
export default function Edit( { attributes, setAttributes } ) {
	const blockProps = useBlockProps();
*/
/*
	return (
		<p { ...blockProps }>
			{ __( 'Carmo Bulk – hello from the editor!', 'carmo-bulk' ) }
		</p>
	);
}
*/

import {PanelBody,SelectControl,CheckboxControl,TextControl} from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { InspectorControls } from '@wordpress/block-editor';

export default function Edit( props ) {
	const { attributes, setAttributes } = props;
	const { selectedCategory, imageWidth, addCartVisible } = attributes;
	const [ products, setProducts ] = useState( [] );

	const categories = useSelect( ( select ) => {
		return select( 'core' ).getEntityRecords( 'taxonomy', 'product_cat', {
			per_page: -1,
		} );
	}, [] );

	useEffect( () => {
		if ( selectedCategory ) {
			fetchProducts( selectedCategory );
		}
	}, [ selectedCategory ] );

	const fetchProducts = ( category ) => {
		wp.apiFetch( {
			path: `/wc/v3/products?category=${ category }`,
		} ).then( ( data ) => {
			setProducts( data );
		} );
	};

	addCartVisible ? console.log('true') : console.log('false');

	return (
		<div { ...useBlockProps() }>
			<InspectorControls>
				<PanelBody title={ __( 'Settings', 'carmo-order-form' ) }>
					<SelectControl
						label={ __( 'Product Category', 'carmo-order-form' ) }
						value={ selectedCategory }
						options={
							categories
								? categories.map( ( category ) => ( {
										label: category.name,
										value: category.id,
								  } ) )
								: []
						}
						onChange={ ( value ) =>
							setAttributes( { selectedCategory: value } )
						}
					/>
					<TextControl
						label={ __(
							'Product Image Width (px)',
							'carmo-order-form'
						) }
						value={ imageWidth }
						onChange={ ( value ) =>
							setAttributes( { imageWidth: value } )
						}
					/>
					<CheckboxControl
						label={ __( 'Add to Cart Visible', 'carmo-order-form' ) }
						checked={ addCartVisible }
						onChange={ ( value ) =>
							setAttributes( { addCartVisible: value } )
						}
					/>
				</PanelBody>
			</InspectorControls>
			<table>
				<thead>
					<tr>
						<th>{ __( 'Image', 'carmo-order-form' ) }</th>
						<th>{ __( 'Name', 'carmo-order-form' ) }</th>
						<th>{ __( 'Quantity', 'carmo-order-form' ) }</th>
						<th>{ __( 'Add to Cart', 'carmo-order-form' ) }</th>
					</tr>
				</thead>
				<tbody>
					{ products.map( ( product ) => (
						<tr key={ product.id }>
							<td>
								<img
									src={ product.images[ 0 ]?.src }
									width={ imageWidth }
									alt={ product.name }
								/>
							</td>
							<td>{ product.name }</td>
							<td>
								<input 
									type="number" 
									min="1" 
									defaultValue="1"
									data-product-id={product.id}
									className="quantity-input"
								/>
							</td>
							<td>
								<button
									className="add-to-cart-button"
									data-product-id={product.id}
									data-wp-on--click="actions.addToCart"
								>
									{ __( 'Add to Cart', 'carmo-order-form' ) }
								</button>
							</td>
						</tr>
					) ) }
				</tbody>
			</table>
		</div>
	);
}
