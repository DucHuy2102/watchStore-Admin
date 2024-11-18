import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Button, Space, Popconfirm, Tooltip, Image, Skeleton, Badge } from 'antd';
import { FaEdit, FaTrash, FaPlus, FaCircle, FaImage, FaFilter, FaEye } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { FilterModal_Component } from '../../components/exportComponent';
import { toast } from 'react-toastify';
import SearchInput from './components/SearchInput';
import { Empty } from 'antd';

const options = [
    {
        title: 'Đối tượng',
        choices: [
            { key: 'gender', value: 'Nữ', label: 'Đồng hồ nữ' },
            { key: 'gender', value: 'Nam', label: 'Đồng hồ nam' },
        ],
    },
    {
        title: 'Chất liệu dây',
        choices: [
            { key: 'wireMaterial', value: 'Dây Da', label: 'Dây Da' },
            { key: 'wireMaterial', value: 'Dây Nhựa', label: 'Dây Nhựa' },
            { key: 'wireMaterial', value: 'Dây Kim Loại', label: 'Dây Kim Loại' },
            {
                key: 'wireMaterial',
                value: 'Dây Thép Không Gỉ Mạ Vàng PVD',
                label: 'Dây Thép Không Gỉ Mạ Vàng PVD',
            },
        ],
    },
    {
        title: 'Hình dáng mặt đồng hồ',
        choices: [
            { key: 'shape', value: 'Mặt tròn', label: 'Mặt tròn' },
            { key: 'shape', value: 'Mặt vuông', label: 'Mặt vuông' },
        ],
    },
    {
        title: 'Kháng nước',
        choices: [
            { key: 'waterProof', value: '3', label: '3atm' },
            { key: 'waterProof', value: '5', label: '5atm' },
            { key: 'waterProof', value: '10', label: '10atm' },
            { key: 'waterProof', value: '20', label: '20atm' },
        ],
    },
];

export default function ListProduct() {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    console.log(products);
    const [isLoading, setIsLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showModalFilter, setShowModalFilter] = useState(false);
    const [searchFilterOption, setSearchFilterOption] = useState('');
    const [selectedFilters, setSelectedFilters] = useState([]);

    useEffect(() => {
        getAllProducts();
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, [searchParams]);

    const getAllProducts = async () => {
        try {
            setIsLoading(true);
            const filterParams = Array.from(searchParams.entries())
                .filter(([key]) => key !== 'pageNum')
                .map(([key, value]) => `${key}=${value}`)
                .join('&');

            const pageNum = searchParams.get('pageNum') || '1';

            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/product/get-all-product${
                    filterParams ? `?${filterParams}&pageNum=${pageNum}` : `?pageNum=${pageNum}`
                }`,
                {
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                }
            );
            if (res.status === 200) {
                setProducts(res.data.productResponses);
                setTotalProducts(res.data.totalProducts);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredOptions = options.map((option) => ({
        ...option,
        choices: option.choices.filter((choice) =>
            choice.label.toLowerCase().includes(searchFilterOption.toLowerCase())
        ),
    }));

    const handleSelect = (choice) => {
        const isChoiceExist = selectedFilters.some(
            (item) => item.key === choice.key && item.value === choice.value
        );
        if (!isChoiceExist) {
            setSelectedFilters([...selectedFilters, choice]);
        }
    };

    const handleRemoveOptionFilter = (filterToRemove) => {
        const updatedFilters = selectedFilters.filter(
            (filter) =>
                !(filter.key === filterToRemove.key && filter.value === filterToRemove.value)
        );
        setSelectedFilters(updatedFilters);
    };

    const updateSearchParams = (filters) => {
        const newSearchParams = new URLSearchParams();
        newSearchParams.set('pageNum', '1');

        const filterGroups = {};
        filters.forEach((filter) => {
            if (filter?.value.trim()) {
                if (!filterGroups[filter.key]) {
                    filterGroups[filter.key] = new Set();
                }
                filterGroups[filter.key].add(filter.value.trim());
            }
        });

        Object.entries(filterGroups).forEach(([key, values]) => {
            const valuesArray = Array.from(values);
            if (valuesArray.length > 0) {
                newSearchParams.set(key, valuesArray.join(','));
            }
        });

        searchParams.forEach((value, key) => {
            if (key !== 'pageNum' && !options.some((option) => option.choices[0].key === key)) {
                newSearchParams.set(key, value);
            }
        });

        searchParams.forEach((value, key) => {
            if (key === 'q' && value.trim()) {
                newSearchParams.set(key, value);
            }
        });

        setSearchParams(newSearchParams);
    };

    const handleSubmitFilter = (e) => {
        e.preventDefault();
        updateSearchParams(selectedFilters);
        setShowModalFilter(false);
    };

    const handleTableChange = (pagination) => {
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.set('pageNum', pagination.current.toString());
        setSearchParams(newSearchParams);
    };

    const handleEdit = (id) => {
        navigate(`/product/edit/${id}`);
    };

    const handleDelete = async (id) => {
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/product/delete`, {
                params: {
                    productId: id,
                },
                headers: {
                    Authorization: `Bearer ${tokenUser}`,
                },
            });
            toast.success('Xóa sản phẩm thành công');
            await getAllProducts();
        } catch (error) {
            toast.error('Có lỗi xảy ra khi xóa sản phẩm');
        }
    };

    const columns = [
        {
            title: 'Sản phẩm',
            dataIndex: 'product',
            key: 'product',
            width: '40%',
            render: (_, record) => (
                <div className='flex items-center gap-4'>
                    <div className='relative w-20 h-20'>
                        {record?.img && record.img.length > 0 ? (
                            <Image
                                src={record.img[0]}
                                alt={record.productName}
                                className='rounded-lg object-cover w-full h-full'
                                loading='lazy'
                                preview={{
                                    mask: <div className='text-xs'>Xem</div>,
                                }}
                            />
                        ) : (
                            <div className='w-full h-full bg-gray-100 rounded-lg flex items-center justify-center'>
                                <FaImage className='w-6 h-6 text-gray-400' />
                            </div>
                        )}
                    </div>
                    <div className='flex flex-col'>
                        <Link
                            to={`/product-detail/${record.id}`}
                            className='font-medium text-gray-900 hover:text-blue-600 mb-1'
                        >
                            {record.productName}
                        </Link>
                        <span className='text-sm text-gray-500'>
                            {record.origin} · {record.type}
                        </span>
                    </div>
                </div>
            ),
        },
        {
            title: 'Màu sắc',
            dataIndex: 'variants',
            key: 'variants',
            align: 'center',
            width: '35%',
            render: (_, record) => (
                <div className='flex flex-wrap justify-center items-center gap-2'>
                    {record.option?.map((opt, index) => (
                        <Tooltip
                            key={opt.key || index}
                            title={
                                <div className='space-y-1'>
                                    <div>
                                        Giá:{' '}
                                        {(opt.value.price - opt.value.discount).toLocaleString()}đ
                                    </div>
                                    <div>Kho: {opt.value.quantity}</div>
                                    {opt.value.discount > 0 && (
                                        <div className='text-red-400'>
                                            Giảm:{' '}
                                            {((opt.value.discount / opt.value.price) * 100).toFixed(
                                                0
                                            )}
                                            %
                                        </div>
                                    )}
                                </div>
                            }
                        >
                            <div className='flex items-center cursor-pointer gap-2 px-3 py-1.5 bg-gray-50 rounded-full'>
                                <div
                                    className='w-4 h-4 rounded-full border shadow-sm'
                                    style={{ backgroundColor: opt.key }}
                                />
                                <span className='text-sm font-medium text-gray-700'>
                                    {opt.value.color}
                                </span>
                                {opt.value.quantity === 0 && (
                                    <Badge status='error' text='Hết' className='text-xs' />
                                )}
                            </div>
                        </Tooltip>
                    ))}
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: '15%',
            align: 'center',
            render: (_, record) => {
                const totalQuantity =
                    record.option?.reduce((sum, opt) => sum + opt.value.quantity, 0) || 0;
                const hasDiscount = record.option?.some((opt) => opt.value.discount > 0);

                return (
                    <div className='space-y-2'>
                        <div
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full ${
                                totalQuantity > 0
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-700'
                            }`}
                        >
                            <FaCircle
                                onClick={() => navigate(`/product-detail/${record.id}`)}
                                className={`w-2 h-2 ${
                                    totalQuantity > 0 ? 'text-green-500' : 'text-red-500'
                                }`}
                            />
                            <span className='font-medium'>
                                {totalQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                            </span>
                        </div>
                        {hasDiscount && (
                            <div className='text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full inline-block'>
                                Đang giảm giá
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <div className='flex items-center justify-center gap-2'>
                    <Tooltip title='Xem chi tiết'>
                        <Link to={`/product-detail/${record.id}`}>
                            <Button type='text' icon={<FaEye className='text-blue-600' />} />
                        </Link>
                    </Tooltip>
                    <Tooltip title='Chỉnh sửa'>
                        <Button
                            type='text'
                            icon={<FaEdit className='text-gray-600' />}
                            onClick={() => handleEdit(record.id)}
                        />
                    </Tooltip>
                    <Tooltip title='Xóa'>
                        <Popconfirm
                            title='Bạn có chắc muốn xóa sản phẩm này?'
                            onConfirm={() => handleDelete(record.id)}
                        >
                            <Button type='text' icon={<FaTrash className='text-red-600' />} />
                        </Popconfirm>
                    </Tooltip>
                </div>
            ),
        },
    ];

    return (
        <div className='p-4'>
            <div className='mb-4 flex justify-between items-center'>
                <h1 className='text-2xl font-bold'>Quản lý sản phẩm</h1>
                <Button
                    className='w-44'
                    type='primary'
                    icon={<FaPlus />}
                    onClick={() => navigate('/product/create')}
                >
                    Thêm sản phẩm
                </Button>
            </div>

            <div className='mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-x-3 sm:items-center'>
                <SearchInput
                    onSearch={(text) => {
                        const search = new URLSearchParams(searchParams);
                        search.set('pageNum', '1');
                        if (text.trim() !== '') {
                            search.set('q', text.trim());
                        } else {
                            search.delete('q');
                        }
                        setSearchParams(search);
                    }}
                    placeholder='Tìm kiếm theo tên sản phẩm, mã sản phẩm...'
                />

                <Space size='middle' className='flex-shrink-0'>
                    <Tooltip
                        title={selectedFilters.length ? `${selectedFilters.length} bộ lọc` : 'Lọc'}
                    >
                        <Button
                            onClick={() => setShowModalFilter(true)}
                            className={`h-11 px-5 flex items-center gap-2 border-2 ${
                                selectedFilters.length ? 'border-blue-500 text-blue-500' : ''
                            }`}
                        >
                            <FaFilter />
                            <span className='hidden sm:inline'>Bộ lọc</span>
                            {selectedFilters.length > 0 && (
                                <span className='flex items-center justify-center w-5 h-5 text-xs font-medium bg-blue-500 text-white rounded-full'>
                                    {selectedFilters.length}
                                </span>
                            )}
                        </Button>
                    </Tooltip>
                </Space>
            </div>

            <FilterModal_Component
                show={showModalFilter}
                onClose={() => setShowModalFilter(false)}
                searchFilterOption={searchFilterOption}
                onSearchChange={(value) => setSearchFilterOption(value)}
                selectedFilters={selectedFilters}
                onRemoveFilter={handleRemoveOptionFilter}
                filteredOptions={filteredOptions}
                onSelect={handleSelect}
                onSubmit={handleSubmitFilter}
            />

            {isLoading ? (
                <Skeleton active />
            ) : (
                <div className='bg-white rounded-lg shadow'>
                    {products.length > 0 ? (
                        <Table
                            columns={columns}
                            dataSource={products}
                            rowKey='id'
                            pagination={{
                                total: totalProducts,
                                pageSize: 12,
                                showSizeChanger: false,
                                showQuickJumper: false,
                                showTotal: (total) => `Tổng số ${total} sản phẩm`,
                            }}
                            onChange={handleTableChange}
                        />
                    ) : (
                        <Empty description='Không có sản phẩm nào' />
                    )}
                </div>
            )}
        </div>
    );
}
