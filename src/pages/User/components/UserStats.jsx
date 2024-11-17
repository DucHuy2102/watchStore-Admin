// import { motion } from 'framer-motion';
// import {
//     CheckCircleOutlined,
//     SafetyCertificateOutlined,
//     StopOutlined,
//     UserOutlined,
// } from '@ant-design/icons';

// export default function UserStats({ users }) {
//     const totalUsers = users.length;
//     const activeUsers = users.filter((u) => u.state === 'active').length;
//     const blockedUsers = users.filter((u) => u.state === 'inactive').length;
//     const verifiedUsers = users.filter((u) => u.verified).length;

//     const stats = [
//         {
//             title: 'Tổng người dùng',
//             value: totalUsers,
//             icon: <UserOutlined />,
//             gradient: 'from-indigo-500 to-blue-500',
//             lightGradient: 'from-indigo-50 to-blue-50',
//         },
//         {
//             title: 'Đang hoạt động',
//             value: activeUsers,
//             icon: <CheckCircleOutlined />,
//             gradient: 'from-emerald-500 to-teal-500',
//             lightGradient: 'from-emerald-50 to-teal-50',
//             percent: Math.round((activeUsers / totalUsers) * 100),
//         },
//         {
//             title: 'Đã bị chặn',
//             value: blockedUsers,
//             icon: <StopOutlined />,
//             gradient: 'from-rose-500 to-red-500',
//             lightGradient: 'from-rose-50 to-red-50',
//             percent: Math.round((blockedUsers / totalUsers) * 100),
//         },
//         {
//             title: 'Đã xác thực',
//             value: verifiedUsers,
//             icon: <SafetyCertificateOutlined />,
//             gradient: 'from-violet-500 to-purple-500',
//             lightGradient: 'from-violet-50 to-purple-50',
//             percent: Math.round((verifiedUsers / totalUsers) * 100),
//         },
//     ];

//     return (
//         <div className='grid grid-cols-4 gap-8 mb-10 p-2'>
//             {stats.map((stat, index) => (
//                 <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ duration: 0.5, delay: index * 0.1 }}
//                     key={index}
//                     className='relative group'
//                 >
//                     <div className='absolute inset-0 bg-gradient-to-r {stat.lightGradient} rounded-2xl transform rotate-1 group-hover:rotate-2 transition-transform duration-300'></div>
//                     <div className='relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100'>
//                         <div className='flex items-start justify-between mb-4'>
//                             <div>
//                                 <h3 className='text-sm font-medium text-gray-400 mb-1'>
//                                     {stat.title}
//                                 </h3>
//                                 <div className='flex items-baseline'>
//                                     <span className='text-3xl font-bold bg-gradient-to-r {stat.gradient} bg-clip-text text-transparent'>
//                                         {stat.value.toLocaleString()}
//                                     </span>
//                                     {stat.percent && (
//                                         <span className='ml-2 text-sm font-medium text-gray-500'>
//                                             ({stat.percent}%)
//                                         </span>
//                                     )}
//                                 </div>
//                             </div>
//                             <div
//                                 className={`bg-gradient-to-r ${stat.lightGradient} p-3 rounded-xl`}
//                             >
//                                 <span
//                                     className={`text-xl bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
//                                 >
//                                     {stat.icon}
//                                 </span>
//                             </div>
//                         </div>

//                         {stat.percent && (
//                             <div>
//                                 <div className='h-1.5 w-full bg-gray-100 rounded-full overflow-hidden'>
//                                     <motion.div
//                                         initial={{ width: 0 }}
//                                         animate={{ width: `${stat.percent}%` }}
//                                         transition={{ duration: 1, ease: 'easeOut' }}
//                                         className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
//                                     />
//                                 </div>
//                             </div>
//                         )}
//                     </div>
//                 </motion.div>
//             ))}
//         </div>
//     );
// }

import { motion } from 'framer-motion';
import {
    CheckCircleOutlined,
    SafetyCertificateOutlined,
    StopOutlined,
    UserOutlined,
} from '@ant-design/icons';

export default function UserStats({ users }) {
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.state === 'active').length;
    const blockedUsers = users.filter((u) => u.state === 'blocked').length; // Sửa 'inactive' thành 'blocked' theo data API
    const verifiedUsers = users.filter((u) => u.verified).length;

    const stats = [
        {
            title: 'Tổng người dùng',
            value: totalUsers,
            icon: <UserOutlined />,
            gradient: 'from-indigo-500 to-blue-500',
            lightGradient: 'from-indigo-50 to-blue-50',
            additionalInfo: 'Tất cả người dùng trong hệ thống',
        },
        {
            title: 'Đang hoạt động',
            value: activeUsers,
            icon: <CheckCircleOutlined />,
            gradient: 'from-emerald-500 to-teal-500',
            lightGradient: 'from-emerald-50 to-teal-50',
            percent: Math.round((activeUsers / totalUsers) * 100),
            additionalInfo: 'Người dùng đang hoạt động bình thường',
        },
        {
            title: 'Đã bị chặn',
            value: blockedUsers,
            icon: <StopOutlined />,
            gradient: 'from-rose-500 to-red-500',
            lightGradient: 'from-rose-50 to-red-50',
            percent: Math.round((blockedUsers / totalUsers) * 100),
            additionalInfo: 'Người dùng bị chặn vì vi phạm',
        },
        {
            title: 'Đã xác thực',
            value: verifiedUsers,
            icon: <SafetyCertificateOutlined />,
            gradient: 'from-violet-500 to-purple-500',
            lightGradient: 'from-violet-50 to-purple-50',
            percent: Math.round((verifiedUsers / totalUsers) * 100),
            additionalInfo: 'Người dùng đã xác thực email',
        },
    ];

    return (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
            {stats.map((stat, index) => (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    key={index}
                    className='group relative'
                >
                    <div className='absolute -inset-0.5 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl blur opacity-50 group-hover:opacity-100 transition duration-300'></div>

                    <div className='relative bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300'>
                        <div
                            className={`absolute -top-4 right-4 w-12 h-12 bg-gradient-to-r ${stat.gradient} rounded-lg shadow-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300`}
                        >
                            <span className='text-white text-xl'>{stat.icon}</span>
                        </div>

                        <div className='pt-2'>
                            <h3 className='text-sm font-medium text-gray-500 dark:text-gray-400'>
                                {stat.title}
                            </h3>
                            <div className='mt-2 flex items-baseline'>
                                <span
                                    className={`text-3xl font-bold bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}
                                >
                                    {stat.value.toLocaleString()}
                                </span>
                                {stat.percent && (
                                    <span className='ml-2 text-sm font-medium text-gray-500'>
                                        ({stat.percent}%)
                                    </span>
                                )}
                            </div>

                            {stat.percent && (
                                <div className='mt-4'>
                                    <div className='h-1.5 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden'>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${stat.percent}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
                                        />
                                    </div>
                                </div>
                            )}

                            <p className='mt-3 text-xs text-gray-500 dark:text-gray-400'>
                                {stat.additionalInfo}
                            </p>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
