import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton } from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  TextField: {
    '& .Mui-focused $ClearButton': {
      visibility: 'visible',
    },
    '@media (pointer: fine)': {
      [`&:hover $ClearButton`]: {
        visibility: 'visible',
      },
    },
  },
  ClearButton: {
    visibility: 'hidden',
  },
});

const CustomTextField = React.forwardRef(({ onClear, ...otherProps }, ref) => {
  const classes = useStyles();
  const [isClearVisible, setIsClearVisible] = useState(otherProps.value || otherProps.defaultValue);
  const InputProps = {
    ...(otherProps.InputProps || {}),
    endAdornment: onClear ? (
      <>
        <InputAdornment>
          {isClearVisible && (
            <IconButton
              size="small"
              tabIndex={-1}
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClear(event);
                setIsClearVisible(false);
              }}
              onMouseDown={(event) => event.preventDefault()}
              aria-label="Clear"
              title="Clear"
              className={classes.ClearButton}
            >
              <Icons.Close fontSize="small" />
            </IconButton>
          )}
        </InputAdornment>
        {otherProps.InputProps?.endAdornment}
      </>
    ) : (
      InputProps.endAdornment
    ),
  };

  return (
    <TextField
      {...otherProps}
      ref={ref}
      className={[otherProps.className, classes.TextField].filter(Boolean).join(' ')}
      InputProps={InputProps}
      onChange={(event, ...args) => {
        setIsClearVisible(!!event.target.value);
        otherProps?.onChange?.(event, ...args);
      }}
    />
  );
});

export default CustomTextField;
