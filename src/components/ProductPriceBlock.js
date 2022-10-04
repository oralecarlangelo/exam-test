import DataBlock, {
  ControlledInput,
  DataBlockTitle,
  withSchemaDataBlock,
} from '@/components/DataBlock';
import { Can, usePermissions } from '@/context/Permissions';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
} from '@material-ui/core';
import React, { useCallback, useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { useConfirm } from '@/context/Confirm';
import { useDataPageData, useDataPageEditingState } from '@/context/DataPage';
import {
  PriceDefinitionObjectSchema,
  ProductPriceDefinitionBLockSchema,
} from '@/schemas/ProductSchema';
import CS from '@/services/central';
import { mapPriceDefinition } from '@/utils/mapPriceDefinition';
import { yupResolver } from '@hookform/resolvers/yup';
import { Delete } from '@material-ui/icons';
import { chain } from 'lodash';
import { useForm, useFormContext } from 'react-hook-form';

const currencySymbols = {
  usd: '$',
  eur: '€',
  gbp: '£',
};

const FormDialog = ({ onDialogSubmit, onDialogClose, isOpen }) => {
  const { handleSubmit, control, reset } = useForm({
    resolver: yupResolver(PriceDefinitionObjectSchema),
    defaultValues: {
      isChecked: false,
      price: '',
      normalPrice: '',
      vatRate: '',
    },
    mode: 'onChange',
  });

  const handleClose = () => {
    reset();
    onDialogClose();
  };

  const onSubmit = (data) => {
    const { price, normalPrice } = data;
    if (!price && normalPrice) {
      data.price = normalPrice;
    }
    if (!normalPrice && price) {
      data.normalPrice = price;
    }
    onDialogSubmit(data);
    handleClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle id="form-dialog-title">Price definition</DialogTitle>
      <DialogContent>
        <Grid container spacing={1} alignItems="flex-start" pt={2}>
          <Grid item md={4}>
            <ControlledInput
              name="price"
              label="Price"
              type="number"
              control={control}
              inputProps={{ min: 0, step: 0.01 }}
              editing
            />
          </Grid>
          <Grid item md={4}>
            <ControlledInput
              name="normalPrice"
              label="Normal price"
              type="number"
              control={control}
              inputProps={{ min: 0, step: 0.01 }}
              editing
            />
          </Grid>
          <Grid item md={4}>
            <ControlledInput
              name="vatRate"
              label="VAT rate(%)"
              type="number"
              control={control}
              inputProps={{ min: 0, max: 99.99, step: 0.01 }}
              editing
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSubmit(onSubmit)} color="primary">
          Confirm
        </Button>
        <Button onClick={handleClose} color="primary">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const FormPriceDefinition = ({ editing, disabled, regionList }) => {
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [selectedList, setSelectedList] = useState([]);
  const [isCheckboxChange, setIsCheckboxChange] = useState(false);

  const {
    register,
    setValue,
    getValues,
    formState: { isSubmitting },
  } = useFormContext();
  const { confirm } = useConfirm();

  const clearFormField = (key) => {
    setValue(`priceDefinition.${key}.normalPrice`, '');
    setValue(`priceDefinition.${key}.price`, '');
    setValue(`priceDefinition.${key}.vatRate`, '');
    setValue(`priceDefinition.${key}.isChecked`, false);
  };

  const clearData = async (key) => {
    if (selectedList.length <= 1) {
      clearFormField(key);
      return;
    }

    const isConfirm = await confirm(
      <FormattedMessage defaultMessage="Are you sure you want to clear data for all selected regions?" />,
      {
        title: <FormattedMessage defaultMessage="Please choose" />,
        confirmButtonText: <FormattedMessage defaultMessage="Confirm" />,
        dismissButtonText: <FormattedMessage defaultMessage="Cancel" />,
      },
    );

    if (isConfirm) {
      selectedList.forEach((e) => {
        clearFormField(e);
      });
      setSelectedList([]);
    }
  };

  const onCheckboxChange = (e, { currency, level }) => {
    const isChecked = e.target.checked;
    setIsCheckboxChange(!isCheckboxChange);

    regionList.forEach((e) => {
      if (isChecked && e.currency === currency && e.level > level) {
        setValue(`priceDefinition.region_${e.region}.isChecked`, isChecked);
      }

      if (isChecked && e.currency !== currency) {
        setValue(`priceDefinition.region_${e.region}.isChecked`, false);
      }
    });
  };

  const onDialogClose = () => {
    setIsOpenDialog(false);
  };
  const onDialogSubmit = (data) => {
    const { price, normalPrice, vatRate, isChecked } = data;
    selectedList.forEach((e) => {
      setValue(`priceDefinition.${e}.price`, price);
      setValue(`priceDefinition.${e}.normalPrice`, normalPrice);
      setValue(`priceDefinition.${e}.vatRate`, vatRate);
      setValue(`priceDefinition.${e}.isChecked`, isChecked);
    });
    setSelectedList([]);
  };

  const onInputClick = () => {
    if (selectedList.length > 1) {
      setIsOpenDialog(true);
    }
  };

  useEffect(() => {
    const priceDefinitionForm = getValues('priceDefinition');
    if (priceDefinitionForm) {
      let checkedList = [];
      for (const [key, value] of Object.entries(priceDefinitionForm)) {
        if (value.isChecked) {
          checkedList.push(key);
        }
      }
      setSelectedList(checkedList);
    }
  }, [isCheckboxChange, getValues]);

  useEffect(() => {
    return () => {
      setIsOpenDialog(false);
    };
  }, []);

  return (
    <Box width="100%" overflow="auto" maxHeight={!editing && 240}>
      <Grid container spacing={1} alignItems="center">
        <Grid item md={0.5} />
        <Grid item md={2.75}>
          <FormattedMessage defaultMessage="Region / Country" />
          <FormDialog
            isOpen={isOpenDialog}
            onDialogClose={onDialogClose}
            onDialogSubmit={onDialogSubmit}
          />
        </Grid>
        <Grid item md={2.75}>
          <FormattedMessage defaultMessage="Price" />
        </Grid>
        <Grid item md={2.75}>
          <FormattedMessage defaultMessage="Normal" />
        </Grid>
        <Grid item md={2.75}>
          <FormattedMessage defaultMessage="VAT Rate(%)" />
        </Grid>
        <Grid item md={0.5} />
      </Grid>
      {!editing && regionList.length === 0 ? (
        <Box textAlign="center" fontWeight="bold" mt={2}>
          <FormattedMessage defaultMessage="No price definition" />
        </Box>
      ) : (
        regionList.map((e) => {
          const registerChecked = register(`priceDefinition.region_${e.region}.isChecked`);
          return (
            <Grid container spacing={1} alignItems="flex-start" key={e.region} pt={1.5}>
              <Grid item md={0.5} style={{ paddingLeft: `${e.level * 8}px` }}>
                {editing && (
                  <input
                    type="checkbox"
                    {...registerChecked}
                    onChange={(evt) => {
                      registerChecked.onChange(evt);
                      onCheckboxChange(evt, {
                        currency: e.currency,
                        level: e.level,
                      });
                    }}
                  />
                )}
              </Grid>
              <Grid item md={2.75} style={{ paddingLeft: `${e.level * 8}px` }}>
                {e.regionDescription}
              </Grid>
              <Grid item md={2.75}>
                <ControlledInput
                  name={`priceDefinition.region_${e.region}.price`}
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  disabled={disabled || !editing || isSubmitting}
                  onClick={onInputClick}
                  editing
                  InputProps={{
                    endAdornment: e.level !== 1 && (
                      <InputAdornment position="end">
                        {currencySymbols[e.currency] || '?'}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item md={2.75}>
                <ControlledInput
                  name={`priceDefinition.region_${e.region}.normalPrice`}
                  type="number"
                  inputProps={{ min: 0, step: 0.01 }}
                  disabled={disabled || !editing || isSubmitting}
                  onClick={onInputClick}
                  editing
                  InputProps={{
                    endAdornment: e.level !== 1 && (
                      <InputAdornment position="end">
                        {currencySymbols[e.currency] || '?'}
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item md={2.75}>
                <ControlledInput
                  name={`priceDefinition.region_${e.region}.vatRate`}
                  type="number"
                  inputProps={{ min: 0, max: 99.99, step: 0.01 }}
                  disabled={disabled || !editing || isSubmitting}
                  onClick={onInputClick}
                  editing
                />
              </Grid>
              <Grid item md={0.5}>
                {editing && (
                  <Delete
                    style={{ cursor: 'pointer' }}
                    onClick={() => {
                      clearData(`region_${e.region}`);
                    }}
                  />
                )}
              </Grid>
            </Grid>
          );
        })
      )}
    </Box>
  );
};

const ProductPriceBlock = ({ id = 'product-price', ...otherProps }) => {
  const permissions = usePermissions();
  const { confirm } = useConfirm();
  const [regionList, setRegionList] = useState([]);
  const [viewList, setViewList] = useState([]);
  const { priceDefinition } = useDataPageData();
  const {
    formState: { isSubmitting },
  } = useFormContext();
  const { isEditingBlock } = useDataPageEditingState();
  const isEditing = isEditingBlock(id);

  const onBeforeSave = useCallback(
    async (data) => {
      const { priceDefinition } = data;
      data.priceDefinition = JSON.stringify(mapPriceDefinition(priceDefinition));
      const applyToAllVariants = await confirm(
        <FormattedMessage defaultMessage="Do you want to apply this to all variants or just to the main one?" />,
        {
          title: <FormattedMessage defaultMessage="Please choose" />,
          confirmButtonText: <FormattedMessage defaultMessage="Apply to all" />,
          dismissButtonText: <FormattedMessage defaultMessage="Apply to main only" />,
        },
      );
      return { ...data, applyToAllVariants };
    },
    [confirm],
  );

  const getRegionList = useCallback(async () => {
    try {
      const { items } = await CS.regionList();
      const regions = chain(items)
        .filter((e) => e.region.length > 3) // ignore world level
        .map((e) => {
          return { ...e, level: e.region.length / 3 - 1 };
        })
        .sortBy('region')
        .value();

      setRegionList(regions);
    } catch (error) {
      console.log('getRegionList error: ', error);
    }
  }, []);

  useEffect(() => {
    getRegionList();
  }, [getRegionList, isSubmitting]);

  useEffect(() => {
    if (priceDefinition) {
      const viewList = regionList.filter((e) => priceDefinition[`region_${e.region}`]);
      setViewList(viewList);
    }
  }, [priceDefinition, regionList]);

  return (
    <Can view={id}>
      <DataBlock
        id={id}
        editable={permissions.canAccess(id)}
        onBeforeSave={onBeforeSave}
        {...otherProps}
      >
        <DataBlockTitle>
          <FormattedMessage defaultMessage="Price definition" />
        </DataBlockTitle>

        <FormPriceDefinition editing={isEditing} regionList={isEditing ? regionList : viewList} />
      </DataBlock>
    </Can>
  );
};

export default withSchemaDataBlock(ProductPriceDefinitionBLockSchema)(ProductPriceBlock);
