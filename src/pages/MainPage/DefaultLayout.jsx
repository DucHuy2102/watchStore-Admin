import { Outlet } from 'react-router-dom';
import { Sidebar_Component } from '../../components/exportComponent';

export default function DefaultLayout() {
    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            <div className='md:w-auto sticky top-0 h-screen'>
                <Sidebar_Component />
            </div>

            <div className='flex-1 flex flex-col w-full'>
                <main className='flex-1 p-4'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
