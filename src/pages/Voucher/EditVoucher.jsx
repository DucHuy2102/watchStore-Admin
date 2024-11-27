import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Card,
    Spin,
    Alert,
    Upload,
    Button,
    Image,
} from 'antd';
import {
    ClockCircleOutlined,
    DeleteOutlined,
    EnvironmentOutlined,
    InboxOutlined,
    PictureOutlined,
    TagOutlined,
    EditOutlined,
    SaveOutlined,
    CloseOutlined,
} from '@ant-design/icons';
import { toast } from 'react-toastify';
import dayjs from 'dayjs';
import { FaArrowLeftLong } from 'react-icons/fa6';
import { FaEye } from 'react-icons/fa';
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

export default function EditVoucher() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [previewModalOpen, setPreviewModalOpen] = useState(false);
    const [previewVoucher, setPreviewVoucher] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const { provinces, getProvinces } = useProvinces();
    const [provinceSelected, setProvinceSelected] = useState({
        value: '',
        label: '',
    });
    const [fileList, setFileList] = useState([]);
    const [imageUrl, setImageUrl] = useState('');
    const [isEditImg, setIsEditImg] = useState(false);

    useEffect(() => {
        getVoucherDetail();
        getProvinces();
    }, [id]);

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
                console.log('data', data);
                const formData = {
                    couponCode: data?.couponCode ?? '',
                    couponName: data?.couponName ?? '',
                    description: data?.description ?? '',
                    discount: data?.discount ?? 0,
                    minPrice: data?.minPrice ?? 0,
                    province: data?.province?.label ?? null,
                    times: data?.times ?? 100,
                    state: data?.state ?? 'active',
                    img: data?.img ?? '',
                    expiryDate: data?.expiryDate ? dayjs(data.expiryDate) : null,
                    createdDate: data?.expiryDate ? dayjs(data.createdDate) : dayjs(),
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

                form.setFieldsValue(formData);
            }
        } catch (error) {
            console.log(error);
            toast.error('Không thể tải thông tin voucher!');
        } finally {
            setLoading(false);
        }
    };

    const onFinish = async (values) => {
        const imageUpload = await handleUploadToCloudinary(fileList[0]?.originFileObj);
        console.log('imageUpload success', imageUpload);
        const { image, ...rest } = values;
        try {
            setSubmitting(true);
            const submitData = {
                ...rest,
                id: id,
                province: provinceSelected,
                img: imageUpload || imageUrl,
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

    const handleCancelEditImage = () => {
        setIsEditImg(false);
        setImageUrl(form.getFieldValue('img'));
        setFileList([]);
    };

    return (
        <div className='p-6 max-w-4xl mx-auto'>
            {/* header */}
            <div className='flex items-center justify-between mb-6'>
                <div>
                    <h1 className='text-3xl font-extrabold text-gray-800 dark:text-[#fbfcfc] tracking-tight'>
                        Chỉnh sửa Voucher
                    </h1>
                </div>
                <Link
                    to='/vouchers'
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

            {/* form */}
            <div className='max-w-6xl mx-auto'>
                <Card className='shadow-sm border border-gray-100'>
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
                                <Form.Item
                                    label='Mô tả'
                                    name='description'
                                    className='col-span-2'
                                    rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                                >
                                    <Input.TextArea
                                        placeholder='Nhập mô tả về voucher và điều kiện áp dụng'
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
                                <Form.Item label='Giá trị giảm' name='discount'>
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
                                        placeholder='Nhập giá tối thiểu để áp dụng voucher'
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

                        {/* image info */}
                        <div className='mb-8'>
                            <div className='flex items-center justify-between mb-4'>
                                <h2 className='text-lg font-semibold text-gray-700 flex items-center gap-2'>
                                    <PictureOutlined className='text-blue-500' />
                                    Hình ảnh voucher
                                </h2>
                                {!isEditImg ? (
                                    <Button
                                        onClick={() => {
                                            setIsEditImg(true);
                                            setImageUrl('');
                                        }}
                                        className='flex items-center gap-2 px-4 py-2 rounded-lg text-blue-600 border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all duration-200'
                                        icon={<EditOutlined />}
                                    >
                                        Chỉnh sửa ảnh
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={handleCancelEditImage}
                                        className='flex items-center gap-2 px-4 py-2 rounded-lg text-red-600 border-red-200 bg-red-50 hover:bg-red-100 hover:border-red-300 transition-all duration-200'
                                        icon={<CloseOutlined />}
                                    >
                                        Hủy chỉnh sửa
                                    </Button>
                                )}
                            </div>

                            {isEditImg ? (
                                <Form.Item name='image'>
                                    {imageUrl ? (
                                        <div className='relative flex items-center justify-center'>
                                            <Image
                                                src={imageUrl}
                                                alt='Uploaded preview'
                                                className='rounded-lg shadow-sm'
                                                preview={{
                                                    mask: (
                                                        <div className='text-xs font-medium'>
                                                            Xem ảnh
                                                        </div>
                                                    ),
                                                }}
                                            />
                                            <Button
                                                icon={<DeleteOutlined />}
                                                className='absolute top-2 right-2 bg-white/80 hover:bg-white shadow-sm'
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
                                    )}
                                </Form.Item>
                            ) : (
                                <div className='flex justify-center items-center'>
                                    <Image
                                        src={imageUrl}
                                        alt='Voucher image'
                                        preview={{
                                            mask: (
                                                <div className='text-xs font-medium'>Xem ảnh</div>
                                            ),
                                        }}
                                    />
                                </div>
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

                        {/* buttons */}
                        <div className='flex items-center justify-between'>
                            <Button
                                onClick={() => navigate('/vouchers')}
                                className='h-12 px-8 rounded-lg hover:scale-105 transition-all duration-200'
                                disabled={submitting}
                            >
                                Hủy
                            </Button>
                            <div className='flex items-center gap-5'>
                                <Button
                                    onClick={handlePreview}
                                    className='h-12 px-8 rounded-lg hover:scale-105 transition-all duration-200 bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-100'
                                    icon={<FaEye className='mr-2' />}
                                    disabled={submitting}
                                >
                                    Xem trước
                                </Button>
                                <Button
                                    type='primary'
                                    htmlType='submit'
                                    loading={submitting}
                                    className='h-12 px-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:scale-105 transition-all duration-200'
                                    icon={<SaveOutlined />}
                                    disabled={submitting}
                                >
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </div>

                        <VoucherDetailModal
                            voucher={previewVoucher}
                            open={previewModalOpen}
                            onClose={() => setPreviewModalOpen(false)}
                        />
                    </Form>
                </Card>
            </div>
        </div>
    );
}
