import React, { Children, useMemo, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  FormControl,
  FormHelperText,
  Select,
  MenuItem,
  InputLabel,
  Autocomplete as MUIAutocomplete,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import { FormattedMessage } from 'react-intl';
import { Controller, useFormContext, useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import {
  useDataPageEditingState,
  useDatePageMode,
  useDataPageOnBlockSave,
  useDataPageData,
  useDataPageValidationContext,
} from '@/context/DataPage';
import { mapKeys } from 'lodash';

export const DataBlockTitle = () => {
  throw new Error(`"DataBlockTitle" should always be direct child of "DataBlock"`);
};
DataBlockTitle.TYPE = 'TITLE';
export const DataBlockField = () => {
  throw new Error(`"DataBlockField" should always be direct child of "DataBlock"`);
};
DataBlockField.TYPE = 'FIELD';

export const ON_BEFORE_SAVE_CANCEL = 'ON_BEFORE_SAVE_CANCEL';

const useDataBlockStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  actions: {
    '& > *': {
      margin: theme.spacing(1),
    },
  },
  title: {
    float: 'left',
  },
}));

const DataBlock = ({ id, children, disabled, editable, card = true, onBeforeSave, actions }) => {
  const classes = useDataBlockStyles();
  const { mode, isEditingBlock, isEditing, setEditingBlock } = useDataPageEditingState();
  const onBlockSave = useDataPageOnBlockSave();
  const {
    handleSubmit,
    control,
    reset,
    watch,
    formState: { isSubmitting },
  } = useFormContext();

  const titles = Children.toArray(children).filter((i) => i.type.TYPE === DataBlockTitle.TYPE);
  const rest = Children.toArray(children).filter((i) => i.type.TYPE !== DataBlockTitle.TYPE);

  const onSubmit = useMemo(() => {
    return handleSubmit(async (payload) => {
      let data = payload;
      if (onBeforeSave) {
        data = await onBeforeSave(data);
        if (data === ON_BEFORE_SAVE_CANCEL) {
          return;
        }
      }
      return onBlockSave(id)(data);
    });
  }, [handleSubmit, onBlockSave, onBeforeSave, id]);

  const content = (
    <Grid container spacing={1}>
      {rest.map((field, index) => {
        if (field?.type?.TYPE !== DataBlockField.TYPE) {
          return <React.Fragment key={index}>{field}</React.Fragment>;
        }

        let { title, rules, name, component, ...otherProps } = field.props;
        let Component = component || DefaultComponent;
        return (
          <React.Fragment key={name || index}>
            {title != null && (
              <Grid item sm={5} lg={4}>
                <Box minHeight={40} display="flex" alignItems="center" justifyContent="flex-end">
                  <Typography variant="overline" align="right" sx={{ lineHeight: '18px' }}>
                    {title}
                  </Typography>
                </Box>
              </Grid>
            )}
            <Grid item sm={title == null ? 12 : 7} lg={title == null ? 12 : 8}>
              <Box display="flex" minHeight={40} alignItems="center">
                {isEditingBlock(id) ? (
                  <Controller
                    render={(props) => (
                      <Component
                        error={props.fieldState.error}
                        editing={isEditingBlock(id)}
                        {...otherProps}
                        {...props.field}
                        disabled={otherProps.disabled || disabled || isSubmitting}
                      />
                    )}
                    control={control}
                    name={name}
                    rules={rules}
                  />
                ) : (
                  <Component
                    disabled={disabled || isSubmitting}
                    editing={isEditingBlock(id)}
                    value={watch(name)}
                    {...otherProps}
                  />
                )}
              </Box>
            </Grid>
          </React.Fragment>
        );
      })}
    </Grid>
  );

  return (
    <>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        {titles.map((title, index) => (
          <Typography gutterBottom variant="h6" component="h2" key={index}>
            {title.props.children}
          </Typography>
        ))}
        {mode === 'edit' && editable && (
          <Box className={classes.actions}>
            {isEditingBlock(id) ? (
              <>
                <Button
                  variant="text"
                  size="small"
                  color="primary"
                  onClick={onSubmit}
                  disabled={isSubmitting}
                >
                  <FormattedMessage defaultMessage="Save" />
                </Button>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    reset();
                    setEditingBlock(null);
                  }}
                  disabled={isSubmitting}
                >
                  <FormattedMessage defaultMessage="Cancel" />
                </Button>
              </>
            ) : (
              <Button
                variant="text"
                size="small"
                onClick={() => setEditingBlock(id)}
                disabled={isEditing}
              >
                <FormattedMessage defaultMessage="Edit" />
              </Button>
            )}
          </Box>
        )}
        {mode === 'edit' && editable && actions && <Box className={classes.actions}>{actions}</Box>}
      </Box>
      {card ? (
        <Card className={classes.root} variant="outlined">
          <CardContent>{content}</CardContent>
        </Card>
      ) : (
        <Box mt={1}>{content}</Box>
      )}
    </>
  );
};

const DataBlockFormProvider = ({ children, schema, defaultValues }) => {
  const data = useDataPageData();
  const validationContext = useDataPageValidationContext();
  const { priceDefinition } = data;
  if (priceDefinition && typeof priceDefinition === 'string') {
    const priceDefinitionPrefix = mapKeys(JSON.parse(priceDefinition), function (value, key) {
      return 'region_' + key;
    });
    data.priceDefinition = priceDefinitionPrefix;
  }

  const form = useForm({
    resolver: yupResolver(schema),
    defaultValues: data,
    context: validationContext,
  });
  const reset = form.reset;
  useEffect(() => {
    reset(data);
  }, [reset, data]);
  return <FormProvider {...form}>{children}</FormProvider>;
};

export const DataBlockContainer = ({ schema, children }) => {
  const mode = useDatePageMode();
  if (mode === 'create' || schema == null) {
    return children;
  }
  return <DataBlockFormProvider schema={schema}>{children}</DataBlockFormProvider>;
};

export const DataBlockWrapper = ({ schema, ...otherProps }) => {
  return (
    <DataBlockContainer schema={schema}>
      <DataBlock {...otherProps} />
    </DataBlockContainer>
  );
};

export const withSchemaDataBlock =
  (defaultSchema) =>
  (Component) =>
  ({ schema = defaultSchema, ...otherProps }) => {
    return (
      <DataBlockContainer schema={schema}>
        <Component {...otherProps} />
      </DataBlockContainer>
    );
  };

export default DataBlockWrapper;

export const controlled =
  (Component) =>
  ({ name, control, rules, editing, defaultValue, shouldUnregister, ...otherProps }) => {
    return (
      <Controller
        name={name}
        control={control}
        rules={editing ? rules : {}}
        defaultValue={defaultValue}
        shouldUnregister={shouldUnregister}
        render={(props) => (
          <Component
            editing={editing}
            error={props.fieldState.error}
            {...otherProps}
            {...props.field}
            value={props.field.value || ''}
          />
        )}
      />
    );
  };

const useDefaultComponentStyles = makeStyles((theme) => ({
  unset: {
    color: theme.palette.grey['700'],
    fontStyle: 'italic',
  },
}));
export const DefaultComponent = ({
  editing,
  value,
  multiline,
  rows,
  error,
  type,
  onChange,
  helperText,
  ...otherProps
}) => {
  const classes = useDefaultComponentStyles();
  if (editing) {
    return (
      <TextField
        multiline={multiline}
        rows={rows}
        variant="outlined"
        size="small"
        fullWidth
        value={value}
        error={!!error}
        helperText={error?.message || helperText}
        type={type}
        onChange={(event) => {
          if (type === 'number') {
            onChange(event.target.valueAsNumber);
          } else {
            onChange(event);
          }
        }}
        {...otherProps}
      />
    );
  }
  return (
    <Typography variant="outlined" {...otherProps}>
      {value}
      {(value == null || value === '') && <span className={classes.unset}>Unset</span>}
    </Typography>
  );
};

export const Dropdown = ({
  editing,
  value,
  error,
  label,
  options = [],
  disabledOptions = [],
  availableOptions,
  ...otherProps
}) => {
  let filteredOptions = useMemo(() => {
    let optionsClone = [...options];
    for (let item of [...(availableOptions || []), value]) {
      if (item && !optionsClone.some((i) => i.value === item)) {
        optionsClone.push({ value: item, label: item });
      }
    }
    if (Array.isArray(availableOptions)) {
      return optionsClone.filter((i) => i.value === value || availableOptions.includes(i.value));
    }
    return optionsClone;
  }, [availableOptions, options, value]);

  if (!editing) {
    return (
      <DefaultComponent
        value={options.find((i) => i.value === value)?.label || value || ''}
        editing={editing}
        {...otherProps}
      />
    );
  }

  return (
    <FormControl variant="outlined" size="small" fullWidth error={!!error}>
      {label && <InputLabel>{label}</InputLabel>}
      <Select loa value={value || ''} {...otherProps} label={label}>
        {filteredOptions.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            disabled={disabledOptions.includes(option.value)}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText>{error.message}</FormHelperText>}
    </FormControl>
  );
};
export const ControlledDropdown = controlled(Dropdown);

export const Input = DefaultComponent;
export const ControlledInput = controlled(Input);
