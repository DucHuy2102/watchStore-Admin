import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Empty, Skeleton, Table, Tag, Modal, Button, Image, Input, Typography, Select } from 'antd';
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
    const [currentState, setCurrentState] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [currentType, setCurrentType] = useState('all');
    const [emailContent, setEmailContent] = useState('');
    const [pageSize, _] = useState(10);
    const { confirm } = Modal;

    const getServices = async () => {
        try {
            setLoading(true);
            const params = {};
            if (searchValue) {
                params.q = searchValue.trim();
            }
            if (currentState && currentState !== 'all') {
                params.state = currentState;
            }
            if (currentType && currentType !== 'all') {
                params.type = currentType;
            }
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/service/get-all`, {
                params,
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
        getServices();
    }, [currentState, currentType]);

    const handleCheckDone = async (id) => {
        confirm({
            title: 'Xác nhận hoàn thành',
            icon: <ExclamationCircleOutlined />,
            content: (
                <div>
                    <p className='mb-1'>Xác nhận đã phản hồi với khách hàng?</p>
                    <Input.TextArea
                        placeholder='Nhập ghi chú xử lý...'
                        rows={4}
                        onChange={(e) => setEmailContent(e.target.value)}
                        className='mt-2'
                    />
                </div>
            ),
            async onOk() {
                try {
                    const res = await axios.post(
                        `${import.meta.env.VITE_API_URL}/api/service/process-service`,
                        {
                            note: emailContent,
                            type: selectedService.type,
                        },
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

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            getServices();
        }
    };

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            key: 'index',
            align: 'center',
            render: (text, record, index) => index + 1 + (currentPage - 1) * pageSize,
        },
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
            render: (phone) => <Typography.Text copyable>{phone}</Typography.Text>,
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
                <Tag
                    color={type === 'feedback' ? 'blue' : 'gold'}
                    className='w-36 py-1.5 rounded-full text-center font-medium shadow-sm transition-all hover:scale-105'
                >
                    {type === 'feedback' ? 'Phản Ánh & Góp Ý' : 'Yêu Cầu Tư Vấn'}
                </Tag>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'state',
            key: 'state',
            align: 'center',
            render: (state) => (
                <Tag
                    color={state === 'proceed' ? 'success' : 'warning'}
                    className='w-24 text-center py-1.5 rounded-full font-medium shadow-sm transition-all hover:scale-105'
                >
                    {state === 'proceed' ? 'Đã xử lý' : 'Chờ xử lý'}
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
                        className='rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedService(record);
                            setIsModalOpen(true);
                        }}
                    >
                        Chi tiết
                    </Button>
                    {record.state === 'proceed' && (
                        <Button
                            type='primary'
                            className='!bg-green-600 hover:!bg-green-500 rounded-full shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'
                            onClick={(e) => {
                                e.stopPropagation();
                                handleCheckDone(record.id);
                            }}
                        >
                            Đã xử lý
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    const stateOptions = [
        { value: 'all', label: 'Tất cả trạng thái' },
        { value: 'pending', label: 'Chờ xử lý' },
        { value: 'proceed', label: 'Đã xử lý' },
    ];

    const typeOptions = [
        { value: 'all', label: 'Tất cả loại dịch vụ' },
        { value: 'feedback', label: 'Phản Ánh & Góp Ý' },
        { value: 'return', label: 'Yêu Cầu Tư Vấn' },
    ];

    const handleStateChange = (value) => {
        setCurrentState(value);
        setCurrentPage(1);
    };

    const handleTypeChange = (value) => {
        setCurrentType(value);
        setCurrentPage(1);
    };

    return (
        <div className='p-10'>
            <div className='flex flex-col w-full p-8 rounded-2xl shadow-xl mb-8 bg-white backdrop-blur-lg backdrop-filter'>
                <div className='mb-5'>
                    <h1 className='text-3xl font-extrabold mb-3 text-gray-900 dark:text-gray-900 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400'>
                        Quản Lý Dịch Vụ
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 mt-1'>
                        Quản lý tất cả các dịch vụ đang có trong hệ thống
                    </p>
                </div>
                <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                        <Input
                            placeholder='Tìm kiếm theo tên khách hàng, số điện thoại, email...'
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            onKeyDown={handleKeyPress}
                            allowClear
                            className='w-[40vw] h-10 rounded-lg border-gray-300 shadow-sm hover:border-blue-500 focus:border-blue-500 transition-all duration-300'
                        />
                        <Button
                            type='primary'
                            className='px-8 py-3 h-10 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105'
                            onClick={getServices}
                        >
                            Tìm kiếm
                        </Button>
                    </div>
                    <div className='flex items-center gap-3'>
                        <Select
                            value={currentState}
                            onChange={handleStateChange}
                            options={stateOptions}
                            className='w-40 h-10'
                        />{' '}
                        <Select
                            value={currentType}
                            onChange={handleTypeChange}
                            options={typeOptions}
                            className='w-40 h-10'
                        />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className='bg-white rounded-2xl shadow-xl p-6'>
                    <Skeleton active />
                </div>
            ) : services.length > 0 ? (
                <div className='bg-white rounded-2xl shadow-xl overflow-hidden'>
                    <Table
                        columns={columns}
                        dataSource={services.map((item) => ({
                            ...item,
                            key: item.id,
                        }))}
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Tổng cộng ${total} dịch vụ`,
                            onChange: (page) => setCurrentPage(page),
                            className: 'p-4',
                        }}
                        bordered={false}
                        scroll={{ x: 'max-content' }}
                        loading={loading}
                    />
                </div>
            ) : (
                <div className='bg-white rounded-2xl shadow-xl p-12'>
                    <Empty description='Không có dịch vụ nào được ghi nhận' />
                </div>
            )}

            <Modal
                title={
                    <div className='text-xl font-semibold border-b pb-3 text-blue-600'>
                        Chi Tiết Dịch Vụ
                    </div>
                }
                open={isModalOpen}
                onCancel={() => setIsModalOpen(false)}
                footer={null}
                width={800}
                className='custom-modal'
                centered
            >
                {selectedService && (
                    <div className='p-6 space-y-6'>
                        <div className='grid grid-cols-2 gap-6'>
                            <div className='bg-gray-50/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'>
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

                            <div className='bg-gray-50/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'>
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
                                            className='ml-2 px-3 py-1 rounded-lg'
                                        >
                                            {selectedService.type === 'feedback'
                                                ? 'Phản Ánh & Góp Ý'
                                                : 'Yêu Cầu Tư Vấn'}
                                        </Tag>
                                    </div>
                                    <div>
                                        <label className='text-gray-600 font-medium'>
                                            Trạng thái:
                                        </label>
                                        <Tag
                                            color={
                                                selectedService.state === 'proceed'
                                                    ? 'green'
                                                    : 'red'
                                            }
                                            className='ml-2 px-3 py-1 rounded-lg'
                                        >
                                            {selectedService.state !== 'proceed'
                                                ? 'Đang chờ xử lý'
                                                : 'Đã xử lý'}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className='bg-gray-50/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'>
                            <h3 className='text-sm text-gray-500 uppercase mb-2'>Nội Dung</h3>
                            <p className='text-gray-800 whitespace-pre-wrap'>
                                {selectedService.message}
                            </p>
                        </div>

                        {selectedService.img && selectedService.img.length > 0 && (
                            <div className='bg-gray-50/50 p-6 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300'>
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
