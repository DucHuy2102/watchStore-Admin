import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
    Spin,
    Alert,
    Radio,
    Upload,
    Modal,
} from 'antd';
import {
    ArrowLeftOutlined,
    ClockCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    EnvironmentOutlined,
    InboxOutlined,
    PictureOutlined,
    TagOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { CiWarning } from 'react-icons/ci';

const defaultImages = [
    {
        url: 'https://res.cloudinary.com/dajzl4hdt/image/upload/v1731319344/aqsmz8libwikhsvlvfhj.png',
        title: 'Miễn phí vận chuyển',
    },
    {
        url: 'https://res.cloudinary.com/dajzl4hdt/image/upload/v1731319279/wlp0352fmr4qmjwxn7hc.jpg',
        title: 'Hàng quốc tế',
    },
    {
        url: 'https://res.cloudinary.com/dajzl4hdt/image/upload/v1731319322/lcl9dvcqovgx0wyjenk8.png',
        title: 'Hàng mới về',
    },
    {
        url: 'https://res.cloudinary.com/dajzl4hdt/image/upload/v1731319361/usugcntczyjuai9c3jau.png',
        title: 'Siêu giảm giá',
    },
];

export default function EditVoucher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [provinces, setProvinces] = useState([]);
    const [provinceSelected, setProvinceSelected] = useState({
        value: '',
        label: '',
    });
    const [imageType, setImageType] = useState('default');
    const [imageUrl, setImageUrl] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

    useEffect(() => {
        getVoucherDetail();
        getProvince();
    }, [id]);

    const getVoucherDetail = async () => {
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/coupon/get-by-id`, {
                params: {
                    couponId: id,
                },
                headers: {
                    Authorization: `Bearer ${tokenUser}`,
                },
            });
            if (res.status === 200) {
                const { data } = res;
                const formData = {
                    couponCode: data?.couponCode || '',
                    couponName: data?.couponName || '',
                    description: data?.description || '',
                    discount: data?.discount || 0,
                    minPrice: data?.minPrice || 0,
                    province: data?.province?.label || null,
                    times: data?.times || 100,
                    state: data?.state || 'active',
                    imageType: data?.imageType || 'default',
                    expiryDate: data?.expiryDate ? dayjs(data.expiryDate) : null,
                    createdDate: data?.expiryDate ? dayjs(data.createdDate) : dayjs(),
                    img: data?.img || '',
                };

                if (data?.province) {
                    setProvinceSelected({
                        value: data.province.value,
                        label: data.province.label,
                    });
                } else {
                    setProvinceSelected({
                        value: '',
                        label: '',
                    });
                }

                if (data?.img) {
                    setImageUrl(data.img);
                    setImageType('custom');
                } else {
                    setImageUrl('');
                    setImageType('default');
                }

                form.setFieldsValue(formData);
            }
        } catch (error) {
            console.log(error);
            toast.error('Không thể tải thông tin voucher!');
        } finally {
            setLoading(false);
        }
    };

    const getProvince = async () => {
        try {
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
            console.log('Error get api province', error);
        }
    };

    const onFinish = async (values) => {
        const { couponName, couponCode, description, discount, minPrice, times, state } = values;
        try {
            setSubmitting(true);
            const submitData = {
                id: id,
                couponName,
                couponCode,
                description,
                discount,
                minPrice,
                province: provinceSelected,
                times,
                state,
                img: imageUrl,
                expiryDate: values.expiryDate.toISOString(),
                createdDate: values.createdDate.toISOString(),
            };
            console.log('submitData', submitData);
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/coupon/update`,
                submitData,
                {
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                }
            );

            if (res.status === 200) {
                toast.success('Cập nhật voucher thành công!');
                setTimeout(() => {
                    navigate('/vouchers');
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi cập nhật voucher!');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className='min-h-screen bg-gray-50 flex items-center justify-center'>
                <Spin size='large' tip='Đang tải thông tin voucher...' />
            </div>
        );
    }

    const handleProvinceChange = (value, option) => {
        setProvinceSelected({
            key: value,
            label: option.label,
        });
        form.setFieldValue('province', value);
    };

    const handleDelete = async () => {
        try {
            setSubmitting(true);
            const res = await axios.delete(`${import.meta.env.VITE_API_URL}/api/coupon/delete/`, {
                params: {
                    couponId: id,
                },
                headers: {
                    Authorization: `Bearer ${tokenUser}`,
                },
            });
            if (res.status === 200) {
                toast.success('Xóa voucher thành công!');
                setTimeout(() => {
                    navigate('/voucher');
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi xóa voucher!');
        } finally {
            setSubmitting(false);
            setDeleteModalVisible(false);
        }
    };

    return (
        <div className='p-6 max-w-4xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='text-3xl font-extrabold text-gray-800 dark:text-[#fbfcfc] tracking-tight'>
                        Chỉnh sửa Voucher
                    </h1>
                </div>
                <Button
                    icon={<ArrowLeftOutlined />}
                    onClick={() => navigate('/vouchers')}
                    className='flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 hover:text-blue-500 hover:border-blue-500 hover:bg-gray-50 rounded-lg shadow-sm'
                >
                    Quay lại
                </Button>
            </div>

            <div className='max-w-6xl mx-auto'>
                <Card className='shadow-sm border border-gray-100'>
                    <Form
                        form={form}
                        layout='vertical'
                        onFinish={onFinish}
                        className='max-w-4xl mx-auto'
                        initialValues={{
                            state: 'active',
                            discount: 0,
                            times: 100,
                        }}
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
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập tên voucher!' },
                                    ]}
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
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập giá trị giảm!' },
                                    ]}
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
                                            label: p.NameExtension[1] || p.NameExtension[0],
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
                                    rules={[
                                        { required: true, message: 'Vui lòng chọn ngày hết hạn!' },
                                    ]}
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
                                    <img
                                        src={imageUrl}
                                        alt='Preview'
                                        className='max-w-xs rounded-lg'
                                    />
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
                                            <span className='text-green-600'>
                                                Kích hoạt voucher
                                            </span>
                                        ),
                                    },
                                    {
                                        value: 'inactive',
                                        label: (
                                            <span className='text-red-600'>Ngừng kích hoạt</span>
                                        ),
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

                        <div className='flex justify-between items-center gap-4'>
                            <Button
                                danger
                                icon={<DeleteOutlined />}
                                onClick={() => setDeleteModalVisible(true)}
                                className='h-11 px-6'
                                loading={submitting}
                            >
                                Xóa Voucher
                            </Button>
                            <div className='flex gap-4'>
                                <Button onClick={() => navigate('/voucher')} className='h-11 px-6'>
                                    Hủy thay đổi
                                </Button>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    loading={submitting}
                                    className='h-11 px-8 bg-blue-500 hover:bg-blue-600 flex items-center gap-2'
                                    icon={<EditOutlined />}
                                >
                                    Cập nhật Voucher
                                </Button>
                            </div>
                        </div>

                        <Modal
                            open={deleteModalVisible}
                            onOk={handleDelete}
                            onCancel={() => setDeleteModalVisible(false)}
                            okText='Xóa'
                            cancelText='Hủy'
                            okButtonProps={{
                                danger: true,
                                loading: submitting,
                            }}
                        >
                            <div className='text-center'>
                                <CiWarning className='text-yellow-400 mx-auto w-20 h-20 mb-2' />
                                <p className='font-medium text-lg'>
                                    Bạn có chắc chắn muốn dừng xóa voucher này?
                                </p>
                                <p className='text-gray-500 mt-2'>
                                    Hành động này sẽ không thể hoàn tác.
                                </p>
                            </div>
                        </Modal>
                    </Form>
                </Card>
            </div>
        </div>
    );
}
