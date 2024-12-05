import { Outlet } from 'react-router-dom';
import { Sidebar_Component } from '../../components/exportComponent';

export default function DefaultLayout() {
    return (
        <div className='flex min-h-screen'>
            <Sidebar_Component />
            <main className='flex-1 w-full overflow-y-auto h-screen'>
                <Outlet />
            </main>
        </div>
    );
}
