import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Table, Tag, Badge, Tooltip, Skeleton, Button, Space, Switch } from 'antd';
import { FaCalendarAlt, FaPercentage, FaMapMarkerAlt, FaTags, FaPlusCircle } from 'react-icons/fa';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

export default function ListVouchers() {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    console.log(vouchers);
    const navigate = useNavigate();

    useEffect(() => {
        getAllVouchers();
    }, []);

    const getAllVouchers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/coupon/get-all-coupon`,
                {
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                }
            );
            if (res.status === 200) {
                setVouchers(res.data);
            }
        } catch (error) {
            console.log(error);
            toast.error('Lỗi hệ thống!');
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'Mã voucher',
            dataIndex: 'couponCode',
            align: 'center',
            key: 'couponCode',
            render: (text) => (
                <Tag color='blue' className='px-3 py-1 text-sm font-medium uppercase'>
                    {text}
                </Tag>
            ),
        },
        {
            title: 'Tên voucher',
            align: 'left',
            dataIndex: 'couponName',
            key: 'couponName',
            render: (text, record) => (
                <div className='flex flex-col'>
                    <span className='font-medium'>{text}</span>
                    <span className='text-gray-500 text-sm'>{record.description}</span>
                </div>
            ),
        },
        {
            title: 'Giá trị tối thiểu',
            align: 'center',
            dataIndex: 'minPrice',
            key: 'minPrice',
            render: (value) => (
                <span className='font-medium'>{value.toLocaleString('vi-VN')}đ</span>
            ),
        },
        {
            title: 'Khu vực',
            dataIndex: 'province',
            align: 'center',
            key: 'province',
            render: (text) => (
                <div className='flex items-center gap-1.5'>
                    <FaMapMarkerAlt className='text-red-500' />
                    <span>{text}</span>
                </div>
            ),
        },
        // {
        //     title: 'Thời hạn',
        //     align: 'center',
        //     key: 'dates',
        //     render: (_, record) => (
        //         <div className='space-y-1'>
        //             <Tooltip title='Ngày tạo'>
        //                 <div className='flex items-center gap-1.5 text-sm text-gray-600'>
        //                     <FaCalendarAlt className='text-green-500' />
        //                     <span>{dayjs(record.createdDate).format('DD/MM/YYYY HH:mm')}</span>
        //                 </div>
        //             </Tooltip>
        //             <Tooltip title='Ngày hết hạn'>
        //                 <div className='flex items-center gap-1.5 text-sm text-gray-600'>
        //                     <FaCalendarAlt className='text-red-500' />
        //                     <span>{dayjs(record.expiryDate).format('DD/MM/YYYY HH:mm')}</span>
        //                 </div>
        //             </Tooltip>
        //         </div>
        //     ),
        // },
        {
            title: 'Số lượt dùng',
            dataIndex: 'times',
            align: 'center',
            key: 'times',
            render: (value) => (
                <div className='flex justify-center items-center gap-2'>
                    <FaTags className='text-blue-500' />
                    <span className='font-medium'>{value}</span>
                </div>
            ),
        },
        // {
        //     title: 'Trạng thái',
        //     dataIndex: 'state',
        //     align: 'center',
        //     key: 'state',
        //     render: (state) => {
        //         const stateConfig = {
        //             active: {
        //                 color: 'success',
        //                 text: 'Đang hoạt động',
        //             },
        //             inactive: {
        //                 color: 'error',
        //                 text: 'Ngừng hoạt động',
        //             },
        //             expired: {
        //                 color: 'default',
        //                 text: 'Hết hạn',
        //             },
        //         };

        //         const config = stateConfig[state] || stateConfig.inactive;

        //         return <Badge status={config.color} text={config.text} />;
        //     },
        // },
        {
            title: 'Trạng thái',
            dataIndex: 'state',
            key: 'state',
            render: (state) => {
                const stateConfig = {
                    active: {
                        color: 'success',
                        text: 'Đang hoạt động',
                    },
                    inactive: {
                        color: 'error',
                        text: 'Ngừng hoạt động',
                    },
                    expired: {
                        color: 'default',
                        text: 'Hết hạn',
                    },
                };

                const config = stateConfig[state] || stateConfig.inactive;

                return <Badge status={config.color} text={config.text} />;
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                const isExpired = dayjs(record.expiryDate).isBefore(dayjs());

                return (
                    <Space size='middle'>
                        <Tooltip
                            title={isExpired ? 'Voucher đã hết hạn' : 'Kích hoạt/Dừng voucher'}
                        >
                            <Switch
                                checked={record.state === 'active'}
                                onChange={() => handleToggleStatus(record.id, record.state)}
                                disabled={isExpired}
                                className={`${record.state === 'active' ? 'bg-blue-600' : ''}`}
                            />
                        </Tooltip>

                        <Tooltip title='Chỉnh sửa'>
                            <Button
                                type='primary'
                                className='bg-blue-500'
                                onClick={() => navigate(`/vouchers/edit/${record.id}`)}
                            >
                                Sửa
                            </Button>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const handleToggleStatus = async (id, currentState) => {};

    return (
        <div className='p-6 mt-10'>
            <div className='mb-6 flex justify-between items-center'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800'>Quản lý Voucher</h1>
                    <p className='text-gray-600 mt-1'>Quản lý tất cả voucher trong hệ thống</p>
                </div>

                <Button
                    type='primary'
                    size='large'
                    icon={<FaPlusCircle className='text-lg' />}
                    onClick={() => navigate('/vouchers/create')}
                    className='flex items-center gap-2 h-11 px-6 bg-blue-500 hover:bg-blue-600 shadow-sm'
                >
                    <span className='font-medium'>Tạo Voucher mới</span>
                </Button>
            </div>

            {loading ? (
                <Skeleton active />
            ) : (
                <div className='bg-white rounded-lg shadow'>
                    <Table
                        columns={columns}
                        dataSource={vouchers}
                        rowKey='id'
                        pagination={{
                            pageSize: 10,
                            showTotal: (total) => `Tổng ${total} voucher`,
                        }}
                        className='custom-table'
                    />
                </div>
            )}
        </div>
    );
}
