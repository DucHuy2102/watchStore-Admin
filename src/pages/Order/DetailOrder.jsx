import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Card, Steps, Tag, Divider } from 'antd';
import { FaBox, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa';
import { FaArrowLeftLong } from 'react-icons/fa6';
const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(price);
};

export default function DetailOrder() {
    const { id } = useParams();
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [order, setOrder] = useState(null);
    console.log('order -->', order);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        getOrderById(id);
    }, [id]);

    const getOrderById = async (id) => {
        try {
            setIsLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/order/get-by-id`, {
                params: {
                    orderId: id,
                },
                headers: {
                    Authorization: `Bearer ${tokenUser}`,
                },
            });
            if (res.status === 200) {
                setOrder(res.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const getOrderStatus = () => {
        if (order?.delivered) return 3;
        if (order?.paid) return 1;
        if (order?.state === 'processing') return 2;
        return 0;
    };

    const ProductItem = ({ item }) => (
        <div className='grid grid-cols-12 gap-6 items-center p-4 rounded-lg hover:bg-gray-50 transition-colors'>
            <div className='col-span-12 md:col-span-5'>
                <div className='flex gap-5 items-center'>
                    <div className='w-28 h-28 bg-white rounded-2xl border border-gray-100 p-3 flex-shrink-0'>
                        <img
                            src={item.product.img[0]}
                            alt={item.product.productName}
                            className='w-full h-full object-contain'
                        />
                    </div>
                    <div className='flex-1 min-w-0 space-y-2'>
                        <h3 className='font-medium text-gray-900 text-lg line-clamp-2'>
                            {item.product.productName}
                        </h3>
                        <div className='text-sm text-gray-600'>
                            {item.product.brand} • {item.product.origin}
                        </div>
                        <div className='text-sm text-gray-500 line-clamp-2'>
                            {item.product.feature}
                        </div>
                    </div>
                </div>
            </div>

            <div className='col-span-12 md:col-span-4'>
                <div className='flex flex-col items-center gap-2'>
                    <div className='flex items-center justify-center gap-x-3'>
                        {item.product.discount > 0 && (
                            <span className='text-gray-400 line-through font-semibold block'>
                                {formatPrice(item.product.price)}
                            </span>
                        )}
                        {item.product.discount > 0 && (
                            <span className='text-sm text-green-600 font-medium'>
                                (-{formatPrice(item.product.discount)})
                            </span>
                        )}
                    </div>
                    <div className='flex items-center justify-center gap-x-2'>
                        <span className='text-xl font-bold text-primary'>
                            {formatPrice(item.product.price - item.product.discount)}
                        </span>
                        {item.product.discount > 0 && (
                            <div className='bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-medium'>
                                Giảm{' '}
                                {Math.round((item.product.discount / item.product.price) * 100)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className='col-span-6 md:col-span-1'>
                <div className='flex justify-center'>
                    <span className='px-5 py-2 bg-gray-50 rounded-lg font-medium text-gray-900'>
                        {item.quantity}
                    </span>
                </div>
            </div>

            <div className='col-span-6 md:col-span-2'>
                <div className='flex items-center gap-2 flex-wrap justify-end'>
                    <span className='text-xl font-bold text-primary whitespace-nowrap'>
                        {formatPrice((item.product.price - item.product.discount) * item.quantity)}
                    </span>
                    {item.product.discount > 0 && (
                        <span className='text-sm text-green-600 font-medium whitespace-nowrap'>
                            (Tiết kiệm {formatPrice(item.product.discount * item.quantity)})
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className='max-w-5xl mx-auto p-6 bg-gray-50 min-h-screen'>
            <div className='mb-8'>
                <Link
                    to='/orders'
                    className='inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 transition-colors'
                >
                    <FaArrowLeftLong className='w-4 h-4 mr-2' />
                    Quay lại danh sách
                </Link>
                <div className='flex justify-between items-center bg-white p-6 rounded-lg shadow-sm'>
                    <div>
                        <h1 className='text-3xl font-semibold text-gray-900 mb-2'>
                            Chi tiết đơn hàng
                        </h1>
                        <p className='text-gray-600 font-medium'>Mã đơn hàng: #{order?.id}</p>
                    </div>
                    <Tag
                        color={order?.paid ? 'success' : 'error'}
                        className={`text-base px-6 py-2 rounded-full ${
                            order?.paid ? 'bg-green-50' : 'bg-red-50'
                        }`}
                    >
                        {order?.paid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                    </Tag>
                </div>
            </div>
            <Card className='mb-8 shadow-none border-2 border-gray-100'>
                <Steps
                    current={getOrderStatus()}
                    progressDot
                    className='px-8'
                    items={[
                        {
                            title: 'Đặt hàng',
                            description: new Date(order?.createdAt).toLocaleDateString('vi-VN'),
                        },
                        {
                            title: 'Thanh toán',
                            description: order?.paidAt
                                ? new Date(order.paidAt).toLocaleDateString('vi-VN')
                                : '',
                        },
                        {
                            title: 'Đang xử lý',
                            description: order?.state === 'processing' ? 'Đang xử lý' : '',
                        },
                        {
                            title: 'Đã giao hàng',
                            description: order?.deliveredAt
                                ? new Date(order.deliveredAt).toLocaleDateString('vi-VN')
                                : '',
                        },
                    ]}
                />
            </Card>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-8'>
                <Card
                    title={
                        <span className='text-lg font-semibold text-gray-800'>
                            Thông tin khách hàng
                        </span>
                    }
                    className='shadow-none border-2 border-gray-100'
                >
                    <div className='space-y-4'>
                        <div className='flex border-b border-gray-100 pb-3'>
                            <span className='w-32 text-gray-600'>Họ tên:</span>
                            <span className='font-medium text-gray-900'>{order?.user.name}</span>
                        </div>
                        <div className='flex border-b border-gray-100 pb-3'>
                            <span className='w-32 text-gray-600'>Email:</span>
                            <span className='font-medium text-gray-900'>{order?.user.email}</span>
                        </div>
                        <div className='flex'>
                            <span className='w-32 text-gray-600'>Số điện thoại:</span>
                            <span className='font-medium text-gray-900'>{order?.user.phone}</span>
                        </div>
                    </div>
                </Card>

                <Card
                    title={
                        <span className='text-lg font-semibold text-gray-800'>
                            Thông tin giao hàng
                        </span>
                    }
                    className='shadow-none border-2 border-gray-100'
                >
                    <div className='space-y-4'>
                        <div className='flex border-b border-gray-100 pb-3'>
                            <span className='w-32 text-gray-600'>Tỉnh/Thành:</span>
                            <span className='font-medium text-gray-900'>
                                {order?.user.address.province.label}
                            </span>
                        </div>
                        <div className='flex border-b border-gray-100 pb-3'>
                            <span className='w-32 text-gray-600'>Quận/Huyện:</span>
                            <span className='font-medium text-gray-900'>
                                {order?.user.address.district.label}
                            </span>
                        </div>
                        <div className='flex border-b border-gray-100 pb-3'>
                            <span className='w-32 text-gray-600'>Phường/Xã:</span>
                            <span className='font-medium text-gray-900'>
                                {order?.user.address.ward.label}
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-32 text-gray-600'>Địa chỉ:</span>
                            <span className='font-medium text-gray-900'>
                                {order?.user.address.fullAddress}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>
            <Card className='shadow-sm border-2 border-gray-100 mb-8'>
                <div className='flex items-center gap-3 px-2 mb-6'>
                    <h2 className='text-xl font-semibold text-gray-800'>Thông tin sản phẩm</h2>
                </div>

                <div className='bg-gray-50/50 -mx-6 px-6 py-4 border-y border-gray-100 mb-6'>
                    <div className='hidden md:grid grid-cols-12 gap-6 text-sm text-gray-600 font-medium'>
                        <div className='col-span-5 text-center'>Sản phẩm</div>
                        <div className='col-span-4 text-center'>Đơn giá</div>
                        <div className='col-span-1 text-center'>SL</div>
                        <div className='col-span-2 text-center'>Thành tiền</div>
                    </div>
                </div>

                <div className='divide-y divide-gray-100'>
                    {order?.products.map((item) => (
                        <ProductItem key={item.id} item={item} />
                    ))}
                </div>

                <div className='mt-8 pt-6 border-t border-gray-100'>
                    <div className='space-y-4'>
                        <div className='flex justify-between items-center'>
                            <span className='text-gray-600'>Tổng tiền sản phẩm</span>
                            <span className='font-medium text-gray-900'>
                                {formatPrice(order?.itemsPrice)}
                            </span>
                        </div>

                        {order?.shippingPrice > 0 && (
                            <div className='flex justify-between items-center'>
                                <span className='text-gray-600'>Phí vận chuyển</span>
                                <span className='font-medium text-gray-900'>
                                    {formatPrice(order?.shippingPrice)}
                                </span>
                            </div>
                        )}

                        {order?.coupon && (
                            <div className='flex justify-between items-center text-green-600'>
                                <span>Giảm giá</span>
                                <span className='font-medium'>
                                    - {formatPrice(order.coupon.discount)}
                                </span>
                            </div>
                        )}

                        <div className='flex justify-between items-center pt-4 border-t border-gray-100'>
                            <span className='font-medium text-gray-900 text-lg'>
                                Tổng thanh toán
                            </span>
                            <span className='font-bold text-primary text-2xl'>
                                {formatPrice(order?.totalPrice)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
