import { Avatar, Button, Input, Modal, Select, Table, Tag } from 'antd';
import axios from 'axios';
import { Badge, Card } from 'flowbite-react';
import { useEffect, useState } from 'react';
import { AiOutlineEye, AiOutlineSearch } from 'react-icons/ai';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const { Search } = Input;

export default function ListUser() {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [users, setUsers] = useState([]);
    console.log(users);
    const [searchText, setSearchText] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [selectedUser, setSelectedUser] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        getAllUsers();
    }, []);

    const getAllUsers = async () => {
        try {
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
        }
    };

    const columns = [
        {
            title: 'Người dùng',
            key: 'user',
            render: (_, record) => (
                <div className='flex items-center gap-3'>
                    <Avatar src={record.avatarImg} size='large'>
                        {record.username?.[0]?.toUpperCase()}
                    </Avatar>
                    <div>
                        <div className='font-semibold'>{record.username}</div>
                        <div className='text-gray-500 text-sm'>{record.email}</div>
                    </div>
                </div>
            ),
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone',
            align: 'center',
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
            title: 'Vai trò',
            key: 'role',
            align: 'center',
            render: (_, record) => (
                <Tag color={record.admin ? 'red' : 'blue'}>{record.admin ? 'Admin' : 'User'}</Tag>
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
                        onClick={() => {
                            setSelectedUser(record);
                            setIsModalVisible(true);
                        }}
                    >
                        <AiOutlineEye className='text-lg' />
                        Chi tiết
                    </Button>
                    <div className='h-4 w-px bg-gray-300' />
                    <Select
                        value={record.state === 'active' ? 'active' : 'inactive'}
                        style={{ width: 130 }}
                        onChange={(value) => handleChangeUserState(record.id, value)}
                        loading={loading}
                        className='text-center'
                        popupClassName='min-w-[130px]'
                    >
                        <Select.Option value='active'>
                            <div className='flex justify-start items-center gap-2 px-1'>
                                <div className='w-2 h-2 bg-green-500 rounded-full' />
                                Kích hoạt
                            </div>
                        </Select.Option>
                        <Select.Option value='inactive'>
                            <div className='flex justify-start items-center gap-2 px-1'>
                                <div className='w-2 h-2 bg-red-500 rounded-full' />
                                Chặn
                            </div>
                        </Select.Option>
                    </Select>
                </div>
            ),
        },
    ];

    const handleChangeUserState = async (userId, newState) => {
        try {
            setLoading(true);
            if (newState === 'inactive') {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/user/block-user`, null, {
                    params: { userId: userId },
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                });
                toast.success('Đã chặn người dùng thành công');
            } else {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/user/unblock-user`, null, {
                    params: { userId: userId },
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                });
                toast.success('Đã gỡ chặn người dùng thành công');
            }
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
        <Card className='p-6 mt-16 ml-2'>
            <div className='flex justify-between items-center mb-6'>
                <div className='text-2xl font-bold'>Quản lý người dùng</div>
                <div className='flex gap-4'>
                    <Select defaultValue='all' style={{ width: 120 }} onChange={setFilterStatus}>
                        <Select.Option value='all'>Tất cả</Select.Option>
                        <Select.Option value='active'>Hoạt động</Select.Option>
                        <Select.Option value='inactive'>Bị chặn</Select.Option>
                    </Select>
                    <Search
                        placeholder='Tìm kiếm người dùng...'
                        allowClear
                        enterButton={<AiOutlineSearch />}
                        onChange={(e) => setSearchText(e.target.value)}
                        style={{ width: 300 }}
                    />
                </div>
            </div>

            <Table
                columns={columns}
                dataSource={filteredUsers}
                rowKey='id'
                pagination={{
                    pageSize: 10,
                    total: filteredUsers.length,
                    showTotal: (total) => `Tổng ${total} người dùng`,
                }}
            />

            <Modal
                title='Thông tin chi tiết người dùng'
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={null}
                width={700}
            >
                {selectedUser && (
                    <div className='space-y-4'>
                        <div className='flex items-center gap-4'>
                            <Avatar src={selectedUser.avatarImg} size={64}>
                                {selectedUser.username?.[0]?.toUpperCase()}
                            </Avatar>
                            <div>
                                <div className='text-xl font-bold'>{selectedUser.username}</div>
                                <div>{selectedUser.email}</div>
                            </div>
                        </div>

                        <div className='grid grid-cols-2 gap-4'>
                            <div>
                                <div className='font-semibold'>Họ và tên</div>
                                <div>{selectedUser.fullName || 'Chưa cập nhật'}</div>
                            </div>
                            <div>
                                <div className='font-semibold'>Số điện thoại</div>
                                <div>{selectedUser.phone || 'Chưa cập nhật'}</div>
                            </div>
                        </div>

                        {selectedUser.address && (
                            <div>
                                <div className='font-semibold'>Địa chỉ</div>
                                <div>{selectedUser.address.fullAddress}</div>
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </Card>
    );
}
