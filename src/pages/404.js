import BaseLayout from '@/layouts/BaseLayout';
import { Box } from '@material-ui/core';
import Link from 'next/link';

export default function Custom404() {
  return (
    <BaseLayout>
      <Box maxWidth={800} m="0 auto">
        <h1>404 - Not Found!</h1>
        <Link href="/">Go Home</Link>
      </Box>
    </BaseLayout>
  );
}
