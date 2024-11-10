import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Input, Button, Space, Popconfirm, Tooltip, Image, Skeleton } from 'antd';
import { FaSearch, FaEdit, FaTrash, FaPlus, FaCircle, FaImage, FaFilter } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { FilterModal_Component } from '../../components/exportComponent';
import { toast } from 'react-toastify';

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
    const [isLoading, setIsLoading] = useState(false);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchText, setSearchText] = useState('');
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

    const handleSearch = () => {
        const search = new URLSearchParams(searchParams);
        search.set('pageNum', '1');
        if (searchText.trim() !== '') {
            search.set('q', searchText.trim());
        } else {
            search.delete('q');
        }
        setSearchParams(search);
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
            title: 'Hình ảnh',
            dataIndex: 'image',
            key: 'image',
            render: (_, record) => (
                <div className='relative w-16 h-16'>
                    {record?.img && record.img.length > 0 ? (
                        <Image
                            src={record.img[0]}
                            alt={record.productName}
                            className='rounded-lg object-cover w-16 h-16'
                            fallback='/path-to-fallback-image.png'
                            preview={true}
                        />
                    ) : (
                        <div className='w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center'>
                            <FaImage className='w-6 h-6 text-gray-400' />
                        </div>
                    )}
                </div>
            ),
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (_, record) =>
                record?.productName && (
                    <Link to={`/product-detail/${record.id}`} className='truncate'>
                        {record.productName}
                    </Link>
                ),
        },
        {
            title: 'Giá gốc',
            align: 'center',
            dataIndex: 'price',
            sorter: (a, b) => a.price - b.price,
            key: 'price',
            render: (price) => `${price.toLocaleString()}đ`,
        },
        {
            title: 'Giảm giá',
            align: 'center',
            dataIndex: 'discount',
            sorter: (a, b) => a.discount - b.discount,
            key: 'discount',
            render: (discount) => `${discount.toLocaleString()}đ`,
        },
        {
            title: 'Giá đang bán',
            align: 'center',
            dataIndex: 'priceNow',
            key: 'priceNow',
            render: (_, record) => {
                const finalPrice = record.price - record.discount;
                const discountPercent = ((record.discount / record.price) * 100).toFixed(0);
                return (
                    <Tooltip
                        title={record.discount > 0 ? `Giảm ${discountPercent}%` : 'Không giảm giá'}
                    >
                        <span className='font-medium'>
                            {finalPrice.toLocaleString()}đ
                            {record.discount > 0 && (
                                <span className='ml-2 text-xs text-red-500'>
                                    -{discountPercent}%
                                </span>
                            )}
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Số lượng',
            align: 'center',
            dataIndex: 'amount',
            key: 'amount',
            sorter: (a, b) => a.amount - b.amount,
            render: (amount) => {
                let color = 'green';
                let status = 'Còn nhiều';
                if (amount < 20) {
                    color = 'red';
                    status = 'Sắp hết hàng';
                } else if (amount < 50) {
                    color = 'yellow';
                    status = 'Số lượng trung bình';
                }
                return (
                    <Tooltip title={status}>
                        <span className={`text-${color}-500 cursor-pointer font-medium`}>
                            {amount.toLocaleString()}
                        </span>
                    </Tooltip>
                );
            },
        },
        {
            title: 'Trạng thái',
            align: 'center',
            dataIndex: 'state',
            key: 'state',
            render: (state) => {
                return state === 'saling' ? (
                    <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full'>
                        <FaCircle className='w-2 h-2 text-blue-500 animate-pulse' />
                        <span className='font-medium'>Đang bán</span>
                    </div>
                ) : state === 'soldOut' ? (
                    <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full'>
                        <FaCircle className='w-2 h-2 text-gray-500' />
                        <span className='font-medium'>Hết hàng</span>
                    </div>
                ) : (
                    <div className='inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 rounded-full'>
                        <FaCircle className='w-2 h-2 text-red-500' />
                        <span className='font-medium'>Đã xóa</span>
                    </div>
                );
            },
        },
        {
            title: 'Thao tác',
            align: 'center',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type='primary' icon={<FaEdit />} onClick={() => handleEdit(record.id)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title='Bạn có chắc muốn xóa sản phẩm này?'
                        onConfirm={() => handleDelete(record.id)}
                    >
                        <Button type='primary' danger icon={<FaTrash />}>
                            Xóa
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div className='p-4 mt-10'>
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

            <div className='mb-6 flex gap-x-3 items-center'>
                <div className='flex-1 relative'>
                    <Input
                        placeholder='Tìm kiếm sản phẩm theo tên, mã, thương hiệu...'
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        onPressEnter={handleSearch}
                        className='h-10 pl-11'
                        allowClear
                    />
                    <span className='absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none'>
                        <FaSearch className='w-4 h-4 text-gray-400' />
                    </span>
                </div>

                <Space size='middle'>
                    <Button
                        type='primary'
                        onClick={handleSearch}
                        icon={<FaSearch className='text-sm' />}
                        className='h-10 px-6 flex items-center gap-2 shadow-sm'
                    >
                        Tìm kiếm
                    </Button>

                    <Tooltip
                        title={
                            selectedFilters.length > 0
                                ? `${selectedFilters.length} bộ lọc đang được áp dụng`
                                : 'Mở bộ lọc nâng cao'
                        }
                    >
                        <Button
                            type='default'
                            onClick={() => setShowModalFilter(true)}
                            className={`h-10 px-5 flex items-center gap-2 border-2 transition-all duration-200 hover:border-blue-500 hover:text-blue-500 ${
                                selectedFilters.length > 0
                                    ? 'border-blue-500 text-blue-500'
                                    : 'border-gray-200'
                            }`}
                        >
                            <FaFilter className='text-sm' />
                            <span>Bộ lọc</span>
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
                <Table
                    columns={columns}
                    dataSource={products}
                    loading={isLoading}
                    pagination={{
                        total: totalProducts,
                        current: parseInt(searchParams.get('pageNum') || '1'),
                        pageSize: 12,
                        onChange: (page) => handleTableChange({ current: page }),
                        showSizeChanger: false,
                        showTotal: (total) => `Tổng ${total} sản phẩm`,
                    }}
                    onChange={handleTableChange}
                    rowKey='id'
                    scroll={{ x: 'max-content' }}
                    size='middle'
                />
            )}
        </div>
    );
}
