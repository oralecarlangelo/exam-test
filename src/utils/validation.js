import { FormattedMessage } from 'react-intl';
import * as yup from 'yup';
import bytes from 'bytes';

yup.setLocale({
  mixed: {
    required: <FormattedMessage defaultMessage="Required" />,
    notType: ({ type }) => <FormattedMessage defaultMessage="Must be a {type}" values={{ type }} />,
  },
  number: {
    min: ({ min }) => (
      <FormattedMessage defaultMessage="Must be greater or equal to {min}" values={{ min }} />
    ),
    max: ({ max }) => (
      <FormattedMessage defaultMessage="Must be lower or equal to {max}" values={{ max }} />
    ),
  },
  string: {
    url: (values) => <FormattedMessage defaultMessage="Must be a valid URL" values={values} />,
  },
});

export const wrap = (schema, message) => (value) => {
  try {
    schema.validateSync(value);
  } catch (error) {
    return message || error.message;
  }
};

export const compose =
  (...validators) =>
  (value) => {
    for (let validator of validators.filter(Boolean)) {
      let message = validator(value);
      if (message != null) {
        return message;
      }
    }
  };

export const email = wrap(
  yup.string().email(),
  <FormattedMessage defaultMessage="Please enter valid email" />,
);

export const required = wrap(
  yup.lazy((value) => {
    switch (typeof value) {
      case 'string':
        return yup.string().trim().required();
      case 'number':
        return yup.number().required();
      default:
        return yup.mixed().required();
    }
  }),
  <FormattedMessage defaultMessage="Required" />,
);

export const min = (min) =>
  wrap(
    yup.number().min(min),
    <FormattedMessage defaultMessage="Value must be greater or equal {min}" values={{ min }} />,
  );

export const max = (max) =>
  wrap(
    yup.number().max(max),
    <FormattedMessage defaultMessage="Value must be greater or equal {max}" values={{ max }} />,
  );

export const between = (min, max) =>
  wrap(
    yup.number().min(min).max(max),
    <FormattedMessage
      defaultMessage="Value must be between {min} and {max}"
      values={{ min, max }}
    />,
  );
