import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import {
    HiChartPie,
    HiOutlineExclamationCircle,
    HiOutlineUserGroup,
    HiShoppingBag,
    HiUser,
} from 'react-icons/hi';
import { FaShippingFast } from 'react-icons/fa';
import { TbLogout2 } from 'react-icons/tb';
import { MdDiscount } from 'react-icons/md';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import { user_SignOut } from '../redux/slices/userSlice';
import { Button, Modal } from 'flowbite-react';
import { Tooltip } from 'antd';

const SidebarItem = ({ to, icon: Icon, active, showSidebar, children }) => {
    return (
        <div className='w-full'>
            <Tooltip title={children} placement='right' className='w-full'>
                <Link
                    to={to}
                    className={`flex items-center justify-start w-full rounded-lg py-2 transition-all duration-200 
                     ${
                         active
                             ? 'bg-blue-500 hover:bg-blue-600 text-white font-semibold'
                             : 'hover:bg-gray-100 text-gray-700'
                     } 
                     ${showSidebar ? 'px-5' : 'px-2 justify-center'}`}
                >
                    {showSidebar ? <Icon size={20} /> : <Icon size={25} />}
                    {showSidebar && <span className='ml-2'>{children}</span>}
                </Link>
            </Tooltip>
        </div>
    );
};

export default function Sidebar_Component() {
    // state
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const { theme } = useSelector((state) => state.theme);
    const currentUser = useSelector((state) => state.user.user);
    const [showSidebar, setShowSidebar] = useState(true);
    // get tab from url
    const location = useLocation();
    const [tab, setTab] = useState('');
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const tabURL = urlParams.get('tab');
        setTab(tabURL);
    }, [location.search]);

    // sign out function
    const handleSignOutAccount = useCallback(async () => {
        dispatch(user_SignOut());
    }, [dispatch]);

    const toggleSidebar = useCallback(() => {
        setShowSidebar((prev) => !prev);
    }, []);

    return (
        <div
            className={`relative transition-all duration-200 ease-in-out min-h-screen border-r ${
                theme === 'light' ? 'border-gray-200 bg-gray-100' : 'border-gray-800'
            } ${showSidebar ? 'w-64' : 'w-16'}`}
        >
            <div
                className={`flex flex-col items-center justify-between min-h-screen ${
                    showSidebar ? 'p-5' : 'px-2 py-5'
                }`}
            >
                <div className='w-full flex flex-col items-center justify-between gap-y-5'>
                    <div className='flex items-center justify-center w-full'>
                        {showSidebar && (
                            <Link
                                to='/dashboard'
                                className='tracking-widest outline-none whitespace-nowrap text-2xl sm:text-2xl font-semibold md:font-bold'
                            >
                                <span
                                    className={`bg-clip-text text-transparent bg-gradient-to-r
                                        ${
                                            theme === 'light'
                                                ? 'from-gray-400 to-gray-700'
                                                : 'from-gray-500 to-gray-300'
                                        }`}
                                >
                                    Watc
                                    <span
                                        className={`font-extrabold ${
                                            theme === 'light' ? 'text-yellow-400' : 'text-blue-400'
                                        }`}
                                    >
                                        H
                                    </span>
                                    es
                                </span>
                            </Link>
                        )}
                        <button
                            onClick={toggleSidebar}
                            className={`z-10 transition-all absolute duration-300 ease-in-out p-2 rounded-full
                            ${
                                theme === 'light'
                                    ? 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                                    : 'bg-gray-600 text-gray-200 hover:bg-gray-700'
                            }
                            ${showSidebar ? '-right-5 top-[50%]' : 'top-3'}`}
                        >
                            {showSidebar ? <SlArrowLeft size={20} /> : <SlArrowRight size={20} />}
                        </button>
                    </div>

                    <div
                        className={`flex flex-col items-center justify-center ${
                            !showSidebar && 'mt-5'
                        }`}
                    >
                        <div className='relative'>
                            <img
                                src={currentUser?.avatarImg ?? '/assets/default_Avatar.jpg'}
                                className={`rounded-full object-cover border-4 border-gray-200 shadow-sm ${
                                    showSidebar ? 'w-28 h-28' : 'w-12 h-12'
                                }`}
                                alt='Avatar User'
                            />
                            <div
                                className={`absolute bottom-1 right-1 bg-green-400 rounded-full 
                            border-2 border-white ${showSidebar ? 'w-4 h-4' : 'w-3 h-3'}`}
                            />
                        </div>

                        {showSidebar && (
                            <>
                                <h2
                                    className={`mt-4 text-xl font-semibold ${
                                        theme === 'light' ? 'text-gray-800' : 'text-gray-200'
                                    }`}
                                >
                                    {currentUser.username}
                                </h2>
                                <span
                                    className={`mt-1 px-3 py-1 ${
                                        theme === 'light'
                                            ? 'bg-blue-100 text-blue-800'
                                            : 'bg-blue-900 text-blue-200'
                                    } rounded-full text-xs font-medium`}
                                >
                                    {currentUser.admin ? 'ADMIN' : 'USER'}
                                </span>
                                <p
                                    className={`mt-2 text-sm font-medium ${
                                        theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                    }`}
                                >
                                    {currentUser.email}
                                </p>
                            </>
                        )}

                        <nav className='space-y-2 w-full mt-5'>
                            <SidebarItem
                                to='/dashboard'
                                icon={HiChartPie}
                                active={tab === 'dashboard'}
                                showSidebar={showSidebar}
                            >
                                Trang chủ
                            </SidebarItem>
                            <SidebarItem
                                to='/profile'
                                icon={HiUser}
                                active={tab === 'profile'}
                                showSidebar={showSidebar}
                            >
                                Trang cá nhân
                            </SidebarItem>
                            {showSidebar && (
                                <div className={`relative`}>
                                    <div className={`absolute inset-0 flex items-center`}>
                                        <div
                                            className={`w-full border-t ${
                                                theme === 'light'
                                                    ? 'border-gray-300'
                                                    : 'border-gray-700'
                                            }`}
                                        ></div>
                                    </div>
                                    <div className='relative flex justify-center mt-5'>
                                        <span
                                            className={`px-2 text-sm font-semibold uppercase ${
                                                theme === 'light'
                                                    ? 'bg-gray-100 text-gray-600'
                                                    : 'bg-gray-900 text-gray-300'
                                            }`}
                                        >
                                            Quản lý
                                        </span>
                                    </div>
                                </div>
                            )}
                            <SidebarItem
                                to='/products'
                                icon={HiShoppingBag}
                                active={tab === 'products'}
                                theme={theme}
                                showSidebar={showSidebar}
                            >
                                Sản phẩm
                            </SidebarItem>
                            <SidebarItem
                                to='/vouchers'
                                icon={MdDiscount}
                                active={tab === 'vouchers'}
                                theme={theme}
                                showSidebar={showSidebar}
                            >
                                Giảm giá
                            </SidebarItem>
                            <SidebarItem
                                to='/users'
                                icon={HiOutlineUserGroup}
                                active={tab === 'users'}
                                theme={theme}
                                showSidebar={showSidebar}
                            >
                                Người dùng
                            </SidebarItem>
                            <SidebarItem
                                to='/orders'
                                icon={FaShippingFast}
                                active={tab === 'orders'}
                                theme={theme}
                                showSidebar={showSidebar}
                            >
                                Đơn hàng
                            </SidebarItem>{' '}
                        </nav>
                    </div>
                </div>
                <div className='w-full'>
                    <Tooltip title='Đăng xuất' placement='right' className='w-full'>
                        <button
                            onClick={() => setShowModal(true)}
                            className='w-full bg-red-500 hover:bg-red-600 rounded-lg py-2 text-white'
                        >
                            <div
                                className={`flex items-center justify-center ${
                                    showSidebar ? 'px-5 gap-x-2' : 'px-2'
                                }`}
                            >
                                <TbLogout2 size={showSidebar ? 20 : 25} />
                                {showSidebar && <span>Đăng xuất</span>}
                            </div>
                        </button>
                    </Tooltip>
                </div>
            </div>
            <Modal show={showModal} onClose={() => setShowModal(false)} size='md' popup>
                <Modal.Header />
                <Modal.Body>
                    <div className='text-center'>
                        <HiOutlineExclamationCircle className='text-yellow-300 text-5xl mx-auto' />
                        <span className='text-lg font-medium text-black'>
                            Bạn có chắc chắn muốn đăng xuất?
                        </span>
                        <div className='flex justify-between items-center mt-5'>
                            <Button color='gray' onClick={() => setShowModal(false)}>
                                Hủy
                            </Button>
                            <Button color='warning' onClick={handleSignOutAccount}>
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
