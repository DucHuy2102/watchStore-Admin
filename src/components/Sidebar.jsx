import { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import {
    HiChartPie,
    HiOutlineCog,
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
        <Tooltip title={children} placement='right'>
            <Link
                to={to}
                className={`group flex items-center w-full p-3 mx-3 rounded-xl transition-all duration-300
                ${
                    active
                        ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/30'
                        : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
                } ${!showSidebar ? 'justify-center w-12 mx-auto' : ''}`}
            >
                <div className={`flex items-center ${active ? 'animate-pulse' : ''}`}>
                    <Icon size={22} className={active ? 'stroke-2' : ''} />
                </div>
                {showSidebar && (
                    <span
                        className={`ml-3 font-medium transition-all duration-300 ${
                            active ? 'translate-x-1' : 'group-hover:translate-x-1'
                        }`}
                    >
                        {children}
                    </span>
                )}
            </Link>
        </Tooltip>
    );
};

const DropdownMenuItem = ({ icon: Icon, label, items, isActive, showSidebar }) => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    return (
        <div className='w-full'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`group flex items-center w-full p-3 rounded-xl transition-all duration-300
                    ${
                        isActive
                            ? 'bg-gradient-to-r from-blue-600 to-blue-400 text-white shadow-lg shadow-blue-500/30'
                            : 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
                    }  ${!showSidebar ? 'justify-center w-12 mx-auto' : ''}`}
            >
                <div className={`flex items-center ${isActive ? 'animate-pulse' : ''}`}>
                    <Icon size={22} className={isActive ? 'stroke-2' : ''} />
                </div>
                {showSidebar && (
                    <>
                        <span
                            className={`ml-3 font-medium transition-all duration-300 ${
                                isActive ? 'translate-x-1' : 'group-hover:translate-x-1'
                            }`}
                        >
                            {label}
                        </span>
                        <svg
                            className={`w-4 h-4 ml-auto transition-transform duration-300 ${
                                isOpen ? 'rotate-180' : ''
                            }`}
                            fill='none'
                            viewBox='0 0 24 24'
                            stroke='currentColor'
                        >
                            <path
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeWidth={2}
                                d='M19 9l-7 7-7-7'
                            />
                        </svg>
                    </>
                )}
            </button>

            {showSidebar && isOpen && (
                <div className='mt-2 ml-6 border-l-2 border-gray-200 dark:border-gray-600 space-y-1 pl-4'>
                    {items.map((item, index) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`relative block py-2 px-3 rounded-lg text-sm transition-all duration-300
                    ${
                        location.pathname === item.path
                            ? 'bg-blue-50 text-blue-600 font-medium dark:bg-gray-800 dark:text-blue-400'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-blue-600 dark:text-gray-400 dark:hover:bg-gray-800'
                    }`}
                        >
                            <span
                                className={`absolute left-[-20px] top-1/2 transform -translate-y-1/2 w-2 h-2 rounded-full bg-gray-400 dark:bg-gray-600`}
                                style={{ marginTop: index === 0 ? 0 : '' }}
                            />
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default function Sidebar_Component() {
    const dispatch = useDispatch();
    const [showModal, setShowModal] = useState(false);
    const { theme } = useSelector((state) => state.theme);
    const currentUser = useSelector((state) => state.user.user);
    const [showSidebar, setShowSidebar] = useState(true);
    const [showSubmenu, setShowSubmenu] = useState(false);

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
            className={`relative min-h-screen transition-all duration-300
            ${
                theme === 'light'
                    ? 'bg-white border-r border-gray-100'
                    : 'bg-gray-900 border-r border-gray-800'
            } ${showSidebar ? 'w-64' : 'w-20'}`}
        >
            <div className='flex flex-col h-screen'>
                {/* Logo Section */}
                <div className='relative p-5'>
                    <div className='flex flex-col items-center justify-center'>
                        {showSidebar && (
                            <Link to='/dashboard'>
                                <h1 className='text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent'>
                                    WatcHes
                                </h1>
                            </Link>
                        )}
                    </div>
                    <button
                        onClick={toggleSidebar}
                        className={`absolute ${
                            showSidebar ? '-right-4' : 'right-1/2 translate-x-1/2'
                        } top-2 p-1.5 rounded-full bg-blue-500 text-white
            hover:bg-blue-600 transition-all duration-300 shadow-lg shadow-blue-500/50`}
                    >
                        {showSidebar ? <SlArrowLeft size={16} /> : <SlArrowRight size={16} />}
                    </button>
                </div>

                {/* Profile Section */}
                <div
                    className={`px-5 ${
                        !showSidebar
                            ? 'flex justify-center'
                            : 'flex flex-col items-center justify-center'
                    }`}
                >
                    <div className='relative inline-block'>
                        <img
                            src={currentUser?.avatarImg ?? '/assets/default_Avatar.jpg'}
                            className={`rounded-xl object-cover transition-all duration-300 ring-2 ring-offset-2 ring-blue-500
                                ${showSidebar ? 'w-20 h-20' : 'w-12 h-12'}`}
                            alt='Avatar'
                        />
                        <div className='absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-white' />
                    </div>

                    {showSidebar && (
                        <div className='mt-3 space-y-1'>
                            <h2 className='text-lg font-semibold text-gray-800 dark:text-gray-200'>
                                {currentUser.username}
                            </h2>
                            <span
                                className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            >
                                {currentUser.admin ? 'ADMIN' : 'USER'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Navigation Section */}
                <nav className='flex-1 flex flex-col items-center px-5 mt-8 space-y-2'>
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
                        <div className='relative py-4'>
                            <div className='absolute inset-0 flex items-center px-3'>
                                <div
                                    className={`w-full h-[1px] ${
                                        theme === 'light'
                                            ? 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'
                                            : 'bg-gradient-to-r from-transparent via-gray-700 to-transparent'
                                    }`}
                                ></div>
                            </div>
                            <div className='relative flex justify-center'>
                                <span
                                    className={`px-4 py-1 rounded-full text-xs font-semibold tracking-wider uppercase ${
                                        theme === 'light'
                                            ? 'bg-gray-100 text-gray-600 shadow-sm border border-gray-200'
                                            : 'bg-gray-800 text-gray-300 shadow-md border border-gray-700'
                                    } transition-all duration-300 hover:scale-105`}
                                >
                                    <div className='flex items-center gap-2'>
                                        <HiOutlineCog className='w-4 h-4' />
                                        Quản lý
                                    </div>
                                </span>
                            </div>
                        </div>
                    )}
                    <SidebarItem
                        to='/users'
                        icon={HiOutlineUserGroup}
                        active={tab === 'users'}
                        theme={theme}
                        showSidebar={showSidebar}
                    >
                        Người dùng
                    </SidebarItem>
                    <DropdownMenuItem
                        icon={HiShoppingBag}
                        label='Sản phẩm'
                        isActive={location.pathname.includes('/product')}
                        showSidebar={showSidebar}
                        items={[
                            { path: '/products', label: 'Danh sách' },
                            { path: '/product/create', label: 'Tạo mới' },
                        ]}
                    />
                    <SidebarItem
                        to='/orders'
                        icon={FaShippingFast}
                        active={tab === 'orders'}
                        theme={theme}
                        showSidebar={showSidebar}
                    >
                        Đơn hàng
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
                </nav>

                {/* Logout Button */}
                <div className='p-5'>
                    <Tooltip title='Đăng xuất' placement='right'>
                        <button
                            onClick={() => setShowModal(true)}
                            className='w-full p-3 rounded-xl text-white bg-gradient-to-r from-red-600 to-red-400
                                hover:from-red-700 hover:to-red-500 transition-all duration-300 shadow-lg shadow-red-500/30'
                        >
                            <div
                                className={`flex items-center justify-center ${
                                    showSidebar ? 'space-x-2' : ''
                                }`}
                            >
                                <TbLogout2 size={22} />
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
