import React from 'react';

const INT_MASK = /^-?[0-9]*$/;
const transform = (initial) => {
  let value = initial;
  while (value && !INT_MASK.test(value)) value = value.substr(0, value.length - 1);
  return value;
};

const IntInput = React.forwardRef(({ ...otherProps }, ref) => {
  return (
    <input
      {...otherProps}
      type="text"
      ref={ref}
      onChange={(event) => {
        event.target.value = transform(event.target.value);
        otherProps.onChange(event);
      }}
      onBlur={(event) => {
        event.target.value = transform(event.target.value);
        otherProps.onBlur(event);
      }}
    />
  );
});

export default IntInput;
