import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

export default function PrivateRoute() {
    const { access_token: tokenUser, isAdmin } = useSelector((state) => state.user);

    return tokenUser && isAdmin ? <Outlet /> : <Navigate to='/login' />;
}
