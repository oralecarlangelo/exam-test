import { useState } from 'react';
import { makeStyles } from '@material-ui/styles';
import Head from 'next/head';
import { Toolbar } from '@material-ui/core';

import Header from '@/components/Header';
import SideBar from '@/components/SideBar';

import { Can } from '@/context/Permissions';

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(2),
    margin: '0 auto',
    // backgroundColor: 'rgb(245, 245, 245)',
  },
}));

const BaseLayout = ({ children, header, responsive = false }) => {
  const classes = useStyles();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <>
      <Head>
        <title>Shopkoin Dashboard</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={classes.root}>
        <Header isSidebarOpen={isSidebarOpen} onSideBarOpenChange={setIsSidebarOpen}>
          {header}
        </Header>
        <Can view="side-menu">
          <SideBar isMobileOpen={isSidebarOpen} onMobileOpenChange={setIsSidebarOpen} />
        </Can>
        <main className={classes.content} style={responsive ? {} : { maxWidth: 1600 }}>
          <Toolbar />
          {children}
        </main>
      </div>
    </>
  );
};

export default BaseLayout;
