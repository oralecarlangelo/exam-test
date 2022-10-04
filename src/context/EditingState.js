import { useEffect, useState } from 'react';
import constate from 'constate';

const [EditingStateProvider, useEditingStateValue, useEditingStateSetValue] = constate(
  () => useState(0),
  ([count]) => count !== 0,
  ([, setCount]) => setCount,
);

const useEditingState = (isEditing = false) => {
  const setCount = useEditingStateSetValue();
  useEffect(() => {
    if (!isEditing) {
      return;
    }
    setCount((value) => value + 1);
    return () => setCount((value) => value - 1);
  }, [isEditing, setCount]);
};

export { EditingStateProvider, useEditingState, useEditingStateValue };
