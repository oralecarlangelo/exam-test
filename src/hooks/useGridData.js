import axios from 'axios';
import { useState, useEffect, useCallback } from 'react';

import CS from '@/services/central';

export default function useGridData(endpoint, params = {}) {
  if (!endpoint) {
    throw new Error('"endpoint" required');
  }

  const [tick, setTick] = useState(0);
  const [pageSize, setPageSize] = useState(params.pageSize || 20);
  const [orderBy, setOrderBy] = useState(params.orderBy || 'id');
  const [sortDirection, setSortDirection] = useState(params.sortDirection || 'asc');
  const [filter, setFilter] = useState('');
  const [searchFilters, setSearchFilters] = useState({});
  const [pageIndex, setPageIndex] = useState(1);
  const [rowCount, setRowCount] = useState(0);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);

  const load = useCallback(() => setTick((value) => value + 1), []);

  useEffect(() => {
    const source = axios.CancelToken.source();
    async function load() {
      setLoading(true);
      setError(null);
      try {
        let data = await CS.request({
          method: 'POST',
          url: endpoint,
          data: {
            filter,
            pageIndex,
            pageSize,
            orderBy,
            sortDirection,
            ...(params.filters || {}),
            ...searchFilters,
          },
          cancelToken: source.token,
        });
        setRowCount(data.total);
        setData(data.items);
      } catch (error) {
        if (!axios.isCancel(error)) {
          setError(error);
        }
      }
      setLoading(false);
    }
    load();
    // Canceling request to avoid race conditions
    return () => source.cancel();
  }, [
    tick,
    pageIndex,
    pageSize,
    orderBy,
    sortDirection,
    filter,
    endpoint,
    searchFilters,
    params.filters,
  ]);

  const setSort = useCallback(({ orderBy, sortDirection }) => {
    setPageIndex(1);
    setSortDirection(sortDirection);
    setOrderBy(orderBy);
  }, []);

  const setRowsPerPage = useCallback((size) => {
    setPageIndex(1);
    setPageSize(size);
  }, []);

  const setSearch = useCallback((value) => {
    setPageIndex(1);
    setFilter(value);
  }, []);

  const setFilters = useCallback((filters) => {
    setPageIndex(1);
    setSearchFilters(filters);
  }, []);

  return {
    pageIndex,
    pageSize,
    data,
    error,
    loading,
    rowCount,
    search: filter,
    orderBy,
    sortDirection,

    setRowsPerPage,
    setSort,
    setSearch,
    setPageIndex,

    filters: searchFilters,
    setFilters,
    load,
    setData,
    setLoading,
  };
}
