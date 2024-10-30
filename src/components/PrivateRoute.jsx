import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
    const { access_token: tokenUser, user } = useSelector((state) => state.user);

    return tokenUser && user?.admin ? <Outlet /> : <Navigate to='/login' />;
}
