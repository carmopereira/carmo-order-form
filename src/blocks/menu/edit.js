/**
 * Componente simplificado de edição para o bloco Menu
 */
import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';

const Edit = () => {
    const blockProps = useBlockProps();

    return (
        <div {...blockProps}>
            <h2>Hello World</h2>
        </div>
    );
};

export default Edit; 