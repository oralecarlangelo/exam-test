import React, { useState, useCallback, useContext, useMemo } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const ConfirmStateContext = React.createContext({
  items: [],
});

const ConfirmContext = React.createContext({
  async confirm() {
    return false;
  },
});

export const useConfirm = () => useContext(ConfirmContext);
export const useConfirmState = () => useContext(ConfirmStateContext);

const Confirm = () => {
  const { items, submit } = useConfirmState();
  return (
    <>
      {items.map(
        (
          { title = <FormattedMessage defaultMessage="Confirm action" />, message, options },
          index,
        ) => (
          <Dialog
            key={index}
            open={open}
            onClose={(event, reason) => {
              if (!options.disableBackdropClick || reason !== 'backdropClick') {
                submit(false, index);
              }
            }}
            disableEscapeKeyDown={options.disableEscapeKeyDown || false}
          >
            {title && <DialogTitle>{title}</DialogTitle>}
            {message && (
              <DialogContent>
                <DialogContentText>{message}</DialogContentText>
              </DialogContent>
            )}
            <DialogActions>
              <Button
                variant="text"
                color="primary"
                {...(options.confirmButtonProps || {})}
                onClick={() => submit(true, index)}
              >
                {options.confirmButtonText ?? <FormattedMessage defaultMessage="Confirm" />}
              </Button>
              <Button
                variant="text"
                {...(options.dismissButtonProps || {})}
                onClick={() => submit(false, index)}
              >
                {options.dismissButtonText ?? <FormattedMessage defaultMessage="Dismiss" />}
              </Button>
            </DialogActions>
          </Dialog>
        ),
      )}
    </>
  );
};

const ConfirmContextProvider = ({ children }) => {
  const [items, setItems] = useState([]);

  const confirm = useCallback(
    async (message, { title, ...options } = {}) => {
      const promise = new Promise((resolve) => {
        setItems([...items, { title, options, message, resolve }]);
      });
      return promise;
    },
    [items],
  );

  const submit = useCallback(
    (value, index) => {
      items[index].resolve(value);
      setItems(items.filter((item, i) => i !== index));
    },
    [items],
  );

  const value = useMemo(() => ({ confirm }), [confirm]);
  const state = useMemo(() => ({ items, submit }), [items, submit]);

  return (
    <ConfirmContext.Provider value={value}>
      <ConfirmStateContext.Provider value={state}>{children}</ConfirmStateContext.Provider>
    </ConfirmContext.Provider>
  );
};

export const ConfirmProvider = ({ children }) => (
  <ConfirmContextProvider>
    {children}
    <Confirm />
  </ConfirmContextProvider>
);
