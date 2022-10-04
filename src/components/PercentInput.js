import React from 'react';
import * as Components from '@/components/DataBlock';

const PercentInput = ({ editing, value, decimals = 2, onChange, ...otherProps }) => {
  if (!editing) {
    return (
      <Components.Input
        editing={editing}
        value={typeof value === 'number' ? `${value.toFixed(decimals)} %` : value}
      />
    );
  }

  let f = 10 ** decimals;

  return (
    <Components.Input
      type="number"
      editing={editing}
      value={value == null || Number.isNaN(value) ? '' : value.toString()}
      onChange={(value) => {
        if (!Number.isNaN(value)) {
          value = Math.floor(value * f) / f;
        }
        onChange(Number.isNaN(value) ? undefined : value);
      }}
      {...otherProps}
    />
  );
};

export default PercentInput;
