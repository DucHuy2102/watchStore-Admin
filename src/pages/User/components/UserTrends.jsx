// Import thêm các components cần thiết
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Select } from 'antd';
import { useState, useEffect } from 'react';

export default function UserTrends() {
    const [timeRange, setTimeRange] = useState('week');
    const [userTrendData, setUserTrendData] = useState([]);

    useEffect(() => {
        generateData(timeRange);
    }, [timeRange]);

    // Hàm tạo dữ liệu mẫu - Trong thực tế sẽ là API call
    const generateData = (range) => {
        let data = [];
        let days = range === 'week' ? 7 : range === 'month' ? 30 : 12;
        let format = range === 'year' ? 'MM/YYYY' : 'DD/MM';

        for (let i = 0; i < days; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.unshift({
                date: date.toLocaleDateString('vi-VN', {
                    day: range !== 'year' ? '2-digit' : undefined,
                    month: '2-digit',
                    year: range === 'year' ? 'numeric' : undefined,
                }),
                users: Math.floor(Math.random() * (1000 - 500) + 500),
                activeUsers: Math.floor(Math.random() * (800 - 300) + 300),
                newUsers: Math.floor(Math.random() * (200 - 50) + 50),
            });
        }
        setUserTrendData(data);
    };

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className='bg-white p-4 shadow-lg rounded-lg border border-gray-100'>
                    <p className='font-medium text-gray-600 mb-2'>{label}</p>
                    <div className='space-y-1'>
                        <p className='text-sm text-indigo-600'>
                            <span className='font-medium'>Tổng người dùng:</span> {payload[0].value}
                        </p>
                        <p className='text-sm text-emerald-600'>
                            <span className='font-medium'>Đang hoạt động:</span> {payload[1].value}
                        </p>
                        <p className='text-sm text-violet-600'>
                            <span className='font-medium'>Người dùng mới:</span> {payload[2].value}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className='mb-8 bg-white rounded-2xl p-6 shadow-lg border border-gray-100'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h3 className='text-lg font-semibold text-gray-800'>Xu hướng người dùng</h3>
                    <p className='text-sm text-gray-500 mt-1'>
                        Thống kê biến động người dùng theo thời gian
                    </p>
                </div>
                <Select
                    defaultValue='week'
                    onChange={setTimeRange}
                    className='w-32'
                    dropdownClassName='rounded-lg shadow-lg'
                >
                    <Select.Option value='week'>Tuần này</Select.Option>
                    <Select.Option value='month'>Tháng này</Select.Option>
                    <Select.Option value='year'>Năm nay</Select.Option>
                </Select>
            </div>

            <div className='h-80'>
                <ResponsiveContainer width='100%' height='100%'>
                    <AreaChart
                        data={userTrendData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id='colorTotalUsers' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='5%' stopColor='#6366f1' stopOpacity={0.15} />
                                <stop offset='95%' stopColor='#6366f1' stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id='colorActiveUsers' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='5%' stopColor='#10b981' stopOpacity={0.15} />
                                <stop offset='95%' stopColor='#10b981' stopOpacity={0} />
                            </linearGradient>
                            <linearGradient id='colorNewUsers' x1='0' y1='0' x2='0' y2='1'>
                                <stop offset='5%' stopColor='#8b5cf6' stopOpacity={0.15} />
                                <stop offset='95%' stopColor='#8b5cf6' stopOpacity={0} />
                            </linearGradient>
                        </defs>

                        <XAxis
                            dataKey='date'
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#64748b', fontSize: 12 }}
                        />
                        <Tooltip content={<CustomTooltip />} />

                        <Area
                            type='monotone'
                            dataKey='users'
                            stroke='#6366f1'
                            strokeWidth={2}
                            fillOpacity={1}
                            fill='url(#colorTotalUsers)'
                        />
                        <Area
                            type='monotone'
                            dataKey='activeUsers'
                            stroke='#10b981'
                            strokeWidth={2}
                            fillOpacity={1}
                            fill='url(#colorActiveUsers)'
                        />
                        <Area
                            type='monotone'
                            dataKey='newUsers'
                            stroke='#8b5cf6'
                            strokeWidth={2}
                            fillOpacity={1}
                            fill='url(#colorNewUsers)'
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className='flex items-center justify-center gap-6 mt-6'>
                <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-indigo-500'></div>
                    <span className='text-sm text-gray-600'>Tổng người dùng</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-emerald-500'></div>
                    <span className='text-sm text-gray-600'>Đang hoạt động</span>
                </div>
                <div className='flex items-center gap-2'>
                    <div className='w-3 h-3 rounded-full bg-violet-500'></div>
                    <span className='text-sm text-gray-600'>Người dùng mới</span>
                </div>
            </div>
        </div>
    );
}
