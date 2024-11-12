import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Button,
    Card,
    Radio,
    Upload,
    Alert,
} from 'antd';
import {
    ArrowLeftOutlined,
    SaveOutlined,
    TagOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    PictureOutlined,
    InboxOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';

import { defaultImages } from './defaultImages';

const useVoucherSubmit = (navigate) => {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async (values, provinceSelected, imageUrl) => {
        try {
            setSubmitting(true);
            const submitData = {
                ...values,
                img: imageUrl,
                province: provinceSelected,
                expiryDate: values.expiryDate.toISOString(),
                createdDate: values.createdDate.toISOString(),
            };

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/coupon/create`,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                }
            );

            if (res.status === 200) {
                toast.success('Tạo voucher thành công!');
                setTimeout(() => {
                    navigate('/vouchers');
                }, 3000);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tạo voucher!');
        } finally {
            setSubmitting(false);
        }
    };

    return {
        submitting,
        handleSubmit,
    };
};

const useProvinces = () => {
    const [provinces, setProvinces] = useState([]);
    const [loading, setLoading] = useState(false);

    const getProvinces = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                'https://online-gateway.ghn.vn/shiip/public-api/master-data/province',
                {
                    headers: {
                        Token: import.meta.env.VITE_TOKEN_GHN,
                    },
                }
            );
            if (res?.status === 200) {
                setProvinces(res.data.data);
            }
        } catch (error) {
            console.error('Error getting provinces:', error);
            toast.error('Không thể tải danh sách tỉnh thành!');
        } finally {
            setLoading(false);
        }
    };

    return {
        provinces,
        loading,
        getProvinces,
    };
};

export default function CreateVoucher() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { provinces, getProvinces } = useProvinces();
    const { submitting, handleSubmit } = useVoucherSubmit(navigate);

    const [provinceSelected, setProvinceSelected] = useState({ key: '', label: '' });
    const [imageType, setImageType] = useState('default');
    const [imageUrl, setImageUrl] = useState(defaultImages[0].url);

    useEffect(() => {
        getProvinces();
        form.setFieldsValue({
            state: 'active',
            times: 100,
            discount: 0,
            createdDate: dayjs(),
            imageType: 'default',
        });
    }, []);

    const handleProvinceChange = (value, option) => {
        setProvinceSelected({
            key: value,
            label: option.label,
        });
        form.setFieldValue('province', value);
    };

    const onFinish = (values) => {
        handleSubmit(values, provinceSelected, imageUrl);
    };

    return (
        <div className='p-6 max-w-4xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='text-3xl font-extrabold text-gray-800 tracking-tight'>
                        Tạo Voucher Mới
                    </h1>
                    <p className='text-gray-600 mt-2'>
                        Tạo voucher mới với các thông tin chi tiết bên dưới
                    </p>
                </div>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/vouchers')}
                    className='flex items-center'
                >
                    Quay lại
                </Button>
            </div>

            <Card className='shadow-sm'>
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={onFinish}
                    className='max-w-4xl mx-auto'
                >
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                            <TagOutlined className='text-blue-500' />
                            Thông tin cơ bản
                        </h2>
                        <div className='grid grid-cols-2 gap-6'>
                            <Form.Item
                                label='Mã voucher'
                                name='couponCode'
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mã voucher!' },
                                    {
                                        pattern: /^[A-Z0-9]+$/,
                                        message: 'Mã voucher chỉ được chứa chữ in hoa và số!',
                                    },
                                ]}
                                className='col-span-1'
                            >
                                <Input
                                    placeholder='VD: FREESHIP'
                                    className='h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                    maxLength={20}
                                />
                            </Form.Item>

                            <Form.Item
                                label='Tên voucher'
                                name='couponName'
                                rules={[{ required: true, message: 'Vui lòng nhập tên voucher!' }]}
                                className='col-span-1'
                            >
                                <Input
                                    placeholder='VD: Miễn phí vận chuyển'
                                    className='h-12 rounded-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                                />
                            </Form.Item>
                            <Form.Item label='Mô tả' name='description' className='col-span-2'>
                                <Input.TextArea
                                    placeholder='Nhập mô tả về voucher và điều kiện áp dụng'
                                    rows={4}
                                    className='text-gray-700'
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                            <TagOutlined className='text-blue-500' />
                            Thông tin giảm giá
                        </h2>
                        <div className='grid grid-cols-2 gap-6'>
                            <Form.Item
                                label='Giá trị giảm'
                                name='discount'
                                rules={[{ required: true, message: 'Vui lòng nhập giá trị giảm!' }]}
                            >
                                <InputNumber
                                    min={0}
                                    max={100}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value.replace('%', '')}
                                    className='w-full h-11 flex items-center'
                                />
                            </Form.Item>

                            <Form.Item
                                label='Giá tối thiểu'
                                name='minPrice'
                                rules={[
                                    { required: true, message: 'Vui lòng nhập giá tối thiểu!' },
                                ]}
                            >
                                <InputNumber
                                    min={0}
                                    className='w-full h-11 flex items-center'
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    }
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder='Nhập giá tối thiểu để áp dụng voucher'
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                            <EnvironmentOutlined className='text-blue-500' />
                            Phạm vi & Giới hạn
                        </h2>
                        <div className='grid grid-cols-2 gap-6'>
                            <Form.Item
                                label='Khu vực áp dụng'
                                name='province'
                                rules={[{ required: true, message: 'Vui lòng chọn khu vực!' }]}
                            >
                                <Select
                                    placeholder='Chọn khu vực áp dụng'
                                    className='h-11'
                                    onChange={handleProvinceChange}
                                    options={provinces?.map((p) => ({
                                        value: p.ProvinceID,
                                        label: p.ProvinceName,
                                    }))}
                                />
                            </Form.Item>

                            <Form.Item
                                label='Số lượt sử dụng'
                                name='times'
                                rules={[
                                    {
                                        required: true,
                                        message: 'Vui lòng nhập số lượt sử dụng!',
                                    },
                                ]}
                            >
                                <InputNumber
                                    min={1}
                                    max={99999}
                                    className='w-full h-11 flex items-center'
                                    placeholder='Nhập số lượt sử dụng tối đa'
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                            <ClockCircleOutlined className='text-blue-500' />
                            Thời gian hiệu lực
                        </h2>
                        <div className='grid grid-cols-2 gap-6'>
                            <Form.Item
                                label='Ngày tạo'
                                name='createdDate'
                                rules={[{ required: true, message: 'Vui lòng chọn ngày tạo!' }]}
                            >
                                <DatePicker
                                    className='w-full h-11'
                                    format='DD/MM/YYYY HH:mm'
                                    showTime
                                    placeholder='Chọn ngày tạo voucher'
                                />
                            </Form.Item>

                            <Form.Item
                                label='Ngày hết hạn'
                                name='expiryDate'
                                rules={[{ required: true, message: 'Vui lòng chọn ngày hết hạn!' }]}
                            >
                                <DatePicker
                                    className='w-full h-11'
                                    format='DD/MM/YYYY HH:mm'
                                    showTime
                                    placeholder='Chọn ngày hết hạn voucher'
                                    disabledDate={(current) =>
                                        current && current < dayjs().endOf('day')
                                    }
                                />
                            </Form.Item>
                        </div>
                    </div>

                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                            <PictureOutlined className='text-blue-500' />
                            Hình ảnh voucher
                        </h2>

                        <Form.Item name='imageType' label='Loại hình ảnh'>
                            <Radio.Group
                                onChange={(e) => setImageType(e.target.value)}
                                value={imageType}
                            >
                                <Radio value='default'>Sử dụng mẫu có sẵn</Radio>
                                <Radio value='custom'>Tải lên hình ảnh mới</Radio>
                            </Radio.Group>
                        </Form.Item>

                        {imageType === 'default' ? (
                            <div className='grid grid-cols-4 gap-4 mt-4'>
                                {defaultImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`border-2 rounded-lg p-2 cursor-pointer ${
                                            imageUrl === image.url
                                                ? 'border-blue-500'
                                                : 'border-gray-200'
                                        }`}
                                        onClick={() => {
                                            setImageUrl(image.url);
                                            form.setFieldValue('image', image.url);
                                        }}
                                    >
                                        <img
                                            src={image.url}
                                            alt={image.title}
                                            className='w-full h-40 object-cover rounded'
                                        />
                                        <p className='text-center mt-2'>{image.title}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Form.Item
                                name='image'
                                valuePropName='fileList'
                                getValueFromEvent={(e) => {
                                    if (Array.isArray(e)) {
                                        return e;
                                    }
                                    return e?.fileList;
                                }}
                            >
                                <Upload.Dragger
                                    name='file'
                                    multiple={false}
                                    listType='picture'
                                    accept='image/*'
                                    beforeUpload={(file) => {
                                        const reader = new FileReader();
                                        reader.readAsDataURL(file);
                                        reader.onload = () => {
                                            setImageUrl(reader.result);
                                        };
                                        return false;
                                    }}
                                    onRemove={() => {
                                        setImageUrl('');
                                        form.setFieldValue('image', null);
                                    }}
                                >
                                    <p className='ant-upload-drag-icon'>
                                        <InboxOutlined />
                                    </p>
                                    <p className='ant-upload-text'>
                                        Kéo thả hoặc click để tải ảnh lên
                                    </p>
                                    <p className='ant-upload-hint'>
                                        Hỗ trợ định dạng: JPG, PNG. Dung lượng tối đa: 2MB
                                    </p>
                                </Upload.Dragger>
                            </Form.Item>
                        )}

                        {imageUrl && (
                            <div className='mt-4'>
                                <p className='font-medium mb-2'>Xem trước:</p>
                                <img src={imageUrl} alt='Preview' className='max-w-xs rounded-lg' />
                            </div>
                        )}
                    </div>

                    <Form.Item label='Trạng thái hoạt động' name='state'>
                        <Select
                            className='h-11'
                            options={[
                                {
                                    value: 'active',
                                    label: (
                                        <span className='text-green-600'>Kích hoạt voucher</span>
                                    ),
                                },
                                {
                                    value: 'inactive',
                                    label: <span className='text-red-600'>Ngừng kích hoạt</span>,
                                },
                            ]}
                        />
                    </Form.Item>

                    {dayjs().isAfter(form.getFieldValue('expiryDate')) && (
                        <Alert
                            message='Voucher đã hết hạn'
                            description='Voucher này đã quá hạn sử dụng. Vui lòng cập nhật ngày hết hạn để kích hoạt lại.'
                            type='warning'
                            showIcon
                            className='mb-6'
                        />
                    )}

                    <div className='flex justify-end gap-4 mt-8'>
                        <Button onClick={() => navigate('/vouchers')} className='h-11 px-6'>
                            Hủy
                        </Button>
                        <Button
                            type='primary'
                            htmlType='submit'
                            loading={submitting}
                            className='h-11 px-8 bg-blue-500 hover:bg-blue-600'
                            icon={<SaveOutlined />}
                            disabled={submitting}
                        >
                            Tạo Voucher
                        </Button>
                    </div>
                </Form>
            </Card>
        </div>
    );
}
