import Head from 'next/head';
import { useMemo, useEffect, useState } from 'react';
import BaseLayout from '@/layouts/BaseLayout';
import { withPermissionsSSP } from '@/context/Permissions';
import {
  Box,
  Grid,
  TextField,
  Autocomplete,
  Button,
  IconButton,
  Chip,
  Stack,
} from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { FormattedMessage, useIntl } from 'react-intl';

import PartnerHeaderSelect from '@/components/PartnerHeaderSelect';
import SearchFilter from '@/components/SearchFilter';
import DataLabel from '@/components/DataLabel';
import PoSDataGridSelect from '@/components/PoSDataGridSelect';
import CreateProductDialog from '@/components/CreateProductDialog';
import ProductsBulkUpdateDialog from '@/components/ProductsBulkUpdateDialog';
import { useRouter } from 'next/router';
import { Can, usePermissions } from '@/context/Permissions';
import { XGrid } from '@material-ui/x-grid';
import { Central } from '@/services/central';
import useGridData from '@/hooks/useGridData';
import productTypes from '@/data/productTypes';
import productCategories from '@/data/productCategories';
import productStatuses from '@/data/productStatuses';
import shopkoinReviewStatuses from '@/data/shopkoinReviewStatuses';
import { useRefDataOptions } from '@/hooks/useRefDataConfig';

import BooleanChip, { BOOLEAN_FILTER_OPTIONS } from '@/components/BooleanChip';
import { useXGridStyles } from '@/components/XGridCommonStyles';

export default function ProductsPage({ partner }) {
  const intl = useIntl();
  const router = useRouter();
  const { canAccess, canView } = usePermissions();
  const filters = useMemo(() => ({ partnerId: partner.partnerId }), [partner.partnerId]);
  const grid = useGridData('/api/admin/paged_list/admin_products', {
    pageSize: 50,
    orderBy: 'productId',
    sortDirection: 'desc',
    filters,
  });

  const onFilterChange = (data) => {
    let update = {};
    for (let [k, v] of Object.entries(data)) {
      let value = v ?? undefined;
      if (value === '') {
        value = undefined;
      }
      if (grid.filters[k] != value) {
        update[k] = value;
      }
    }
    if (Object.keys(update).length > 0) {
      grid.setFilters({ ...grid.filters, ...update });
    }
  };
  const [isBulkUpdateDialogVisible, setIsBulkUpdateDialogVisible] = useState(false);
  const [selectedProductsIds, setSelectedProductsIds] = useState([]);
  const [isCreateProductDialogOpen, setIsCreateProductDialogOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const gridFilters = grid.filters;
  const setGridFilters = grid.setFilters;
  useEffect(() => {
    if (gridFilters.pointOfSaleId !== pos?.pointOfSaleId) {
      setGridFilters({ ...gridFilters, ...{ pointOfSaleId: pos?.pointOfSaleId || undefined } });
    }
  }, [pos?.pointOfSaleId, setGridFilters, gridFilters]);

  const availableProductTypes = useRefDataOptions({
    entity: 'products',
    key: 'types',
    options: productTypes,
  });

  const availableProductCategories = useRefDataOptions({
    entity: grid.filters.productType || 'experience',
    key: 'categories',
    options: productCategories,
  });

  const availableShopkoinReviewStatuses = useRefDataOptions({
    entity: 'products',
    key: 'shopkoinReviewStatus',
    options: shopkoinReviewStatuses,
  });

  const XGridStyles = useXGridStyles();

  useEffect(() => {
    setSelectedProductsIds((state) => {
      const currentProductIds = grid.data.map((i) => i.productId);
      return state.filter((i) => currentProductIds.includes(i));
    });
  }, [grid.data, setSelectedProductsIds]);

  return (
    <BaseLayout
      header={
        <Box display="flex" flexDirection="row" alignItems="center">
          <PartnerHeaderSelect
            partner={partner}
            onSelect={(item) => router.push(`/products/${item.partnerId}`)}
          />
          <Box flexGrow={1} />
          {partner && (
            <Can view="product-create-button">
              <Button
                sx={{ marginLeft: 2 }}
                color="default"
                variant="contained"
                disableElevation
                disabled={!canAccess('product-create-button')}
                onClick={() => setIsCreateProductDialogOpen(true)}
              >
                <FormattedMessage defaultMessage="Create Product" />
              </Button>
            </Can>
          )}
        </Box>
      }
    >
      <Head>
        <title>{intl.formatMessage({ defaultMessage: 'Products | Shopkoin Dashboard' })}</title>
      </Head>
      <Box mt={2}>
        <Grid container spacing={2}>
          <Grid container item xs={12} lg={10} spacing={2}>
            <Grid item xs={12} sm={12} md={3} lg={3}>
              <SearchFilter
                onChange={(event) => grid.setSearch(event.target.value)}
                onBlur={(event) => grid.setSearch(event.target.value)}
                onClear={() => grid.setSearch('')}
              />
            </Grid>
            <Grid item container xs={12} sm={12} md={3} lg={3} spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={availableProductTypes.options}
                  loading={availableProductTypes.loading}
                  getOptionLabel={(option) => option.label?.props?.defaultMessage}
                  renderInput={(params) => (
                    <TextField
                      label={<FormattedMessage defaultMessage="Product Type" />}
                      variant="outlined"
                      {...params}
                    />
                  )}
                  value={
                    grid.filters.productType
                      ? availableProductTypes.options.find(
                          (option) => option.value === grid.filters.productType,
                        )
                      : null
                  }
                  onChange={(event, option) =>
                    onFilterChange({ productType: option?.value, category: null })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  disabled={!grid.filters.productType}
                  options={
                    grid.filters.productType
                      ? availableProductCategories.options
                      : productCategories
                  }
                  loading={availableProductCategories.loading}
                  getOptionLabel={(option) => option.label?.props?.defaultMessage}
                  renderInput={(params) => (
                    <TextField
                      label={<FormattedMessage defaultMessage="Product Category" />}
                      variant="outlined"
                      {...params}
                    />
                  )}
                  value={
                    grid.filters.category
                      ? productCategories.find((option) => option.value === grid.filters.category)
                      : null
                  }
                  onChange={(event, option) => onFilterChange({ category: option?.value })}
                />
              </Grid>
            </Grid>

            <Grid item container xs={12} sm={12} md={3} lg={3} spacing={2}>
              <Grid item xs={12}>
                <Autocomplete
                  options={BOOLEAN_FILTER_OPTIONS}
                  getOptionLabel={(option) => option.label?.props?.defaultMessage}
                  renderInput={(params) => (
                    <TextField
                      label={<FormattedMessage defaultMessage="Visible" />}
                      variant="outlined"
                      {...params}
                    />
                  )}
                  value={
                    BOOLEAN_FILTER_OPTIONS.find(
                      (option) => option.value === grid.filters.shopkoinVisible,
                    ) ?? null
                  }
                  onChange={(event, option) => onFilterChange({ shopkoinVisible: option?.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={BOOLEAN_FILTER_OPTIONS}
                  getOptionLabel={(option) => option.label?.props?.defaultMessage}
                  renderInput={(params) => (
                    <TextField
                      label={<FormattedMessage defaultMessage="Purchasable" />}
                      variant="outlined"
                      {...params}
                    />
                  )}
                  value={
                    BOOLEAN_FILTER_OPTIONS.find(
                      (option) => option.value === grid.filters.shopkoinPurchasable,
                    ) ?? null
                  }
                  onChange={(event, option) =>
                    onFilterChange({ shopkoinPurchasable: option?.value })
                  }
                />
              </Grid>
            </Grid>
            <Grid item xs={12} sm={12} md={3} lg={3} container spacing={2}>
              <Grid item xs={12}>
                <Box display="flex" alignItems="center">
                  <PoSDataGridSelect
                    buttonText={
                      pos ? (
                        <>
                          {pos.pointOfSaleName} ({pos.pointOfSaleId})
                        </>
                      ) : (
                        <FormattedMessage defaultMessage="Select PoS" />
                      )
                    }
                    color="default"
                    onSelect={(item) => setPos(item)}
                    filters={partner ? { partnerId: partner.partnerId } : {}}
                  />
                  <Box>
                    {pos && (
                      <IconButton
                        sx={{ flex: 0 }}
                        aria-label="clear"
                        color="default"
                        onClick={() => setPos(null)}
                      >
                        <Icons.Clear />
                      </IconButton>
                    )}
                  </Box>
                </Box>
              </Grid>
              <Grid item xs={12}>
                <Autocomplete
                  options={
                    grid.filters.productType
                      ? availableShopkoinReviewStatuses.options
                      : shopkoinReviewStatuses
                  }
                  loading={availableShopkoinReviewStatuses.loading}
                  getOptionLabel={(option) => option.label?.props?.defaultMessage}
                  renderInput={(params) => (
                    <TextField
                      label={<FormattedMessage defaultMessage="Shopkoin Review Status" />}
                      variant="outlined"
                      {...params}
                    />
                  )}
                  value={
                    grid.filters.shopkoinReviewStatus
                      ? shopkoinReviewStatuses.find(
                          (option) => option.value === grid.filters.shopkoinReviewStatus,
                        )
                      : null
                  }
                  onChange={(event, option) =>
                    onFilterChange({ shopkoinReviewStatus: option?.value })
                  }
                />
              </Grid>
            </Grid>
            <Grid item container xs={12} sm={12} md={3} lg={3} spacing={2}>
              <Grid item xs={12}></Grid>
              <Grid item xs={12}></Grid>
            </Grid>
          </Grid>
          <Grid item xs={12} md={12} lg={2}>
            <Stack spacing={1}>
              <Button
                variant="contained"
                color="default"
                fullWidth
                onClick={() => {
                  grid.setSearch('');
                  grid.setFilters({});
                  setPos(null);
                }}
              >
                <FormattedMessage defaultMessage="Clear" />
              </Button>
              <Can view="product-bulk-update">
                <Button
                  variant="contained"
                  fullWidth
                  disabled={!canAccess('product-bulk-update') || selectedProductsIds.length < 2}
                  onClick={() => {
                    setIsBulkUpdateDialogVisible(true);
                  }}
                >
                  <FormattedMessage defaultMessage="Bulk update" />
                </Button>
              </Can>
            </Stack>
          </Grid>
          <Grid item xs={12} height="calc(100vh - 220px)">
            <XGrid
              getRowId={(row) => row.productId}
              loading={grid.loading}
              error={grid.error}
              rows={grid.data}
              rowCount={grid.rowCount}
              onRowClick={(data, event) => {
                // A bit hacky way to separate cell clicks from button or link clicks.
                if (event.target?.getAttribute?.('role') === 'cell') {
                  router.push(`/products/${partner.partnerId}/${data.row.productId}`);
                }
              }}
              checkboxSelection={canView('product-bulk-update')}
              getRowClassName={() => XGridStyles.rowPoinerCursor}
              page={grid.pageIndex - 1}
              pageSize={grid.pageSize}
              disableColumnMenu
              disableDensitySelector
              disableExtendRowFullWidth
              disableMultipleColumnsSorting
              disableSelectionOnClick
              disableMultipleSelection
              onPageChange={({ page }) => grid.setPageIndex(page + 1)}
              onPageSizeChange={({ pageSize }) => grid.setRowsPerPage(pageSize)}
              sortModel={[{ field: grid.orderBy, sort: grid.sortDirection }]}
              onSelectionModelChange={({ selectionModel }) => {
                setSelectedProductsIds(selectionModel ?? []);
              }}
              onSortModelChange={({ sortModel }) => {
                if (Array.isArray(sortModel) && sortModel.length > 0) {
                  grid.setSort({ orderBy: sortModel[0].field, sortDirection: sortModel[0].sort });
                }
              }}
              pagination
              paginationMode="server"
              rowsPerPageOptions={[50, 100, 500]}
              sortingMode="server"
              sortingOrder={['asc', 'desc']}
              columns={[
                {
                  field: 'productId',
                  headerName: <FormattedMessage defaultMessage="ID" />,
                  width: 85,
                },
                {
                  field: 'productName',
                  headerName: <FormattedMessage defaultMessage="Name" />,
                  flex: 1,
                },
                {
                  field: 'productType',
                  headerName: <FormattedMessage defaultMessage="Type" />,
                  flex: 0.5,
                  renderCell({ value }) {
                    return <DataLabel options={productTypes} value={value} />;
                  },
                },
                {
                  field: 'category',
                  headerName: <FormattedMessage defaultMessage="Category" />,
                  flex: 0.5,
                  renderCell({ value }) {
                    return <DataLabel options={productCategories} value={value} />;
                  },
                },
                {
                  field: 'collectionName',
                  headerName: <FormattedMessage defaultMessage="Collection" />,
                  flex: 0.5,
                },
                {
                  field: 'productStatus',
                  headerName: <FormattedMessage defaultMessage="Status" />,
                  flex: 0.5,
                  renderCell({ value }) {
                    return <DataLabel chip options={productStatuses} value={value} />;
                  },
                },
                {
                  field: 'sku',
                  headerName: <FormattedMessage defaultMessage="SKU" />,
                  flex: 0.5,
                },
                {
                  field: 'shopkoinReviewStatus',
                  headerName: <FormattedMessage defaultMessage="Shopkoin Review Status" />,
                  width: 180,
                  renderCell({ value }) {
                    return <DataLabel options={shopkoinReviewStatuses} value={value} />;
                  },
                },
                {
                  field: 'shopkoinVisible',
                  headerName: <FormattedMessage defaultMessage="Visible" />,
                  flex: 0.3,
                  renderCell({ value }) {
                    return <BooleanChip value={value} />;
                  },
                },
                {
                  field: 'shopkoinPurchasable',
                  headerName: <FormattedMessage defaultMessage="Purchasable" />,
                  flex: 0.35,
                  renderCell({ value }) {
                    return <BooleanChip value={value} />;
                  },
                },
              ]}
            />
          </Grid>
        </Grid>
      </Box>
      {isCreateProductDialogOpen && (
        <CreateProductDialog
          partner={partner}
          open={isCreateProductDialogOpen}
          onClose={() => setIsCreateProductDialogOpen(false)}
        />
      )}

      {isBulkUpdateDialogVisible && (
        <ProductsBulkUpdateDialog
          products={selectedProductsIds.map((id) => grid.data.find((i) => i.productId === id))}
          partner={partner}
          open={isBulkUpdateDialogVisible}
          onClose={() => setIsBulkUpdateDialogVisible(false)}
          onSubmitSuccess={() => {
            grid.load();
          }}
        />
      )}
    </BaseLayout>
  );
}

export const getServerSideProps = withPermissionsSSP((context) => ({
  name: 'products',
  objects: [{ type: 'partner', id: context.params.partnerId }],
}))(async (context) => {
  const CS = new Central({
    baseURL: process.env.NEXT_PUBLIC_DASHBOARD_SERVER,
    headers: context.req.headers,
  });
  const [partner] = await Promise.all([CS.partner(context.query.partnerId)]);
  return {
    props: {
      partner,
    },
  };
});
