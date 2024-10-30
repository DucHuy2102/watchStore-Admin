import axios from 'axios';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { user_SignIn } from '../redux/slices/userSlice';
import { FadeLoader } from 'react-spinners';
import { FcGoogle } from 'react-icons/fc';
import { useGoogleLogin } from '@react-oauth/google';

export default function Login() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { state } = useLocation();

    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleLoginForm = async (e) => {
        e.preventDefault();
        if (!formData.username || !formData.password) {
            toast.error('Vui lòng nhập đầy đủ thông tin!');
            return;
        }

        try {
            setIsLoading(true);
            const credentials = btoa(`${formData.username}:${formData.password}`);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/sign-in`, null, {
                headers: {
                    Authorization: `Basic ${credentials}`,
                    'Content-Type': 'application/json',
                },
            });
            if (res?.status === 200) {
                const { data } = res;
                dispatch(user_SignIn({ access_token: data.access_token, user: data }));
                toast.success('Đăng nhập thành công!');
                setTimeout(() => {
                    if (state?.from) {
                        navigate(state.from);
                    } else {
                        navigate('/');
                    }
                }, 3000);
            }
        } catch (error) {
            if (error.response.status === 401) {
                setErrorMessage('Tài khoản hoặc mật khẩu không đúng!');
            } else {
                setErrorMessage('Đã xảy ra lỗi, vui lòng thử lại sau!');
            }
            setFormData({ username: '', password: '' });
            toast.error(errorMessage);
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const loginGoogle = useGoogleLogin({
        onSuccess: (response) => {
            const token = response.access_token;
            sendTokenToServer(token);
        },
        onFailure: (response) => {
            toast.error('Lỗi hệ thống!');
            console.log('Login Failed:', response);
        },
    });

    const sendTokenToServer = async (token) => {
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/google?token=${token}`);
            if (res.status === 200) {
                const { data } = res;
                dispatch(user_SignIn({ access_token: data.access_token, user: data }));
                toast.success('Đăng nhập thành công!');
                setTimeout(() => {
                    if (state?.from) {
                        navigate(state.from);
                    } else {
                        navigate('/');
                    }
                }, 3000);
            }
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className='min-h-screen'>
            <div className='flex w-full min-h-screen'>
                <div className='hidden lg:flex w-1/3 flex-col items-center justify-center gap-y-8 px-8 dark:bg-[#22272e] text-white'>
                    <h1 className='text-4xl font-bold text-center leading-tight'>
                        Chào mừng bạn trở lại
                    </h1>
                    <h3 className='text-xl text-blue-100 text-center'>
                        Đăng nhập để quản lý cửa hàng của bạn
                    </h3>
                    <img
                        src='/img-login.webp'
                        alt='Login'
                        className='object-cover w-4/5 h-auto rounded-lg'
                    />
                </div>

                <div className='w-full lg:w-2/3 flex items-center justify-center px-6 lg:px-16 py-12'>
                    <div className='w-full max-w-md space-y-8'>
                        <div className='text-center'>
                            <h2 className='text-3xl font-bold tracking-tight dark:text-white'>
                                Đăng nhập tài khoản
                            </h2>
                            <p className='mt-2 text-gray-600 dark:text-gray-400'>
                                Vui lòng nhập thông tin đăng nhập của bạn
                            </p>
                        </div>

                        <form onSubmit={handleLoginForm} className='mt-8 space-y-6'>
                            <div className='space-y-4'>
                                <div>
                                    <div className='mt-1'>
                                        <input
                                            id='username'
                                            type='text'
                                            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-[#22272e] dark:border-gray-600 dark:text-white dark:focus:ring-blue-400'
                                            placeholder='Tên người dùng'
                                            value={formData.username}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className='mt-1'>
                                        <input
                                            id='password'
                                            type='password'
                                            className='w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-[#22272e] dark:border-gray-600 dark:text-white dark:focus:ring-blue-400'
                                            placeholder='Mật khẩu'
                                            value={formData.password}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className='flex items-center justify-end'>
                                <a
                                    href='#'
                                    className='text-sm text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-medium'
                                >
                                    Quên mật khẩu?
                                </a>
                            </div>

                            {isLoading ? (
                                <div className='flex items-center justify-center'>
                                    <FadeLoader color={'blue'} />
                                </div>
                            ) : (
                                <button
                                    type='submit'
                                    className='w-full py-3 px-4 border border-transparent rounded-lg 
                                    text-md font-bold shadow-sm text-white dark:text-black dark:bg-white dark:hover:bg-[#c4cdd5] 
                                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors'
                                >
                                    Đăng nhập
                                </button>
                            )}

                            <div className='relative'>
                                <div className='absolute inset-0 flex items-center'>
                                    <div className='w-full border-t border-gray-300 dark:border-gray-600'></div>
                                </div>
                                <div className='relative flex justify-center text-sm'>
                                    <span className='px-2 bg-white dark:bg-[#22272e] text-gray-500'>
                                        Hoặc đăng nhập với
                                    </span>
                                </div>
                            </div>

                            <button
                                onClick={() => loginGoogle()}
                                type='button'
                                className='w-full flex items-center justify-center gap-x-3 py-3
                                border border-gray-300 dark:border-gray-600 rounded-lg
                                hover:bg-gray-50 dark:hover:bg-gray-800
                                transition-colors dark:bg-[#22272e]'
                            >
                                <FcGoogle className='mt-1/2' />
                                <span className='text-md font-medium dark:text-white'>
                                    Đăng nhập với Google
                                </span>
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
