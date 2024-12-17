import { IoIosCart } from 'react-icons/io';
import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { Badge, Card, Typography, Tag, Select } from 'antd';
import {
    ShoppingCartOutlined,
    UserOutlined,
    CommentOutlined,
    DollarOutlined,
} from '@ant-design/icons';
const { Title, Text } = Typography;
import './Dashboard.css';
import { GiWatch } from 'react-icons/gi';
import { motion } from 'framer-motion';
import { Image, Button } from 'antd';
import { FaImage, FaEye } from 'react-icons/fa';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    BarChart,
    Bar,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { Spinner } from 'flowbite-react';

const monthOptions = [
    { value: 0, label: 'Tháng 1' },
    { value: 1, label: 'Tháng 2' },
    { value: 2, label: 'Tháng 3' },
    { value: 3, label: 'Tháng 4' },
    { value: 4, label: 'Tháng 5' },
    { value: 5, label: 'Tháng 6' },
    { value: 6, label: 'Tháng 7' },
    { value: 7, label: 'Tháng 8' },
    { value: 8, label: 'Tháng 9' },
    { value: 9, label: 'Tháng 10' },
    { value: 10, label: 'Tháng 11' },
    { value: 11, label: 'Tháng 12' },
];

export default function Dashboard() {
    const { pathname } = useLocation();
    const { access_token: token } = useSelector((state) => state.user);
    const { sidebar } = useSelector((state) => state.theme);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // state products
    const [products, setProducts] = useState([]);
    const [totalProducts, setTotalProducts] = useState(0);
    const [productOutOfStock, setProductOutOfStock] = useState([]);
    const [topHighestAccessProducts, setTopHighestAccessProducts] = useState([]);
    const [analysisProductGender, setAnalysisProductGender] = useState([]);

    // state services
    const [services, setServices] = useState([]);

    // state orders
    const [orders, setOrders] = useState([]);
    const [customers, setCustomers] = useState([]);

    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

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
                    setTotalProducts(data.totalProducts);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        getAllProducts();
    }, [token]);

    // analyze products
    useEffect(() => {
        const analyzeProducts = async () => {
            try {
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/api/order/statistics-admin`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    }
                );
                if (res.status === 200) {
                    const { data } = res;
                    setTopHighestAccessProducts(data.top5Selling);
                    setAnalysisProductGender(data.genders);
                    setProductOutOfStock(data.outOfStock);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };
        if (products.length === 0) analyzeProducts();
    }, [products, token]);

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

    const memoizedGetMonthlyStats = useCallback(
        (month) => {
            const filteredOrders = orders.filter((order) => {
                const orderDate = new Date(order.createdAt);
                return orderDate.getMonth() === month;
            });
            return {
                total: filteredOrders.length,
                pending: filteredOrders.filter((order) => !order.delivered).length,
                completed: filteredOrders.filter((order) => order.state === 'complete').length,
                cancelled: filteredOrders.filter((order) => order.state === 'cancel').length,
            };
        },
        [orders]
    );

    const orderStats = useMemo(
        () => memoizedGetMonthlyStats(selectedMonth),
        [memoizedGetMonthlyStats, selectedMonth]
    );

    const getRevenueData = (orders) => {
        const monthlyRevenue = Array(12)
            .fill(0)
            .map((_, index) => ({
                name: `T ${index + 1}`,
                revenue: 0,
            }));

        orders.forEach((order) => {
            const date = new Date(order.createdAt);
            const month = date.getMonth();
            monthlyRevenue[month].revenue += order.totalPrice || 0;
        });

        return monthlyRevenue;
    };

    const productSalesData = useMemo(() => {
        const monthlyData = Array(12)
            .fill()
            .map((_, index) => ({
                name: `T${index + 1}`,
                male: 0,
                female: 0,
            }));

        analysisProductGender.forEach((item) => {
            const monthIndex = item.month - 1;
            if (item.gender === 'Nam') {
                monthlyData[monthIndex].male = item.quantity;
            } else if (item.gender === 'Nữ') {
                monthlyData[monthIndex].female = item.quantity;
            }
        });

        return monthlyData;
    }, [analysisProductGender]);

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen bg-gray-50'>
                <Spinner size='lg' />
                <p className='text-gray-500 text-lg font-semibold ml-2'>Đang tải dữ liệu...</p>
            </div>
        );
    }

    return (
        <div className='p-6'>
            {/* header */}
            <div className='mb-6 bg-white p-8 rounded-lg shadow-md'>
                {/* title */}
                <div className='flex items-center justify-between mb-8'>
                    <div className='relative'>
                        <h1 className='text-3xl font-bold text-blue-500'>Tổng quan hệ thống</h1>
                        <div className='h-px w-36 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mt-2'></div>
                        <p className='text-gray-500 mt-3 italic font-light tracking-wide'>
                            Theo dõi và quản lý hoạt động kinh doanh của cửa hàng
                        </p>
                    </div>
                </div>

                {/* filter month */}
                <div className='mb-4 flex justify-end'>
                    <Select
                        value={selectedMonth}
                        onChange={setSelectedMonth}
                        style={{ width: 150 }}
                        options={monthOptions}
                    />
                </div>

                {/* stats */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6'>
                    {[
                        {
                            title: 'Tổng Đơn Hàng',
                            value: orderStats?.total,
                            icon: <ShoppingCartOutlined />,
                            gradient: 'from-indigo-500 to-blue-500',
                            lightGradient: 'from-indigo-50 to-blue-50',
                            additionalInfo: 'Tất cả đơn hàng trong hệ thống',
                            stats: [
                                { label: 'Hoàn thành', value: orderStats?.completed },
                                { label: 'Đã hủy', value: orderStats?.cancelled },
                            ],
                            percent: 15,
                            link: '/orders',
                        },
                        {
                            title: 'Tổng Khách Hàng',
                            value: customers.length,
                            icon: <UserOutlined />,
                            gradient: 'from-emerald-500 to-teal-500',
                            lightGradient: 'from-emerald-50 to-teal-50',
                            additionalInfo: 'Tất cả khách hàng đã đăng ký',
                            stats: [
                                {
                                    label: 'Hoạt động',
                                    value: customers.filter((c) => c.state === 'active').length,
                                },
                                {
                                    label: 'Bị chặn',
                                    value: customers.filter((c) => c.state === 'blocked').length,
                                },
                            ],
                            percent: 8,
                            link: '/users',
                        },
                        {
                            title: 'Tổng Dịch Vụ',
                            value: services.length,
                            icon: <CommentOutlined />,
                            gradient: 'from-orange-500 to-amber-500',
                            lightGradient: 'from-orange-50 to-amber-50',
                            additionalInfo: 'Tất cả yêu cầu hỗ trợ',
                            stats: [
                                {
                                    label: 'Đang chờ',
                                    value: services.filter((s) => s.state === 'pending').length,
                                },
                                {
                                    label: 'Đã phản hồi',
                                    value: services.filter((s) => s.state === 'proceed').length,
                                },
                            ],
                            percent: 12,
                            link: '/services',
                        },
                        {
                            title: 'Tổng Sản Phẩm',
                            value: totalProducts,
                            icon: <GiWatch />,
                            gradient: 'from-purple-500 to-pink-500',
                            lightGradient: 'from-purple-50 to-pink-50',
                            additionalInfo: 'Tất cả sản phẩm trong kho',
                            stats: [
                                {
                                    label: 'Còn hàng',
                                    value: totalProducts - productOutOfStock.length,
                                },
                                {
                                    label: 'Hết hàng',
                                    value: productOutOfStock.length,
                                },
                            ],
                            percent: 10,
                            link: '/products',
                        },
                    ].map((stat, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            key={index}
                            className='group relative border-2 border-gray-50 rounded-xl'
                            onClick={() => navigate(stat.link)}
                        >
                            <div className='absolute -inset-0.5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-300'></div>

                            <div className='relative bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer'>
                                <div
                                    className={`absolute -top-4 right-4 w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <span className='text-white text-xl'>{stat.icon}</span>
                                </div>

                                <div className='pt-2'>
                                    <h3 className='text-sm font-medium text-gray-500'>
                                        {stat.title}
                                    </h3>
                                    <div className='mt-2 flex items-baseline'>
                                        <span
                                            className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                                        >
                                            {stat.value?.toLocaleString()}
                                        </span>
                                        <span className='ml-2 text-sm font-medium text-gray-500'>
                                            (+{stat.percent}%)
                                        </span>
                                    </div>

                                    <div className='mt-4'>
                                        <div className='h-1.5 w-full bg-gray-100 rounded-full overflow-hidden'>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${stat.percent}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                                            />
                                        </div>
                                    </div>

                                    <div className='mt-4 grid grid-cols-2 gap-2'>
                                        {stat.stats.map((subStat, idx) => (
                                            <div
                                                key={idx}
                                                className='bg-gradient-to-r from-gray-50 to-gray-100 p-2 rounded-lg'
                                            >
                                                <span className='text-sm text-gray-600'>
                                                    {subStat.label}
                                                </span>
                                                <p
                                                    className={`text-lg font-semibold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                                                >
                                                    {subStat.value}
                                                </p>
                                            </div>
                                        ))}
                                    </div>

                                    <p className='mt-3 text-xs text-gray-500'>
                                        {stat.additionalInfo}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* charts */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6'>
                <Card className='shadow-lg hover:shadow-xl transition-all duration-300'>
                    <Title level={4} className='!mb-6 flex items-center gap-2'>
                        <DollarOutlined className='text-blue-500' />
                        Doanh thu trong năm
                    </Title>
                    <ResponsiveContainer width='100%' height={400}>
                        <AreaChart
                            data={getRevenueData(orders)}
                            margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                        >
                            <defs>
                                <linearGradient id='colorRevenue' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='5%' stopColor='#1E88E5' stopOpacity={0.8} />
                                    <stop offset='95%' stopColor='#1E88E5' stopOpacity={0.1} />
                                </linearGradient>
                                <linearGradient id='colorRevenueStroke' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='5%' stopColor='#1E88E5' stopOpacity={1} />
                                    <stop offset='95%' stopColor='#1E88E5' stopOpacity={0.8} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray='3 3'
                                vertical={false}
                                stroke='rgba(0, 0, 0, 0.1)'
                            />
                            <XAxis
                                dataKey='name'
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#666', fontSize: 12 }}
                            />
                            <YAxis
                                tickFormatter={(value) => `${(value / 1000000).toFixed(0)}M`}
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#666', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    padding: '12px',
                                }}
                                labelStyle={{
                                    color: 'black',
                                    fontWeight: 'bold',
                                }}
                                formatter={(value) => [`${value.toLocaleString()}đ`, 'Doanh thu']}
                                cursor={{
                                    stroke: '#1E88E5',
                                    strokeWidth: 1,
                                    strokeDasharray: '5 5',
                                }}
                            />
                            <Area
                                type='monotone'
                                dataKey='revenue'
                                stroke='url(#colorRevenueStroke)'
                                strokeWidth={2}
                                fill='url(#colorRevenue)'
                                name='Doanh thu'
                                animationDuration={2000}
                                animationEasing='ease-in-out'
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                    <div className='mt-8 border-t border-gray-100 pt-6'>
                        <div className={`flex ${!sidebar ? 'gap-2' : 'gap-5'}`}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className='flex-1 relative cursor-pointer overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'
                            >
                                <div className='absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6'>
                                    <div className='w-full h-full bg-blue-200 opacity-20 rounded-full'></div>
                                </div>
                                <Text className='text-gray-600 font-medium text-sm uppercase tracking-wider mb-2'>
                                    Tổng doanh thu
                                </Text>
                                <div className='flex items-baseline gap-1'>
                                    <Title
                                        level={4}
                                        className='!mb-0 !font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'
                                    >
                                        {orders
                                            .reduce(
                                                (sum, order) => sum + (order.totalPrice || 0),
                                                0
                                            )
                                            .toLocaleString()}
                                    </Title>
                                    <span className='text-blue-600 font-medium'>đ</span>
                                </div>
                                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600'></div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className='flex-1 relative cursor-pointer overflow-hidden bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'
                            >
                                <div className='absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6'>
                                    <div className='w-full h-full bg-green-200 opacity-20 rounded-full'></div>
                                </div>
                                <Text className='text-gray-600 font-medium text-sm uppercase tracking-wider mb-2'>
                                    Tháng cao nhất
                                </Text>
                                <div className='flex items-baseline gap-1'>
                                    <Title
                                        level={4}
                                        className='!mb-0 !font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent'
                                    >
                                        {Math.max(
                                            ...getRevenueData(orders).map((item) => item.revenue)
                                        ).toLocaleString()}
                                    </Title>
                                    <span className='text-green-600 font-medium'>đ</span>
                                </div>
                                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600'></div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className='flex-1 relative cursor-pointer overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'
                            >
                                <div className='absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6'>
                                    <div className='w-full h-full bg-orange-200 opacity-20 rounded-full'></div>
                                </div>
                                <Text className='text-gray-600 font-medium text-sm uppercase tracking-wider mb-2'>
                                    Trung bình/tháng
                                </Text>
                                <div className='flex items-baseline gap-1'>
                                    <Title
                                        level={4}
                                        className='!mb-0 !font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent'
                                    >
                                        {Math.round(
                                            orders.reduce(
                                                (sum, order) => sum + (order.totalPrice || 0),
                                                0
                                            ) / 12
                                        ).toLocaleString()}
                                    </Title>
                                    <span className='text-orange-600 font-medium'>đ</span>
                                </div>
                                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600'></div>
                            </motion.div>
                        </div>
                    </div>
                </Card>

                <Card className='shadow-lg hover:shadow-xl transition-all duration-300'>
                    <Title level={4} className='!mb-6 flex items-center gap-2'>
                        <ShoppingCartOutlined className='text-blue-500' />
                        Sản phẩm bán ra trong năm
                    </Title>
                    <ResponsiveContainer width='100%' height={400}>
                        <BarChart data={productSalesData}>
                            <defs>
                                <linearGradient id='malesGradient' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='0%' stopColor='#4CAF50' stopOpacity={0.8} />
                                    <stop offset='95%' stopColor='#4CAF50' stopOpacity={0.4} />
                                </linearGradient>
                                <linearGradient id='femalesGradient' x1='0' y1='0' x2='0' y2='1'>
                                    <stop offset='0%' stopColor='#E91E63' stopOpacity={0.8} />
                                    <stop offset='95%' stopColor='#E91E63' stopOpacity={0.4} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid
                                strokeDasharray='3 3'
                                vertical={false}
                                stroke='rgba(0, 0, 0, 0.1)'
                            />
                            <XAxis
                                dataKey='name'
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#666', fontSize: 12 }}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#666', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: 'none',
                                    borderRadius: '10px',
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                                    padding: '12px',
                                }}
                                cursor={{ fill: 'rgba(0, 0, 0, 0.05)' }}
                                labelStyle={{
                                    color: 'black',
                                    fontWeight: 'bold',
                                }}
                                formatter={(value, name) => [
                                    value,
                                    name === 'Đồng Hồ Nam' ? 'Nam' : 'Nữ',
                                ]}
                            />
                            <Legend
                                wrapperStyle={{
                                    paddingTop: '20px',
                                }}
                                iconType='circle'
                                iconSize={10}
                            />
                            <Bar
                                dataKey='male'
                                name='Đồng Hồ Nam'
                                fill='url(#malesGradient)'
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                                animationDuration={2000}
                                animationEasing='ease-in-out'
                            />
                            <Bar
                                dataKey='female'
                                name='Đồng Hồ Nữ'
                                fill='url(#femalesGradient)'
                                radius={[4, 4, 0, 0]}
                                maxBarSize={50}
                                animationDuration={2000}
                                animationEasing='ease-in-out'
                            />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className='mt-8 border-t border-gray-100 pt-6'>
                        <div className={`flex ${!sidebar ? 'gap-2' : 'gap-5'}`}>
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className='flex-1 relative cursor-pointer overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'
                            >
                                <div className='absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6'>
                                    <div className='w-full h-full bg-blue-200 opacity-20 rounded-full'></div>
                                </div>
                                <Text className='text-gray-600 font-medium text-sm uppercase tracking-wider mb-2'>
                                    Tổng SP bán ra
                                </Text>
                                <div className='flex items-baseline gap-1'>
                                    <Title
                                        level={4}
                                        className='!mb-0 !font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'
                                    >
                                        {productSalesData.reduce(
                                            (sum, item) => sum + item.male + item.female,
                                            0
                                        )}
                                    </Title>
                                    <span className='text-blue-600 font-medium'>SP</span>
                                </div>
                                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-blue-600'></div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className='flex-1 relative cursor-pointer overflow-hidden bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'
                            >
                                <div className='absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6'>
                                    <div className='w-full h-full bg-green-200 opacity-20 rounded-full'></div>
                                </div>
                                <Text className='text-gray-600 font-medium text-sm uppercase tracking-wider mb-2'>
                                    Số lượng SP Nam
                                </Text>
                                <div className='flex items-baseline gap-1'>
                                    <Title
                                        level={4}
                                        className='!mb-0 !font-bold bg-gradient-to-r from-green-600 to-green-800 bg-clip-text text-transparent'
                                    >
                                        {productSalesData.reduce((sum, item) => sum + item.male, 0)}
                                    </Title>
                                    <span className='text-green-600 font-medium'>SP</span>
                                </div>
                                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600'></div>
                            </motion.div>

                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                className='flex-1 relative cursor-pointer overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'
                            >
                                <div className='absolute top-0 right-0 w-20 h-20 transform translate-x-6 -translate-y-6'>
                                    <div className='w-full h-full bg-orange-200 opacity-20 rounded-full'></div>
                                </div>
                                <Text className='text-gray-600 font-medium text-sm uppercase tracking-wider mb-2'>
                                    Số lượng SP Nữ
                                </Text>
                                <div className='flex items-baseline gap-1'>
                                    <Title
                                        level={4}
                                        className='!mb-0 !font-bold bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent'
                                    >
                                        {productSalesData.reduce(
                                            (sum, item) => sum + item.female,
                                            0
                                        )}
                                    </Title>
                                    <span className='text-orange-600 font-medium'>SP</span>
                                </div>
                                <div className='absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-orange-400 to-orange-600'></div>
                            </motion.div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* top products selling */}
            <Card className='shadow-lg hover:shadow-xl transition-all duration-300'>
                <div className='flex justify-between items-center mb-6'>
                    <Title level={4} className='!mb-0 flex items-center gap-2'>
                        <FaEye className='text-blue-500' />
                        Sản phẩm bán chạy nhất
                    </Title>

                    <Button type='primary' icon={<FaEye />} onClick={() => navigate('/products')}>
                        Xem tất cả
                    </Button>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6'>
                    {topHighestAccessProducts.map((product, index) => (
                        <motion.div
                            key={product.id}
                            className='relative'
                            whileHover={{
                                scale: 1.05,
                                rotate: [0, -1, 1, -1, 0],
                                transition: {
                                    duration: 0.2,
                                    rotate: {
                                        repeat: Infinity,
                                        duration: 0.5,
                                    },
                                },
                            }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.div
                                className={`relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer ${
                                    index === 0
                                        ? 'ring-2 ring-[#FFDE4D]'
                                        : index === 1
                                        ? 'ring-2 ring-gray-300'
                                        : index === 2
                                        ? 'ring-2 ring-amber-600'
                                        : ''
                                }`}
                                style={{
                                    filter: 'none',
                                }}
                                whileHover={{
                                    filter: 'brightness(1.1)',
                                }}
                            >
                                <div
                                    className={`absolute top-0 left-0 w-full h-1 ${
                                        index === 0
                                            ? 'bg-gradient-to-r from-yellow-300 to-yellow-500'
                                            : index === 1
                                            ? 'bg-gradient-to-r from-gray-200 to-gray-400'
                                            : index === 2
                                            ? 'bg-gradient-to-r from-amber-500 to-amber-700'
                                            : ''
                                    }`}
                                />

                                <div className='aspect-square relative'>
                                    {product?.img && product.img.length > 0 ? (
                                        <Image
                                            src={product.img[0]}
                                            alt={product.productName}
                                            className='object-cover w-full h-full'
                                            preview={{
                                                mask: <div className='text-xs'>Xem Ảnh</div>,
                                            }}
                                        />
                                    ) : (
                                        <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                                            <FaImage className='w-8 h-8 text-gray-400' />
                                        </div>
                                    )}
                                    <Badge
                                        count={`#${index + 1}`}
                                        className='absolute top-2 right-2'
                                        style={{
                                            backgroundColor:
                                                index === 0
                                                    ? '#FFD700'
                                                    : index === 1
                                                    ? '#C0C0C0'
                                                    : index === 2
                                                    ? '#CD7F32'
                                                    : '#1890ff',
                                            fontWeight: 'bold',
                                        }}
                                    />
                                    {product.option && product.option[0]?.value?.price && (
                                        <div className='absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded-full text-sm'>
                                            {product.option[0].value.price.toLocaleString()}đ
                                        </div>
                                    )}
                                </div>

                                <div className='p-4'>
                                    <h3
                                        onClick={() =>
                                            navigate(`/product-detail/${product.id}`, {
                                                state: { from: pathname },
                                            })
                                        }
                                        className='font-medium text-gray-900 truncate mb-1 cursor-pointer'
                                    >
                                        {product.productName}
                                    </h3>
                                    <div className='flex flex-col gap-1 mb-2'>
                                        <span className='font-medium italic'>
                                            Hãng {product.brand}
                                        </span>
                                        <span>Đồng hồ {product.genderUser}</span>
                                        {product.waterproof && (
                                            <Tag color='blue' className='m-0'>
                                                Chống nước {product.waterproof}ATM
                                            </Tag>
                                        )}
                                    </div>

                                    <div className='flex items-center justify-between mt-3 pt-3 border-t border-gray-200'>
                                        <div className='flex items-center gap-2'>
                                            <Tag
                                                className='border-0 rounded-full px-4 py-1 font-medium'
                                                style={{
                                                    background:
                                                        product.stateProduct === 'selling'
                                                            ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
                                                            : 'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                                                    color: 'white',
                                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                }}
                                            >
                                                {product.stateProduct === 'selling'
                                                    ? 'Đang bán'
                                                    : 'Ngừng bán'}
                                            </Tag>
                                        </div>
                                        <div
                                            className={`flex items-center gap-2 rounded-xl px-2 py-1 ${
                                                index === 0
                                                    ? 'bg-yellow-300 text-white'
                                                    : index === 1
                                                    ? 'bg-gray-200 text-gray-800'
                                                    : index === 2
                                                    ? 'bg-amber-500 text-white'
                                                    : 'bg-blue-500 text-white'
                                            }`}
                                        >
                                            <IoIosCart className='text-sm' />
                                            <span className='font-semibold'>{product.selling}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    ))}
                </div>
            </Card>
        </div>
    );
}
