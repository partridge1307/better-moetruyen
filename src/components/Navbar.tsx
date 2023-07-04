import { getAuthSession } from '@/lib/auth';

import NavbarClient from './NavbarClient';

const Navbar = async () => {
  const session = await getAuthSession();

  return <NavbarClient session={session} />;
};

export default Navbar;
