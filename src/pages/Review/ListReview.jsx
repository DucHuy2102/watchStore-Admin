import {
    Empty,
    Image,
    Input,
    Modal,
    Skeleton,
    Table,
    Tooltip,
    Typography,
    Button as ButtonAntd,
    Select,
} from 'antd';
import axios from 'axios';
import { Button } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';
import { HiOutlineTrash, HiOutlineEye } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';
import { AiFillStar } from 'react-icons/ai';

export default function ListReview() {
    const navigate = useNavigate();
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(false);
    const { access_token: token } = useSelector((state) => state.user);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, _] = useState(10);
    const [product, setProduct] = useState(null);
    const [searchValue, setSearchValue] = useState('');
    const [selectedRating, setSelectedRating] = useState(null);

    const getReviews = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/review/get-all-review`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (res?.status === 200) {
                const { data } = res;
                setReviews(data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const getProduct = async () => {
            try {
                setLoading(true);
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/client/product`, {
                    params: {
                        productId: selectedReview.productId,
                    },
                });
                if (res?.status === 200) {
                    setProduct(res.data);
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        };

        if (selectedReview) getProduct();
    }, [selectedReview]);

    useEffect(() => {
        if (reviews.length === 0) getReviews();
    }, []);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            align: 'center',
            render: (text, record, index) => index + 1 + (currentPage - 1) * pageSize,
        },
        {
            title: 'Người Dùng',
            dataIndex: ['user', 'name'],
            key: 'user',
            render: (text) => <Typography.Text strong>{text}</Typography.Text>,
        },
        {
            title: 'Số Điện Thoại',
            dataIndex: ['user', 'phone'],
            key: 'phone',
            align: 'center',
            render: (phone) => <Typography.Text copyable>{phone}</Typography.Text>,
        },
        {
            title: 'Thời Gian',
            dataIndex: 'createdAt',
            key: 'createdAt',
            align: 'center',
            render: (date) => format(new Date(date), 'dd/MM/yyyy HH:mm'),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: 'Nội Dung Đánh Giá',
            dataIndex: 'reviewText',
            key: 'reviewText',
            width: '30%',
            ellipsis: true,
        },
        {
            title: 'Số Sao',
            dataIndex: 'rating',
            key: 'rating',
            sorter: (a, b) => a.rating - b.rating,
            align: 'center',
            render: (rating) => (
                <div className='flex justify-center'>
                    {[...Array(rating)].map((_, index) => (
                        <AiFillStar key={index} className='text-yellow-400' />
                    ))}
                </div>
            ),
        },
        {
            title: 'Thao Tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className='flex gap-2 justify-center'>
                    <Button
                        size='sm'
                        className='px-1 !ring-0'
                        color='blue'
                        onClick={() => handleDetail(record)}
                    >
                        <HiOutlineEye className='w-4 h-4' />
                    </Button>
                    <Button
                        size='sm'
                        className='px-1 !ring-0'
                        color='failure'
                        onClick={() => handleDelete(record)}
                    >
                        <HiOutlineTrash className='w-4 h-4' />
                    </Button>
                </div>
            ),
        },
    ];

    const handleDetail = async (record) => {
        setIsModalOpen(true);
        setSelectedReview(record);
    };

    const handleDelete = (record) => {
        Modal.confirm({
            title: 'Xác nhận xóa',
            content: 'Bạn có chắc chắn muốn xóa đánh giá này?',
            onOk: async () => {
                try {
                    setLoading(true);
                    const res = await axios.delete(
                        `${import.meta.env.VITE_API_URL}/api/review/admin-delete`,
                        {
                            params: {
                                reviewId: record.id,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (res?.status === 200) {
                        setReviews((prevReviews) => prevReviews.filter((r) => r.id !== record.id));
                    }
                } catch (error) {
                    console.log(error);
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const handleSearch = () => {
        console.log('Searching for:', searchValue);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const handleRatingChange = (value) => {
        setSelectedRating(value);
        console.log('Selected rating:', value);
    };

    return (
        <div className='p-10'>
            <div className='flex flex-col w-full'>
                <div className='mb-5'>
                    <h1 className='text-2xl font-bold w-1/3'>Quản Lý Đánh Giá</h1>
                    <p className='text-gray-500'>
                        Quản lý tất cả các đánh giá sản phẩm có trong hệ thống
                    </p>
                </div>
                <div className='mb-5 flex items-center justify-between'>
                    <div className='flex items-center gap-1 w-[40vw]'>
                        <Input
                            placeholder='Tìm kiếm theo tên khách hàng, số điện thoại'
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            className='w-full rounded-lg border-gray-300'
                        />
                        <ButtonAntd type='primary' className='px-5 py-5' onClick={handleSearch}>
                            Tìm kiếm
                        </ButtonAntd>
                    </div>
                    <Select
                        placeholder='Chọn số sao'
                        allowClear
                        className='w-[10vw] h-10'
                        onChange={handleRatingChange}
                        options={[
                            { value: 1, label: '1 sao' },
                            { value: 2, label: '2 sao' },
                            { value: 3, label: '3 sao' },
                            { value: 4, label: '4 sao' },
                            { value: 5, label: '5 sao' },
                        ]}
                    />
                </div>
            </div>
            {loading ? (
                <Skeleton active />
            ) : reviews.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={reviews}
                    rowKey='id'
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng cộng ${total} đánh giá`,
                        onChange: (page) => setCurrentPage(page),
                    }}
                    bordered
                    scroll={{ x: 'max-content' }}
                    className='shadow-xl rounded-lg'
                    loading={loading}
                />
            ) : (
                <Empty description='Không có phản ánh nào được ghi nhận' />
            )}

            <Modal
                open={isModalOpen}
                onCancel={() => {
                    setIsModalOpen(false);
                    setProduct(null);
                }}
                footer={null}
                width={800}
                className='review-detail-modal'
                centered
            >
                {selectedReview && (
                    <div className='flex flex-col justify-center items-center gap-6 p-4'>
                        <div className='grid grid-cols-2 gap-8 w-full'>
                            <div className='bg-gray-50 p-6 rounded-lg shadow-sm'>
                                <h3 className='font-bold mb-4 text-xl text-gray-800 border-b pb-2'>
                                    Thông Tin Người Dùng
                                </h3>
                                <div className='space-y-3'>
                                    <p className='flex items-center gap-2'>
                                        <span className='font-medium text-gray-600'>Họ tên:</span>
                                        <span>{selectedReview.user.name}</span>
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <span className='font-medium text-gray-600'>
                                            Số điện thoại:
                                        </span>
                                        <Typography.Text copyable>
                                            {selectedReview.user.phone}
                                        </Typography.Text>
                                    </p>
                                    <p className='flex items-center gap-x-2'>
                                        <span className='font-medium text-gray-600'>Email:</span>
                                        <span>{selectedReview.user.email}</span>
                                    </p>
                                    <p className='flex items-center gap-x-2'>
                                        <span className='font-medium text-gray-600 w-16'>
                                            Địa chỉ:
                                        </span>
                                        <Tooltip
                                            title={selectedReview.user.address.fullAddress}
                                            className='truncate cursor-pointer'
                                        >
                                            {selectedReview.user.address.fullAddress}
                                        </Tooltip>
                                    </p>
                                </div>
                            </div>

                            <div className='bg-gray-50 p-6 rounded-lg shadow-sm'>
                                <h3 className='font-bold mb-4 text-xl text-gray-800 border-b pb-2'>
                                    Nội Dung Đánh Giá
                                </h3>
                                <div className='space-y-3'>
                                    <p className='flex items-center gap-2'>
                                        <span className='font-medium text-gray-600'>
                                            Số sao đánh giá:
                                        </span>
                                        <span className='text-yellow-400 flex'>
                                            {[...Array(selectedReview.rating)].map((_, index) => (
                                                <AiFillStar key={index} />
                                            ))}
                                        </span>
                                    </p>
                                    <p className='flex flex-col gap-2'>
                                        <span className='font-medium text-gray-600'>
                                            Nội dung đánh giá:
                                        </span>
                                        <span className='italic bg-white p-3 rounded-md'>
                                            &quot;{selectedReview.reviewText}&quot;
                                        </span>
                                    </p>
                                    <p className='flex items-center gap-2'>
                                        <span className='font-medium text-gray-600'>
                                            Thời gian:
                                        </span>
                                        <span>
                                            {format(
                                                new Date(selectedReview.createdAt),
                                                'dd/MM/yyyy HH:mm'
                                            )}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className='bg-white p-6 rounded-lg shadow-md w-full max-w-md'>
                            <h3 className='font-bold mb-4 text-xl text-gray-800 border-b pb-2 text-center'>
                                Thông Tin Sản Phẩm
                            </h3>
                            {product ? (
                                <div className='flex items-center gap-6'>
                                    <Image
                                        src={product.img[0]}
                                        alt='Product'
                                        preview={{
                                            mask: <div className='text-xs'>Xem</div>,
                                        }}
                                        className='!w-40 !h-auto object-cover rounded-lg shadow-sm'
                                    />
                                    <div className='space-y-2'>
                                        <Tooltip
                                            title='Xem chi tiết sản phẩm'
                                            onClick={() =>
                                                navigate(`/product-detail/${product.id}`)
                                            }
                                            className='font-bold text-xl cursor-pointer'
                                        >
                                            {product.productName}
                                        </Tooltip>
                                        <p className='text-gray-600 font-medium'>
                                            Hãng: {product.brand}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <Skeleton active paragraph={{ rows: 3 }} />
                            )}
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
