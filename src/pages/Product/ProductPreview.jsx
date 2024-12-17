// import { useLocation, Link, useNavigate } from 'react-router-dom';
// import { Card, Tabs, Breadcrumb, Descriptions, Tag } from 'antd';
// import {
//     BoxPlotOutlined,
//     AppstoreOutlined,
//     SyncOutlined,
//     TrademarkOutlined,
//     BarcodeOutlined,
//     UserOutlined,
// } from '@ant-design/icons';
// import { IoMdWatch } from 'react-icons/io';
// import { FaArrowLeftLong } from 'react-icons/fa6';
// import { Gallery } from './components/exportComponentProduct';
// import { useState, useMemo, useCallback, useEffect } from 'react';

// export default function ProductPreview() {
//     const { location } = useLocation();
//     const product = {};
//     console.log(product);
//     // const product = location.state?.product;
//     const [selectedOption, setSelectedOption] = useState(product?.option?.[0]);
//     const [isExpandDescription, setIsExpandDescription] = useState(false);

//     useEffect(() => {
//         const timer = setTimeout(() => {
//             window.scrollTo({
//                 top: 0,
//                 behavior: 'smooth',
//             });
//         }, 100);

//         return () => clearTimeout(timer);
//     }, []);

//     const formattedPrices = useMemo(() => {
//         if (!selectedOption)
//             return {
//                 originalPrice: '',
//                 discount: '',
//                 finalPrice: '',
//             };

//         return {
//             originalPrice: new Intl.NumberFormat('vi-VN', {
//                 style: 'currency',
//                 currency: 'VND',
//             }).format(selectedOption.price),

//             discount:
//                 selectedOption.discount > 0
//                     ? new Intl.NumberFormat('vi-VN', {
//                           style: 'currency',
//                           currency: 'VND',
//                       }).format(selectedOption.discount)
//                     : 'Không giảm giá',

//             finalPrice: new Intl.NumberFormat('vi-VN', {
//                 style: 'currency',
//                 currency: 'VND',
//             }).format(selectedOption.price - selectedOption.discount),
//         };
//     }, [selectedOption]);

//     const handleOptionSelect = useCallback((opt) => {
//         setSelectedOption(opt);
//     }, []);

//     const toggleDescription = useCallback(() => {
//         setIsExpandDescription((prev) => !prev);
//     }, []);

//     const productFeatures = useMemo(() => {
//         if (!product?.feature) return [];
//         return product.feature.trim() === '' ? [] : product.feature.split(',').map((f) => f.trim());
//     }, [product?.feature]);

//     if (!product) return <div>No preview data available</div>;

//     return (
//         <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 rounded-lg'>
//             {/* Breadcrumb */}
//             <div className='flex items-center justify-between'>
//                 <div className='flex items-center mb-10 gap-x-10 relative'>
//                     <Breadcrumb
//                         items={[
//                             { href: '/dashboard', title: 'Trang chủ' },
//                             { href: '/products', title: 'Danh sách sản phẩm' },
//                             { title: 'Xem trước sản phẩm' },
//                         ]}
//                     />
//                     <Tag color='blue' icon={<SyncOutlined spin />} className='absolute z-10 top-7'>
//                         Thời gian: {new Date().toLocaleString('vi-VN')}
//                     </Tag>
//                 </div>
//                 <Link
//                     to='/products/create'
//                     className='inline-flex items-center gap-2 px-6 py-2.5 rounded-full
//                         bg-white border border-gray-200 shadow-sm hover:shadow-md
//                         text-gray-700 hover:text-primary hover:border-primary/20
//                         transition-all duration-300 ease-in-out transform hover:-translate-x-1
//                         font-medium group mb-1'
//                 >
//                     <FaArrowLeftLong className='w-4 h-4 transition-transform duration-300 group-hover:animate-pulse' />
//                     <span className='bg-gradient-to-r from-gray-800 to-gray-600 hover:from-primary hover:to-primary/80 bg-clip-text text-transparent'>
//                         Quay lại tạo sản phẩm
//                     </span>
//                 </Link>
//             </div>

//             {/* Product detail */}
//             <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
//                 {/* Gallery */}
//                 <div className='space-y-6'>
//                     <Gallery images={product.img} productName={product.productName} />
//                 </div>

//                 {/* Product info */}
//                 <div className='space-y-8'>
//                     {/* Product name and description */}
//                     <Card className='shadow-lg rounded-lg'>
//                         <h1 className='text-3xl font-bold mb-6'>{product.productName}</h1>
//                         <Descriptions bordered column={1} className='mb-8'>
//                             <Descriptions.Item
//                                 label={
//                                     <span className='font-semibold flex items-center'>
//                                         <TrademarkOutlined className='mr-2 text-blue-500' /> Thương
//                                         hiệu
//                                     </span>
//                                 }
//                             >
//                                 <span className='text-lg'>{product.brand}</span>
//                             </Descriptions.Item>
//                             <Descriptions.Item
//                                 label={
//                                     <span className='font-semibold flex items-center'>
//                                         <BarcodeOutlined className='mr-2 text-green-500' /> Mã sản
//                                         phẩm
//                                     </span>
//                                 }
//                             >
//                                 <span className='font-mono'>{product.id || 'Preview'}</span>
//                             </Descriptions.Item>
//                             <Descriptions.Item
//                                 label={
//                                     <span className='font-semibold flex items-center'>
//                                         <IoMdWatch className='mr-2 text-yellow-500' /> Loại đồng hồ
//                                     </span>
//                                 }
//                             >
//                                 <span>{product.type}</span>
//                             </Descriptions.Item>
//                             <Descriptions.Item
//                                 label={
//                                     <span className='font-semibold flex items-center'>
//                                         <UserOutlined className='mr-2 text-purple-500' /> Đối tượng
//                                         sử dụng
//                                     </span>
//                                 }
//                             >
//                                 <span>{product.genderUser}</span>
//                             </Descriptions.Item>
//                         </Descriptions>

//                         {/* Color options */}
//                         <div className='space-y-6'>
//                             <h3 className='text-xl font-semibold'>Màu sắc sản phẩm</h3>
//                             <div className='flex flex-wrap gap-4'>
//                                 {product.option.map((opt) => (
//                                     <button
//                                         key={opt.key}
//                                         onClick={() => handleOptionSelect(opt)}
//                                         className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-200
//                           ${
//                               selectedOption?.key === opt.key
//                                   ? 'bg-gray-100 ring-2 ring-blue-500'
//                                   : 'hover:bg-gray-50'
//                           }`}
//                                     >
//                                         <div
//                                             className='w-6 h-6 rounded-full shadow-inner'
//                                             style={{ backgroundColor: `${opt.key}` }}
//                                         />
//                                         <span className='font-medium'>{opt.color}</span>
//                                     </button>
//                                 ))}
//                             </div>

//                             {selectedOption && (
//                                 <Card className='bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl mt-6'>
//                                     <div className='space-y-6'>
//                                         <div className='flex items-center justify-between'>
//                                             <h3 className='text-xl font-semibold text-gray-800'>
//                                                 Chi tiết phiên bản {selectedOption.color}
//                                             </h3>
//                                             <Tag
//                                                 color='green'
//                                                 className='text-base px-4 py-1.5 rounded-full'
//                                             >
//                                                 Xem trước
//                                             </Tag>
//                                         </div>
//                                         <div className='grid grid-cols-2 gap-6'>
//                                             <div className='bg-white p-4 rounded-lg shadow-sm transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:bg-gray-50 cursor-pointer group'>
//                                                 <div className='text-gray-500 text-sm mb-1 group-hover:text-blue-500 transition-colors duration-300'>
//                                                     Giá gốc
//                                                 </div>
//                                                 <div className='text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors duration-300'>
//                                                     {formattedPrices.originalPrice}
//                                                 </div>
//                                             </div>

//                                             <div className='bg-white p-4 rounded-lg shadow-sm transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:bg-gray-50 cursor-pointer group'>
//                                                 <div className='text-gray-500 text-sm mb-1 group-hover:text-blue-500 transition-colors duration-300'>
//                                                     Số lượng còn
//                                                 </div>
//                                                 <div className='text-2xl font-bold text-blue-600 group-hover:text-blue-700 transition-colors duration-300'>
//                                                     {selectedOption.amount} chiếc
//                                                 </div>
//                                             </div>

//                                             <div className='bg-white p-4 rounded-lg shadow-sm transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:bg-gray-50 cursor-pointer group'>
//                                                 <div className='text-gray-500 text-sm mb-1 group-hover:text-red-500 transition-colors duration-300'>
//                                                     Giảm giá
//                                                 </div>
//                                                 <div className='text-2xl font-bold text-red-500 group-hover:text-red-600 transition-colors duration-300'>
//                                                     {formattedPrices.discount}
//                                                 </div>
//                                             </div>

//                                             <div className='bg-white p-4 rounded-lg shadow-sm transform transition-all duration-300 ease-out hover:scale-105 hover:shadow-md hover:bg-gray-50 cursor-pointer group'>
//                                                 <div className='text-gray-500 text-sm mb-1 group-hover:text-green-500 transition-colors duration-300'>
//                                                     Giá cuối
//                                                 </div>
//                                                 <div className='text-2xl font-bold text-green-600 group-hover:text-green-700 transition-colors duration-300'>
//                                                     {formattedPrices.finalPrice}
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         {selectedOption.amount < 10 && (
//                                             <div className='bg-yellow-50 border border-yellow-200 p-3 rounded-lg'>
//                                                 <span className='text-yellow-600 font-medium'>
//                                                     Chỉ còn {selectedOption.amount} sản phẩm
//                                                 </span>
//                                             </div>
//                                         )}
//                                     </div>
//                                 </Card>
//                             )}
//                         </div>
//                     </Card>

//                     {/* Product details and specs */}
//                     <Tabs
//                         defaultActiveKey='details'
//                         className='bg-white rounded-lg shadow-lg p-6'
//                         tabBarStyle={{
//                             marginBottom: 24,
//                             borderBottom: '2px solid #e5e7eb',
//                             padding: '0 8px',
//                         }}
//                         tabBarGutter={32}
//                         items={[
//                             {
//                                 key: 'details',
//                                 label: (
//                                     <span className='flex items-center space-x-3 text-lg px-4 py-2 transition-all duration-300 hover:text-blue-600'>
//                                         <AppstoreOutlined className='text-xl' />
//                                         <span className='font-medium'>Chi tiết sản phẩm</span>
//                                     </span>
//                                 ),
//                                 children: (
//                                     <div className='space-y-6 animate-fadeIn'>
//                                         <div className='bg-gray-50 p-6 rounded-lg'>
//                                             <h3 className='text-xl font-semibold mb-4'>
//                                                 Mô tả sản phẩm
//                                             </h3>
//                                             <div
//                                                 className={`text-gray-700 leading-relaxed ${
//                                                     !isExpandDescription ? 'line-clamp-3' : ''
//                                                 }`}
//                                             >
//                                                 {product.description}
//                                             </div>
//                                             <button
//                                                 onClick={toggleDescription}
//                                                 className='text-blue-500 hover:text-blue-700 mt-2 font-medium'
//                                             >
//                                                 {isExpandDescription ? 'Thu gọn' : 'Xem thêm'}
//                                             </button>
//                                         </div>

//                                         <div>
//                                             <h3 className='text-xl font-semibold mb-4'>
//                                                 Tính năng nổi bật
//                                             </h3>
//                                             <div className='flex flex-wrap gap-3'>
//                                                 {productFeatures.length === 0 ? (
//                                                     <p className='text-gray-500 italic'>
//                                                         Chưa có tính năng nổi bật
//                                                     </p>
//                                                 ) : (
//                                                     productFeatures.map((feature, index) => (
//                                                         <Tag
//                                                             key={index}
//                                                             className='
//                                                                 px-4 py-2 text-base rounded-full
//                                                                 bg-gradient-to-r from-blue-50 to-indigo-50
//                                                                 border border-blue-200 hover:border-blue-300
//                                                                 text-blue-700 hover:text-blue-800
//                                                                 shadow-sm hover:shadow-md
//                                                                 transition-all duration-300 ease-in-out
//                                                                 cursor-default
//                                                                 flex items-center gap-2
//                                                             '
//                                                         >
//                                                             <span className='w-2 h-2 rounded-full bg-blue-400'></span>
//                                                             {feature}
//                                                         </Tag>
//                                                     ))
//                                                 )}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ),
//                             },
//                             {
//                                 key: 'specs',
//                                 label: (
//                                     <span className='flex items-center space-x-3 text-lg px-4 py-2 transition-all duration-300 hover:text-blue-600'>
//                                         <BoxPlotOutlined className='text-xl' />
//                                         <span className='font-medium'>Thông số kỹ thuật</span>
//                                     </span>
//                                 ),
//                                 children: (
//                                     <div className='animate-fadeIn'>
//                                         <Card className='shadow-sm hover:shadow-md transition-shadow duration-300'>
//                                             <Descriptions column={2}>
//                                                 <Descriptions.Item label='Xuất xứ'>
//                                                     {product.origin}
//                                                 </Descriptions.Item>
//                                                 <Descriptions.Item label='Chất liệu vỏ'>
//                                                     {product.shellMaterial}
//                                                 </Descriptions.Item>
//                                                 <Descriptions.Item label='Dây đeo'>
//                                                     {product.wireMaterial}
//                                                 </Descriptions.Item>
//                                                 <Descriptions.Item label='Chống nước'>
//                                                     {product.waterproof} ATM
//                                                 </Descriptions.Item>
//                                                 <Descriptions.Item label='Hình dạng'>
//                                                     {product.shape}
//                                                 </Descriptions.Item>
//                                                 <Descriptions.Item label='Kiểu dáng'>
//                                                     {product.style}
//                                                 </Descriptions.Item>
//                                                 <Descriptions.Item label='Kích thước'>
//                                                     {product.width}mm x {product.length}mm x{' '}
//                                                     {product.height}mm
//                                                 </Descriptions.Item>
//                                                 <Descriptions.Item label='Khối lượng'>
//                                                     {product.weight}g
//                                                 </Descriptions.Item>
//                                             </Descriptions>
//                                         </Card>
//                                     </div>
//                                 ),
//                             },
//                         ]}
//                     />
//                 </div>
//             </div>
//         </div>
//     );
// }

import { useLocation, Link } from 'react-router-dom';
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
import { FaArrowLeftLong } from 'react-icons/fa6';
import { Gallery } from './components/exportComponentProduct';
import { useState, useMemo, useCallback } from 'react';

export default function ProductPreview() {
    const { state } = useLocation();
    const product = state?.product;
    console.log(state, product);
    const [selectedOption, setSelectedOption] = useState(product?.option?.[0]);
    const [isExpandDescription, setIsExpandDescription] = useState(false);

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
            }).format(selectedOption.price),

            discount:
                selectedOption.discount > 0
                    ? new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                      }).format(selectedOption.discount)
                    : 'Không giảm giá',

            finalPrice: new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND',
            }).format(selectedOption.price - selectedOption.discount),
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

    if (!product) return <div>No preview data available</div>;

    return (
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 rounded-lg'>
            {/* Breadcrumb */}
            <div className='flex items-center justify-between'>
                <div className='flex items-center mb-10 gap-x-10 relative'>
                    <Breadcrumb
                        items={[
                            { href: '/dashboard', title: 'Trang chủ' },
                            { href: '/products', title: 'Danh sách sản phẩm' },
                            { title: 'Xem trước sản phẩm' },
                        ]}
                    />
                    <Tag color='blue' icon={<SyncOutlined spin />} className='absolute z-10 top-7'>
                        Thời gian: {new Date().toLocaleString('vi-VN')}
                    </Tag>
                </div>
                <Link
                    to={`/product/edit/${product.id}`}
                    className='inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                        bg-white border border-gray-200 shadow-sm hover:shadow-md
                        text-gray-700 hover:text-primary hover:border-primary/20
                        transition-all duration-300 ease-in-out transform hover:-translate-x-1
                        font-medium group mb-1'
                >
                    <FaArrowLeftLong className='w-4 h-4 transition-transform duration-300 group-hover:animate-pulse' />
                    <span className='bg-gradient-to-r from-gray-800 to-gray-600 hover:from-primary hover:to-primary/80 bg-clip-text text-transparent'>
                        Quay lại trang chỉnh sửa
                    </span>
                </Link>
            </div>

            {/* Product detail */}
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
                {/* Gallery */}
                <div className='space-y-6'>
                    <Gallery images={product.img} productName={product.productName} />
                </div>

                {/* Product info */}
                <div className='space-y-8'>
                    {/* Product name and description */}
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
                                <span className='font-mono'>{product.id || 'Preview'}</span>
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

                        {/* Color options */}
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
                                        <span className='font-medium'>{opt.color}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedOption && (
                                <Card className='bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-xl mt-6'>
                                    <div className='space-y-6'>
                                        <div className='flex items-center justify-between'>
                                            <h3 className='text-xl font-semibold text-gray-800'>
                                                Chi tiết phiên bản {selectedOption.color}
                                            </h3>
                                            <Tag
                                                color='green'
                                                className='text-base px-4 py-1.5 rounded-full'
                                            >
                                                Xem trước
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
                                                    {selectedOption.amount} chiếc
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

                                        {selectedOption.amount < 10 && (
                                            <div className='bg-yellow-50 border border-yellow-200 p-3 rounded-lg'>
                                                <span className='text-yellow-600 font-medium'>
                                                    Chỉ còn {selectedOption.amount} sản phẩm
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            )}
                        </div>
                    </Card>

                    {/* Product details and specs */}
                    <Tabs
                        defaultActiveKey='details'
                        className='bg-white rounded-lg shadow-lg p-6'
                        tabBarStyle={{
                            marginBottom: 24,
                            borderBottom: '2px solid #e5e7eb',
                            padding: '0 8px',
                        }}
                        tabBarGutter={32}
                        items={[
                            {
                                key: 'details',
                                label: (
                                    <span className='flex items-center space-x-3 text-lg px-4 py-2 transition-all duration-300 hover:text-blue-600'>
                                        <AppstoreOutlined className='text-xl' />
                                        <span className='font-medium'>Chi tiết sản phẩm</span>
                                    </span>
                                ),
                                children: (
                                    <div className='space-y-6 animate-fadeIn'>
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
                                            <div className='flex flex-wrap gap-3'>
                                                {productFeatures.length === 0 ? (
                                                    <p className='text-gray-500 italic'>
                                                        Chưa có tính năng nổi bật
                                                    </p>
                                                ) : (
                                                    productFeatures.map((feature, index) => (
                                                        <Tag
                                                            key={index}
                                                            className='
                                                                px-4 py-2 text-base rounded-full
                                                                bg-gradient-to-r from-blue-50 to-indigo-50
                                                                border border-blue-200 hover:border-blue-300
                                                                text-blue-700 hover:text-blue-800
                                                                shadow-sm hover:shadow-md
                                                                transition-all duration-300 ease-in-out
                                                                cursor-default
                                                                flex items-center gap-2
                                                            '
                                                        >
                                                            <span className='w-2 h-2 rounded-full bg-blue-400'></span>
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
                                    <span className='flex items-center space-x-3 text-lg px-4 py-2 transition-all duration-300 hover:text-blue-600'>
                                        <BoxPlotOutlined className='text-xl' />
                                        <span className='font-medium'>Thông số kỹ thuật</span>
                                    </span>
                                ),
                                children: (
                                    <div className='animate-fadeIn'>
                                        <Card className='shadow-sm hover:shadow-md transition-shadow duration-300'>
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
                                                    {product.width}mm x {product.length}mm x{' '}
                                                    {product.height}mm
                                                </Descriptions.Item>
                                                <Descriptions.Item label='Khối lượng'>
                                                    {product.weight}g
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </div>
                                ),
                            },
                        ]}
                    />
                </div>
            </div>
        </div>
    );
}
