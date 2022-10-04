import React from 'react';
import { useController, useWatch } from 'react-hook-form';

export const BaseField = ({
  name,
  control,
  defaultValue,
  rules,
  shouldUnregister,
  as: asComponent,
  render,
  element,
  component,
  children,
  ...otherProps
}) => {
  const controller = useController({
    name,
    control,
    defaultValue,
    rules,
    shouldUnregister,
  });

  const props = {
    ...controller.field,
    ...controller.fieldState,
    inputRef: controller.field.ref,
    ref: otherProps.ref,
    ...otherProps,
  };

  if (controller.fieldState.error) {
    props.helperText = controller.fieldState.error.message;
  }

  switch (true) {
    case component != null:
      return React.createElement(component, props, children);
    case asComponent != null:
      return React.createElement(asComponent, props, children);
    case element != null:
      return React.cloneElement(element, props);
    case typeof render === 'function':
      return render(controller);
    case typeof children === 'function':
      return children(controller);
    default:
      return null;
  }
};

export const WatchField = ({ name, control, ...otherProps }) => {
  const defaultValue = useWatch({ name, control });
  return <BaseField name={name} control={control} {...otherProps} defaultValue={defaultValue} />;
};

const Field = ({ watch, ...otherProps }) => {
  if (watch) {
    return <WatchField {...otherProps} />;
  }
  return <BaseField {...otherProps} />;
};

export default Field;
