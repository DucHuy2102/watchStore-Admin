import { Modal, Badge } from 'antd';
import { motion } from 'framer-motion';
import {
    FaTag,
    FaMapMarkerAlt,
    FaCalendarAlt,
    FaClock,
    FaInfoCircle,
    FaGift,
} from 'react-icons/fa';
import dayjs from 'dayjs';

export default function VoucherDetailModal({ voucher, open, onClose }) {
    if (!voucher) return null;

    const isExpired = dayjs(voucher.expiryDate).isBefore(dayjs());
    const isActive = voucher.state === 'active';

    return (
        <Modal
            open={open}
            onCancel={onClose}
            footer={null}
            width={600}
            centered
            className='voucher-detail-modal'
        >
            <div className='flex flex-col space-y-6 p-4'>
                <div className='relative h-48 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg overflow-hidden'>
                    {voucher.img ? (
                        <img
                            src={voucher.img}
                            alt={voucher.couponName}
                            className='w-full h-full object-cover'
                        />
                    ) : (
                        <div className='flex items-center justify-center h-full'>
                            <FaGift className='text-white text-6xl opacity-50' />
                        </div>
                    )}
                    <div className='absolute inset-0 bg-black bg-opacity-40 flex items-end p-6'>
                        <div className='text-white'>
                            <h2 className='text-3xl font-bold mb-2'>{voucher.couponName}</h2>
                            <Badge
                                status={isActive ? 'success' : 'error'}
                                text={
                                    <span className='text-white'>
                                        {isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                                    </span>
                                }
                            />
                        </div>
                    </div>
                </div>

                <div className='grid grid-cols-2 gap-6'>
                    <motion.div
                        className='space-y-4'
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className='bg-blue-50 p-4 rounded-lg'>
                            <div className='flex items-center gap-2 text-blue-600 mb-2'>
                                <FaTag />
                                <h3 className='font-semibold'>Mã Voucher</h3>
                            </div>
                            <div className='bg-white px-4 py-3 rounded-md text-center'>
                                <span className='text-xl font-mono font-bold text-blue-600'>
                                    {voucher.couponCode}
                                </span>
                            </div>
                        </div>

                        <div className='bg-orange-50 p-4 rounded-lg'>
                            <div className='flex items-center gap-2 text-orange-600 mb-2'>
                                <FaMapMarkerAlt />
                                <h3 className='font-semibold'>Khu vực áp dụng</h3>
                            </div>
                            <p className='text-gray-700'>
                                {voucher.province?.value !== 0
                                    ? voucher.province?.label
                                    : 'Áp dụng toàn quốc'}
                            </p>
                        </div>
                    </motion.div>

                    <motion.div
                        className='space-y-4'
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                    >
                        <div className='bg-purple-50 p-4 rounded-lg'>
                            <div className='flex items-center gap-2 text-purple-600 mb-2'>
                                <FaCalendarAlt />
                                <h3 className='font-semibold'>Thời hạn</h3>
                            </div>
                            <div className='flex justify-between items-center'>
                                <p className='text-gray-700'>
                                    {dayjs(voucher.expiryDate).format('DD/MM/YYYY')}
                                </p>
                                {isExpired && <Badge status='error' text='Đã hết hạn' />}
                            </div>
                        </div>

                        <div className='bg-green-50 p-4 rounded-lg'>
                            <div className='flex items-center gap-2 text-green-600 mb-2'>
                                <FaClock />
                                <h3 className='font-semibold'>Số lượt sử dụng</h3>
                            </div>
                            <p className='text-3xl font-bold text-green-600'>
                                {voucher.times}
                                <span className='text-base font-normal text-gray-600 ml-2'>
                                    lượt
                                </span>
                            </p>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className='bg-gray-50 p-4 rounded-lg'
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 }}
                >
                    <div className='flex items-center gap-2 text-gray-600 mb-2'>
                        <FaInfoCircle />
                        <h3 className='font-semibold'>Mô tả</h3>
                    </div>
                    <p className='text-gray-700 whitespace-pre-line'>{voucher.description}</p>
                </motion.div>
            </div>
        </Modal>
    );
}
