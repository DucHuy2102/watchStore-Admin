import axios from 'axios';
import { useEffect, useMemo, useCallback } from 'react';
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
    Table,
    Button,
    Space,
    Popconfirm,
    Tooltip,
    Image,
    Skeleton,
    Select,
    Card,
    Modal,
    Switch,
    Tag,
} from 'antd';
import { FaEdit, FaTrash, FaCircle, FaImage, FaFilter, FaEye, FaPlusCircle } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { FilterModal } from '../../components/exportComponent';
import { toast } from 'react-toastify';
import SearchInput from './components/SearchInput';
import { Empty } from 'antd';

const STATE_OPTIONS = [
    { value: 'all', label: 'Tất cả trạng thái' },
    { value: 'selling', label: 'Đang bán' },
    { value: 'pause', label: 'Ngừng bán' },
    { value: 'outOfStock', label: 'Hết hàng' },
    { value: 'deleted', label: 'Đã xóa' },
];

const PAGE_SIZE = 12;

export default function ListProduct() {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalProducts, setTotalProducts] = useState(0);
    const [searchParams, setSearchParams] = useSearchParams();
    const [showModalFilter, setShowModalFilter] = useState(false);
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [selectedState, setSelectedState] = useState('all');
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const [selectedOptions, setSelectedOptions] = useState(null);
    const [waterProof, setWaterProof] = useState([]);
    const [wireMaterial, setWireMaterial] = useState([]);

    const getAllProducts = useCallback(async () => {
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
                const { data } = res;
                const productsWithIndex = data.productResponses.map((product, idx) => ({
                    ...product,
                    index: (pageNum - 1) * PAGE_SIZE + idx + 1,
                }));
                setProducts(productsWithIndex);
                setTotalProducts(data.totalProducts);
                setWaterProof(data.waterProof);
                setWireMaterial(data.wireMaterial);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }, [tokenUser, searchParams]);

    useEffect(() => {
        getAllProducts();
        const pageNum = parseInt(searchParams.get('pageNum')) || 1;
        setCurrentPage(pageNum);
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams]);

    const FILTER_OPTIONS = useMemo(
        () => [
            {
                title: 'Đối tượng',
                choices: [
                    { key: 'gender', value: 'Nữ', label: 'Đồng hồ nữ' },
                    { key: 'gender', value: 'Nam', label: 'Đồng hồ nam' },
                    { key: 'gender', value: 'Thiếu nhi', label: 'Đồng hồ thiếu nhi' },
                    { key: 'gender', value: 'Tất cả', label: 'Tất cả đối tượng' },
                ],
            },
            {
                title: 'Chất liệu dây',
                choices: wireMaterial.map((wireMaterial) => ({
                    key: 'wireMaterial',
                    value: wireMaterial,
                    label: wireMaterial,
                })),
            },
            {
                title: 'Hình dáng mặt đồng hồ',
                choices: [
                    { key: 'shape', value: 'Đồng hồ mặt tròn', label: 'Đồng hồ mặt tròn' },
                    { key: 'shape', value: 'Đồng hồ mặt vuông', label: 'Đồng hồ mặt vuông' },
                    {
                        key: 'shape',
                        value: 'Đồng hồ mặt chữ nhật',
                        label: 'Đồng hồ mặt chữ nhật',
                    },
                    {
                        key: 'shape ',
                        value: 'Đồng hồ mặt tam giác',
                        label: 'Đồng hồ mặt tam giác',
                    },
                    {
                        key: 'shape',
                        value: 'Đồng hồ mặt bầu dục',
                        label: 'Đồng hồ mặt bầu dục',
                    },
                    {
                        key: 'shape',
                        value: 'Đồng hồ mặt Tonneau',
                        label: 'Đồng hồ mặt Tonneau',
                    },
                    {
                        key: 'shape',
                        value: 'Đồng hồ mặt Carage',
                        label: 'Đồng hồ mặt Carage',
                    },
                    {
                        key: 'shape',
                        value: 'Đồng hồ mặt Cushion',
                        label: 'Đồng hồ mặt Cushion',
                    },
                    {
                        key: 'shape',
                        value: 'Đồng hồ mặt bát giác',
                        label: 'Đồng hồ mặt bát giác',
                    },
                ],
            },
            {
                title: 'Kháng nước',
                choices: waterProof.map((waterProof) => ({
                    key: 'waterProof',
                    value: waterProof,
                    label: `${waterProof} ATM`,
                })),
            },
        ],
        [waterProof, wireMaterial]
    );

    const handleStateChange = useCallback(
        (value) => {
            setSelectedState(value);
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.set('pageNum', '1');
            if (value === 'all') {
                newSearchParams.delete('state');
            } else {
                newSearchParams.set('state', value);
            }
            setSearchParams(newSearchParams);
        },
        [searchParams, setSearchParams]
    );

    const handleSelect = useCallback(
        (choice) => {
            const isChoiceExist = selectedFilters.some(
                (item) => item.key === choice.key && item.value === choice.value
            );
            if (!isChoiceExist) {
                setSelectedFilters([...selectedFilters, choice]);
            }
        },
        [selectedFilters]
    );

    const updateSearchParams = useCallback(
        (filters) => {
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
                if (
                    key !== 'pageNum' &&
                    !FILTER_OPTIONS.some((option) => option.choices[0].key === key)
                ) {
                    newSearchParams.set(key, value);
                }
            });

            searchParams.forEach((value, key) => {
                if (key === 'q' && value.trim()) {
                    newSearchParams.set(key, value);
                }
            });

            setSearchParams(newSearchParams);
        },
        [FILTER_OPTIONS, searchParams, setSearchParams]
    );

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

    const handleEdit = useCallback(
        (id) => {
            navigate(`/product/edit/${id}`);
        },
        [navigate]
    );

    const handleDeleteProduct = useCallback(
        async (id) => {
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
        },
        [getAllProducts, tokenUser]
    );

    const showOptionModal = (options, productId) => {
        setSelectedOptions(options.map((opt) => ({ ...opt, productId })));
        setIsModalVisible(true);
    };

    const handleModalClose = () => {
        setIsModalVisible(false);
        setSelectedOptions(null);
    };

    const handleToggleProductState = useCallback(
        async (productId, currentState) => {
            try {
                const newState = currentState === 'selling' ? 'pause' : 'selling';

                await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/product/toggle-state`,
                    { productId, state: newState },
                    {
                        headers: {
                            Authorization: `Bearer ${tokenUser}`,
                        },
                    }
                );

                toast.success(`Đã ${newState === 'selling' ? 'mở bán' : 'tạm ngừng'} sản phẩm`);
                await getAllProducts();
            } catch (error) {
                console.error('Error toggling product state:', error);
                toast.error('Có lỗi xảy ra khi thay đổi trạng thái sản phẩm');
            }
        },
        [getAllProducts, tokenUser]
    );

    const columns = useMemo(
        () => [
            {
                title: 'STT',
                key: 'index',
                width: '5%',
                align: 'center',
                render: (_, record) => <span>{record.index}</span>,
            },
            {
                title: (
                    <div className='flex flex-col items-center gap-1'>
                        <span className='text-black font-semibold'>Thông tin sản phẩm</span>
                        <div className='text-xs text-gray-400 font-normal'>
                            Tên sản phẩm - Hãng - Đối tượng
                        </div>
                    </div>
                ),
                dataIndex: 'product',
                key: 'product',
                width: '25%',
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
                        <div className='flex flex-col max-w-[200px]'>
                            <Tooltip title={record.productName}>
                                <Link
                                    to={`/product-detail/${record.id}`}
                                    className='font-medium text-gray-900 hover:text-blue-600 mb-1 truncate'
                                >
                                    {record.productName}
                                </Link>
                            </Tooltip>
                            <span className='text-sm font-medium text-gray-500'>
                                Hãng: {record.brand}
                            </span>
                            <span className='text-sm text-gray-400'>
                                Đồng hồ {record.genderUser.toLowerCase()}
                            </span>
                        </div>
                    </div>
                ),
            },
            {
                title: (
                    <div className='flex flex-col items-center gap-1'>
                        <span className='text-black font-semibold'>Thông số kỹ thuật</span>
                        <div className='text-xs text-gray-400 font-normal'>
                            Kích thước - Trọng lượng
                        </div>
                    </div>
                ),
                key: 'specifications',
                width: '15%',
                align: 'center',
                render: (_, record) => (
                    <div className='flex flex-col gap-2'>
                        <div className='bg-gray-50 p-2 rounded-lg'>
                            <div className='text-xs text-gray-500 mb-1'>Kích thước (mm)</div>
                            <div className='font-medium text-gray-700 flex justify-center items-center gap-x-1'>
                                <span>{record.length}</span>
                                <span>x</span>
                                <span>{record.width}</span>
                                <span>x</span>
                                <span>{record.height}</span>
                            </div>
                        </div>
                        <div className='bg-gray-50 p-2 rounded-lg'>
                            <div className='text-xs text-gray-500 mb-1'>Trọng lượng (g)</div>
                            <div className='font-medium text-gray-700 flex justify-center items-center'>
                                {record.weight}
                            </div>
                        </div>
                    </div>
                ),
            },
            {
                title: (
                    <div className='flex flex-col items-center gap-1'>
                        <span className='text-black font-semibold'>Màu sắc</span>
                        <div className='text-xs text-gray-400 font-normal'>
                            Nhấn vào từng màu để xem chi tiết
                        </div>
                    </div>
                ),
                key: 'colors',
                width: '15%',
                align: 'center',
                render: (_, record) => (
                    <div className='flex flex-col gap-2'>
                        {record.option.map((opt, index) => (
                            <div
                                key={index}
                                onClick={() => showOptionModal(record.option, record.id)}
                                className='flex items-center gap-2 cursor-pointer'
                            >
                                <div
                                    className='w-6 h-6 rounded-lg border shadow-sm'
                                    style={{ backgroundColor: opt.key }}
                                />
                                <Tag
                                    className={`px-2 w-20 text-center py-1 text-xs font-semibold rounded-full border-none ${
                                        opt.value.state === 'selling'
                                            ? 'bg-green-100 text-green-700'
                                            : opt.value.state === 'pause'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-red-100 text-red-700'
                                    }`}
                                >
                                    {opt.value.state === 'selling'
                                        ? 'Đang bán'
                                        : opt.value.state === 'pause'
                                        ? 'Ngừng bán'
                                        : 'Hết hàng'}
                                </Tag>
                            </div>
                        ))}
                    </div>
                ),
            },
            {
                title: (
                    <div className='flex flex-col items-center gap-1'>
                        <span className='text-black font-semibold'>Giá bán (VND)</span>
                        <div className='text-xs text-gray-400 font-normal'>
                            Nhấn nút xem giá để xem chi tiết
                        </div>
                    </div>
                ),
                dataIndex: 'price',
                key: 'price',
                width: '15%',
                align: 'center',
                sorter: (a, b) => a.price - b.price,
                render: (_, record) => (
                    <Button
                        type='primary'
                        onClick={() => showOptionModal(record.option, record.id)}
                        className='bg-blue-500 hover:bg-blue-600 hover:scale-105 
                    shadow-md hover:shadow-lg transition-all duration-300'
                    >
                        Xem giá
                    </Button>
                ),
            },
            {
                title: (
                    <div className='flex flex-col items-center gap-1'>
                        <span className='text-black font-semibold'>Trạng thái</span>
                        <div className='text-xs text-gray-400 font-normal'>
                            Trạng thái bán của dòng sản phẩm
                        </div>
                    </div>
                ),
                dataIndex: 'stateProduct',
                key: 'stateProduct',
                width: '15%',
                align: 'center',
                render: (state) => (
                    <div className='flex flex-col items-center gap-2'>
                        <Tag
                            className={`px-3 py-1 font-medium text-sm rounded-full border-none ${
                                state === 'selling'
                                    ? 'bg-green-100 text-green-700'
                                    : state === 'pause'
                                    ? 'bg-yellow-100 text-yellow-700'
                                    : state === 'deleted'
                                    ? 'bg-gray-600 text-white'
                                    : 'bg-red-100 text-red-700'
                            }`}
                        >
                            <span className='flex items-center gap-1.5'>
                                <FaCircle
                                    className={`w-2 h-2 ${
                                        state === 'selling'
                                            ? 'text-green-500'
                                            : state === 'pause'
                                            ? 'text-yellow-500'
                                            : state === 'deleted'
                                            ? 'text-gray-500'
                                            : 'text-red-500'
                                    }`}
                                />
                                {state === 'selling'
                                    ? 'Đang bán'
                                    : state === 'pause'
                                    ? 'Ngừng bán'
                                    : state === 'deleted'
                                    ? 'Đã xóa'
                                    : 'Hết hàng'}
                            </span>
                        </Tag>
                    </div>
                ),
            },
            {
                title: (
                    <div className='flex flex-col items-center gap-1'>
                        <span className='text-black font-semibold'>Thao tác</span>
                        <div className='text-xs text-gray-400 font-normal'>
                            Thêm - Sửa - Xóa - Ngừng bán
                        </div>
                    </div>
                ),
                key: 'action',
                width: '10%',
                align: 'center',
                render: (_, record) => (
                    <div className='flex flex-col items-center justify-center gap-2'>
                        <div className='flex items-center justify-center gap-2'>
                            <Tooltip title='Xem chi tiết'>
                                <Link to={`/product-detail/${record.id}`}>
                                    <Button
                                        type='text'
                                        icon={<FaEye className='text-blue-600' />}
                                    />
                                </Link>
                            </Tooltip>
                            {record.state !== 'deleted' && (
                                <>
                                    <Tooltip title='Chỉnh sửa'>
                                        <Button
                                            type='text'
                                            icon={<FaEdit className='text-gray-600' />}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(record.id);
                                            }}
                                        />
                                    </Tooltip>
                                    <Tooltip title='Xóa'>
                                        <Popconfirm
                                            title='Bạn có chắc muốn xóa sản phẩm này?'
                                            description='Hành động này không thể hoàn tác!'
                                            onConfirm={() => handleDeleteProduct(record.id)}
                                            okText='Xóa'
                                            cancelText='Hủy'
                                            okButtonProps={{
                                                danger: true,
                                                className: 'bg-red-500 hover:bg-red-600',
                                            }}
                                        >
                                            <Button
                                                type='text'
                                                icon={<FaTrash className='text-red-600' />}
                                            />
                                        </Popconfirm>
                                    </Tooltip>
                                </>
                            )}
                        </div>
                        {record.state !== 'deleted' && (
                            <Tooltip
                                title={record.stateProduct === 'selling' ? 'Đang bán' : 'Tạm ngừng'}
                            >
                                <Switch
                                    checked={record.stateProduct === 'selling'}
                                    onChange={() =>
                                        handleToggleProductState(record.id, record.stateProduct)
                                    }
                                />
                            </Tooltip>
                        )}
                    </div>
                ),
            },
        ],
        [handleDeleteProduct, handleEdit, handleToggleProductState]
    );

    const handleEditOption = (productId) => {
        navigate(`/product/edit/${productId}`, {
            state: {
                scrollTo: 'colorSection',
            },
        });
    };

    const handleToggleState = useCallback(
        async (optionKey, productId) => {
            try {
                setIsToggling(true);
                const res = await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/product/pause-option`,
                    {},
                    {
                        params: {
                            key: optionKey,
                            productId,
                        },
                        headers: {
                            Authorization: `Bearer ${tokenUser}`,
                        },
                    }
                );
                if (res.status === 200) {
                    await getAllProducts();
                    toast.success('Thay đổi trạng thái thành công');
                    setIsModalVisible(false);
                }
            } catch (error) {
                console.log('Error toggling state:', error);
                toast.error('Lỗi xảy ra khi ngừng bán màu này');
            } finally {
                setIsToggling(false);
            }
        },
        [getAllProducts, tokenUser]
    );

    return (
        <div className='p-6'>
            {/* Header */}
            <div className='mb-4 flex justify-between items-center'>
                <div>
                    <h1 className='text-2xl font-bold'>Quản lý sản phẩm</h1>
                    <p className='text-gray-500 mt-1'>
                        Quản lý tất cả các sản phẩm có trong hệ thống
                    </p>
                </div>
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

            {/* Content */}
            <Card bordered={false}>
                {/* Search */}
                <div className='mb-6 space-y-4 sm:space-y-0 sm:flex sm:gap-x-3 sm:items-center justify-between items-center'>
                    <div className='flex items-center gap-3 flex-1'>
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
                            placeholder='Tìm kiếm sản phẩm theo tên, mã...'
                        />
                        <Select
                            value={selectedState}
                            onChange={handleStateChange}
                            options={STATE_OPTIONS}
                            className='min-w-[180px] h-11'
                        />
                    </div>
                    <Space size='middle' className='flex-shrink-0'>
                        <Tooltip
                            title={
                                selectedFilters.length ? `${selectedFilters.length} bộ lọc` : 'Lọc'
                            }
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

                {/* Filter Modal */}
                <FilterModal
                    show={showModalFilter}
                    onClose={() => setShowModalFilter(false)}
                    options={FILTER_OPTIONS}
                    selectedFilters={selectedFilters}
                    onRemoveFilter={() => setSelectedFilters([])}
                    onSelect={handleSelect}
                    onSubmit={handleSubmitFilter}
                />

                {/* Table */}
                {isLoading ? (
                    <Skeleton active />
                ) : (
                    <div className='bg-white rounded-lg shadow'>
                        {products.length > 0 ? (
                            <Table
                                columns={columns}
                                dataSource={products}
                                pagination={{
                                    current: currentPage,
                                    total: totalProducts,
                                    pageSize: PAGE_SIZE,
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
            </Card>

            {/* Option Modal */}
            <Modal
                title={
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center gap-3'>
                            <div className='flex-1'>
                                <h3
                                    className='text-xl font-bold bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 
                                    bg-clip-text text-transparent animate-gradient'
                                >
                                    Chi tiết giá và số lượng sản phẩm
                                </h3>
                                <div className='mt-1.5 flex items-center gap-2'>
                                    <span className='text-sm text-gray-500'>Có</span>
                                    <div className='px-2.5 py-0.5 bg-blue-50 rounded-full'>
                                        <span className='text-sm font-semibold text-blue-600'>
                                            {selectedOptions?.length}
                                        </span>
                                    </div>
                                    <span className='text-sm text-gray-500'>
                                        phiên bản màu sắc khác nhau
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div className='h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent'></div>
                    </div>
                }
                open={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={700}
                centered
            >
                {selectedOptions && (
                    <div className='space-y-4 py-3'>
                        {selectedOptions.map((option, index) => (
                            <div
                                key={index}
                                className={`${
                                    option.value.quantity === 0 && 'bg-red-500'
                                } p-5 rounded-xl shadow-md border border-gray-100 
                                hover:shadow-lg transition-all duration-300 relative overflow-hidden`}
                            >
                                <div
                                    className='absolute top-0 right-0 w-24 h-24 opacity-5 rounded-full'
                                    style={{
                                        backgroundColor: option.key,
                                        transform: 'translate(30%, -30%)',
                                    }}
                                />

                                {/* color and state option */}
                                <div className='flex items-center justify-between mb-4'>
                                    <div className='flex items-center gap-3'>
                                        <div
                                            className='w-8 h-8 rounded-lg border-2 border-white shadow-md transform hover:scale-110 transition-transform duration-300'
                                            style={{ backgroundColor: option.key }}
                                        />
                                        <span
                                            className={`text-lg font-bold ${
                                                option.value.quantity === 0
                                                    ? 'text-white'
                                                    : 'text-gray-800'
                                            }`}
                                        >
                                            {option.value.color}
                                        </span>
                                    </div>
                                    <div className='flex items-center justify-center gap-2'>
                                        <Tag
                                            className={`px-3 py-1 font-medium text-sm rounded-full border-none ${
                                                option.value.state === 'selling'
                                                    ? 'bg-green-100 text-green-700'
                                                    : option.value.state === 'pause'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-red-100 text-red-700'
                                            }`}
                                        >
                                            <span className='flex items-center gap-1.5'>
                                                <FaCircle className='w-2 h-2' />
                                                {option.value.state === 'selling'
                                                    ? 'Đang bán'
                                                    : option.value.state === 'pause'
                                                    ? 'Ngừng bán'
                                                    : 'Hết hàng'}
                                            </span>
                                        </Tag>
                                    </div>
                                </div>

                                {/* original price, discount price, quantity and sell price */}
                                <div className='grid grid-cols-2 gap-4 mb-4'>
                                    <div
                                        className='bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-3 rounded-lg 
                    shadow-sm hover:shadow-md transition-all duration-300 border border-indigo-100'
                                    >
                                        <div className='text-indigo-600 text-xs mb-1 font-medium'>
                                            Giá gốc
                                        </div>
                                        <div
                                            className='text-base font-bold bg-gradient-to-r from-indigo-600 to-purple-600 
                        bg-clip-text text-transparent'
                                        >
                                            {option.value.price.toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>

                                    <div
                                        className='bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 p-3 rounded-lg 
                    shadow-sm hover:shadow-md transition-all duration-300 border border-emerald-100'
                                    >
                                        <div className='text-emerald-600 text-xs mb-1 font-medium'>
                                            Giảm giá
                                        </div>
                                        <div
                                            className='text-base font-bold bg-gradient-to-r from-emerald-600 to-green-600 
                        bg-clip-text text-transparent'
                                        >
                                            {option.value.discount.toLocaleString('vi-VN')}đ
                                        </div>
                                    </div>

                                    <div
                                        className='bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-50 p-3 rounded-lg 
                    shadow-sm hover:shadow-md transition-all duration-300 border border-sky-100'
                                    >
                                        <div className='text-sky-600 text-xs mb-1 font-medium'>
                                            Số lượng
                                        </div>
                                        <div
                                            className='text-base font-bold bg-gradient-to-r from-sky-600 to-blue-600 
                        bg-clip-text text-transparent flex items-baseline'
                                        >
                                            {option.value.quantity}
                                            <span className='text-sm ml-1 opacity-75'>cái</span>
                                        </div>
                                    </div>

                                    <div
                                        className='bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 p-3 rounded-lg 
                    shadow-sm hover:shadow-md transition-all duration-300 border border-amber-200'
                                    >
                                        <div className='text-amber-700 text-xs mb-1 font-medium'>
                                            Giá bán
                                        </div>
                                        <div
                                            className='text-base font-bold bg-gradient-to-r from-amber-600 via-yellow-600 to-orange-500 
                        bg-clip-text text-transparent'
                                        >
                                            {(
                                                option.value.price - option.value.discount
                                            ).toLocaleString('vi-VN')}
                                            đ
                                        </div>
                                    </div>
                                </div>

                                {/* edit and change state option */}
                                <div className='flex justify-end items-center gap-2 border-gray-100'>
                                    <Button
                                        type='primary'
                                        icon={<FaEdit />}
                                        onClick={() => handleEditOption(option.productId)}
                                        className='h-8 px-4 flex items-center gap-1.5 bg-gradient-to-r from-blue-500 
                                        to-blue-600 hover:from-blue-600 hover:to-blue-700 border-none'
                                    >
                                        <span className='text-sm'>
                                            {option.value.state === 'outOfStock'
                                                ? 'Cập nhật số lượng'
                                                : 'Sửa'}
                                        </span>
                                    </Button>

                                    <Popconfirm
                                        title={`${
                                            option.value.state === 'selling'
                                                ? 'Tạm ngừng'
                                                : 'Mở bán'
                                        } phiên bản màu`}
                                        description={`Bạn có chắc chắn muốn ${
                                            option.value.state === 'selling'
                                                ? 'tạm ngừng'
                                                : 'mở bán'
                                        } phiên bản màu này?`}
                                        onConfirm={() =>
                                            handleToggleState(option.key, option.productId)
                                        }
                                        okText={
                                            option.value.state === 'selling'
                                                ? 'Tạm ngừng'
                                                : 'Mở bán'
                                        }
                                        cancelText='Hủy'
                                        okButtonProps={{
                                            className: `${
                                                option.value.state === 'selling'
                                                    ? 'bg-yellow-500 hover:!bg-yellow-600'
                                                    : 'bg-green-500 hover:!bg-green-600'
                                            } text-white border-none`,
                                            loading: isToggling,
                                        }}
                                        disabled={option.value.state === 'outOfStock'}
                                    >
                                        {option.value.state !== 'outOfStock' && (
                                            <Button
                                                type='default'
                                                icon={
                                                    <FaCircle
                                                        className={`${
                                                            option.value.state === 'selling'
                                                                ? 'text-red-500'
                                                                : 'text-green-500'
                                                        }`}
                                                    />
                                                }
                                                className='h-8 px-4 flex items-center gap-1.5 border'
                                            >
                                                <span className='text-sm'>
                                                    {option.value.state === 'selling'
                                                        ? 'Ngừng bán'
                                                        : 'Mở bán'}
                                                </span>
                                            </Button>
                                        )}
                                    </Popconfirm>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Modal>
        </div>
    );
}
