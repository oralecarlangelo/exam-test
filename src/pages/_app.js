import 'nprogress/nprogress.css';
import '@/styles/index.css';

import CssBaseline from '@material-ui/core/CssBaseline';
import { ThemeProvider } from '@material-ui/core/styles';
import Router, { useRouter } from 'next/router';
import NProgress from 'nprogress';
import React, { useEffect } from 'react';
import { IntlProvider } from 'react-intl';
import { AuthProvider } from '@/context/Auth';
import { ToastProvider } from 'react-toast-notifications';

import theme from '@/themes/light';
import Toast from '@/components/Toast';
import { PermissionsProvider } from '@/context/Permissions';
import { LicenseInfo } from '@material-ui/x-grid';
import { ConfirmProvider } from '@/context/Confirm';
import { PartnerProvider } from '@/context/PartnerProvider';
import { EditingStateProvider } from '@/context/EditingState';
import AdapterDateFns from '@material-ui/lab/AdapterDateFns';
import LocalizationProvider from '@material-ui/lab/LocalizationProvider';

import '@/utils/validation';
import { NotificationsProvider } from '@/context/Notifications';
import { SWRConfig } from 'swr';

LicenseInfo.setLicenseKey(
  'XXXXXXX',
);
const defaultLocale =
  typeof window !== 'undefined' && window.navigator?.language ? window.navigator.language : 'en-GB';
const defaultRichTextElements = {
  b: (chunks) => <strong>{chunks}</strong>,
};

if (typeof window !== 'undefined') {
  NProgress.configure({ showSpinner: false });
  Router.events.on('routeChangeStart', () => NProgress.start());
  Router.events.on('routeChangeComplete', () => NProgress.done());
  Router.events.on('routeChangeError', () => NProgress.done());
}

const App = ({ Component, pageProps }) => {
  const { locale = defaultLocale } = useRouter();
  useEffect(() => {
    const jssStyles = document.querySelector('#jss-server-side');
    if (jssStyles) {
      jssStyles.parentElement?.removeChild(jssStyles);
    }
  }, []);

  return (
    <SWRConfig
      value={{
        fetcher: (url) => fetch(url).then((response) => response.json()),
        shouldRetryOnError: false,
      }}
    >
      <PermissionsProvider permissions={pageProps.permissions}>
        <ThemeProvider theme={theme}>
          <IntlProvider
            locale={locale}
            defaultLocale={defaultLocale}
            defaultRichTextElements={defaultRichTextElements}
          >
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <CssBaseline />
              <AuthProvider>
                <PartnerProvider partner={pageProps.partner}>
                  <EditingStateProvider>
                    <ConfirmProvider>
                      <ToastProvider
                        components={{ Toast }}
                        placement="bottom-left"
                        autoDismiss={false}
                        autoDismissTimeout={10 * 1000}
                      >
                        <NotificationsProvider>
                          <Component {...pageProps} />
                        </NotificationsProvider>
                      </ToastProvider>
                    </ConfirmProvider>
                  </EditingStateProvider>
                </PartnerProvider>
              </AuthProvider>
            </LocalizationProvider>
          </IntlProvider>
        </ThemeProvider>
      </PermissionsProvider>
    </SWRConfig>
  );
};

export default App;
