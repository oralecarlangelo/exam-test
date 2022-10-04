import { useState, useEffect, useCallback, useMemo } from 'react';
import constate from 'constate';
import { useFormContext, useForm, FormProvider } from 'react-hook-form';
import { useToasts } from 'react-toast-notifications';
import { FormattedMessage } from 'react-intl';
import { yupResolver } from '@hookform/resolvers/yup';
import { useEditingState } from '@/context/EditingState';

export const MODE_CREATE = 'create';
export const MODE_EDIT = 'edit';

const [
  Provider,
  useDataPage,
  useDataPageEditingState,
  useDataPageOnBlockSave,
  useDataPageOnCreate,
  useDatePageMode,
  useDataPageData,
  useDataPageValidationContext,
] = constate(
  (params) => {
    const mode = params.mode;
    const data = params.data;
    const [editingBlock, setEditingBlock] = useState(params.initialEditingBlock ?? null);
    const { handleSubmit } = useFormContext();
    const { addToast } = useToasts();
    const isEditing = mode === MODE_CREATE || editingBlock != null;
    useEditingState(isEditing);
    const isEditingBlock = useCallback(
      (id) => mode === MODE_CREATE || editingBlock === id,
      [mode, editingBlock],
    );

    const onBlockSave = useCallback(
      (family) => async (data) => {
        try {
          console.log('Updating', data);
          let response = await params.onBlockSave(data, family);
          console.log('Response', response);
          if (response != null && typeof params.onDataChange === 'function') {
            params.onDataChange(response);
          }
          setEditingBlock(null);
        } catch (error) {
          console.error(error);
          addToast(<FormattedMessage defaultMessage="Error, please try again" />, {
            appearance: 'error',
          });
        }
      },
      [params, addToast],
    );
    const onCreate = useMemo(
      () =>
        handleSubmit(async (data) => {
          try {
            console.log('Creating', data);
            let response = await params.onCreate(data);
            console.log('Response', response);
          } catch (error) {
            console.error(error);
            addToast(<FormattedMessage defaultMessage="Error, please try again" />, {
              appearance: 'error',
            });
          }
        }),
      [handleSubmit, params, addToast],
    );

    return {
      mode,
      data,
      isEditing,
      isEditingBlock,
      setEditingBlock,
      onBlockSave,
      onCreate,
      validationContext: params.validationContext,
    };
  },
  (value) => value,
  (value) => ({
    mode: value.mode,
    isEditing: value.isEditing,
    isEditingBlock: value.isEditingBlock,
    setEditingBlock: value.setEditingBlock,
  }),
  (value) => value.onBlockSave,
  (value) => value.onCreate,
  (value) => value.mode,
  (value) => value.data,
  (value) => value.validationContext,
);

const DataPageProvider = ({
  children,
  validationContext,
  data: initialData,
  mode,
  schema,
  onCreate,
  onBlockSave,
  initialEditingBlock,
}) => {
  const [data, setData] = useState(initialData);
  const form = useForm({
    defaultValues: data,
    resolver: schema && yupResolver(schema),
    context: schema && validationContext,
  });
  const reset = form.reset;
  useEffect(() => {
    setData(initialData);
  }, [initialData]);

  useEffect(() => {
    reset(data);
  }, [reset, data]);

  return (
    <FormProvider {...form}>
      <Provider
        mode={mode}
        data={data}
        onCreate={onCreate}
        onBlockSave={onBlockSave}
        onDataChange={setData}
        initialEditingBlock={initialEditingBlock}
        validationContext={validationContext}
      >
        {children}
      </Provider>
    </FormProvider>
  );
};

export {
  DataPageProvider,
  useDataPage,
  useDataPageEditingState,
  useDataPageOnBlockSave,
  useDataPageOnCreate,
  useDatePageMode,
  useDataPageData,
  useDataPageValidationContext,
};
