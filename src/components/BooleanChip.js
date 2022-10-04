import { Chip } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

export const BOOLEAN_FILTER_OPTIONS = [
  {
    value: true,
    label: <FormattedMessage defaultMessage="Yes" />,
  },
  {
    value: false,
    label: <FormattedMessage defaultMessage="No" />,
  },
];

const BooleanChip = ({ value }) => {
  if (value) {
    return <Chip color="success" label={<FormattedMessage defaultMessage="Yes" />} />;
  }
  return <Chip color="error" label={<FormattedMessage defaultMessage="No" />} />;
};

export default BooleanChip;
