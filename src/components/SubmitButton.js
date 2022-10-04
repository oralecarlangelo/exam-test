import React from 'react';
import { LoadingButton } from '@material-ui/lab';
import { FormattedMessage } from 'react-intl';

const SubmitButton = ({ children, ...otherProps }) => {
  return (
    <LoadingButton {...otherProps}>
      {children ?? <FormattedMessage defaultMessage="Submit" />}
    </LoadingButton>
  );
};

export default SubmitButton;
