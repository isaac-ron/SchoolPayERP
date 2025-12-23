import { Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Layout = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <Outlet />;
};

export default Layout;