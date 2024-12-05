import axios from 'axios';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { BeatLoader } from 'react-spinners';

export default function Dashboard() {
    const { access_token: token } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [services, setServices] = useState([]);
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);

    console.log('products', products);
    console.log('services', services);
    console.log('orders', orders);
    console.log('customers', customers);

    // get all products
    useEffect(() => {
        const getAllProducts = async () => {
            try {
                setLoading(true);

                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/product/get-all-product`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (res.status === 200) {
                    const { data } = res;
                    setProducts(data.productResponses);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        getAllProducts();
    }, [token]);

    // get all services
    useEffect(() => {
        const getServices = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/service/get-all`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res?.status === 200) {
                    const { data } = res;
                    setServices(data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        getServices();
    }, [token]);

    // get all orders
    useEffect(() => {
        const getAllOrders = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/order/get-all-order`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (res.status === 200) {
                    setOrders(res.data);
                }
            } catch (error) {
                console.log(error);
                toast.error('Lỗi lấy danh sách đơn hàng');
            } finally {
                setLoading(false);
            }
        };
        getAllOrders();
    }, [token]);

    // get all customers
    useEffect(() => {
        const getAllUsers = async () => {
            try {
                setLoading(true);
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/user/get-all-user`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (res.status === 200) {
                    const { data } = res;
                    setCustomers(data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        getAllUsers();
    }, [token]);

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-50'>
                <BeatLoader color='#3B82F6' />
                <p className='text-gray-500 text-lg font-semibold ml-2'>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return <div>Dashboard</div>;
}
