import React from 'react';
import CircularProgress from '@material-ui/core/CircularProgress';
import Box from '@material-ui/core/Box';

const PageLoader = () => (
  <Box
    display="flex"
    position="fixed"
    width="100vw"
    height="100vh"
    justifyContent="center"
    alignItems="center"
  >
    <CircularProgress />
  </Box>
);

export default PageLoader;
