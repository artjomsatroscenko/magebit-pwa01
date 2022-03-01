import React, {Fragment, Suspense} from 'react';
import {FormattedMessage, useIntl} from 'react-intl';
import {arrayOf, bool, number, shape, string} from 'prop-types';
import {Form} from 'informed';
import {Info} from 'react-feather';

import Price from '@magento/venia-ui/lib/components/Price';
import {useProductFullDetail} from '@magento/peregrine/lib/talons/ProductFullDetail/useProductFullDetail';
import {isProductConfigurable} from '@magento/peregrine/lib/util/isProductConfigurable';

import {useStyle} from '../../../../../node_modules/@magento/venia-ui/lib/classify.js';
import Breadcrumbs
    from '../../../../../node_modules/@magento/venia-ui/lib/components/Breadcrumbs/index.js';
import Button from '../../../../../node_modules/@magento/venia-ui/lib/components/Button/index.js';
import Carousel
    from '../../../../../node_modules/@magento/venia-ui/lib/components/ProductImageCarousel/index.js';
import FormError
    from '../../../../../node_modules/@magento/venia-ui/lib/components/FormError/index.js';
import {
    QuantityFields
} from '@magento/venia-ui/lib/components/CartPage/ProductListing/quantity';
import RichContent
    from '../../../../../node_modules/@magento/venia-ui/lib/components/RichContent/richContent.js';
import {
    ProductOptionsShimmer
} from '../../../../../node_modules/@magento/venia-ui/lib/components/ProductOptions/index.js';
import CustomAttributes from './CustomAttributes';
import defaultClasses from './productFullDetail.module.css';
import CmsBlock from '@magento/venia-ui/lib/components/CmsBlock';
import {TabGroup} from '../../../../components/Tabs/tabs';

const Options = React.lazy(() => import('../../../../../node_modules/@magento/venia-ui/lib/components/ProductOptions/index.js'));

// Correlate a GQL error message to a field. GQL could return a longer error
// string but it may contain contextual info such as product id. We can use
// parts of the string to check for which field to apply the error.
const ERROR_MESSAGE_TO_FIELD_MAPPING = {
    'The requested qty is not available': 'quantity',
    'Product that you are trying to add is not available.': 'quantity',
    "The product that was requested doesn't exist.": 'quantity'
};

// Field level error messages for rendering.
const ERROR_FIELD_TO_MESSAGE_MAPPING = {
    quantity: 'The requested quantity is not available.'
};

const ProductFullDetail = props => {
    const {product} = props;

    const talonProps = useProductFullDetail({product});

    const {
        breadcrumbCategoryId,
        errorMessage,
        handleAddToCart,
        handleSelectionChange,
        isOutOfStock,
        isAddToCartDisabled,
        isSupportedProductType,
        mediaGalleryEntries,
        productDetails,
        customAttributes,
    } = talonProps;
    const {formatMessage} = useIntl();

    const classes = useStyle(defaultClasses, props.classes);

    const options = isProductConfigurable(product) ? (
        <Suspense fallback={<ProductOptionsShimmer/>}>
            <Options
                onSelectionChange={handleSelectionChange}
                options={product.configurable_options}
            />
        </Suspense>
    ) : null;

    const breadcrumbs = breadcrumbCategoryId ? (
        <Breadcrumbs
            categoryId={breadcrumbCategoryId}
            currentProduct={productDetails.name}
        />
    ) : null;

    // Fill a map with field/section -> error.
    const errors = new Map();
    if (errorMessage) {
        Object.keys(ERROR_MESSAGE_TO_FIELD_MAPPING).forEach(key => {
            if (errorMessage.includes(key)) {
                const target = ERROR_MESSAGE_TO_FIELD_MAPPING[key];
                const message = ERROR_FIELD_TO_MESSAGE_MAPPING[target];
                errors.set(target, message);
            }
        });

        // Handle cases where a user token is invalid or expired. Preferably
        // this would be handled elsewhere with an error code and not a string.
        if (errorMessage.includes('The current user cannot')) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorToken',
                        defaultMessage:
                            'There was a problem with your cart. Please sign in again and try adding the item once more.'
                    })
                )
            ]);
        }

        // Handle cases where a cart wasn't created properly.
        if (
            errorMessage.includes('Variable "$cartId" got invalid value null')
        ) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorCart',
                        defaultMessage:
                            'There was a problem with your cart. Please refresh the page and try adding the item once more.'
                    })
                )
            ]);
        }

        // An unknown error should still present a readable message.
        if (!errors.size) {
            errors.set('form', [
                new Error(
                    formatMessage({
                        id: 'productFullDetail.errorUnknown',
                        defaultMessage:
                            'Could not add item to cart. Please check required options and try again.'
                    })
                )
            ]);
        }
    }

    const cartCallToActionText = !isOutOfStock ? (
        <FormattedMessage
            id="productFullDetail.addItemToCart"
            defaultMessage="Add to Cart"
        />
    ) : (
        <FormattedMessage
            id="productFullDetail.itemOutOfStock"
            defaultMessage="Out of Stock"
        />
    );

    const cartActionContent = isSupportedProductType ? (
        <Button
            data-cy="ProductFullDetail-addToCartButton"
            disabled={isAddToCartDisabled}
            priority="high"
            type="submit"
        >
            {cartCallToActionText}
        </Button>
    ) : (
        <div className={classes.unavailableContainer}>
            <Info/>
            <p>
                <FormattedMessage
                    id={'productFullDetail.unavailableProduct'}
                    defaultMessage={
                        'This product is currently unavailable for purchase.'
                    }
                />
            </p>
        </div>
    );

    return (
        <Fragment>
            {breadcrumbs}
            <Form
                className={classes.root}
                data-cy="ProductFullDetail-root"
                onSubmit={handleAddToCart}
            >
                <section className={classes.title}>
                    <h1
                        className={classes.productName}
                        data-cy="ProductFullDetail-productName"
                    >
                        {productDetails.name}
                    </h1>
                    <p className={classes.productPrice}>
                        <Price
                            currencyCode={productDetails.price.currency}
                            value={productDetails.price.value}
                        />
                    </p>
                </section>
                <section className={classes.longDescription}>
                    <div className={classes.longDescriptionBox}>
                        <RichContent html={productDetails.description}/>
                    </div>
                </section>

                <CmsBlock
                    identifiers={'shipping-block'}
                    classes={{
                        block: null,
                        content: null,
                        root: classes.shipping
                    }}
                />


                <section className={classes.imageCarousel}>
                    <Carousel images={mediaGalleryEntries}/>
                </section>
                <FormError
                    classes={{
                        root: classes.formErrors
                    }}
                    errors={errors.get('form') || []}
                />
                <section className={classes.options}>{options}</section>
                <section className={classes.quantity}>
                    <QuantityFields
                        classes={{root: classes.quantityRoot}}
                        min={1}
                        message={errors.get('quantity')}
                    />
                </section>
                <section className={classes.actions}>
                    {cartActionContent}
                </section>
                {/*<section className={classes.description}>*/}
                {/*    <span className={classes.descriptionTitle}>*/}
                {/*        <FormattedMessage*/}
                {/*            id={'productFullDetail.productDescription'}*/}
                {/*            defaultMessage={'Product Description'}*/}
                {/*        />*/}
                {/*    </span>*/}
                {/*    <RichContent html={product.short_description.html} />*/}
                {/*</section>*/}

                <section className={classes.tabsContainer}>
                    <TabGroup
                        descName={'tab1'}
                        descLabel={'Description'}
                        descContent={
                            <section className={classes.description}>
                                <span className={classes.descriptionTitle}>
                                    <FormattedMessage
                                        id={'productFullDetail.productDescription'}
                                        defaultMessage={'Product Description'}
                                    />
                                </span>
                                <RichContent html={product.short_description.html}/>
                            </section>
                        }
                        attrName={'tab2'}
                        attrLabel={'Attributes'}
                        attrContent={
                            <section className={classes.details}>
                                <span className={classes.detailsTitle}>
                                    <FormattedMessage
                                        id={'global.sku'}
                                        defaultMessage={'SKU'}
                                    />
                                </span>
                                <strong>{productDetails.sku}</strong>
                                <CustomAttributes customAttributes={customAttributes} />
                            </section>
                        }
                    />
                </section>

                {/*<section className={classes.details}>*/}
                {/*    <span className={classes.detailsTitle}>*/}
                {/*        <FormattedMessage*/}
                {/*            id={'global.sku'}*/}
                {/*            defaultMessage={'SKU'}*/}
                {/*        />*/}
                {/*    </span>*/}
                {/*    <strong>{productDetails.sku}</strong>*/}
                {/*    <CustomAttributes customAttributes={customAttributes} />*/}
                {/*</section>*/}
            </Form>
        </Fragment>
    );
};

ProductFullDetail.propTypes = {
    classes: shape({
        cartActions: string,
        description: string,
        descriptionTitle: string,
        details: string,
        detailsTitle: string,
        imageCarousel: string,
        options: string,
        productName: string,
        productPrice: string,
        quantity: string,
        quantityTitle: string,
        root: string,
        title: string,
        unavailableContainer: string
    }),
    product: shape({
        __typename: string,
        id: number,
        stock_status: string,
        sku: string.isRequired,
        price: shape({
            regularPrice: shape({
                amount: shape({
                    currency: string.isRequired,
                    value: number.isRequired
                })
            }).isRequired
        }).isRequired,
        media_gallery_entries: arrayOf(
            shape({
                uid: string,
                label: string,
                position: number,
                disabled: bool,
                file: string.isRequired
            })
        ),
        description: string,
    }).isRequired
};

export default ProductFullDetail;
