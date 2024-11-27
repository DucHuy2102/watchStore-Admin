import axios from 'axios';
import { useEffect } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Table, Button, Space, Popconfirm, Tooltip, Image, Skeleton, Badge } from 'antd';
import { FaEdit, FaTrash, FaCircle, FaImage, FaFilter, FaEye, FaPlusCircle } from 'react-icons/fa';
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
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showModalFilter, setShowModalFilter] = useState(false);
    const [searchFilterOption, setSearchFilterOption] = useState('');
    const [selectedFilters, setSelectedFilters] = useState([]);

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
                const productsWithIndex = res.data.productResponses.map((product, index) => ({
                    ...product,
                    index: (parseInt(pageNum) - 1) * 12 + index + 1,
                }));
                setProducts(productsWithIndex);
                setTotalProducts(res.data.totalProducts);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        getAllProducts();
        const pageNum = parseInt(searchParams.get('pageNum')) || 1;
        setCurrentPage(pageNum);
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    }, [searchParams]);

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
            width: '20%',
            onCell: (record) => ({
                rowSpan: record.isFirstOption ? record.totalOptions : 0,
            }),
            render: (_, record) => {
                if (!record.isFirstOption) return null;
                return (
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
                        </div>
                    </div>
                );
            },
        },
        {
            title: 'Màu sắc',
            dataIndex: 'color',
            key: 'color',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <div className='flex items-center justify-center gap-2'>
                    <div
                        className='w-4 h-4 rounded-full border shadow-sm'
                        style={{ backgroundColor: record.colorKey }}
                    />
                    <span>{record.value.color}</span>
                </div>
            ),
        },
        {
            title: 'Giá bán',
            dataIndex: 'price',
            key: 'price',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <div>{record.value.price.toLocaleString()}đ</div>
            ),
        },
        {
            title: 'Số lượng',
            dataIndex: 'quantity',
            key: 'quantity',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <div>{record.value.quantity}</div>
            ),
        },
        {
            title: 'Giảm giá',
            dataIndex: 'discount',
            key: 'discount',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <div className='text-red-500'>
                    {record.value.discount > 0
                        ? `${record.value.discount.toLocaleString()}đ`
                        : '-'}
                </div>
            ),
        },
        {
            title: 'Thành tiền',
            dataIndex: 'finalPrice',
            key: 'finalPrice',
            width: '10%',
            align: 'center',
            render: (_, record) => (
                <div className='font-medium'>
                    {(record.value.price - record.value.discount).toLocaleString()}đ
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'status',
            width: '15%',
            align: 'center',
            render: (_, record) => (
                <div
                    className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full ${
                        record.value.quantity > 0
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                    }`}
                >
                    <FaCircle
                        className={`w-2 h-2 ${
                            record.value.quantity > 0 ? 'text-green-500' : 'text-red-500'
                        }`}
                    />
                    <span className='font-medium'>
                        {record.value.quantity > 0 ? 'Còn hàng' : 'Hết hàng'}
                    </span>
                </div>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            width: '10%',
            align: 'center',
            onCell: (record) => ({
                rowSpan: record.isFirstOption ? record.totalOptions : 0,
            }),
            render: (_, record) => {
                if (!record.isFirstOption) return null;
                return (
                    <div className='flex flex-col items-center justify-center gap-2'>
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
                );
            },
        },
    ];

    const transformedData = products.flatMap(product => 
        product.option.map((opt, index) => ({
            ...product,
            isFirstOption: index === 0,
            totalOptions: product.option.length,
            colorKey: opt.key,
            value: opt.value,
        }))
    );

    return (
        <div className='p-4'>
            <div className='mb-4 flex justify-between items-center'>
                <h1 className='text-2xl font-bold'>Quản lý sản phẩm</h1>
                <Button
                    type='primary'
                    size='large'
                    icon={<FaPlusCircle className='text-lg' />}
                    onClick={() => navigate('/product/create')}
                    className='flex items-center gap-2.5 h-12 px-7 bg-gradient-to-r from-blue-500 to-blue-600 
                    hover:from-blue-600 hover:to-blue-700 transition-all duration-300 
                    transform hover:scale-[1.02]'
                >
                    <span className='font-semibold tracking-wide'>Thêm sản phẩm mới</span>
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
                            dataSource={transformedData}
                            rowKey={(record) => `${record.id}-${record.value.color}`}
                            pagination={{
                                current: currentPage,
                                total: totalProducts,
                                pageSize: 12,
                                showSizeChanger: false,
                                showQuickJumper: false,
                                showTotal: (total) => `Tổng số ${total} sản phẩm`,
                            }}
                            onChange={handleTableChange}
                            bordered
                        />
                    ) : (
                        <Empty description='Không có sản phẩm nào' />
                    )}
                </div>
            )}
        </div>
    );
}
