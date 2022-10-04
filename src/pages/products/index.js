import Head from 'next/head';
import BaseLayout from '@/layouts/BaseLayout';
import { withPermissionsSSP } from '@/context/Permissions';
import { Box, Typography } from '@material-ui/core';
import { FormattedMessage, useIntl } from 'react-intl';

import PartnerHeaderSelect from '@/components/PartnerHeaderSelect';
import { useRouter } from 'next/router';

export default function Page() {
  const intl = useIntl();
  const router = useRouter();
  return (
    <BaseLayout
      header={
        <Box display="flex" flexDirection="row" alignItems="center">
          <PartnerHeaderSelect onSelect={(item) => router.push(`/products/${item.partnerId}`)} />
          <Box flexGrow={1} />
        </Box>
      }
    >
      <Head>
        <title>{intl.formatMessage({ defaultMessage: 'Products | Shopkoin Dashboard' })}</title>
      </Head>
      <Box mt={2} display="flex" alignItems="center" justifyContent="center">
        <Typography variant="h5">
          <FormattedMessage defaultMessage="Please select partner" />
        </Typography>
      </Box>
    </BaseLayout>
  );
}

export const getServerSideProps = withPermissionsSSP({ name: 'products' })();
