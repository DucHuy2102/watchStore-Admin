import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { defaultImages } from './defaultImages';

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
    const [submitting, setSubmitting] = useState(false);
    const { provinces, getProvinces } = useProvinces();
    const [provinceSelected, setProvinceSelected] = useState({
        value: '',
        label: '',
    });
    const [fileList, setFileList] = useState([]);
    const [imageType, setImageType] = useState('default');
    const [imageUrl, setImageUrl] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);

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
                    imageType: data?.imageType ?? 'default',
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

                if (data?.img) {
                    setImageUrl(data.img);
                    const matchedDefault = defaultImages.some((image) => image.url === data.img);
                    setImageType(matchedDefault ? 'default' : 'custom');
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
                                <Radio.Group onChange={handleImageTypeChange} value={imageType}>
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
                                <Form.Item name='image'>
                                    {imageUrl ? (
                                        <div className='relative inline-block'>
                                            <img
                                                src={imageUrl}
                                                alt='Uploaded preview'
                                                className='max-w-[300px] rounded-lg shadow-sm'
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
