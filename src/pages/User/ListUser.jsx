import { Avatar, Button, Input, Modal, Select, Table, Tag } from 'antd';
import TextArea from 'antd/es/input/TextArea';
import axios from 'axios';
import { Badge } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineSearch } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { ExclamationCircleOutlined, MailOutlined } from '@ant-design/icons';
import { UserStats } from './components/exportComponentUser';
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
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    console.log(users);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [blockReason, setBlockReason] = useState('');
    const [isBlockModalVisible, setIsBlockModalVisible] = useState(false);

    useEffect(() => {
        if (!users.length) {
            getAllUsers();
        }
    }, []);

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

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            sorter: (a, b) => a.username.localeCompare(b.username),
            render: (_, record) => (
                <div className='flex items-center gap-3'>
                    <Avatar src={record.avatarImg} size='large'>
                        {record.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div className='flex items-center gap-x-2'>
                            <div className='font-semibold'>
                                {record.fullName ?? 'Chưa cập nhật'}
                            </div>{' '}
                            - <div className='font-semibold italic'>{record.username}</div>
                        </div>
                        <div className='flex items-center gap-1.5 truncate text-gray-600'>
                            <MailOutlined />
                            <span>{record.email}</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            align: 'center',
            sorter: (a, b) => a.phone?.localeCompare(b.phone),
            key: 'phone',
            render: (phone) => phone || 'Chưa cập nhật',
        },
        {
            title: 'Xác thực',
            key: 'verified',
            align: 'center',
            render: (_, record) => (
                <Badge
                    className='py-1 w-full flex items-center justify-center'
                    color={record.verified ? 'success' : 'warning'}
                >
                    {record.verified ? 'Đã xác thực' : 'Chưa xác thực'}
                </Badge>
            ),
        },
        {
            title: 'Trạng thái',
            key: 'state',
            align: 'center',
            render: (_, record) => (
                <Tag
                    color={record.state === 'active' ? 'success' : 'error'}
                    className='px-3 py-1 text-sm font-medium rounded-full'
                >
                    {record.state === 'active' ? (
                        <span className='flex items-center justify-center gap-1'>
                            <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                            Hoạt động
                        </span>
                    ) : (
                        <span className='flex items-center gap-1'>
                            <span className='w-2 h-2 bg-red-500 rounded-full' />
                            Đã chặn
                        </span>
                    )}
                </Tag>
            ),
        },
        {
            title: 'Thao tác',
            key: 'action',
            align: 'center',
            render: (_, record) => (
                <div className='flex items-center justify-center gap-2'>
                    <Button
                        type='link'
                        className='flex items-center gap-1'
                        onClick={(e) => {
                            e.stopPropagation();
                            setSelectedUser(record);
                            setIsModalVisible(true);
                        }}
                    >
                        <AiOutlineEye className='text-lg' />
                        Chi tiết
                    </Button>
                    <div className='h-4 w-px bg-gray-300' />
                    <Button
                        type={record.state === 'active' ? 'danger' : 'primary'}
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
        <div className='container mx-auto px-6'>
            <div className='mb-6'>
                <h1 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    Quản lý người dùng
                </h1>
                <p className='text-gray-500 mt-2'>Theo dõi và quản lý người dùng trong hệ thống</p>
            </div>

            {!loading && (
                <div className='mb-6'>
                    <UserStats users={users} />
                </div>
            )}

            <div className='bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden'>
                <div className='bg-white dark:bg-gray-800 rounded-xl p-4'>
                    <div className='flex flex-wrap gap-4 items-center justify-between'>
                        <div className='flex gap-4'>
                            <Select
                                defaultValue='all'
                                className='min-w-[140px]'
                                onChange={setFilterStatus}
                            >
                                <Select.Option value='all'>Tất cả</Select.Option>
                                <Select.Option value='active'>Hoạt động</Select.Option>
                                <Select.Option value='inactive'>Bị chặn</Select.Option>
                            </Select>
                            <Search
                                placeholder='Tìm kiếm người dùng...'
                                allowClear
                                enterButton={<AiOutlineSearch />}
                                onChange={(e) => setSearchText(e.target.value)}
                                className='w-full md:w-[300px]'
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
                        showSizeChanger: true,
                        showTotal: (total) => `Tổng ${total} người dùng`,
                    }}
                />
            </div>

            <Modal
                title='Thông tin chi tiết người dùng'
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedUser && (
                    <div className='space-y-6'>
                        <div className='flex items-center gap-4'>
                            <Avatar src={selectedUser.avatarImg} size={64}>
                                {selectedUser.username?.[0]?.toUpperCase()}
                            </Avatar>
                            <div className='flex-1'>
                                <div className='flex items-center gap-3'>
                                    <span className='text-xl font-bold'>
                                        {selectedUser.username}
                                    </span>
                                    <Tag
                                        color={
                                            selectedUser.state === 'active' ? 'success' : 'error'
                                        }
                                        className='px-3 py-1 text-sm font-medium rounded-full'
                                    >
                                        {selectedUser.state === 'active' ? (
                                            <span className='flex items-center justify-center gap-1'>
                                                <span className='w-2 h-2 bg-green-500 rounded-full animate-pulse' />
                                                Hoạt động
                                            </span>
                                        ) : (
                                            <span className='flex items-center gap-1'>
                                                <span className='w-2 h-2 bg-red-500 rounded-full' />
                                                Đã chặn
                                            </span>
                                        )}
                                    </Tag>
                                </div>
                                <div className='text-gray-500'>{selectedUser.email}</div>
                            </div>
                        </div>

                        <div className='border-t border-gray-200'></div>

                        <div className='grid grid-cols-2 gap-6'>
                            <div className='space-y-4'>
                                <div>
                                    <div className='text-gray-500 text-sm mb-1'>Họ và tên</div>
                                    <div className='font-medium'>
                                        {selectedUser.fullName || 'Chưa cập nhật'}
                                    </div>
                                </div>
                                <div>
                                    <div className='text-gray-500 text-sm mb-1'>Số điện thoại</div>
                                    <div className='font-medium'>
                                        {selectedUser.phone || 'Chưa cập nhật'}
                                    </div>
                                </div>
                                {selectedUser.address && (
                                    <div>
                                        <div className='text-gray-500 text-sm mb-1'>Địa chỉ</div>
                                        <div className='font-medium'>
                                            {selectedUser.address.fullAddress}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedUser.state === 'blocked' && (
                                <div className='bg-red-50 p-4 rounded-lg border border-red-100'>
                                    <div className='flex items-center gap-2 mb-2'>
                                        <ExclamationCircleOutlined className='text-red-500' />
                                        <span className='font-semibold text-red-600'>
                                            Thông tin chặn
                                        </span>
                                    </div>
                                    <div className='space-y-2'>
                                        <div>
                                            <div className='text-gray-500 text-sm'>
                                                Thời gian chặn
                                            </div>
                                            <div className='font-medium'>
                                                {formatDate(selectedUser.blockAt) ||
                                                    'Không có thông tin'}
                                            </div>
                                        </div>
                                        <div>
                                            <div className='text-gray-500 text-sm'>Lý do chặn</div>
                                            <div className='font-medium text-red-600'>
                                                {selectedUser.reasonBlock || 'Không có thông tin'}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedUser.orders && selectedUser.orders.length > 0 && (
                            <>
                                <div className='border-t border-gray-200 pt-6'>
                                    <div className='text-lg font-semibold mb-4'>
                                        Lịch sử đơn hàng
                                    </div>
                                    <div className='space-y-4'>
                                        {selectedUser.orders.map((order) => (
                                            <div
                                                key={order.id.timestamp}
                                                className='bg-gray-50 rounded-lg p-4'
                                            >
                                                <div className='flex justify-between items-start'>
                                                    <div>
                                                        <div className='font-medium text-gray-900'>
                                                            Đơn hàng #{order.id.timestamp}
                                                        </div>
                                                        <div className='text-sm text-gray-500'>
                                                            {new Date(
                                                                order.createdAt
                                                            ).toLocaleString('vi-VN')}
                                                        </div>
                                                    </div>
                                                    <Tag
                                                        color={
                                                            order.state === 'processing'
                                                                ? 'processing'
                                                                : order.state === 'delivered'
                                                                ? 'success'
                                                                : 'default'
                                                        }
                                                    >
                                                        {order.state === 'processing'
                                                            ? 'Đang xử lý'
                                                            : order.state === 'delivered'
                                                            ? 'Đã giao'
                                                            : 'Chờ xử lý'}
                                                    </Tag>
                                                </div>

                                                <div className='mt-3 space-y-2'>
                                                    {order.products.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className='flex justify-between items-center text-sm'
                                                        >
                                                            <div className='flex items-center gap-2'>
                                                                <div className='font-medium'>
                                                                    {item.product.productName}
                                                                </div>
                                                                <div className='text-gray-500'>
                                                                    x{item.quantity}
                                                                </div>
                                                            </div>
                                                            <div className='font-medium'>
                                                                {Number(
                                                                    item.product.priceSafely
                                                                ).toLocaleString('vi-VN')}
                                                                đ
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div className='mt-3 pt-3 border-t border-gray-200 flex justify-between items-center'>
                                                    <div className='text-sm'>
                                                        <span className='text-gray-500'>
                                                            Phương thức thanh toán:
                                                        </span>
                                                        <span className='font-medium ml-1'>
                                                            {order.paymentMethod === 'cash'
                                                                ? 'Tiền mặt'
                                                                : 'Chuyển khoản VnPay'}
                                                        </span>
                                                    </div>
                                                    <div className='font-medium text-lg'>
                                                        Tổng tiền:{' '}
                                                        {Number(order.totalPrice).toLocaleString(
                                                            'vi-VN'
                                                        )}
                                                        đ
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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
