import Head from 'next/head';
import React, { useCallback } from 'react';
import Link from 'next/link';
import BaseLayout from '@/layouts/BaseLayout';
import { Can, withPermissionsSSP } from '@/context/Permissions';
import { Box, Grid, Button, Typography } from '@material-ui/core';
import { useRouter } from 'next/router';
import PartnerHeaderSelect from '@/components/PartnerHeaderSelect';
import { FormattedMessage, useIntl } from 'react-intl';
import { usePermissions } from '@/context/Permissions';
import { useFormContext } from 'react-hook-form';
import { DataPageProvider, useDatePageMode, useDataPageOnCreate } from '@/context/DataPage';
import CS, { Central } from '@/services/central';

import SubmitButton from '@/components/SubmitButton';
import { withSchemaDataBlock, DataBlockContainer } from '@/components/DataBlock';

import DescriptionsBlock from '@/components/DescriptionsBlock';
import { ProductPicturesBlock } from '@/components/ProductPicturesBlock';
import AttachmentsBlock from '@/components/AttachmentsBlock';
import LinksBlock from '@/components/LinksBlock';
import ProductGeneralInformationBlock from '@/components/ProductGeneralInformationBlock';
import ProductPriceBlock from '@/components/ProductPriceBlock';
import ProductAphiveStatusBlock from '@/components/ProductAphiveStatusBlock';
import ProductReferenceBlock from '@/components/ProductReferenceBlock';
import ProductAPIIntegrationBlock from '@/components/ProductAPIIntegrationBlock';
import ProductTagsBlock from '@/components/ProductTagsBlock';
import ProductPRRBlock from '@/components/ProductPRRBlock';
import ProductValidityPeriodBlock from '@/components/ProductValidityPeriodBlock';
import ProductVariantOptionsBlock from '@/components/ProductVariantOptionsBlock';
import ProductVariantsBlock from '@/components/ProductVariantsBlock';
import { ProductMainPictureBlock } from '@/components/ProductMainPictureBlock';
import ProductCollectionBlock from '@/components/ProductCollectionBlock';
import {
  ProductDescriptionsBlockSchema,
  ProductPicturesBlockSchema,
  ProductSchema,
  ProductVariantsSchema,
} from '@/schemas/ProductSchema';
import ProductHeaderSelect from '@/components/ProductHeaderSelect';

const ProductDescriptionsBlock = withSchemaDataBlock(ProductDescriptionsBlockSchema)(
  DescriptionsBlock,
);

export const ProductPage = ({ partner, product }) => {
  const router = useRouter();
  const { canAccess } = usePermissions();
  const mode = useDatePageMode();
  const onSubmit = useDataPageOnCreate();
  const {
    formState: { isSubmitting },
  } = useFormContext();

  return (
    <BaseLayout
      header={
        <Box display="flex" flexDirection="row" alignItems="center">
          <PartnerHeaderSelect
            partner={partner}
            onSelect={(row) => router.push(`/products/${row.partnerId}`)}
          />
          <Box flexGrow={1} />
          {mode === 'create' ? (
            <>
              <SubmitButton
                onClick={onSubmit}
                variant="contained"
                color="success"
                disableElevation
                loading={isSubmitting}
              />

              <Button
                sx={{ marginLeft: 2 }}
                variant="contained"
                color="secondary"
                disableElevation
                disabled={isSubmitting}
                onClick={() => {
                  router.replace('/products');
                }}
              >
                <FormattedMessage defaultMessage="Cancel" />
              </Button>
            </>
          ) : (
            <>
              <Button
                sx={{ marginLeft: 2 }}
                color="default"
                variant="contained"
                disableElevation
                disabled={!canAccess('product-create-button')}
                onClick={() => router.push(`/products/${partner.partnerId}/create`)}
              >
                <FormattedMessage defaultMessage="Create Product" />
              </Button>
            </>
          )}
        </Box>
      }
    >
      {mode !== 'create' && (
        <Box display="flex" flexDirection="row" alignItems="center">
          {product && <ProductHeaderSelect value={product} filters={partner} />}
          <Box flexGrow={1} />
        </Box>
      )}
      <Box mt={2}>
        <Grid container spacing={2}>
          {mode === 'create' && (
            <Grid item xs={12}>
              <Typography variant="h6">
                <FormattedMessage
                  defaultMessage="Creating Product for {partnerName}"
                  values={{
                    partnerName: (
                      <Link href={`/partners/${partner.name}`}>
                        <a>{partner.name}</a>
                      </Link>
                    ),
                  }}
                />
              </Typography>
            </Grid>
          )}
          <Can view="product-general">
            <Grid item xs={12} md={4}>
              <ProductGeneralInformationBlock />
            </Grid>
          </Can>
          <Can view="product-price">
            <Grid item sm={12} md={8}>
              <ProductPriceBlock />
            </Grid>
          </Can>
          <ProductValidityPeriodBlock />
          <Can view="product-shopkoin-status">
            <Grid item sm={12} md={4}>
              <ProductAphiveStatusBlock />
            </Grid>
          </Can>
          <Can view="product-reference">
            <Grid item sm={12} md={4}>
              <ProductReferenceBlock />
            </Grid>
          </Can>
          <Can view="descriptions">
            <Grid item sm={12} md={4}>
              <ProductDescriptionsBlock entity="products" />
            </Grid>
          </Can>
          <Can view="product-tags">
            <Grid item sm={12} md={4}>
              <ProductTagsBlock />
            </Grid>
          </Can>
          <Can view="pictures">
            <DataBlockContainer schema={ProductPicturesBlockSchema}>
              <Grid item sm={12} md={4}>
                <ProductMainPictureBlock />
              </Grid>
              <Grid item sm={12} md={4}>
                <ProductPicturesBlock />
              </Grid>
            </DataBlockContainer>
          </Can>
          <Can view="product-collection">
            <Grid item sm={12} md={4}>
              <ProductCollectionBlock />
            </Grid>
          </Can>
          <Can view="fees">
            <Grid item sm={12} md={4}>
              <ProductPRRBlock />
            </Grid>
          </Can>
          <Can view="attachments">
            <Grid item sm={12} md={4}>
              <AttachmentsBlock entity="products" />
            </Grid>
          </Can>
          <Can view="links">
            <Grid item sm={12} md={4}>
              <LinksBlock entity="products" />
            </Grid>
          </Can>
          <Can view="product-api">
            <Grid item sm={12} md={4}>
              <ProductAPIIntegrationBlock />
            </Grid>
          </Can>
          <DataBlockContainer schema={ProductVariantsSchema}>
            <Grid item container xs={12} spacing={2}>
              <Grid item sm={12} md={4}>
                <ProductVariantOptionsBlock />
              </Grid>
            </Grid>
            <Grid item xs={12} spacing={2}>
              <ProductVariantsBlock />
            </Grid>
          </DataBlockContainer>
        </Grid>
      </Box>
    </BaseLayout>
  );
};

export default function Page(props) {
  const intl = useIntl();
  const { query } = useRouter();
  const onBlockSave = useCallback(
    async (data, family) => CS.updateProductBlock(query.partnerId, query.productId, family, data),
    [query.partnerId, query.productId],
  );
  return (
    <DataPageProvider
      mode="edit"
      schema={ProductSchema}
      data={props.product}
      onBlockSave={onBlockSave}
    >
      <ProductPage {...props} />
      <Head>
        <title>
          {intl.formatMessage(
            { defaultMessage: '{productName} | Shopkoin Dashboard' },
            props.product,
          )}
        </title>
      </Head>
    </DataPageProvider>
  );
}

export const getServerSideProps = withPermissionsSSP((context) => ({
  name: 'product',
  objects: [{ type: 'partner', id: context.params.partnerId }],
}))(async (context) => {
  let CS = new Central({
    baseURL: process.env.NEXT_PUBLIC_DASHBOARD_SERVER,
    headers: context.req.headers,
  });

  let [partner, product] = await Promise.all([
    CS.partner(context.query.partnerId),
    CS.product(context.query.partnerId, context.query.productId),
  ]);

  if (partner.partnerId !== product.partnerId) {
    return {
      redirect: {
        destination: '/404',
        permanent: false,
      },
    };
  }

  return {
    props: {
      partner,
      product: JSON.parse(JSON.stringify(product)),
    },
  };
});
