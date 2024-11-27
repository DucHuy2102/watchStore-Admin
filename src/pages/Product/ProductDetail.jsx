import axios from 'axios';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Card, Tabs, Breadcrumb, Descriptions, Tag } from 'antd';
import {
    BoxPlotOutlined,
    AppstoreOutlined,
    SyncOutlined,
    TrademarkOutlined,
    BarcodeOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { IoMdWatch } from 'react-icons/io';
import { Gallery } from './components/exportComponentProduct';

export default function ProductDetail() {
    const { id } = useParams();
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedOption, setSelectedOption] = useState(null);
    const [isExpandDescription, setIsExpandDescription] = useState(false);

    useEffect(() => {
        const getProductDetail = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/client/product`, {
                    params: {
                        productId: id,
                    },
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                });
                if (res?.status === 200) {
                    const { data } = res;
                    setProduct(data);
                    if (data?.option?.length > 0) {
                        setSelectedOption(data.option[0]);
                    }
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        getProductDetail();
    }, [id]);

    const formattedPrices = useMemo(() => {
        if (!selectedOption)
            return {
                originalPrice: '',
                discount: '',
                finalPrice: '',
            };

        return {
            originalPrice: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(selectedOption.value.price),

            discount:
                selectedOption.value.discount > 0
                    ? new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                      }).format(selectedOption.value.discount)
                    : 'Không giảm giá',

            finalPrice: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(selectedOption.value.price - selectedOption.value.discount),
        };
    }, [selectedOption]);

    const handleOptionSelect = useCallback((opt) => {
        setSelectedOption(opt);
    }, []);

    const toggleDescription = useCallback(() => {
        setIsExpandDescription((prev) => !prev);
    }, []);

    const productFeatures = useMemo(() => {
        if (!product?.feature) return [];
        return product.feature.trim() === '' ? [] : product.feature.split(',').map((f) => f.trim());
    }, [product?.feature]);

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900'></div>
            </div>
        );
    }

    if (!product) return null;

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 rounded-lg'>
            <div className='flex items-center mb-10 gap-x-10 relative'>
                <Breadcrumb
                    items={[
                        { href: '/dashboard', title: 'Trang chủ' },
                        { href: '/products', title: 'Danh sách sản phẩm' },
                        { title: product.productName },
                    ]}
                />
                <Tag color='blue' icon={<SyncOutlined spin />} className='absolute z-10 top-7'>
                    Thời gian: {new Date().toLocaleString('vi-VN')}
                </Tag>
            </div>

            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                <div className='space-y-6'>
                    <Gallery images={product.img} productName={product.productName} />
                </div>

                <div className='space-y-8'>
                    <Card className='shadow-lg rounded-lg'>
                        <h1 className='text-3xl font-bold mb-6'>{product.productName}</h1>
                        <Descriptions bordered column={1} className='mb-8'>
                            <Descriptions.Item
                                label={
                                    <span className='font-semibold flex items-center'>
                                        <TrademarkOutlined className='mr-2 text-blue-500' /> Thương
                                        hiệu
                                    </span>
                                }
                            >
                                <span className='text-lg'>{product.brand}</span>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <span className='font-semibold flex items-center'>
                                        <BarcodeOutlined className='mr-2 text-green-500' /> Mã sản
                                        phẩm
                                    </span>
                                }
                            >
                                <span className='font-mono'>{product.id}</span>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <span className='font-semibold flex items-center'>
                                        <IoMdWatch className='mr-2 text-yellow-500' /> Loại đồng hồ
                                    </span>
                                }
                            >
                                <span>{product.type}</span>
                            </Descriptions.Item>
                            <Descriptions.Item
                                label={
                                    <span className='font-semibold flex items-center'>
                                        <UserOutlined className='mr-2 text-purple-500' /> Đối tượng
                                        sử dụng
                                    </span>
                                }
                            >
                                <span>{product.genderUser}</span>
                            </Descriptions.Item>
                        </Descriptions>

                        <div className='space-y-6'>
                            <h3 className='text-xl font-semibold'>Màu sắc sản phẩm</h3>
                            <div className='flex flex-wrap gap-4'>
                                {product.option.map((opt) => (
                                    <button
                                        key={opt.key}
                                        onClick={() => handleOptionSelect(opt)}
                                        className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-200
                          ${
                              selectedOption?.key === opt.key
                                  ? 'bg-gray-100 ring-2 ring-blue-500'
                                  : 'hover:bg-gray-50'
                          }`}
                                    >
                                        <div
                                            className='w-6 h-6 rounded-full shadow-inner'
                                            style={{ backgroundColor: `${opt.key}` }}
                                        />
                                        <span className='font-medium'>{opt.value.color}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedOption && (
                                <Card className='bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl mt-6'>
                                    <div className='space-y-6'>
                                        <div className='flex items-center justify-between'>
                                            <h3 className='text-xl font-semibold text-gray-800'>
                                                Chi tiết phiên bản {selectedOption.value.color}
                                            </h3>
                                            <Tag
                                                color={
                                                    selectedOption.value.state === 'seling'
                                                        ? 'green'
                                                        : 'red'
                                                }
                                                className='text-base px-4 py-1.5 rounded-full'
                                            >
                                                {selectedOption.value.state === 'seling'
                                                    ? 'Đang bán'
                                                    : 'Ngừng bán'}
                                            </Tag>
                                        </div>
                                        <div className='grid grid-cols-2 gap-6'>
                                            <div className='bg-white p-4 rounded-lg shadow-sm transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:bg-gray-50 cursor-pointer group'>
                                                <div className='text-gray-500 text-sm mb-1 group-hover:text-blue-500 transition-colors duration-300'>
                                                    Giá gốc
                                                </div>
                                                <div className='text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300'>
                                                    {formattedPrices.originalPrice}
                                                </div>
                                            </div>

                                            <div className='bg-white p-4 rounded-lg shadow-sm transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:bg-gray-50 cursor-pointer group'>
                                                <div className='text-gray-500 text-sm mb-1 group-hover:text-blue-500 transition-colors duration-300'>
                                                    Số lượng còn
                                                </div>
                                                <div className='text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300'>
                                                    {selectedOption.value.quantity} chiếc
                                                </div>
                                            </div>

                                            <div className='bg-white p-4 rounded-lg shadow-sm transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:bg-gray-50 cursor-pointer group'>
                                                <div className='text-gray-500 text-sm mb-1 group-hover:text-red-500 transition-colors duration-300'>
                                                    Giảm giá
                                                </div>
                                                <div className='text-2xl font-bold text-red-500 group-hover:text-red-600 transition-colors duration-300'>
                                                    {formattedPrices.discount}
                                                </div>
                                            </div>

                                            <div className='bg-white p-4 rounded-lg shadow-sm transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:bg-gray-50 cursor-pointer group'>
                                                <div className='text-gray-500 text-sm mb-1 group-hover:text-green-500 transition-colors duration-300'>
                                                    Giá cuối
                                                </div>
                                                <div className='text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-300'>
                                                    {formattedPrices.finalPrice}
                                                </div>
                                            </div>
                                        </div>

                                        {selectedOption.value.quantity < 10 && (
                                            <div className='bg-yellow-50 border border-yellow-200 p-3 rounded-lg'>
                                                <span className='text-yellow-600 font-medium'>
                                                    Chỉ còn {selectedOption.value.quantity} sản phẩm
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </Card>

                    <Tabs
                        defaultActiveKey='details'
                        className='bg-white rounded-lg shadow-lg p-6'
                        items={[
                            {
                                key: 'details',
                                label: (
                                    <span className='flex items-center space-x-2'>
                                        <div>
                                            <AppstoreOutlined />
                                        </div>
                                        <span>Chi tiết sản phẩm</span>
                                    </span>
                                ),
                                children: (
                                    <div className='space-y-6'>
                                        <div className='bg-gray-50 p-6 rounded-lg'>
                                            <h3 className='text-xl font-semibold mb-4'>
                                                Mô tả sản phẩm
                                            </h3>
                                            <div
                                                className={`text-gray-700 leading-relaxed ${
                                                    !isExpandDescription ? 'line-clamp-3' : ''
                                                }`}
                                            >
                                                {product.description}
                                            </div>
                                            <button
                                                onClick={toggleDescription}
                                                className='text-blue-500 hover:text-blue-700 mt-2 font-medium'
                                            >
                                                {isExpandDescription ? 'Thu gọn' : 'Xem thêm'}
                                            </button>
                                        </div>

                                        <div>
                                            <h3 className='text-xl font-semibold mb-4'>
                                                Tính năng nổi bật
                                            </h3>
                                            <div className='flex flex-wrap gap-2'>
                                                {productFeatures.length === 0 ? (
                                                    <p className='text-gray-500 italic'>
                                                        Chưa có tính năng nổi bật
                                                    </p>
                                                ) : (
                                                    productFeatures.map((feature, index) => (
                                                        <Tag
                                                            key={index}
                                                            color='blue'
                                                            className='text-sm'
                                                        >
                                                            {feature}
                                                        </Tag>
                                                    ))
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ),
                            },
                            {
                                key: 'specs',
                                label: (
                                    <span className='flex items-center space-x-2'>
                                        <div className='mr-2'>
                                            <BoxPlotOutlined />
                                        </div>
                                        Thông số kỹ thuật
                                    </span>
                                ),
                                children: (
                                    <Card className='shadow-sm'>
                                        <Descriptions column={2}>
                                            <Descriptions.Item label='Xuất xứ'>
                                                {product.origin}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Chất liệu vỏ'>
                                                {product.shellMaterial}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Dây đeo'>
                                                {product.wireMaterial}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Chống nước'>
                                                {product.waterproof} ATM
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Hình dạng'>
                                                {product.shape}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Kiểu dáng'>
                                                {product.style}
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Kích thước'>
                                                {product.width}mm
                                            </Descriptions.Item>
                                            <Descriptions.Item label='Khối lượng'>
                                                {product.weight}g
                                            </Descriptions.Item>
                                        </Descriptions>
                                    </Card>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}