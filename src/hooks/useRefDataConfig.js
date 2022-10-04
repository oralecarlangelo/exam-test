import { useMemo } from 'react';
import useSWRImmutable from 'swr/immutable';

const fetcher = (...args) => fetch(...args).then((response) => response.json());

export default function useRefDataConfig({ entity, key }) {
  const { data, error } = useSWRImmutable(`/api/admin/refdataconfig/${entity}`, fetcher, {
    shouldRetryOnError: false,
  });

  const value = useMemo(() => {
    return { loading: !data, options: data?.data?.[key] || [], error };
  }, [data, key, error]);
  return value;
}

export const useRefDataOptions = ({ entity, key, options }) => {
  const { loading, options: availableOptions, error } = useRefDataConfig({ entity, key });
  return {
    loading,
    error,
    options: availableOptions.map(
      (value) => options.find((i) => i.value === value) ?? { value, label: value },
    ),
  };
};
