import { Autocomplete, TextField } from '@material-ui/core';
import React from 'react';
import Field from '@/components/Field';

export const AutocompleteField = ({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  options = [],
  loading,
  label,
  getOptionValue = (option) => option?.value,
  getOptionLabel = (option) => option?.label?.props?.defaultMessage ?? option?.label ?? option,
  helperText,
  renderInput,
  ...otherProps
}) => {
  return (
    <Field
      name={name}
      control={control}
      defaultValue={defaultValue ?? null}
      rules={rules}
      shouldUnregister={shouldUnregister}
    >
      {({ field, fieldState }) => (
        <Autocomplete
          value={
            (options || []).find((i) => getOptionValue(i) === field.value) ?? field.value ?? null
          }
          onChange={(event, option) => field.onChange(getOptionValue(option) ?? null)}
          loading={loading}
          options={loading ? [] : options}
          getOptionLabel={getOptionLabel}
          renderInput={
            renderInput ||
            ((params) => (
              <TextField
                label={label}
                variant="outlined"
                {...params}
                error={!!fieldState.error}
                helperText={fieldState.error?.message || helperText}
              />
            ))
          }
          {...otherProps}
        />
      )}
    </Field>
  );
};

export default AutocompleteField;
