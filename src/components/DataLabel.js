import { Chip, useTheme } from '@material-ui/core';
import React from 'react';

const DataLabel = ({ options = [], value, chip, size }) => {
  const theme = useTheme();
  let option = options.find((i) => i.value === value);
  let displayValue = option?.label ?? value;

  if (chip) {
    return (
      <Chip
        size={size}
        style={
          option?.color
            ? { backgroundColor: option.color, color: theme.palette.getContrastText(option?.color) }
            : {}
        }
        label={displayValue}
      />
    );
  }

  return <>{displayValue}</>;
};

export default DataLabel;
