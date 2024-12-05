import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Empty, Skeleton, Table, Tag, Modal, Button, Image, Input } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { toast } from 'react-toastify';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';

export default function ListService() {
    const { access_token: token } = useSelector((state) => state.user);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const { confirm } = Modal;

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

    useEffect(() => {
        if (services.length === 0) getServices();
    }, []);

    const handleCheckDone = async (id) => {
        confirm({
            title: 'Xác nhận hoàn thành',
            icon: <ExclamationCircleOutlined />,
            content: 'Xác nhận đã phản hồi với khách hàng?',
            async onOk() {
                try {
                    const res = await axios.post(
                        `${import.meta.env.VITE_API_URL}/api/service/process-service`,
                        null,
                        {
                            params: {
                                serviceId: id,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (res?.status === 200) {
                        toast.success('Cập nhật trạng thái thành công');
                        getServices();
                    }
                } catch (error) {
                    console.log(error);
                    toast.error('Đã có lỗi xảy ra');
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

    const columns = [
        {
            title: 'Họ và Tên',
            dataIndex: 'name',
            key: 'name',
            render: (text) => <span className='font-medium'>{text}</span>,
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            key: 'phone',
            align: 'center',
        },
        {
            title: 'Nội dung',
            dataIndex: 'message',
            key: 'message',
            ellipsis: true,
        },
        {
            title: 'Loại dịch vụ',
            dataIndex: 'type',
            key: 'type',
            align: 'center',
            render: (type) => (
                <Tag color={type === 'feedback' ? 'blue' : 'gold'} className='px-5 py-1 rounded-lg'>
                    {type === 'feedback' ? 'Phản Ánh' : 'Yêu Cầu Đổi Trả'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'state',
            key: 'state',
            align: 'center',
            render: (state) => (
                <Tag color={state === 'active' ? 'green' : 'blue'} className='px-5 py-1 rounded-lg'>
                    {state === 'active' ? 'Chờ xử lý' : 'Đã hoàn thành'}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            dataIndex: 'action',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className='space-x-2'>
                    <Button
                        type='primary'
                        onClick={() => {
                            setSelectedService(record);
                            setIsModalOpen(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.state === 'active' && (
                        <Button type='primary' danger onClick={() => handleCheckDone(record.id)}>
                            Hoàn thành
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    return (
        <div className='p-10'>
            <div className='flex items-center justify-between w-full p-6 rounded-lg shadow-lg'>
                <div>
                    <h1 className='text-3xl font-extrabold mb-3 text-gray-900 dark:text-white'>
                        Quản Lý Dịch Vụ
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 mt-1'>
                        Quản lý tất cả các dịch vụ đang có trong hệ thống
                    </p>
                </div>
                <div className='mb-5 flex items-center justify-center gap-1 w-2/3'>
                    <Input
                        placeholder='Tìm kiếm theo tên khách hàng, số điện thoại, email...'
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        onKeyDown={handleKeyPress}
                        className='w-full rounded-lg border-gray-300 dark:bg-white'
                    />
                    <Button type='primary' className='px-6 py-5' onClick={handleSearch}>
                        Tìm kiếm
                    </Button>
                </div>
            </div>
            {loading ? (
                <Skeleton active />
            ) : services.length > 0 ? (
                <Table
                    columns={columns}
                    dataSource={services.map((item) => ({
                        ...item,
                        key: item.id,
                    }))}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `Tổng cộng ${total} dịch vụ`,
                    }}
                    bordered
                    scroll={{ x: 'max-content' }}
                    className='shadow-md rounded-lg dark:bg-white'
                    loading={loading}
                />
            ) : (
                <Empty description='Không có phản ánh nào được ghi nhận' />
            )}

            <Modal
                title={<div className='text-xl font-semibold border-b pb-3'>Chi Tiết Dịch Vụ</div>}
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
                className='custom-modal'
                centered
            >
                {selectedService && (
                    <div className='p-4 space-y-6'>
                        <div className='grid grid-cols-2 gap-6'>
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <h3 className='text-sm text-gray-500 uppercase mb-2'>
                                    Thông Tin Khách Hàng
                                </h3>
                                <div className='space-y-3'>
                                    <div>
                                        <label className='text-gray-600 font-medium'>
                                            Họ và tên:
                                        </label>
                                        <p className='text-gray-800'>{selectedService.name}</p>
                                    </div>
                                    <div>
                                        <label className='text-gray-600 font-medium'>Email:</label>
                                        <p className='text-gray-800'>{selectedService.email}</p>
                                    </div>
                                    <div>
                                        <label className='text-gray-600 font-medium'>
                                            Số điện thoại:
                                        </label>
                                        <p className='text-gray-800'>{selectedService.phone}</p>
                                    </div>
                                </div>
                            </div>

                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <h3 className='text-sm text-gray-500 uppercase mb-2'>
                                    Chi Tiết Dịch Vụ
                                </h3>
                                <div className='space-y-3'>
                                    <div>
                                        <label className='text-gray-600 font-medium'>
                                            Loại dịch vụ:
                                        </label>
                                        <Tag
                                            color={
                                                selectedService.type === 'feedback'
                                                    ? 'blue'
                                                    : 'gold'
                                            }
                                            className='ml-2 px-3 py-1'
                                        >
                                            {selectedService.type === 'feedback'
                                                ? 'Phản Ánh'
                                                : 'Yêu Cầu Đổi Trả'}
                                        </Tag>
                                    </div>
                                    <div>
                                        <label className='text-gray-600 font-medium'>
                                            Trạng thái:
                                        </label>
                                        <Tag
                                            color={
                                                selectedService.state === 'active' ? 'green' : 'red'
                                            }
                                            className='ml-2 px-3 py-1'
                                        >
                                            {selectedService.state.toUpperCase()}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-gray-50 p-4 rounded-lg'>
                            <h3 className='text-sm text-gray-500 uppercase mb-2'>Nội Dung</h3>
                            <p className='text-gray-800 whitespace-pre-wrap'>
                                {selectedService.message}
                            </p>
                        </div>

                        {selectedService.img && selectedService.img.length > 0 && (
                            <div className='bg-gray-50 p-4 rounded-lg'>
                                <h3 className='text-sm text-gray-500 uppercase mb-3'>
                                    Hình Ảnh Đính Kèm
                                </h3>
                                <div className='flex justify-center'>
                                    <div className='w-full max-w-2xl'>
                                        <Swiper
                                            modules={[Navigation, Pagination]}
                                            navigation
                                            pagination={{ clickable: true }}
                                            className='rounded-lg'
                                        >
                                            {selectedService.img.map((image, index) => (
                                                <SwiperSlide key={index}>
                                                    <div className='flex justify-center items-center bg-black/5 p-4'>
                                                        <Image
                                                            src={image}
                                                            alt={`Service ${index + 1}`}
                                                            className='object-cover rounded-lg max-h-[400px]'
                                                            preview={{
                                                                mask: (
                                                                    <div className='text-sm'>
                                                                        Xem ảnh
                                                                    </div>
                                                                ),
                                                            }}
                                                        />
                                                    </div>
                                                </SwiperSlide>
                                            ))}
                                        </Swiper>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
