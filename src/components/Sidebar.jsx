import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { HiOutlineExclamationCircle } from 'react-icons/hi';
import { FaChartPie, FaMoon, FaReceipt, FaStar, FaTags, FaUser } from 'react-icons/fa';
import { TbLogout2 } from 'react-icons/tb';
import { SlArrowLeft, SlArrowRight } from 'react-icons/sl';
import { user_SignOut } from '../redux/slices/userSlice';
import { Button, Modal } from 'flowbite-react';
import { Tooltip } from 'antd';
import { IoIosSunny } from 'react-icons/io';
import { toggleTheme } from '../redux/slices/themeSlice';
import { resetCategory } from '../redux/slices/productSlice';
import { FaPeopleGroup } from 'react-icons/fa6';
import { GiWatch } from 'react-icons/gi';

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
    const location = useLocation();
    const { theme } = useSelector((state) => state.theme);
    const { user: currentUser } = useSelector((state) => state.user);
    const [showModal, setShowModal] = useState(false);
    const [showSidebar, setShowSidebar] = useState(true);

    const handleSignOutAccount = () => {
        dispatch(user_SignOut());
        dispatch(resetCategory());
    };

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
            } 
            ${showSidebar ? 'w-64' : 'w-20'}
            fixed md:relative z-50`}
        >
            {showSidebar && (
                <div className='fixed inset-0 bg-black/50 md:hidden' onClick={toggleSidebar} />
            )}

            {/* sidebar */}
            <div className='flex flex-col justify-between h-screen'>
                {/* header */}
                <div className='relative p-4'>
                    <div
                        className={`flex items-center ${
                            !showSidebar ? 'justify-center' : 'justify-between'
                        }`}
                    >
                        {showSidebar && (
                            <Link to='/dashboard' className='flex items-center space-x-2 group'>
                                <h1
                                    className='text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent
                    transition-all duration-300 group-hover:translate-x-1'
                                >
                                    WatcHes
                                </h1>
                            </Link>
                        )}

                        <div className='flex items-center space-x-2'>
                            <button
                                onClick={toggleSidebar}
                                className='p-2 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400
                    hover:bg-blue-500/20 transition-all duration-300'
                                title={showSidebar ? 'Thu gọn' : 'Mở rộng'}
                            >
                                {showSidebar ? (
                                    <SlArrowLeft size={16} />
                                ) : (
                                    <SlArrowRight size={16} />
                                )}
                            </button>

                            <button
                                onClick={() => dispatch(toggleTheme())}
                                className={`p-2 rounded-lg transition-all duration-300
                    ${
                        theme === 'light'
                            ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                            : 'bg-gray-800 hover:bg-gray-700 text-yellow-400'
                    }`}
                                title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
                            >
                                {theme === 'light' ? (
                                    <FaMoon className='w-4 h-4' />
                                ) : (
                                    <IoIosSunny className='w-4 h-4' />
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* avatar */}
                <div
                    className={`px-5 ${
                        !showSidebar
                            ? 'flex justify-center'
                            : 'flex flex-col items-center justify-center'
                    }`}
                >
                    <div className='relative group'>
                        <div
                            className={`relative rounded-2xl overflow-hidden transform transition-all duration-300 cursor-pointer 
            ${showSidebar ? 'w-24 h-24' : 'w-14 h-14'}
            group-hover:shadow-xl group-hover:scale-105`}
                        >
                            <div
                                className='absolute inset-0 bg-gradient-to-b from-transparent to-blue-500/20 opacity-0 
                group-hover:opacity-100 transition-opacity duration-300'
                            />

                            <img
                                src={currentUser?.avatarImg ?? '/assets/default_Avatar.jpg'}
                                className='w-full h-full object-cover'
                                alt={currentUser?.username || 'User avatar'}
                            />

                            <div
                                className='absolute inset-0 border-4 border-transparent rounded-2xl 
                bg-gradient-to-r from-blue-400 to-blue-600 opacity-20 
                group-hover:opacity-40 transition-opacity duration-300'
                                style={{ margin: '-2px' }}
                            />
                        </div>

                        <div className='absolute bottom-1 right-1'>
                            <div
                                className='w-4 h-4 rounded-full bg-green-400 border-2 border-white dark:border-gray-800
                shadow-lg transform transition-transform duration-300 
                group-hover:scale-110 group-hover:ring-2 ring-green-400/50'
                            />
                        </div>
                    </div>

                    {showSidebar && (
                        <div className='mt-4 space-y-1.5 text-center'>
                            <h2
                                className='text-lg font-semibold text-gray-800 dark:text-gray-200 
                tracking-wide transition-colors duration-300'
                            >
                                {currentUser.username}
                            </h2>
                            <span
                                className='inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                bg-gradient-to-r from-blue-500 to-blue-600 text-white
                shadow-sm transition-all duration-300 hover:shadow-md'
                            >
                                {currentUser.admin ? 'ADMIN' : 'USER'}
                            </span>
                        </div>
                    )}
                </div>

                {/* sidebar item */}
                <nav className='flex-1 flex flex-col items-center px-5 mt-2 space-y-2'>
                    <SidebarItem
                        to='/dashboard'
                        icon={FaChartPie}
                        active={location.pathname === '/dashboard'}
                        showSidebar={showSidebar}
                    >
                        Trang chủ
                    </SidebarItem>
                    <SidebarItem
                        to='/profile'
                        icon={FaUser}
                        active={location.pathname === '/profile'}
                        showSidebar={showSidebar}
                    >
                        Trang cá nhân
                    </SidebarItem>
                    <SidebarItem
                        to='/users'
                        icon={FaPeopleGroup}
                        active={location.pathname === '/users'}
                        theme={theme}
                        showSidebar={showSidebar}
                    >
                        Người dùng
                    </SidebarItem>
                    <DropdownMenuItem
                        icon={GiWatch}
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
                        icon={FaReceipt}
                        active={location.pathname === '/orders'}
                        theme={theme}
                        showSidebar={showSidebar}
                    >
                        Đơn hàng
                    </SidebarItem>
                    <SidebarItem
                        to='/vouchers'
                        icon={FaTags}
                        active={location.pathname === '/vouchers'}
                        theme={theme}
                        showSidebar={showSidebar}
                    >
                        Giảm giá
                    </SidebarItem>
                    <SidebarItem
                        to='/reviews'
                        icon={FaStar}
                        active={location.pathname === '/reviews'}
                        theme={theme}
                        showSidebar={showSidebar}
                    >
                        Đánh giá
                    </SidebarItem>
                </nav>

                {/* buttonlogout */}
                <div className='p-5'>
                    <Tooltip title='Đăng xuất' placement='right'>
                        <button
                            onClick={() => setShowModal(true)}
                            className='w-full py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl 
                        shadow-lg transform transition-all duration-200 hover:scale-105 hover:shadow-xl
                        disabled:opacity-50 disabled:cursor-not-allowed'
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

            {/* modal logout */}
            <Modal show={showModal} onClose={() => setShowModal(false)} size='md' popup>
                <Modal.Header />
                <Modal.Body>
                    <div className='flex flex-col items-center gap-y-4'>
                        <HiOutlineExclamationCircle className='text-yellow-300 text-6xl mx-auto' />
                        <span className='text-lg font-medium text-black'>
                            Bạn có chắc chắn muốn đăng xuất?
                        </span>
                        <div className='w-full flex justify-between items-center gap-4'>
                            <Button
                                color='gray'
                                onClick={() => setShowModal(false)}
                                className='w-full hover:shadow-sm hover:scale-105 transition-all duration-300 rounded-xl !text-black !ring-0'
                            >
                                Hủy
                            </Button>
                            <Button
                                color='blue'
                                onClick={handleSignOutAccount}
                                className='w-full hover:shadow-lg hover:scale-105 transition-all duration-300 rounded-xl !ring-0'
                            >
                                Xác nhận
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* button toggle sidebar */}
            <button
                onClick={toggleSidebar}
                className='fixed bottom-4 right-4 p-3 rounded-full bg-blue-600 text-white shadow-lg md:hidden'
            >
                {showSidebar ? <SlArrowLeft size={20} /> : <SlArrowRight size={20} />}
            </button>
        </div>
    );
}
