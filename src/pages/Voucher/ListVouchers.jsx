import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Table, Tag, Tooltip, Skeleton, Button, Space, Switch, Modal, Popconfirm } from 'antd';
import {
    FaMapMarkerAlt,
    FaTags,
    FaPlusCircle,
    FaCheckCircle,
    FaTimesCircle,
    FaCalendarTimes,
    FaEdit,
    FaTrash,
} from 'react-icons/fa';
import dayjs from 'dayjs';
import { CiWarning } from 'react-icons/ci';
import { useNavigate } from 'react-router-dom';
import VoucherDetailModal from './VoucherDetailModal';

export default function ListVouchers() {
    const navigate = useNavigate();
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedVoucher, setSelectedVoucher] = useState(null);
    const [voucherDetailsModalOpen, setVoucherDetailsModalOpen] = useState(false);

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
                <Tag
                    color='blue'
                    title={text}
                    className='w-[120px] py-1 text-sm text-center font-medium uppercase truncate cursor-pointer'
                >
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
                <Tooltip title='Nhấp vào tên để xem chi tiết'>
                    <div className='flex flex-col'>
                        <span
                            onClick={() => showVoucherDetails(record)}
                            className='font-medium cursor-pointer hover:text-blue-500'
                        >
                            {text}
                        </span>
                        <span className='text-gray-500 text-sm'>{record.description}</span>
                    </div>
                </Tooltip>
            ),
        },
        {
            title: 'Khu vực áp dụng',
            dataIndex: 'province',
            align: 'center',
            key: 'province',
            render: (_, record) => (
                <div className='flex items-center gap-1.5'>
                    <FaMapMarkerAlt className='text-red-500' />
                    <span>
                        {record?.province?.value !== 0
                            ? record?.province?.label
                            : 'Áp dụng toàn quốc'}
                    </span>
                </div>
            ),
        },
        {
            title: 'Số lượt dùng',
            dataIndex: 'times',
            align: 'center',
            key: 'times',
            sorter: (a, b) => a.times - b.times,
            render: (value) => (
                <div className='flex justify-center items-center gap-2'>
                    <FaTags className='text-blue-500' />
                    <span className='font-medium'>{value}</span>
                </div>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'state',
            align: 'center',
            key: 'state',
            render: (state) => {
                const stateConfig = {
                    active: {
                        color: 'green',
                        text: 'Đang hoạt động',
                        icon: (
                            <div className='bg-green-500 text-white p-1 rounded-full'>
                                <FaCheckCircle />
                            </div>
                        ),
                    },
                    inactive: {
                        color: 'red',
                        text: 'Ngừng hoạt động',
                        icon: (
                            <div className='bg-red-500 text-white p-1 rounded-full'>
                                <FaTimesCircle />
                            </div>
                        ),
                    },
                    waiting: {
                        color: 'orange',
                        text: 'Chờ kích hoạt',
                        icon: (
                            <div className='bg-orange-500 text-white p-1 rounded-full'>
                                <FaCalendarTimes />
                            </div>
                        ),
                    },
                };

                const config = stateConfig[state];

                return (
                    <div className='flex items-center gap-2'>
                        {config.icon}
                        <span className={`font-medium text-${config.color}-500`}>
                            {config.text}
                        </span>
                    </div>
                );
            },
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => {
                const isExpired = dayjs(record.expiryDate).isBefore(dayjs());
                const isActive = record.state === 'active';

                return (
                    <Space size='middle'>
                        <Tooltip
                            title={
                                isExpired
                                    ? 'Voucher đã hết hạn'
                                    : isActive
                                    ? 'Đang Kích Hoạt'
                                    : 'Đang Dừng'
                            }
                        >
                            <Switch
                                checked={isActive}
                                onChange={() => handleToggleStatus(record.id, record.state)}
                                className={isActive && 'bg-green-500'}
                            />
                        </Tooltip>

                        <Tooltip title='Chỉnh sửa'>
                            <Button
                                type='text'
                                icon={<FaEdit className='text-gray-600' />}
                                onClick={() => navigate(`/voucher/edit/${record.id}`)}
                            />
                        </Tooltip>

                        <Tooltip title='Xóa'>
                            <Popconfirm
                                title='Bạn có chắc muốn xóa voucher này?'
                                onConfirm={() => handleDeleteVoucher(record.id)}
                            >
                                <Button type='text' icon={<FaTrash className='text-red-600' />} />
                            </Popconfirm>
                        </Tooltip>
                    </Space>
                );
            },
        },
    ];

    const handleToggleStatus = async (id, currentState) => {
        if (currentState === 'active') {
            setSelectedVoucher({ id, currentState });
            setConfirmModalOpen(true);
        } else {
            try {
                const res = await axios.put(
                    `${import.meta.env.VITE_API_URL}/api/coupon/active`,
                    null,
                    {
                        params: {
                            couponId: id,
                        },
                        headers: {
                            Authorization: `Bearer ${tokenUser}`,
                        },
                    }
                );
                if (res.status === 200) {
                    toast.success('Kích hoạt voucher thành công!');
                    setTimeout(() => {
                        getAllVouchers();
                    }, 2000);
                }
            } catch (error) {
                console.log(error);
                toast.error('Có lỗi xảy ra!');
            }
        }
    };

    const handleConfirmDeactivate = async () => {
        try {
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/coupon/inactive`,
                null,
                {
                    params: {
                        couponId: selectedVoucher.id,
                    },
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                }
            );
            if (res.status === 200) {
                toast.success('Đã dừng kích hoạt voucher!');
                setTimeout(() => {
                    getAllVouchers();
                }, 2000);
            }
        } catch (error) {
            console.log(error);
            toast.error('Có lỗi xảy ra!');
        } finally {
            setConfirmModalOpen(false);
            setSelectedVoucher(null);
        }
    };

    const showVoucherDetails = (voucher) => {
        setSelectedVoucher(voucher);
        setVoucherDetailsModalOpen(true);
    };

    const handleDeleteVoucher = async (id) => {
        try {
            setLoading(true);
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/coupon/delete`, {
                params: {
                    couponId: id,
                },
                headers: {
                    Authorization: `Bearer ${tokenUser}`,
                },
            });
            if (res.status === 200) {
                toast.success('Xóa voucher thành công!');
                getAllVouchers();
            }
        } catch (error) {
            console.log(error);
            toast.error('Có lỗi xảy ra khi xóa voucher!');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='p-6'>
            {/* header */}
            <div className='mb-6 flex justify-between items-center'>
                <div>
                    <h1 className='text-2xl font-bold text-gray-800 dark:text-[#fbfcfc]'>
                        Quản lý Voucher
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 mt-1'>
                        Quản lý tất cả voucher trong hệ thống
                    </p>
                </div>

                <Button
                    type='primary'
                    size='large'
                    icon={<FaPlusCircle className='text-lg' />}
                    onClick={() => navigate('/voucher/create')}
                    className='flex items-center gap-2.5 h-12 px-7 bg-gradient-to-r from-blue-500 to-blue-600 
                    hover:from-blue-600 hover:to-blue-700 transition-all duration-300 
                    transform hover:scale-[1.02]'
                >
                    <span className='font-semibold tracking-wide'>Tạo Voucher mới</span>
                </Button>
            </div>

            {/* content */}
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

            {/* voucher details modal */}
            <VoucherDetailModal
                voucher={selectedVoucher}
                open={voucherDetailsModalOpen}
                onClose={() => {
                    setVoucherDetailsModalOpen(false);
                    setSelectedVoucher(null);
                }}
            />

            {/* confirm deactivate modal */}
            <Modal
                open={confirmModalOpen}
                onOk={handleConfirmDeactivate}
                onCancel={() => {
                    setConfirmModalOpen(false);
                    setSelectedVoucher(null);
                }}
                okText='Xác nhận'
                cancelText='Hủy'
                okButtonProps={{
                    className: 'bg-blue-500 hover:bg-blue-600',
                }}
            >
                <div className='text-center'>
                    <CiWarning className='text-yellow-400 mx-auto w-20 h-20 mb-2' />
                    <p className='font-medium text-lg'>
                        Bạn có chắc chắn muốn dừng kích hoạt voucher này?
                    </p>
                    <p className='text-gray-500 mt-2'>
                        Voucher sẽ không thể sử dụng cho đến khi được kích hoạt lại.
                    </p>
                </div>
            </Modal>
        </div>
    );
}
