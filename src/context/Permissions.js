import React, { useContext, useMemo, useCallback } from 'react';

export const PermissionsContext = React.createContext({
  canView: () => false,
  canAccess: () => false,
});

export const usePermissions = () => useContext(PermissionsContext);

export const Can = ({ children, view, access, fallback = null, skeleton = null }) => {
  let { canView, canAccess, loading } = usePermissions();
  if (loading) {
    return skeleton;
  }
  if (view && !canView(view)) {
    return fallback;
  }
  if (access && !canAccess(access)) {
    return fallback;
  }
  return children;
};

export const PermissionsProvider = ({ children, permissions }) => {
  const canView = useCallback(
    (name) => name === false || permissions?.view?.includes?.(name),
    [permissions],
  );
  const canAccess = useCallback(
    (name) => name === false || permissions?.access?.includes?.(name),
    [permissions],
  );

  const value = useMemo(() => ({ canView, canAccess }), [canView, canAccess]);
  return <PermissionsContext.Provider value={value}>{children}</PermissionsContext.Provider>;
};

export const withPermissionsSSP =
  (getSecurityParams) =>
  (getProps) =>
  async (context, ...args) => {
    // Something is done
  };
