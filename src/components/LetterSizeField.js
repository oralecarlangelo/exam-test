import React from 'react';
import { TextField } from '@material-ui/core';
import { IMaskInput } from 'react-imask';

const LetterSizeMaskInput = React.forwardRef((props, ref) => {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask={/^[A-Za-z]{1,4}$/}
      inputRef={ref}
      onAccept={(value) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

const LetterSizeField = ({ value, onChange, ...otherProps }) => {
  return (
    <TextField
      value={value}
      onChange={onChange}
      {...otherProps}
      InputProps={{
        inputComponent: LetterSizeMaskInput,
      }}
    />
  );
};

export default LetterSizeField;
