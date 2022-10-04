import React from 'react';
import { TextField } from '@material-ui/core';
import { IMaskInput } from 'react-imask';

const ValueSizeMaskInput = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={/^[0-9]{1,3}(\.?|\.5?)$/}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const ValueSizeField = ({ value, onChange, ...otherProps }) => {
  return (
    <TextField
      value={value}
      onChange={onChange}
      {...otherProps}
      InputProps={{
        inputComponent: ValueSizeMaskInput,
      }}
    />
  );
};

export default ValueSizeField;
