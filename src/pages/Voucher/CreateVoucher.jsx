import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
    SaveOutlined,
    TagOutlined,
    EnvironmentOutlined,
    ClockCircleOutlined,
    PictureOutlined,
    InboxOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { defaultImages } from './defaultImages';
import { FaArrowLeftLong, FaEye } from 'react-icons/fa6';
import VoucherDetailModal from './VoucherDetailModal';

const handleUploadToCloudinary = async (file) => {
    if (!file) return null;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', `${import.meta.env.VITE_CLOUDINARY_PRESETS_NAME}`);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${
                import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
            }/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );
        const data = await response.json();
        return data.secure_url;
    } catch (error) {
        console.error('Lỗi khi upload:', error);
        toast.error('Không thể tải ảnh lên. Vui lòng thử lại!');
        return null;
    }
};

const useVoucherSubmit = (navigate) => {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (values, provinceSelected, imageUrl) => {
        try {
            setIsLoading(true);
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
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tạo voucher!');
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        handleSubmit,
    };
};

const useProvinces = () => {
    const [provinces, setProvinces] = useState([]);

    const getProvinces = async () => {
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
            console.error('Error getting provinces:', error);
            toast.error('Không thể tải danh sách tỉnh thành!');
        }
    };

    return {
        provinces,
        getProvinces,
    };
};

export default function CreateVoucher() {
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { provinces, getProvinces } = useProvinces();
    const { isLoading, handleSubmit } = useVoucherSubmit(navigate);
    const [provinceSelected, setProvinceSelected] = useState({ value: '', label: '' });
    const [imageType, setImageType] = useState('default');
    const [imageUrl, setImageUrl] = useState(defaultImages[0].url);
    const [fileList, setFileList] = useState([]);
    const memoizedDefaultImages = useMemo(() => defaultImages, []);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewVoucher, setPreviewVoucher] = useState(null);

    useEffect(() => {
        getProvinces();
        form.setFieldsValue({
            state: 'active',
            times: 10,
            discount: 0,
            createdDate: dayjs(),
            imageType: 'default',
        });
    }, []);

    const memoizedProvinces = useMemo(() => {
        return provinces?.map((p) => ({
            value: p.ProvinceID,
            label: p.NameExtension[1] || p.NameExtension[0],
        }));
    }, [provinces]);

    const handleProvinceChange = useCallback(
        (value, option) => {
            if (!value) {
                setProvinceSelected({
                    value: 0,
                    label: 'Áp dụng toàn quốc',
                });
            } else {
                setProvinceSelected({
                    value: value,
                    label: option.label,
                });
            }
            form.setFieldValue('province', value);
        },
        [form]
    );

    const handleImageTypeChange = useCallback(
        (e) => {
            const newType = e.target.value;
            setImageType(newType);

            if (newType === 'custom') {
                setImageUrl('');
                form.setFieldValue('image', null);
            }
        },
        [form]
    );

    const onFinish = useCallback(
        async (values) => {
            const imageUpload = await handleUploadToCloudinary(fileList[0]?.originFileObj);
            handleSubmit(values, provinceSelected, imageUpload || imageUrl);
        },
        [fileList, handleSubmit, provinceSelected, imageUrl]
    );

    const handlePreview = () => {
        const formValues = form.getFieldsValue();
        const previewData = {
            ...formValues,
            img: imageUrl,
            province: provinceSelected,
            state: 'active',
            expiryDate: formValues.expiryDate?.toISOString(),
            createdDate: formValues.createdDate?.toISOString(),
        };
        setPreviewVoucher(previewData);
        setPreviewModalOpen(true);
    };

    return (
        <div className='p-8 max-w-5xl mx-auto'>
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='text-3xl font-extrabold text-gray-800 dark:text-[#fbfcfc] tracking-tight'>
                        Tạo Voucher Mới
                    </h1>
                    <p className='text-gray-600 dark:text-gray-400 mt-2'>
                        Tạo voucher mới với các thông tin chi tiết bên dưới
                    </p>
                </div>
                <Link
                    to='/orders'
                    className='inline-flex items-center gap-2 px-6 py-2.5 rounded-full
                        bg-white border border-gray-200 shadow-sm hover:shadow-md
                        text-gray-700 hover:text-primary hover:border-primary/20
                        transition-all duration-300 ease-in-out transform hover:-translate-x-1
                        font-medium group'
                >
                    <FaArrowLeftLong className='w-4 h-4 transition-transform duration-300 group-hover:animate-pulse' />
                    <span className='bg-gradient-to-r from-gray-800 to-gray-600 hover:from-primary hover:to-primary/80 bg-clip-text text-transparent'>
                        Quay lại danh sách
                    </span>
                </Link>
            </div>

            <Card className='shadow-sm'>
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={onFinish}
                    className='max-w-4xl mx-auto'
                >
                    {/* basic info */}
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
                            <Form.Item
                                label='Mô tả'
                                name='description'
                                className='col-span-2'
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mô tả voucher!' },
                                ]}
                            >
                                <Input.TextArea
                                    placeholder='Nhập mô tả về voucher'
                                    rows={4}
                                    className='text-gray-700'
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* discount info */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                            <TagOutlined className='text-blue-500' />
                            Thông tin giảm giá
                        </h2>
                        <div className='grid grid-cols-2 gap-6'>
                            <Form.Item label='Giá trị giảm (%)' name='discount'>
                                <InputNumber
                                    min={0}
                                    max={100}
                                    formatter={(value) => `${value}%`}
                                    parser={(value) => value.replace('%', '')}
                                    className='w-full h-11 flex items-center'
                                    controls={false}
                                />
                            </Form.Item>

                            <Form.Item label='Giá tối thiểu' name='minPrice'>
                                <InputNumber
                                    min={0}
                                    className='w-full h-11 flex items-center'
                                    formatter={(value) =>
                                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                                    }
                                    parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                                    placeholder='Nhập giá tối thiểu'
                                    controls={false}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* scope & limit */}
                    <div className='mb-8'>
                        <h2 className='text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2'>
                            <EnvironmentOutlined className='text-blue-500' />
                            Phạm vi & Giới hạn
                        </h2>
                        <div className='grid grid-cols-2 gap-6'>
                            <Form.Item label='Khu vực áp dụng' name='province'>
                                <Select
                                    placeholder='Chọn khu vực áp dụng'
                                    className='h-11'
                                    onChange={handleProvinceChange}
                                    options={memoizedProvinces}
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
                                    controls={false}
                                />
                            </Form.Item>
                        </div>
                    </div>

                    {/* time info */}
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

                    {/* image info */}
                    <div className='rounded-xl p-6'>
                        <h2 className='text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-6 flex items-center gap-3'>
                            <PictureOutlined className='text-blue-500' />
                            Hình ảnh voucher
                        </h2>

                        <Form.Item name='imageType' label='Loại hình ảnh' className='mb-6'>
                            <Radio.Group
                                onChange={handleImageTypeChange}
                                value={imageType}
                                className='flex gap-6'
                            >
                                <Radio value='default' className='image-radio-button'>
                                    <span className='flex items-center gap-2'>
                                        <TagOutlined className='text-blue-500' />
                                        Sử dụng mẫu có sẵn
                                    </span>
                                </Radio>
                                <Radio value='custom' className='image-radio-button'>
                                    <span className='flex items-center gap-2'>
                                        <PictureOutlined className='text-purple-500' />
                                        Tải lên hình ảnh mới
                                    </span>
                                </Radio>
                            </Radio.Group>
                        </Form.Item>

                        {imageType === 'default' ? (
                            <div className='grid grid-cols-4 gap-6 mt-6'>
                                {memoizedDefaultImages.map((image, index) => (
                                    <div
                                        key={index}
                                        className={`group relative overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg cursor-pointer transform hover:-translate-y-1 ${
                                            imageUrl === image.url
                                                ? 'ring-2 ring-blue-500 shadow-blue-100'
                                                : 'border border-gray-200'
                                        }`}
                                        onClick={() => {
                                            setImageUrl(image.url);
                                            form.setFieldValue('image', image.url);
                                        }}
                                    >
                                        <div className='aspect-[4/3] overflow-hidden'>
                                            <img
                                                src={image.url}
                                                alt={image.title}
                                                className='w-full h-full object-cover transition-transform duration-300 group-hover:scale-110'
                                            />
                                        </div>
                                        <div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4'>
                                            <p className='text-white text-sm font-medium text-center'>
                                                {image.title}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <Form.Item name='image' className='m-0'>
                                {imageUrl ? (
                                    <div className='relative inline-block group'>
                                        <img
                                            src={imageUrl}
                                            alt='Uploaded preview'
                                            className='max-w-[300px] rounded-xl shadow-md transition-all duration-300 group-hover:shadow-lg'
                                        />
                                        <Button
                                            icon={<DeleteOutlined />}
                                            className='absolute top-3 right-3 bg-white/90 hover:bg-white/100 shadow-sm rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300'
                                            onClick={() => {
                                                setImageUrl('');
                                                form.setFieldValue('image', null);
                                                setFileList([]);
                                            }}
                                        />
                                    </div>
                                ) : (
                                    <Upload.Dragger
                                        name='file'
                                        multiple={false}
                                        maxCount={1}
                                        listType='picture'
                                        accept='image/*'
                                        fileList={fileList}
                                        className='bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 transition-all duration-300'
                                        beforeUpload={(file) => {
                                            const isImage = file.type.startsWith('image/');
                                            if (!isImage) {
                                                toast.error('Bạn chỉ có thể tải lên file ảnh!');
                                                return false;
                                            }
                                            const isLt2M = file.size / 1024 / 1024 < 2;
                                            if (!isLt2M) {
                                                toast.error('Ảnh phải nhỏ hơn 2MB!');
                                                return false;
                                            }
                                            const reader = new FileReader();
                                            reader.readAsDataURL(file);
                                            reader.onload = () => {
                                                setImageUrl(reader.result);
                                                form.setFieldValue('image', reader.result);
                                                setFileList([
                                                    {
                                                        uid: '-1',
                                                        name: file.name,
                                                        status: 'done',
                                                        url: reader.result,
                                                        originFileObj: file,
                                                    },
                                                ]);
                                            };
                                            return false;
                                        }}
                                    >
                                        <div className='p-8 space-y-4'>
                                            <div className='text-blue-500 text-4xl'>
                                                <InboxOutlined />
                                            </div>
                                            <div>
                                                <p className='text-lg font-medium text-gray-700 dark:text-gray-300'>
                                                    Kéo thả hoặc click để tải ảnh lên
                                                </p>
                                                <p className='text-sm text-gray-500 dark:text-gray-400 mt-2'>
                                                    Hỗ trợ định dạng: JPG, PNG. Dung lượng tối đa:
                                                    2MB
                                                </p>
                                            </div>
                                        </div>
                                    </Upload.Dragger>
                                )}
                            </Form.Item>
                        )}
                    </div>

                    {/* expired date alert */}
                    {dayjs().isAfter(form.getFieldValue('expiryDate')) && (
                        <Alert
                            message='Voucher đã hết hạn'
                            description='Voucher này đã quá hạn sử dụng. Vui lòng cập nhật ngày hết hạn để kích hoạt lại.'
                            type='warning'
                            showIcon
                            className='mb-6'
                        />
                    )}

                    <div className='flex items-center justify-between'>
                        <Button
                            onClick={() => navigate('/vouchers')}
                            className='h-12 px-8 rounded-lg hover:scale-105 transition-all duration-200'
                            disabled={isLoading}
                        >
                            Hủy
                        </Button>
                        <div className='flex items-center gap-5'>
                            <Button
                                onClick={handlePreview}
                                className='h-12 px-8 rounded-lg hover:scale-105 transition-all duration-200 bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-100'
                                icon={<FaEye className='mr-2' />}
                                disabled={isLoading}
                            >
                                Xem trước
                            </Button>
                            <Button
                                type='primary'
                                htmlType='submit'
                                loading={isLoading}
                                className='h-12 px-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:scale-105 transition-all duration-200'
                                icon={<SaveOutlined />}
                                disabled={isLoading}
                            >
                                Tạo Voucher
                            </Button>
                        </div>
                    </div>
                </Form>
            </Card>

            <VoucherDetailModal
                voucher={previewVoucher}
                open={previewModalOpen}
                onClose={() => setPreviewModalOpen(false)}
            />
        </div>
    );
}
