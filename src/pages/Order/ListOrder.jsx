import { useState, useEffect, useMemo, useCallback } from 'react';
import moment from 'moment';
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
    Tooltip,
} from 'antd';
import {
    SearchOutlined,
    MoreOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    SyncOutlined,
    CarOutlined,
} from '@ant-design/icons';
import { MdDelete } from 'react-icons/md';
import { FaEye } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const { RangePicker } = DatePicker;
const { Title } = Typography;
const formatOrderId = (id, maxLength = 10) => {
    if (id.length <= maxLength) return id;
    return `${id.slice(0, maxLength)}...`;
};

export default function ListOrder() {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [orders, setOrders] = useState([]);
    console.log('orders', orders);
    const [currentTab, setCurrentTab] = useState('all');
    const [loading, setLoading] = useState(false);
    const [tableParams, setTableParams] = useState({
        pagination: {
            current: 1,
            pageSize: 10,
        },
    });
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        getAllOrders();
    }, []);

    const getAllOrders = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/order/get-all-order`, {
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

    const handleView = (record) => {
        navigate(`/order/detail/${record.id}`);
    };

    const handleDelete = (record) => {
        console.log('Deleting record:', record.id);
    };

    // const menuItems = (record) => (
    //     <Menu
    //         style={{
    //             padding: '4px',
    //             borderRadius: '8px',
    //             boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
    //         }}
    //     >
    //         <Menu.Item key='detail'>
    //             <Button
    //                 onClick={() => handleView(record)}
    //                 type='primary'
    //                 size='middle'
    //                 icon={<FaEye />}
    //                 style={{ borderRadius: '6px', width: '100%' }}
    //             >
    //                 Chi tiết
    //             </Button>
    //         </Menu.Item>
    //         <Menu.Item key='delete'>
    //             <Button
    //                 onClick={() => handleDelete(record)}
    //                 className='bg-red-500 w-full !text-white hover:!bg-red-600 !border-none'
    //                 size='middle'
    //                 icon={<MdDelete />}
    //                 style={{ borderRadius: '6px' }}
    //             >
    //                 Xóa
    //             </Button>
    //         </Menu.Item>
    //     </Menu>
    // );

    const columns = [
        {
            title: 'STT',
            key: 'index',
            width: 10,
            align: 'center',
            render: (_, __, index) => {
                const { current, pageSize } = tableParams.pagination;
                return (
                    <span className='text-gray-500 font-medium'>
                        {(current - 1) * pageSize + index + 1}
                    </span>
                );
            },
            fixed: 'left',
        },
        {
            title: <span className='w-full flex items-center justify-center'>Mã đơn</span>,
            dataIndex: 'id',
            key: 'id',
            render: (id) => (
                <Tooltip title={`#${id}`}>
                    <span
                        style={{
                            fontWeight: 600,
                            color: '#1890ff',
                            cursor: 'pointer',
                        }}
                        onClick={() => navigate(`/order/detail/${id}`)}
                        className='hover:text-blue-600'
                    >
                        #{formatOrderId(id)}
                    </span>
                </Tooltip>
            ),
        },
        {
            title: <span className='w-full flex items-center justify-center'>Khách hàng</span>,
            dataIndex: 'user',
            key: 'user',
            render: (user) => (
                <Space>
                    <Avatar
                        style={{
                            backgroundColor: '#1890ff',
                            verticalAlign: 'middle',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                        }}
                    >
                        {user.name.charAt(0)}
                    </Avatar>
                    <div>
                        <div style={{ fontWeight: 600, color: '#262626' }}>{user.name}</div>
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
            render: (status) => {
                const statusConfig = {
                    processing: {
                        color: 'processing',
                        icon: <SyncOutlined spin />,
                        text: 'Đang chờ giao',
                    },
                    delivery: {
                        color: 'warning',
                        icon: <CarOutlined />,
                        text: 'Đang giao hàng',
                    },
                    complete: {
                        color: 'success',
                        icon: <CheckCircleOutlined />,
                        text: 'Thành công',
                    },
                    cancel: {
                        color: 'error',
                        icon: <CloseCircleOutlined />,
                        text: 'Đơn bị hủy',
                    },
                };

                const config = statusConfig[status] || statusConfig.processing;

                return (
                    <Tag
                        icon={config.icon}
                        color={config.color}
                        style={{
                            width: '130px',
                            padding: '5px 12px',
                            borderRadius: '10px',
                            fontSize: '13px',
                        }}
                    >
                        {config.text}
                    </Tag>
                );
            },
        },
        {
            title: 'Thao tác',
            align: 'center',
            key: 'action',
            render: (_, record) => (
                <Button
                    onClick={() => handleView(record)}
                    type='primary'
                    size='middle'
                    icon={<FaEye />}
                    style={{ borderRadius: '6px', width: '100%' }}
                >
                    Chi tiết
                </Button>
            ),
        },
    ];

    const itemTabs = useMemo(() => {
        return [
            {
                key: 'all',
                label: (
                    <Badge count={20} style={{ backgroundColor: '#36cfc9' }}>
                        <span style={{ padding: '0 4px', fontWeight: 500 }}>Tất cả</span>
                    </Badge>
                ),
            },
            {
                key: 'processing',
                label: (
                    <Badge
                        count={orders.filter((order) => order.state === 'processing').length}
                        style={{ backgroundColor: '#4096ff' }}
                    >
                        <span style={{ padding: '0 4px', fontWeight: 500 }}>Đang xử lý</span>
                    </Badge>
                ),
            },
            {
                key: 'delivery',
                label: (
                    <Badge
                        count={orders.filter((order) => order.state === 'delivery').length}
                        size='small'
                    >
                        <span style={{ padding: '0 4px', fontWeight: 500 }}>Đang giao hàng</span>
                    </Badge>
                ),
            },
            {
                key: 'complete',
                label: (
                    <Badge
                        count={orders.filter((order) => order.state === 'complete').length}
                        size='small'
                    >
                        <span style={{ padding: '0 4px', fontWeight: 500 }}>Đã giao</span>
                    </Badge>
                ),
            },
            {
                key: 'cancel',
                label: (
                    <Badge
                        count={orders.filter((order) => order.state === 'cancel').length}
                        size='small'
                    >
                        <span style={{ padding: '0 4px', fontWeight: 500 }}>Hủy đơn</span>
                    </Badge>
                ),
            },
        ];
    }, [orders]);

    const handleTableChange = (pagination, filters, sorter) => {
        setTableParams({
            pagination,
            filters,
            ...sorter,
        });
    };

    const filterOrders = (orders, tab, startDate, endDate) => {
        let filteredOrders = [...orders];

        if (tab !== 'all') {
            filteredOrders = filteredOrders.filter((order) => order.state.trim() === tab.trim());
        }

        if (startDate && endDate) {
            filteredOrders = filteredOrders.filter((order) => {
                const orderDate = moment(order.createdAt).toDate();
                return orderDate >= startDate && orderDate <= endDate;
            });
        }

        return filteredOrders;
    };

    const handleChangeTab = (key) => {
        setCurrentTab(key);
    };

    const handleRangePickerChange = (dates) => {
        if (dates) {
            setStartDate(dates[0].toDate());
            setEndDate(dates[1].toDate());
        } else {
            setStartDate(null);
            setEndDate(null);
        }
    };

    const filteredOrders = useMemo(() => {
        return filterOrders(orders, currentTab, startDate, endDate);
    }, [orders, currentTab, startDate, endDate]);

    const handleSearch = useCallback(
        (e) => {
            const value = e.target.value;
            if (value) {
                const searchOrders = orders.filter(
                    (order) =>
                        order.id.toLowerCase().includes(value.toLowerCase()) ||
                        order.user.name.toLowerCase().includes(value.toLowerCase()) ||
                        order.user.email.toLowerCase().includes(value.toLowerCase())
                );
                setOrders(searchOrders);
            } else {
                getAllOrders();
            }
        },
        [orders]
    );

    return (
        <div className='p-6 min-h-screen'>
            <Title level={3} style={{ marginBottom: '24px' }} className='dark:text-white'>
                Danh sách đơn hàng
            </Title>

            <Card
                bordered={false}
                style={{
                    borderRadius: '12px',
                    boxShadow:
                        'rgba(145, 158, 171, 0.2) 0px 0px 2px 0px, rgba(145, 158, 171, 0.12) 0px 12px 24px -4px',
                    background: '#ffffff',
                }}
            >
                <Tabs
                    onChange={handleChangeTab}
                    defaultActiveKey='all'
                    items={itemTabs}
                    style={{ marginBottom: '24px' }}
                    tabBarStyle={{ marginBottom: '16px' }}
                    tabBarGutter={8}
                    className='custom-tabs'
                />

                <Space direction='vertical' size='middle' className='w-full'>
                    <Space className='w-full justify-between bg-gray-50 p-4 rounded-lg'>
                        <RangePicker
                            onChange={handleRangePickerChange}
                            allowClear
                            format='DD/MM/YYYY'
                            placeholder={['Ngày bắt đầu', 'Ngày kết thúc']}
                            style={{
                                width: 400,
                                height: 40,
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}
                        />
                        <Input
                            onChange={handleSearch}
                            placeholder='Tìm kiếm khách hàng hoặc mã đơn hàng...'
                            prefix={<SearchOutlined style={{ color: '#1890ff' }} />}
                            style={{
                                width: 400,
                                height: 40,
                                borderRadius: '8px',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                            }}
                        />
                    </Space>

                    <Table
                        columns={columns}
                        dataSource={filteredOrders}
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
