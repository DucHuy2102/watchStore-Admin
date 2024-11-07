import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
    Table,
    Card,
    Input,
    DatePicker,
    Space,
    Tag,
    Button,
    Tabs,
    Typography,
    Avatar,
    Badge,
    Dropdown,
    Menu,
} from 'antd';
import {
    SearchOutlined,
    CalendarOutlined,
    MoreOutlined,
    UserOutlined,
    ShoppingCartOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    RollbackOutlined,
} from '@ant-design/icons';
import { MdDelete } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Title } = Typography;

export default function ListOrder() {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [orders, setOrders] = useState([]);
    console.log(orders);
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const navigate = useNavigate();

    useEffect(() => {
        getAllOrders();
    }, []);

    const getAllOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/order`, {
                headers: {
                    Authorization: `Bearer ${tokenUser}`,
                },
            });
            if (res.status === 200) {
                setOrders(res.data);
            }
        } catch (error) {
            console.log(error);
            toast.error('Lỗi lấy danh sách đơn hàng');
        } finally {
            setLoading(false);
        }
    };

    const getStatusTag = (status) => {
        const config = {
            processing: {
                color: '#1890ff',
                icon: <ClockCircleOutlined />,
                text: 'Đang chờ duyệt',
            },
            completed: {
                color: '#52c41a',
                icon: <CheckCircleOutlined />,
                text: 'Hoàn thành',
            },
            cancelled: {
                color: '#ff4d4f',
                icon: <CloseCircleOutlined />,
                text: 'Đã hủy',
            },
            refunded: {
                color: '#faad14',
                icon: <RollbackOutlined />,
                text: 'Hoàn tiền',
            },
        };

        const statusConfig = config[status] || config['processing'];
        return (
            <Tag
                icon={statusConfig.icon}
                color={statusConfig.color}
                style={{
                    padding: '5px 12px',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px',
                    border: 'none',
                }}
            >
                {statusConfig.text}
            </Tag>
        );
    };

    const columns = [
        {
            title: 'Mã đơn',
            dataIndex: 'id',
            key: 'id',
            render: (text) => <span style={{ fontWeight: 600, color: '#1890ff' }}>#{text}</span>,
        },
        {
            title: 'Khách hàng',
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Space>
                    <Avatar
                        style={{
                            backgroundColor: '#f56a00',
                            verticalAlign: 'middle',
                        }}
                    >
                        {user.name.charAt(0)}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600 }}>{user.name}</div>
                        <div style={{ color: '#8c8c8c', fontSize: '12px' }}>{user.email}</div>
                    </div>
                </Space>
            ),
        },
        {
            title: 'Ngày đặt',
            align: 'center',
            dataIndex: 'createdAt',
            key: 'createdAt',
            render: (date) => (
                <div>
                    <div style={{ fontWeight: 500 }}>
                        {new Date(date).toLocaleDateString('vi-VN')}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '12px' }}>
                        {new Date(date).toLocaleTimeString('vi-VN')}
                    </div>
                </div>
            ),
        },
        {
            title: 'Số SP',
            align: 'center',
            dataIndex: 'products',
            key: 'products',
            sorter: (a, b) => a.products.length - b.products.length,
            render: (products) => (
                <Badge
                    count={products.length}
                    style={{
                        backgroundColor: '#1890ff',
                        fontWeight: 600,
                    }}
                />
            ),
        },
        {
            title: 'Tổng tiền',
            align: 'center',
            dataIndex: 'totalPrice',
            sorter: (a, b) => a.totalPrice - b.totalPrice,
            key: 'totalPrice',
            render: (price) => (
                <span style={{ fontWeight: 600, color: '#52c41a' }}>
                    {new Intl.NumberFormat('vi-VN', {
                        style: 'currency',
                        currency: 'VND',
                    }).format(price)}
                </span>
            ),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'state',
            align: 'center',
            key: 'state',
            render: (status) => getStatusTag(status),
        },
        {
            title: 'Thao tác',
            align: 'center',
            key: 'action',
            render: (_, record) => (
                <Dropdown
                    overlay={
                        <Menu>
                            <Menu.Item key='detail'>
                                <Button
                                    onClick={() => navigate(`/order/detail/${record.id}`)}
                                    type='primary'
                                    size='small'
                                    icon={<FaEye />}
                                >
                                    Chi tiết
                                </Button>
                            </Menu.Item>
                            <Menu.Item key='delete'>
                                <Button
                                    className='bg-[#ff4d4f] w-full !text-white hover:!bg-red-500 !border-none'
                                    size='small'
                                    icon={<MdDelete />}
                                >
                                    Xóa
                                </Button>
                            </Menu.Item>
                        </Menu>
                    }
                    trigger={['click']}
                >
                    <Button type='text' icon={<MoreOutlined />} />
                </Dropdown>
            ),
        },
    ];

    const items = [
        {
            key: 'all',
            label: (
                <Badge count={20} size='small'>
                    <span style={{ padding: '0 4px' }}>Tất cả</span>
                </Badge>
            ),
        },
        {
            key: 'processing',
            label: (
                <Badge count={6} size='small'>
                    <span style={{ padding: '0 4px' }}>Đang xử lý</span>
                </Badge>
            ),
        },
        {
            key: 'completed',
            label: (
                <Badge count={10} size='small'>
                    <span style={{ padding: '0 4px' }}>Hoàn thành</span>
                </Badge>
            ),
        },
        {
            key: 'cancelled',
            label: (
                <Badge count={2} size='small'>
                    <span style={{ padding: '0 4px' }}>Đã hủy</span>
                </Badge>
            ),
        },
        {
            key: 'refunded',
            label: (
                <Badge count={2} size='small'>
                    <span style={{ padding: '0 4px' }}>Hoàn tiền</span>
                </Badge>
            ),
        },
    ];

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    return (
        <div className='p-6 bg-gray-50 min-h-screen'>
            <Title level={3} style={{ marginBottom: '24px' }}>
                Danh sách đơn hàng
            </Title>

            <Card
                bordered={false}
                style={{
                    borderRadius: '8px',
                    boxShadow: '0 1px 2px 0 rgba(0,0,0,0.03)',
                }}
            >
                <Tabs defaultActiveKey='all' items={items} style={{ marginBottom: '24px' }} />

                <Space direction='vertical' size='middle' className='w-full'>
                    <Space className='w-full justify-between'>
                        <RangePicker
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                            style={{
                                borderRadius: '6px',
                            }}
                        />
                        <Input
                            placeholder='Tìm kiếm khách hàng hoặc mã đơn hàng...'
                            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                            style={{
                                width: 300,
                                borderRadius: '6px',
                            }}
                        />
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={orders}
                        rowKey='id'
                        pagination={{
                            ...tableParams.pagination,
                            showSizeChanger: true,
                            showTotal: (total) => `Tổng ${total} đơn hàng`,
                            pageSizeOptions: ['10', '20', '50'],
                        }}
                        loading={loading}
                        onChange={handleTableChange}
                        style={{ marginTop: '12px' }}
                    />
                </Space>
            </Card>
        </div>
    );
}
