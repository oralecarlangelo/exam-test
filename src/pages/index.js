import { useAuth } from '@/context/Auth';
import { withPermissionsSSP } from '@/context/Permissions';
import BaseLayout from '@/layouts/BaseLayout';
import HomePoSPage from '@/pages/home_pos';

export default function HomePage(props) {
  const { user } = useAuth();

  return (
    <BaseLayout>
      <h1>Home page</h1>
    </BaseLayout>
  );
}

export const getServerSideProps = withPermissionsSSP({ name: 'home' })();
