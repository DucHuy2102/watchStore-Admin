import axios from 'axios';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useParams } from 'react-router-dom';
import { Button, Modal, Textarea } from 'flowbite-react';
import { Card, Steps, Tag, Spin } from 'antd';
import { FaBox, FaTruck, FaCheckCircle, FaClock, FaBan, FaUser } from 'react-icons/fa';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { toast } from 'react-toastify';

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
    const [isLoading, setIsLoading] = useState(false);
    const [modalConfirmCancel, setModalConfirmCancel] = useState(false);
    const [cancelReason, setCancelReason] = useState('');

    const getOrderById = useCallback(
        async (id) => {
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
        },
        [tokenUser]
    );

    useEffect(() => {
        getOrderById(id);
    }, [getOrderById, id]);

    const checkPaid = useMemo(() => {
        if (order?.paid) {
            if (order?.paymentMethod === 'VNPAY') {
                return 'Thanh toán qua VNPAY';
            } else {
                return 'Thanh toán khi nhận hàng';
            }
        }
        return 'Chưa thanh toán';
    }, [order]);

    const getOrderStatus = useCallback(() => {
        if (order?.state === 'cancel') return -1;
        if (order?.state === 'complete') return 2;
        if (order?.state === 'delivery') return 1;
        return 0;
    }, [order]);

    const handleDeliveryOrder = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/order/approval-oder`,
                {},
                {
                    params: {
                        orderId: order.id,
                    },
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                }
            );
            if (res.status === 200) {
                toast.success('Đang tiến hành giao hàng');
                getOrderById(id);
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi giao hàng');
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }, [tokenUser, order, id, getOrderById]);

    const handleCancelOrder = useCallback(async () => {
        try {
            setIsLoading(true);
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/order/decline-oder`,
                {
                    cancelReason,
                },
                {
                    params: {
                        orderId: order.id,
                    },
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                }
            );
            if (res.status === 200) {
                toast.success('Đã hủy đơn hàng thành công');
                getOrderById(id);
                setModalConfirmCancel(false);
                setCancelReason('');
            }
        } catch (error) {
            toast.error('Có lỗi xảy ra khi hủy đơn hàng');
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }, [cancelReason, order?.id, tokenUser, getOrderById, id]);

    if (isLoading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <Spin size='large' tip='Đang tải thông tin đơn hàng...' />
            </div>
        );
    }

    const ProductItem = ({ item }) => (
        <div className='grid grid-cols-12 gap-6 items-center p-6 rounded-xl hover:bg-gray-50/50 transition-colors'>
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
                        {item.product.option.value.discount > 0 && (
                            <span className='text-gray-400 line-through font-semibold block'>
                                {formatPrice(item.product.option.value.price)}
                            </span>
                        )}
                        {item.product.option.value.discount > 0 && (
                            <span className='text-sm text-green-600 font-medium'>
                                (-{formatPrice(item.product.option.value.discount)})
                            </span>
                        )}
                    </div>
                    <div className='flex items-center justify-center gap-x-2'>
                        <span className='text-xl font-bold text-primary'>
                            {formatPrice(
                                item.product.option.value.price - item.product.option.value.discount
                            )}
                        </span>
                        {item.product.option.value.discount > 0 && (
                            <div className='bg-red-50 text-red-600 px-4 py-1.5 rounded-full text-sm font-medium'>
                                Giảm{' '}
                                {Math.round(
                                    (item.product.option.value.discount /
                                        item.product.option.value.price) *
                                        100
                                )}
                                %
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
                        {formatPrice(
                            (item.product.option.value.price - item.product.option.value.discount) *
                                item.quantity
                        )}
                    </span>
                    {item.product.option.value.discount > 0 && (
                        <span className='text-sm text-green-600 font-medium whitespace-nowrap'>
                            (Tiết kiệm{' '}
                            {formatPrice(item.product.option.value.discount * item.quantity)})
                        </span>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div className='max-w-6xl mx-auto p-8 min-h-screen'>
            {/* header */}
            <div className='mb-10'>
                <Link
                    to='/orders'
                    className='inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                        bg-white border border-gray-200 shadow-sm hover:shadow-md
                        text-gray-700 hover:text-primary hover:border-primary/20
                        transition-all duration-300 ease-in-out transform hover:-translate-x-1
                        font-medium group'
                >
                    <FaArrowLeftLong className='w-4 h-4 transition-transform duration-300 group-hover:animate-pulse' />
                    <span className='bg-gradient-to-r from-gray-800 to-gray-600 hover:from-primary hover:to-primary/80 bg-clip-text text-transparent'>
                        Quay lại danh sách
                    </span>
                </Link>
                <div className='flex justify-between items-center bg-gray-50 p-8 rounded-xl mt-4 border border-gray-100'>
                    <div>
                        <h1 className='text-3xl font-bold text-gray-900 mb-3'>Chi tiết đơn hàng</h1>
                        <p className='text-gray-600 font-medium tracking-wide'>
                            Mã đơn hàng: #{order?.id}
                        </p>
                    </div>
                    <Tag
                        color={order?.paid ? 'success' : 'error'}
                        className={`text-base px-8 py-2.5 rounded-full font-medium ${
                            order?.paid ? 'bg-green-50' : 'bg-red-50'
                        }`}
                    >
                        {checkPaid}
                    </Tag>
                </div>
            </div>

            {/* order status */}
            <Card className='mb-10 shadow-xl border-0 rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50/80'>
                {order?.state === 'cancel' ? (
                    <div className='text-center py-6'>
                        <FaBan className='w-12 h-12 text-red-500 mx-auto mb-4' />
                        <h3 className='text-xl font-bold text-gray-900 mb-2'>Đơn hàng đã bị hủy</h3>
                        <p className='text-gray-600 font-medium'>
                            Lý do:{' '}
                            {order.cancelMessage ? order.cancelMessage : 'Admin hủy đơn hàng'}
                        </p>
                    </div>
                ) : (
                    <Steps
                        current={getOrderStatus()}
                        className='px-20'
                        items={[
                            {
                                title: (
                                    <span
                                        className={`font-semibold ${
                                            order?.state === 'cancel'
                                                ? 'text-red-500'
                                                : order?.state === 'processing'
                                                ? 'text-blue-500 animate-pulse'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        {order?.state === 'cancel'
                                            ? 'Đã hủy đơn hàng'
                                            : order?.state === 'processing'
                                            ? 'Đang xử lý'
                                            : 'Đã tiến hành giao'}
                                    </span>
                                ),
                                icon: <FaClock className='mt-1' />,
                                description: (
                                    <div className='flex flex-col mt-1 w-40 gap-y-1'>
                                        <span
                                            className={`font-semibold ${
                                                order?.state === 'cancel'
                                                    ? 'text-red-500'
                                                    : order?.state === 'processing'
                                                    ? 'text-blue-500 animate-pulse'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {order?.state === 'cancel'
                                                ? 'Đã hủy đơn hàng'
                                                : 'Thời gian tạo đơn'}
                                        </span>
                                        {order?.createdAt && order?.state !== 'cancel' && (
                                            <span
                                                className={`text-xs ${
                                                    order?.state === 'processing'
                                                        ? 'text-blue-500 animate-pulse'
                                                        : 'text-gray-500'
                                                } mt-1 font-medium`}
                                            >
                                                {new Date(order.createdAt).toLocaleDateString(
                                                    'vi-VN'
                                                )}
                                            </span>
                                        )}
                                    </div>
                                ),
                                status: order?.state === 'cancel' ? 'error' : undefined,
                            },
                            {
                                title: (
                                    <span
                                        className={`font-semibold ${
                                            order?.state === 'cancel'
                                                ? 'text-red-500'
                                                : order?.state === 'delivery'
                                                ? 'text-blue-500 animate-pulse'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        Đang giao hàng
                                    </span>
                                ),
                                icon: <FaTruck className='mt-1' />,
                                description: (
                                    <div className='flex flex-col mt-1 w-40'>
                                        <span
                                            className={`font-medium ${
                                                order?.state === 'cancel'
                                                    ? 'text-red-500'
                                                    : order?.state === 'delivery'
                                                    ? 'text-blue-500 animate-pulse'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {order?.state === 'delivery'
                                                ? 'Đang giao hàng'
                                                : order?.state === 'complete'
                                                ? 'Đã giao hàng'
                                                : order?.state === 'cancel'
                                                ? 'Đã hủy đơn hàng'
                                                : 'Chờ xử lý'}
                                        </span>
                                        {order?.shippingDate && (
                                            <span className='text-xs text-gray-500 mt-1'>
                                                {new Date(order.shippingDate).toLocaleDateString(
                                                    'vi-VN'
                                                )}
                                            </span>
                                        )}
                                    </div>
                                ),
                                status: order?.state === 'cancel' ? 'error' : undefined,
                            },
                            {
                                title: (
                                    <span
                                        className={`font-semibold ${
                                            order?.state === 'cancel'
                                                ? 'text-red-500'
                                                : order?.state === 'complete'
                                                ? 'text-blue-500 animate-pulse'
                                                : 'text-gray-500'
                                        }`}
                                    >
                                        Hoàn thành
                                    </span>
                                ),
                                icon: <FaBox className='mt-1' />,
                                description: (
                                    <div className='flex flex-col mt-1'>
                                        <span
                                            className={`font-medium ${
                                                order?.state === 'cancel'
                                                    ? 'text-red-500'
                                                    : order?.state === 'complete'
                                                    ? 'text-blue-500 animate-pulse'
                                                    : 'text-gray-500'
                                            }`}
                                        >
                                            {order?.state === 'delivery'
                                                ? 'Đang giao hàng'
                                                : order?.state === 'complete'
                                                ? 'Đơn hàng đã đến người dùng'
                                                : order?.state === 'cancel'
                                                ? 'Đã hủy đơn hàng'
                                                : 'Chờ xử lý'}
                                        </span>
                                        {order?.deliveredAt && (
                                            <span
                                                className={`text-xs ${
                                                    order?.state === 'complete'
                                                        ? 'text-blue-500 animate-pulse'
                                                        : 'text-gray-500'
                                                } mt-1 font-medium`}
                                            >
                                                {new Date(order.deliveredAt).toLocaleDateString(
                                                    'vi-VN'
                                                )}
                                            </span>
                                        )}
                                    </div>
                                ),
                                status: order?.state === 'cancel' ? 'error' : undefined,
                            },
                        ]}
                    />
                )}
            </Card>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-8 mb-10'>
                {/* user info */}
                <Card
                    title={
                        <span className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                            <FaUser className='text-primary' />
                            Thông tin khách hàng
                        </span>
                    }
                    className='shadow-lg border-0 rounded-xl'
                >
                    <div className='space-y-5'>
                        <div className='flex border-b border-gray-100 pb-4'>
                            <span className='w-36 text-gray-600'>Họ tên:</span>
                            <span className='font-semibold text-gray-900' title={order?.user.name}>
                                {order?.user.name}
                            </span>
                        </div>
                        <div className='flex border-b border-gray-100 pb-4'>
                            <span className='w-36 text-gray-600'>Số điện thoại:</span>
                            <span className='font-semibold text-gray-900' title={order?.user.phone}>
                                {order?.user.phone}
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-36 text-gray-600'>Email:</span>
                            <span className='font-semibold text-gray-900' title={order?.user.email}>
                                {order?.user.email}
                            </span>
                        </div>
                    </div>
                </Card>

                {/* shipping info */}
                <Card
                    title={
                        <span className='text-xl font-bold text-gray-800 flex items-center gap-2'>
                            <FaTruck className='text-primary' />
                            Thông tin giao hàng
                        </span>
                    }
                    className='shadow-lg border-0 rounded-xl'
                >
                    <div className='space-y-5'>
                        <div className='flex border-b border-gray-100 pb-4'>
                            <span className='w-36 text-gray-600'>Tỉnh/Thành:</span>
                            <span className='font-semibold text-gray-900'>
                                {order?.user.address.province.label}
                            </span>
                        </div>
                        <div className='flex border-b border-gray-100 pb-4'>
                            <span className='w-36 text-gray-600'>Quận/Huyện:</span>
                            <span className='font-semibold text-gray-900'>
                                {order?.user.address.district.label}
                            </span>
                        </div>
                        <div className='flex border-b border-gray-100 pb-4'>
                            <span className='w-36 text-gray-600'>Phường/Xã:</span>
                            <span className='font-semibold text-gray-900'>
                                {order?.user.address.ward.label}
                            </span>
                        </div>
                        <div className='flex'>
                            <span className='w-36 text-gray-600'>Địa chỉ cụ thể:</span>
                            <span className='w-full ml-10 font-semibold text-gray-900 line-clamp-1 hover:line-clamp-none'>
                                {order?.user.address.fullAddress}
                                {order?.user.address.fullAddress}
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            {/* product info */}
            <Card
                className='shadow-lg border-0 rounded-xl'
                title={
                    <span className='text-xl font-bold text-gray-800 flex items-center gap-2 px-2'>
                        <FaBox className='text-primary' />
                        Thông tin sản phẩm
                    </span>
                }
            >
                <div className='bg-gray-50 -mx-6 px-8 py-5 border-y border-gray-100 mb-6'>
                    <div className='hidden md:grid grid-cols-12 gap-6 text-sm text-gray-600 font-semibold tracking-wide'>
                        <div className='col-span-5 text-left'>Sản phẩm</div>
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

                <div className='mt-10 pt-6 border-t border-gray-100'>
                    <div className='space-y-5 px-4'>
                        <div className='flex justify-between items-center text-lg'>
                            <span className='text-gray-600'>Tổng tiền sản phẩm</span>
                            <span className='font-medium text-gray-900'>
                                {formatPrice(order?.itemsPrice)}
                            </span>
                        </div>

                        {order?.shippingPrice > 0 && (
                            <div className='flex justify-between items-center text-lg'>
                                <span className='text-gray-600'>Phí vận chuyển</span>
                                <span className='font-medium text-gray-900'>
                                    {formatPrice(order?.shippingPrice)}
                                </span>
                            </div>
                        )}

                        {order?.coupon && (
                            <div className='flex justify-between items-center text-green-600 text-lg'>
                                <span>Giảm giá</span>
                                <span className='font-medium'>
                                    - {formatPrice(order.coupon.discount)}
                                </span>
                            </div>
                        )}

                        <div className='flex justify-between items-center pt-5 border-t border-gray-100'>
                            <span className='font-semibold text-gray-900 text-xl'>
                                Tổng thanh toán
                            </span>
                            <span className='font-bold text-primary text-3xl'>
                                {formatPrice(order?.totalPrice)}
                            </span>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Action Buttons */}
            {(order?.state === 'processing' || order?.state !== 'cancel') && (
                <div>
                    <div className='max-w-6xl mx-auto mt-7'>
                        <div className='flex items-center justify-end gap-x-5'>
                            {/* button ancel order */}
                            {order?.state !== 'cancel' && (
                                <>
                                    <Button
                                        danger
                                        onClick={() => setModalConfirmCancel(true)}
                                        loading={isLoading}
                                        className='!ring-0 px-2 h-12 text-base font-medium bg-gradient-to-r from-red-500 to-red-600 hover:scale-105 transform transition-all text-white'
                                    >
                                        <div className='flex items-center justify-center gap-2'>
                                            <FaBan className='text-lg' />
                                            Hủy đơn
                                        </div>
                                    </Button>

                                    {/* Modal confirm cancel order */}
                                    <Modal
                                        show={modalConfirmCancel}
                                        onClose={() => setModalConfirmCancel(false)}
                                        size='md'
                                        popup
                                    >
                                        <Modal.Header className='px-6 pt-6 pb-0'>
                                            <div className='flex items-center gap-2 text-xl font-bold text-gray-900'>
                                                <FaBan className='text-red-500' />
                                                Xác nhận hủy đơn hàng
                                            </div>
                                        </Modal.Header>
                                        <Modal.Body className='px-6 py-4'>
                                            <div className='space-y-4'>
                                                <p className='text-gray-600'>
                                                    Hãy cân nhắc kỹ lưỡng trước khi hủy đơn hàng
                                                </p>
                                                <Textarea
                                                    placeholder='Nhập lý do hủy đơn hàng...'
                                                    value={cancelReason}
                                                    onChange={(e) =>
                                                        setCancelReason(e.target.value)
                                                    }
                                                    rows={4}
                                                    className='w-full'
                                                />
                                                <div className='flex justify-end gap-3'>
                                                    <Button
                                                        color='gray'
                                                        onClick={() => setModalConfirmCancel(false)}
                                                    >
                                                        Hủy
                                                    </Button>
                                                    <Button
                                                        color='failure'
                                                        onClick={handleCancelOrder}
                                                        isProcessing={isLoading}
                                                    >
                                                        <div className='flex items-center gap-2'>
                                                            <FaBan />
                                                            Xác nhận hủy
                                                        </div>
                                                    </Button>
                                                </div>
                                            </div>
                                        </Modal.Body>
                                    </Modal>
                                </>
                            )}

                            {order?.state === 'processing' && (
                                <Button
                                    type='primary'
                                    onClick={handleDeliveryOrder}
                                    loading={isLoading}
                                    className='!ring-0 px-2 h-12 text-base font-medium bg-gradient-to-r from-blue-500 to-blue-600 hover:scale-105 transform transition-all text-white'
                                >
                                    <div className='flex items-center justify-center gap-2'>
                                        <FaTruck className='text-lg' />
                                        Giao hàng
                                    </div>
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
