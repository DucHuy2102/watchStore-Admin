import { Avatar, Button, Input, Modal, Select, Table, Tag, Tooltip } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { Badge } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineSearch } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ExclamationCircleOutlined, MailOutlined } from '@ant-design/icons';
import { UserStats } from './components/exportComponentUser';
import { IoMdCheckmark, IoMdClose } from 'react-icons/io';
import { useNavigate } from 'react-router-dom';
const { Search } = Input;

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    };
    return date.toLocaleString('vi-VN', options);
}

export default function ListUser() {
    const navigate = useNavigate();
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);

    const getAllUsers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/user/get-all-user`, {
                headers: {
                    Authorization: `Bearer ${tokenUser}`,
                },
            });
            if (res.status === 200) {
                const { data } = res;
                setUsers(data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!users.length) {
            getAllUsers();
        }
    }, []);

    const columns = [
        {
            title: 'STT',
            key: 'index',
            align: 'center',
            width: '5%',
            render: (_, record, index) => (
                <span className='font-semibold text-gray-700'>{index + 1}</span>
            ),
        },
        {
            title: <span className='flex justify-center'>Người dùng</span>,
            key: 'user',
            render: (_, record) => (
                <div className='flex items-center gap-4 p-2'>
                    <Avatar
                        src={record.avatarImg}
                        size={48}
                        className='border-2 border-gray-100 shadow-sm'
                    >
                        {record.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div className='flex items-center gap-x-2'>
                            <div className='font-semibold text-gray-800 text-base'>
                                {record.fullName ?? 'Chưa cập nhật'}
                            </div>
                            <span className='text-gray-400' />
                            <div className='font-medium italic text-blue-600'>
                                {record.username}
                            </div>
                        </div>
                        <div className='flex items-center gap-2 text-gray-500 mt-1'>
                            <MailOutlined className='text-blue-400' />
                            <span className='text-sm'>{record.email}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            align: 'center',
            width: '15%',
            sorter: (a, b) => a.phone?.localeCompare(b.phone),
            key: 'phone',
            render: (phone) => (
                <span className='text-gray-700 font-medium'>{phone || 'Chưa cập nhật'}</span>
            ),
        },
        {
            title: 'Xác thực',
            key: 'verified',
            align: 'center',
            width: '15%',
            render: (_, record) => (
                <Badge
                    className='py-1.5 px-3 w-full flex items-center justify-center rounded-full shadow-sm'
                    color={record.verified ? 'success' : 'warning'}
                >
                    {record.verified ? (
                        <span className='flex items-center gap-1.5'>
                            <IoMdCheckmark className='text-green-600 font-bold' />
                            Đã xác thực
                        </span>
                    ) : (
                        <span className='flex items-center gap-1.5'>
                            <IoMdClose className='text-yellow-500 font-bold' />
                            Chưa xác thực
                        </span>
                    )}
                </Badge>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'state',
            align: 'center',
            width: '15%',
            render: (_, record) => (
                <Tag
                    color={record.state === 'active' ? 'success' : 'error'}
                    className='px-4 py-1.5 text-sm font-medium rounded-full shadow-sm'
                >
                    {record.state === 'active' ? (
                        <span className='flex items-center justify-center gap-1.5'>
                            <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                            Đang kích hoạt
                        </span>
                    ) : (
                        <span className='flex items-center gap-1.5'>
                            <span className='w-2 h-2 bg-red-500 rounded-full' />
                            Đang bị chặn
                        </span>
                    )}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            width: '20%',
            render: (_, record) => (
                <div className='flex items-center justify-center gap-3'>
                    <Button
                        type='link'
                        className='flex items-center gap-1.5 hover:text-blue-600 transition-colors'
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(record);
                            setIsModalVisible(true);
                        }}
                    >
                        <AiOutlineEye className='text-lg' />
                        Chi tiết
                    </Button>
                    <div className='h-5 w-px bg-gray-200' />
                    <Button
                        type={record.state === 'active' ? 'danger' : 'primary'}
                        className={`shadow-sm hover:shadow-md transition-all ${
                            record.state === 'active'
                                ? 'hover:bg-red-600 hover:text-white'
                                : 'hover:bg-blue-600'
                        }`}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleToggleUserState(record);
                        }}
                        loading={loading}
                    >
                        {record.state === 'active' ? 'Chặn' : 'Mở chặn'}
                    </Button>
                </div>
            ),
        },
    ];

    const handleToggleUserState = (record) => {
        setSelectedUser(record);
        setIsBlockModalVisible(true);
    };

    const handleConfirmBlockUser = async () => {
        const messageBlock = blockReason.trim() === '' ? null : blockReason;
        try {
            setLoading(true);
            if (selectedUser.state === 'active') {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/user/block-user`, null, {
                    params: { userId: selectedUser.id, message: messageBlock },
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                });
                toast.success('Đã chặn người dùng!');
            } else {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/user/unblock-user`, null, {
                    params: { userId: selectedUser.id },
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                });
                toast.success('Đã mở chặn người dùng');
            }
            setIsBlockModalVisible(false);
            await getAllUsers();
        } catch (error) {
            console.log(error);
            toast.error('Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            user.username?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchText.toLowerCase()) ||
            user.phone?.includes(searchText);

        if (filterStatus === 'all') return matchesSearch;
        return matchesSearch && user.state === filterStatus;
    });

    return (
        <div className='p-6'>
            <div className='mb-7'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Quản lý người dùng
                </h1>
                <p className='text-gray-500 mt-2'>Theo dõi và quản lý người dùng trong hệ thống</p>
            </div>

            {!loading && (
                <div className='mb-1'>
                    <UserStats users={users} />
                </div>
            )}

            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden'>
                <div className='bg-white dark:bg-gray-800 rounded-xl p-4'>
                    <div className='flex flex-wrap gap-4 items-center justify-between'>
                        <div className='flex gap-4'>
                            <Select
                                defaultValue='all'
                                className='w-[300px]'
                                onChange={setFilterStatus}
                            >
                                <Select.Option value='all'>Tất cả tài khoản</Select.Option>
                                <Select.Option value='active'>Đang kích hoạt</Select.Option>
                                <Select.Option value='inactive'>Đang bị chặn</Select.Option>
                            </Select>
                            <Search
                                placeholder='Tìm kiếm người dùng...'
                                allowClear
                                enterButton={<AiOutlineSearch />}
                                onChange={(e) => setSearchText(e.target.value)}
                                className='w-full'
                            />
                        </div>
                    </div>
                </div>
                <Table
                    loading={loading}
                    columns={columns}
                    dataSource={filteredUsers}
                    rowKey='id'
                    rowClassName='hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer'
                    onRow={(record) => ({
                        onClick: () => {
                            setSelectedUser(record);
                            setIsModalVisible(true);
                        },
                    })}
                    pagination={{
                        className: 'px-6 py-3',
                        showTotal: (total) => `Tổng ${total} người dùng`,
                    }}
                />
            </div>

            <Modal
                title={
                    <div className='text-xl font-bold text-gray-800 pb-4 border-b'>
                        Thông tin chi tiết người dùng
                    </div>
                }
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={800}
                className='user-detail-modal'
            >
                {selectedUser && (
                    <div className='space-y-8 py-4'>
                        {/* user */}
                        <div className='flex items-center gap-6 bg-gray-50 p-6 rounded-xl'>
                            <Avatar
                                src={selectedUser.avatarImg}
                                size={80}
                                className='border-4 border-white shadow-lg'
                            >
                                {selectedUser.username?.[0]?.toUpperCase()}
                            </Avatar>
                            <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-2'>
                                    <span className='text-2xl font-bold text-gray-800'>
                                        {selectedUser.username}
                                    </span>
                                    <Tag
                                        color={
                                            selectedUser.state === 'active' ? 'success' : 'error'
                                        }
                                        className='px-4 py-1 text-sm font-medium rounded-full shadow-sm'
                                    >
                                        {selectedUser.state === 'active' ? (
                                            <span className='flex items-center justify-center gap-1.5'>
                                                <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                                                Đang kích hoạt
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-1.5'>
                                                <span className='w-2 h-2 bg-red-500 rounded-full' />
                                                Đang bị chặn
                                            </span>
                                        )}
                                    </Tag>
                                </div>
                                <div className='text-gray-500 flex items-center gap-2'>
                                    <MailOutlined className='text-blue-500' />
                                    {selectedUser.email}
                                </div>
                            </div>
                        </div>

                        {/* user */}
                        <div
                            className={`grid ${
                                selectedUser.state === 'blocked' ? 'grid-cols-2' : 'grid-cols-1'
                            } gap-6`}
                        >
                            <div className='bg-white p-6 rounded-xl border border-gray-100 shadow-sm'>
                                <h3 className='text-lg font-semibold text-gray-800 mb-4'>
                                    Thông tin cá nhân
                                </h3>
                                <div className='space-y-4'>
                                    <div className='grid grid-cols-2 gap-4'>
                                        <div>
                                            <div className='text-gray-500 text-sm mb-1'>
                                                Họ và tên
                                            </div>
                                            <div className='font-medium text-gray-800 bg-gray-50 p-2 rounded'>
                                                {selectedUser.fullName || 'Chưa cập nhật'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-gray-500 text-sm mb-1'>
                                                Số điện thoại
                                            </div>
                                            <div className='font-medium text-gray-800 bg-gray-50 p-2 rounded'>
                                                {selectedUser.phone || 'Chưa cập nhật'}
                                            </div>
                                        </div>
                                    </div>
                                    {selectedUser.address && (
                                        <div>
                                            <div className='text-gray-500 text-sm mb-1'>
                                                Địa chỉ
                                            </div>
                                            <Tooltip title={selectedUser.address.fullAddress}>
                                                <div className='font-medium text-gray-800 bg-gray-50 p-2 rounded truncate'>
                                                    {selectedUser.address.fullAddress}
                                                </div>
                                            </Tooltip>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {selectedUser.state === 'blocked' && (
                                <div className='bg-red-50 p-6 rounded-xl border border-red-100'>
                                    <div className='flex items-center gap-2 mb-4'>
                                        <ExclamationCircleOutlined className='text-red-500 text-lg' />
                                        <span className='font-semibold text-red-600 text-lg'>
                                            Thông tin chặn
                                        </span>
                                    </div>
                                    <div className='space-y-4'>
                                        <div>
                                            <div className='text-gray-600 text-sm mb-1'>
                                                Thời gian chặn
                                            </div>
                                            <div className='font-medium text-gray-800 bg-white bg-opacity-50 p-2 rounded'>
                                                {formatDate(selectedUser.blockAt) ||
                                                    'Không có thông tin'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-gray-600 text-sm mb-1'>
                                                Lý do chặn
                                            </div>
                                            <div className='font-medium text-red-600 bg-white bg-opacity-50 p-2 rounded'>
                                                {selectedUser.reasonBlock || 'Không có thông tin'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* orders */}
                        {selectedUser.orders && selectedUser.orders.length > 0 && (
                            <>
                                <div className='flex items-center justify-center gap-4'>
                                    <div className='w-44 h-px bg-gray-300' />
                                    <h3 className='text-xl font-bold text-gray-800'>
                                        Lịch sử đơn hàng
                                    </h3>
                                    <div className='w-44 h-px bg-gray-300' />
                                </div>

                                <div className='space-y-6'>
                                    {selectedUser.orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className='bg-white border border-gray-100 rounded-xl shadow-sm hover:shadow-md transition-all duration-200'
                                        >
                                            <div className='p-4 border-b border-gray-50 bg-gray-50'>
                                                <div className='flex justify-between items-center'>
                                                    <div className='flex items-center gap-3'>
                                                        <Tooltip
                                                            title={order.id}
                                                            className='cursor-pointer'
                                                        >
                                                            <div
                                                                onClick={() =>
                                                                    navigate(
                                                                        `/order/detail/${order.id}`
                                                                    )
                                                                }
                                                                className='text-gray-700 font-semibold'
                                                            >
                                                                Đơn hàng #{order.id.slice(-10)}
                                                            </div>
                                                        </Tooltip>
                                                        <Tag
                                                            color={
                                                                order.state === 'processing'
                                                                    ? 'processing'
                                                                    : order.state === 'delivery'
                                                                    ? 'default'
                                                                    : order.state === 'cancel'
                                                                    ? 'error'
                                                                    : 'success'
                                                            }
                                                            className='rounded-full px-3 py-1'
                                                        >
                                                            {order.state === 'processing'
                                                                ? 'Đang chờ xử lý'
                                                                : order.state === 'delivery'
                                                                ? 'Đang giao hàng'
                                                                : order.state === 'cancel'
                                                                ? 'Đơn hàng bị hủy'
                                                                : 'Đã giao thành công'}
                                                        </Tag>
                                                    </div>
                                                    <div className='text-sm text-gray-500'>
                                                        {formatDate(order.createdAt)}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className='p-6'>
                                                <div className='space-y-4'>
                                                    {order.products.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className='flex items-center gap-4 bg-gray-50 p-4 rounded-lg'
                                                        >
                                                            <img
                                                                src={item.product.img?.[0]}
                                                                alt={item.product.productName}
                                                                className='w-20 h-20 object-cover rounded-lg border border-gray-100 shadow-sm'
                                                            />
                                                            <div className='flex-1'>
                                                                <div
                                                                    className='font-semibold text-gray-800 hover:text-blue-600 cursor-pointer transition-colors'
                                                                    onClick={() =>
                                                                        navigate(
                                                                            `/product-detail/${item.product.id}`
                                                                        )
                                                                    }
                                                                >
                                                                    {item.product.productName}
                                                                </div>
                                                                <div className='text-sm text-gray-500 mt-2'>
                                                                    <span className='bg-gray-100 px-2 py-1 rounded'>
                                                                        Màu:{' '}
                                                                        {item.product.option?.value
                                                                            ?.color || 'N/A'}
                                                                    </span>
                                                                    <span className='mx-2'>|</span>
                                                                    <span className='bg-gray-100 px-2 py-1 rounded'>
                                                                        SL: {item.quantity}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className='font-semibold text-blue-600'>
                                                                {Number(
                                                                    (item.product.option?.value
                                                                        ?.price -
                                                                        item.product.option?.value
                                                                            ?.discount) *
                                                                        item.quantity
                                                                ).toLocaleString('vi-VN')}
                                                                đ
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className='mt-6 pt-4 border-t border-gray-100'>
                                                    <div className='flex justify-between items-center'>
                                                        <div className='flex items-center gap-2'>
                                                            <span className='text-gray-600'>
                                                                Thanh toán:
                                                            </span>
                                                            <Tag
                                                                color='blue'
                                                                className='rounded-full px-3'
                                                            >
                                                                {order.paymentMethod === 'cash' ? (
                                                                    <span className='flex items-center gap-1'>
                                                                        <i className='fas fa-money-bill-wave'></i>
                                                                        Tiền mặt
                                                                    </span>
                                                                ) : (
                                                                    <span className='flex items-center gap-1'>
                                                                        <i className='fas fa-credit-card'></i>
                                                                        VnPay
                                                                    </span>
                                                                )}
                                                            </Tag>
                                                        </div>
                                                        <div className='space-y-2'>
                                                            <div className='flex justify-end items-center gap-3'>
                                                                <span className='text-gray-500'>
                                                                    Phí vận chuyển:
                                                                </span>
                                                                <span className='font-medium text-gray-700'>
                                                                    {Number(
                                                                        order.shippingPrice
                                                                    ).toLocaleString('vi-VN')}
                                                                    đ
                                                                </span>
                                                            </div>
                                                            <div className='flex justify-end items-center gap-3'>
                                                                <span className='text-lg font-medium text-gray-600'>
                                                                    Tổng tiền:
                                                                </span>
                                                                <span className='text-xl font-bold text-blue-600'>
                                                                    {Number(
                                                                        order.totalPrice
                                                                    ).toLocaleString('vi-VN')}
                                                                    đ
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {order.cancelMessage && (
                                                        <div className='mt-4 p-4 bg-red-50 rounded-lg border border-red-100'>
                                                            <div className='text-sm text-red-600'>
                                                                <span className='font-semibold'>
                                                                    Lý do hủy:{' '}
                                                                </span>
                                                                {order.cancelMessage}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                )}
            </Modal>

            <Modal
                title={selectedUser?.state === 'active' ? 'Chặn người dùng' : 'Mở chặn người dùng'}
                open={isBlockModalVisible}
                onCancel={() => setIsBlockModalVisible(false)}
                cancelText='Hủy'
                onOk={handleConfirmBlockUser}
                okText='Xác nhận'
                confirmLoading={loading}
            >
                {selectedUser?.state === 'active' ? (
                    <div>
                        <p>
                            Bạn có chắc muốn chặn người dùng &quot;{selectedUser?.username}&quot;?
                        </p>
                        <TextArea
                            className='mt-4'
                            rows={4}
                            placeholder='Nhập lý do chặn'
                            value={blockReason}
                            onChange={(e) => setBlockReason(e.target.value)}
                        />
                    </div>
                ) : (
                    <p>Bạn có chắc muốn mở chặn người dùng &quot;{selectedUser?.username}&quot;?</p>
                )}
            </Modal>
        </div>
    );
}
