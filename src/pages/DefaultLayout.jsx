import { Outlet } from 'react-router-dom';
import { Sidebar_Component } from '../components/exportComponent';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../redux/slices/themeSlice';
import { FaMoon } from 'react-icons/fa';
import { IoIosSunny } from 'react-icons/io';

export default function DefaultLayout() {
    const { theme } = useSelector((state) => state.theme);
    const dispatch = useDispatch();

    return (
        <div className='min-h-screen flex flex-col md:flex-row'>
            <div className='md:w-auto sticky top-0 h-screen'>
                <Sidebar_Component />
            </div>

            <div className='flex-1 flex flex-col w-full relative'>
                <div
                    className={`absolute top-0 right-0 my-5 mx-10 cursor-pointer text-2xl 
                            ${
                                theme === 'light' ? 'bg-[#22272e]' : 'bg-white'
                            } rounded-full p-2 hover:shadow-sm transition-all duration-300`}
                    onClick={() => dispatch(toggleTheme())}
                >
                    {theme === 'light' ? (
                        <FaMoon className='text-gray-300 p-1' />
                    ) : (
                        <IoIosSunny className='text-yellow-400' />
                    )}
                </div>
                <main className='flex-1 p-4'>
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
