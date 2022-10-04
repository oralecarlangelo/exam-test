import React, { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Image from 'next/image';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Typography,
} from '@material-ui/core';
import * as Icons from '@material-ui/icons';
import { useAuth } from '@/context/Auth';

const useStyles = makeStyles((theme) => ({
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
  },
  spacer: {
    flexGrow: 1,
  },
  logo: {
    cursor: 'pointer',
  },
}));

const Header = ({ children, isSidebarOpen, onSideBarOpenChange }) => {
  const classes = useStyles();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);

  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => onSideBarOpenChange(!isSidebarOpen)}
          sx={{ display: { sm: 'none' } }}
        >
          {isSidebarOpen ? <Icons.Close /> : <Icons.Menu />}
        </IconButton>
        <Link href="/">
          <a
            style={{
              marginRight: 70,
              width: 151,
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
            }}
          >
            <Image
              src="/assets/images/logo.svg"
              alt="Shopkoin logo"
              width="58"
              height="43"
              className={classes.logo}
            />
            <Typography variant="h6" sx={{ marginLeft: 2, color: 'white', fontWeight: 'bold' }}>
              Shopkoin
            </Typography>
          </a>
        </Link>
        <Box flexGrow={1}>{children}</Box>
        {isAuthenticated && (
          <>
            <div style={{ paddingLeft: 20 }}>
              <Button
                variant="text"
                onClick={(event) => setAnchorEl(event.currentTarget)}
                color="inherit"
              >
                <Box mr={1}>{user?.firstName || user?.email}</Box> <Icons.AccountCircle />{' '}
                <Icons.ArrowDropDown />
              </Button>
              <Menu
                anchorEl={anchorEl}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                open={!!anchorEl}
                onClose={() => setAnchorEl(null)}
              >
                <MenuItem onClick={logout}>Logout</MenuItem>
              </Menu>
            </div>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Header;
