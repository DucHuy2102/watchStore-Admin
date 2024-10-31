import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Sidebar_Component } from '../components/exportComponent';
import { Dashboard, Profile_Page } from './exportPage';

export default function DefaultLayout() {
    const location = useLocation();
    const [tab, setTab] = useState('');
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabURL = urlParams.get('tab');
        setTab(tabURL);
    }, [location.search]);

    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            <div className='md:w-auto sticky top-0 h-screen'>
                <Sidebar_Component />
            </div>

            <div className='flex-1 flex flex-col w-full'>
                <main className='flex-1 p-4'>
                    {tab === 'dashboard' && <Dashboard />}
                    {tab === 'profile' && <Profile_Page />}
                    {/* {tab === 'order' && <Order_Page />}
                    {tab === 'products' && <ManageProducts_Page />}
                    {tab === 'users' && <ManageUsers_Page />}
                    {tab === 'orders' && <ManageOrders_Page />}
                    {tab === 'vouchers' && <ManageVouchers_Page />} */}
                </main>
            </div>
        </div>
    );
}
