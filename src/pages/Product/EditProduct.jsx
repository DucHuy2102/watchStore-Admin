import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Select, Upload, Spin, Modal } from 'antd';
import {
    InboxOutlined,
    InfoCircleOutlined,
    ProfileOutlined,
    ColumnHeightOutlined,
    AppstoreOutlined,
    EyeOutlined,
    DeleteOutlined,
    PlusOutlined,
    FileTextOutlined,
    BgColorsOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ColorPicker } from 'antd';
import { toast } from 'react-toastify';
import { FaArrowLeftLong, FaEye } from 'react-icons/fa6';

const { TextArea } = Input;

const discountPrice = (price, discount) => {
    return (price * discount) / 100;
};

const calPercent = (price, discount) => {
    return (discount * 100) / price;
};

export default function EditProduct() {
    const { id } = useParams();
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const { category } = useSelector((state) => state.product);
    const { access_token: token } = useSelector((state) => state.user);
    const [productOptions, setProductOptions] = useState([]);
    const [isColorModalVisible, setColorModalVisible] = useState(false);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${import.meta.env.VITE_API_URL}/client/product`, {
                    params: { productId: id },
                });

                if (response.status === 200) {
                    const { data } = response;

                    form.setFieldsValue({
                        productName: data.productName,
                        brand: data.brand,
                        type: data.type,
                        genderUser: data.genderUser,
                        origin: data.origin,
                        category: data.category,
                        wireMaterial: data.wireMaterial,
                        shellMaterial: data.shellMaterial,
                        style: data.style,
                        shape: data.shape,
                        feature: data.feature,
                        length: data.length,
                        width: data.width,
                        height: data.height,
                        weight: data.weight,
                        waterproof: data.waterproof,
                        description: data.description,
                    });

                    const categoryObj = category?.find((item) => item.id === data.category);
                    form.setFieldValue('category', categoryObj?.categoryName);

                    if (data.img && Array.isArray(data.img)) {
                        const formattedFileList = data.img.map((url, index) => ({
                            uid: `-${index}`,
                            name: `image-${index}`,
                            status: 'done',
                            url: url,
                        }));
                        setFileList(formattedFileList);
                        form.setFieldsValue({ img: data.img });
                    }

                    if (data.option && Array.isArray(data.option)) {
                        const formattedOptions = data.option.map((opt) => ({
                            key: opt.key,
                            color: opt.value.color,
                            price: opt.value.price,
                            discount: opt.value.discount,
                            amount: opt.value.quantity,
                        }));
                        setProductOptions(formattedOptions);
                    }
                }
            } catch (error) {
                console.error('Lỗi khi lấy thông tin sản phẩm:', error);
                toast.error('Có lỗi xảy ra khi lấy thông tin sản phẩm');
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [category, form, id]);

    const handleUploadToCloudinary = async () => {
        try {
            const uploadPromises = fileList.map(async (file) => {
                if (!file.originFileObj) {
                    return file;
                }

                const formData = new FormData();
                formData.append('file', file.originFileObj);
                formData.append('upload_preset', `${import.meta.env.VITE_CLOUDINARY_PRESETS_NAME}`);

                const response = await fetch(
                    `https://api.cloudinary.com/v1_1/${
                        import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
                    }/image/upload`,
                    {
                        method: 'POST',
                        body: formData,
                    }
                );

                if (!response.ok) {
                    throw new Error(`Upload failed for ${file.name}`);
                }

                const data = await response.json();
                return {
                    ...file,
                    url: data.secure_url,
                };
            });

            return await Promise.all(uploadPromises);
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw new Error('Failed to upload images to Cloudinary');
        }
    };

    const onFinish = async (values) => {
        console.log('run');
        if (!fileList.length) {
            toast.error('Vui lòng upload ảnh sản phẩm!');
            return;
        }

        if (!productOptions.length) {
            toast.error('Vui lòng thêm ít nhất một màu sản phẩm!');
            return;
        }

        try {
            setLoading(true);
            const uploadedFiles = await handleUploadToCloudinary();
            const formattedOptions = productOptions.map((opt) => ({
                key: opt.key,
                value: {
                    price: opt.price,
                    discount: opt.discount,
                    quantity: opt.amount,
                    color: opt.color,
                    state: 'active',
                },
            }));

            const productData = {
                ...values,
                img: uploadedFiles?.map((file) => file.url || file),
                option: formattedOptions,
                state: 'waiting',
            };

            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/product/update`,
                productData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (res.status === 200) {
                toast.success('Cập nhật sản phẩm thành công!');
                setTimeout(() => {
                    navigate('/products');
                }, 2000);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi cập nhật sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = ({ fileList: newFileList }) => {
        setFileList(newFileList);
        const imgUrls = newFileList
            .map((file) => {
                if (file.url) {
                    return file.url;
                }
                if (file.originFileObj) {
                    return URL.createObjectURL(file.originFileObj);
                }
                return null;
            })
            .filter((url) => url !== null);

        form.setFieldsValue({ img: imgUrls });
    };

    const formSections = useMemo(
        () => [
            {
                title: 'Thông tin cơ bản',
                items: [
                    {
                        name: 'productName',
                        label: 'Tên sản phẩm',
                        rules: [{ required: true, message: 'Vui lòng nhập tên sản phẩm!' }],
                        input: (
                            <Input
                                placeholder='Đồng hồ Casio G-Shock GA-2100-1A1DR'
                                className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]'
                            />
                        ),
                    },

                    {
                        name: 'brand',
                        label: 'Danh mục sản phẩm',
                        rules: [{ required: true, message: 'Vui lòng nhập danh mục!' }],
                        input: (
                            <Input
                                placeholder='G-Shock, Quartz, Eco-Drive...'
                                className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]'
                            />
                        ),
                    },
                    {
                        name: 'type',
                        label: 'Loại sản phẩm',
                        rules: [{ required: true, message: 'Vui lòng chọn loại sản phẩm!' }],
                        input: (
                            <Select
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors duration-300'
                                placeholder='Chọn loại sản phẩm'
                                options={[
                                    { label: 'Đồng hồ cơ tự động', value: 'Đồng hồ cơ tự động' },
                                    {
                                        label: 'Đồng hồ cơ lên dây cót',
                                        value: 'Đồng hồ cơ lên dây cót',
                                    },
                                    { label: 'Đồng hồ thạch anh', value: 'Đồng hồ thạch anh' },
                                    { label: 'Đồng hồ điện tử', value: 'Đồng hồ điện tử' },
                                    { label: 'Đồng hồ thông minh', value: 'Đồng hồ thông minh' },
                                    { label: 'Đồng hồ chronograph', value: 'Đồng hồ chronograph' },
                                    { label: 'Đồ hồ solar', value: 'Đồ hồ solar' },
                                    { label: 'Đồng hồ hybrid', value: 'Đồng hồ hybrid' },
                                ]}
                            />
                        ),
                    },
                    {
                        name: 'genderUser',
                        label: 'Đối tượng sử dụng',
                        rules: [{ required: true, message: 'Vui lòng chọn đối tượng sử dụng!' }],
                        input: (
                            <Select
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors duration-300'
                                placeholder='Chọn đối tượng sử dụng'
                                options={[
                                    { label: 'Nam', value: 'Nam' },
                                    { label: 'Nữ', value: 'Nữ' },
                                    { label: 'Thiếu nhi', value: 'Thiếu nhi' },
                                    { label: 'Tất cả', value: 'Tất cả' },
                                ]}
                            />
                        ),
                    },
                    {
                        name: 'origin',
                        label: 'Xuất xứ',
                        rules: [{ required: true, message: 'Vui lòng nhập xuất xứ sản phẩm!' }],
                        input: (
                            <Input
                                placeholder='Việt Nam, Thụy Sĩ, Trung Quốc...'
                                className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]'
                            />
                        ),
                    },
                    {
                        name: 'category',
                        label: 'Hãng đồng hồ',
                        rules: [{ required: true, message: 'Vui lòng chọn hãng đồng hồ!' }],
                        input: (
                            <Select
                                placeholder='Chọn hãng đồng hồ'
                                options={category?.map((item) => ({
                                    label: item.categoryName,
                                    value: item.categoryName,
                                }))}
                                notFoundContent='Không tìm thấy hãng nào'
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors duration-300'
                            />
                        ),
                    },
                ],
            },
            {
                title: 'Thông tin chi tiết',
                items: [
                    {
                        name: 'wireMaterial',
                        label: 'Chất liệu dây',
                        rules: [{ required: true, message: 'Vui lòng nhập chất liệu dây!' }],
                        input: (
                            <Input
                                placeholder='Dây da, dây thép không gỉ, dây cao su...'
                                className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]'
                            />
                        ),
                    },
                    {
                        name: 'shellMaterial',
                        label: 'Chất liệu vỏ',
                        rules: [{ required: true, message: 'Vui lòng nhập chất liệu vỏ!' }],
                        input: (
                            <Input
                                placeholder='Vỏ thép không gỉ, vỏ nhựa, vỏ titan...'
                                className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]'
                            />
                        ),
                    },
                    {
                        name: 'style',
                        label: 'Kiểu dáng',
                        rules: [{ required: true, message: 'Vui lòng nhập kiểu dáng sản phẩm!' }],
                        input: (
                            <Input
                                placeholder='Thể thao, lịch lãm, thanh lịch...'
                                className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]'
                            />
                        ),
                    },
                    {
                        name: 'shape',
                        label: 'Hình dáng mặt đồng hồ',
                        rules: [
                            { required: true, message: 'Vui lòng chọn hình dáng mặt đồng hồ!' },
                        ],
                        input: (
                            <Select
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors duration-300'
                                placeholder='Chọn hình dáng mặt đồng hồ'
                                options={[
                                    { label: 'Đồng hồ mặt tròn', value: 'Đồng hồ mặt tròn' },
                                    { label: 'Đồng hồ mặt vuông', value: 'Đồng hồ mặt vuông' },
                                    {
                                        label: 'Đồng hồ mặt chữ nhật',
                                        value: 'Đồng hồ mặt chữ nhật',
                                    },
                                    {
                                        label: 'Đồng hồ mặt tam giác',
                                        value: 'Đồng hồ mặt tam giác',
                                    },
                                    { label: 'Đồng hồ mặt bầu dục', value: 'Đồng hồ mặt bầu dục' },
                                    { label: 'Đồng hồ mặt Tonneau', value: 'Đồng hồ mặt Tonneau' },
                                    { label: 'Đồng hồ mặt Carage', value: 'Đồng hồ mặt Carage' },
                                    { label: 'Đồng hồ mặt Cushion', value: 'Đồng hồ mặt Cushion' },
                                    {
                                        label: 'Đồng hồ mặt bát giác',
                                        value: 'Đồng hồ mặt bát giác',
                                    },
                                ]}
                            />
                        ),
                    },
                    {
                        name: 'feature',
                        label: 'Tính năng',
                        rules: [{ required: true, message: 'Vui lòng nhập tính năng sản phẩm!' }],
                        input: (
                            <TextArea
                                placeholder='Chống nước, chống sốc, chống từ trường, chống xước...'
                                style={{ minHeight: 130 }}
                                className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]'
                            />
                        ),
                    },
                ],
            },
            {
                title: 'Kích thước',
                items: [
                    {
                        name: 'length',
                        label: 'Chiều dài (mm)',
                        rules: [{ required: true, message: 'Vui lòng nhập chiều dài!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 flex items-center'
                                min={0}
                                controls={false}
                            />
                        ),
                    },
                    {
                        name: 'width',
                        label: 'Chiều rộng (mm)',
                        rules: [{ required: true, message: 'Vui lòng nhập chiều rộng!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 flex items-center'
                                min={0}
                                controls={false}
                            />
                        ),
                    },
                    {
                        name: 'height',
                        label: 'Chiều cao (mm)',
                        rules: [{ required: true, message: 'Vui lòng nhập chiều cao!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 flex items-center'
                                min={0}
                                controls={false}
                            />
                        ),
                    },
                    {
                        name: 'weight',
                        label: 'Khối lượng (g)',
                        rules: [{ required: true, message: 'Vui lòng nhập khối lượng!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 flex items-center'
                                min={0}
                                controls={false}
                            />
                        ),
                    },
                    {
                        name: 'waterproof',
                        label: 'Độ chống nước (ATM)',
                        rules: [{ required: true, message: 'Vui lòng nhập độ chống nước!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 flex items-center'
                                min={0}
                                controls={false}
                            />
                        ),
                    },
                ],
            },
        ],
        []
    );

    const colorOptions = useMemo(
        () => [
            { key: '#000000', value: 'Đen' },
            { key: '#FFFFFF', value: 'Trắng' },
            { key: '#808080', value: 'Xám' },
            { key: '#0000FF', value: 'Xanh dương' },
            { key: '#FF0000', value: 'Đỏ' },
            { key: '#FFFF00', value: 'Vàng' },
            { key: '#008000', value: 'Xanh lá' },
            { key: '#800080', value: 'Tím' },
            { key: '#FFA500', value: 'Cam' },
            { key: '#FFC0CB', value: 'Hồng' },
            { key: '#00FFFF', value: 'Xanh nước biển' },
            { key: '#FF00FF', value: 'Hồng' },
        ],
        []
    );

    const ColorVariantCard = ({ color, onDelete, onSave }) => {
        const [isEditing, setIsEditing] = useState(false);
        const [localValues, setLocalValues] = useState({
            price: color.price,
            amount: color.amount,
            discount: color.discount,
        });

        const handleLocalChange = (field, value) => {
            setLocalValues((prev) => ({
                ...prev,
                [field]: value,
            }));
        };

        const handleSave = () => {
            onSave(localValues);
            setIsEditing(false);
        };

        return (
            <Card className='mb-4 hover:shadow-lg transition-all duration-300 border border-gray-100'>
                <div className='flex justify-between items-center mb-6 pb-4 border-b border-gray-100'>
                    <div className='flex items-center gap-3'>
                        <div
                            className='w-10 h-10 rounded-lg shadow-inner border border-gray-200 flex items-center justify-center'
                            style={{ backgroundColor: color.key }}
                        >
                            <div className='w-6 h-6 rounded-md border-2 border-white/30'></div>
                        </div>
                        <div>
                            <span className='text-lg font-semibold text-gray-800'>
                                Màu {color.color}
                            </span>
                            <div className='text-sm text-gray-500'>{color.key}</div>
                        </div>
                    </div>
                    <Button
                        danger
                        icon={<DeleteOutlined />}
                        onClick={onDelete}
                        className='hover:scale-105 transition-all duration-300 hover:shadow-md border-red-200'
                        title='Xóa màu sắc này'
                    />
                </div>

                <div className='grid grid-cols-3 gap-6'>
                    <div className='space-y-3'>
                        <label className='text-sm font-medium text-gray-600'>Giá bán</label>
                        <InputNumber
                            className='w-full !rounded-lg'
                            value={localValues.price}
                            onChange={(val) => {
                                handleLocalChange('price', val);
                                setIsEditing(true);
                            }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/[^\d]/g, '')}
                            min={0}
                            size='large'
                            addonAfter='đ'
                            controls={false}
                        />
                    </div>

                    <div className='space-y-3'>
                        <label className='text-sm font-medium text-gray-600'>Số lượng</label>
                        <InputNumber
                            className='w-full !rounded-lg'
                            value={localValues.amount}
                            onChange={(val) => {
                                handleLocalChange('amount', val);
                                setIsEditing(true);
                            }}
                            min={0}
                            size='large'
                            addonAfter='cái'
                            controls={false}
                        />
                    </div>

                    <div className='space-y-3'>
                        <label className='text-sm font-medium text-gray-600'>Giá giảm</label>
                        <InputNumber
                            className='w-full !rounded-lg'
                            value={localValues.discount}
                            onChange={(val) => {
                                handleLocalChange('discount', val);
                                setIsEditing(true);
                            }}
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/[^\d]/g, '')}
                            min={0}
                            size='large'
                            addonAfter='đ'
                            controls={false}
                        />
                        {localValues.discount > 0 && (
                            <div className='flex items-center gap-2 mt-4'>
                                {localValues.price <= localValues.discount ? (
                                    <span className='text-red-500 font-semibold'>
                                        Giá tiền bán không thể nhỏ hơn giá tiền giảm!
                                    </span>
                                ) : (
                                    <>
                                        <span className='text-sm text-gray-500'>Giá sau giảm:</span>
                                        <span className='text-base font-bold text-green-600'>
                                            {new Intl.NumberFormat('vi-VN').format(
                                                localValues.price - localValues.discount
                                            )}
                                            đ
                                        </span>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className='mt-4 flex justify-end'>
                    {isEditing && localValues.price > localValues.discount && (
                        <Button type='primary' onClick={handleSave}>
                            Lưu thông tin
                        </Button>
                    )}
                </div>
            </Card>
        );
    };

    const handleDeleteColor = (indexToDelete) => {
        const newOptions = productOptions.filter((_, index) => index !== indexToDelete);
        setProductOptions(newOptions);
        form.setFieldsValue({ options: newOptions });
        toast.success('Đã xóa màu sắc thành công!');
    };

    const handleColorChange = (index, _, values) => {
        const newOptions = [...productOptions];
        newOptions[index] = {
            ...newOptions[index],
            ...values,
        };
        setProductOptions(newOptions);
        form.setFieldsValue({ options: newOptions });
        toast.success('Đã cập nhật thông tin màu sắc!');
    };

    const handleAddColor = (color) => {
        if (productOptions.find((p) => p.key === color.key)) {
            toast.error('Màu này đã được thêm!');
            return;
        }

        const newOption = {
            key: color.key,
            color: color.value,
            price: 0,
            discount: 0,
            amount: 10,
        };

        setProductOptions([...productOptions, newOption]);
        form.setFieldsValue({
            options: [...productOptions, newOption],
        });

        setColorModalVisible(false);
        toast.success('Đã thêm màu sắc mới!');
    };

    const getIconForSection = (title) => {
        switch (title) {
            case 'Thông tin cơ bản':
                return <InfoCircleOutlined className='text-blue-500' />;
            case 'Thông tin chi tiết':
                return <ProfileOutlined className='text-green-500' />;
            case 'Kích thước':
                return <ColumnHeightOutlined className='text-orange-500' />;
            case 'Thông tin khác':
                return <AppstoreOutlined className='text-purple-500' />;
            default:
                return null;
        }
    };

    const handlePreview = () => {
        const values = form.getFieldsValue();
        const previewData = {
            ...values,
            img: fileList.map((file) => file.url || URL.createObjectURL(file.originFileObj)),
            option: productOptions,
            state: 'preview',
        };
        navigate('/product/product-preview', { state: { product: previewData } });
    };

    return (
        <Card loading={loading} className='rounded-xl border-none '>
            {/* header */}
            <div className='flex items-center justify-between mb-5'>
                <div>
                    <h1 className='text-2xl dark:text-[#141a21] font-bold mb-2'>
                        Chỉnh sửa sản phẩm
                    </h1>
                    <p className='text-gray-500 dark:text-gray-600 text-sm'>
                        Cập nhật thông tin sản phẩm
                    </p>
                </div>
                <Link
                    to={`/product/edit/${id}`}
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
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={onFinish}
                    onFinishFailed={(errorInfo) => {
                        console.log('Form validation failed:', errorInfo);
                    }}
                    className='max-w-[1200px] mx-auto'
                >
                    {/* 3 sections basic info */}
                    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                        {formSections.map((section, idx) => (
                            <Card
                                key={idx}
                                size='small'
                                className='shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border-none bg-gray-50'
                                title={
                                    <span className='font-semibold text-lg flex items-center gap-2'>
                                        {getIconForSection(section.title)} {section.title}
                                    </span>
                                }
                            >
                                {section.items.map((item, index) => (
                                    <Form.Item
                                        key={index}
                                        label={item.label}
                                        name={item.name}
                                        rules={item.rules}
                                    >
                                        {item.input}
                                    </Form.Item>
                                ))}
                            </Card>
                        ))}
                    </div>

                    {/* describe */}
                    <Card
                        className='mt-8'
                        title={
                            <span className='font-semibold flex items-center gap-2'>
                                <FileTextOutlined className='text-blue-500' />
                                Mô tả sản phẩm
                            </span>
                        }
                    >
                        <Form.Item
                            name='description'
                            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
                        >
                            <TextArea rows={6} placeholder='Nhập mô tả chi tiết về sản phẩm...' />
                        </Form.Item>
                    </Card>

                    {/* image */}
                    <Card
                        size='small'
                        className='mt-8 shadow-sm'
                        title={<span className='font-semibold'>Hình ảnh sản phẩm</span>}
                    >
                        <Form.Item
                            name='img'
                            rules={[
                                { required: true, message: 'Vui lòng tải lên ít nhất 1 hình ảnh!' },
                            ]}
                        >
                            <Upload.Dragger
                                beforeUpload={() => false}
                                className='bg-gray-50 rounded-xl p-8 border-2 border-dashed hover:border-blue-400 transition-colors duration-300'
                                listType='picture-card'
                                fileList={fileList}
                                onChange={handleChange}
                                multiple
                                showUploadList={{
                                    showPreviewIcon: true,
                                    showRemoveIcon: true,
                                    previewIcon: <EyeOutlined className='text-blue-500' />,
                                    removeIcon: <DeleteOutlined className='text-red-500' />,
                                }}
                            >
                                <p className='ant-upload-drag-icon text-4xl text-blue-500'>
                                    <InboxOutlined />
                                </p>
                                <p className='ant-upload-text font-semibold'>
                                    Kéo thả hoặc click để tải ảnh lên
                                </p>
                                <p className='ant-upload-hint text-gray-500'>
                                    Hỗ trợ tải nhiều ảnh cùng lúc
                                </p>
                            </Upload.Dragger>
                        </Form.Item>
                    </Card>

                    {/* color */}
                    <Card
                        className='mt-8'
                        title={
                            <div className='flex justify-between items-center'>
                                <span className='font-semibold flex items-center gap-2'>
                                    <BgColorsOutlined className='text-blue-500' />
                                    Màu sắc sản phẩm
                                </span>
                                <Button
                                    type='primary'
                                    icon={<PlusOutlined />}
                                    onClick={() => setColorModalVisible(true)}
                                >
                                    Thêm màu
                                </Button>
                            </div>
                        }
                    >
                        {productOptions.map((color, index) => (
                            <ColorVariantCard
                                key={color.key}
                                color={color}
                                onDelete={() => handleDeleteColor(index)}
                                onSave={(updatedValues) =>
                                    handleColorChange(index, null, updatedValues)
                                }
                            />
                        ))}
                    </Card>

                    {/* color modal */}
                    <Modal
                        title='Chọn màu sắc sản phẩm'
                        open={isColorModalVisible}
                        onCancel={() => setColorModalVisible(false)}
                        footer={null}
                        width={600}
                    >
                        <div className='grid grid-cols-3 gap-4 p-4'>
                            {colorOptions.map((color) => (
                                <div
                                    key={color.key}
                                    className='flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50 rounded-lg transition-colors duration-200'
                                    onClick={() => handleAddColor(color)}
                                >
                                    <div
                                        className='w-8 h-8 rounded-full border shadow-sm'
                                        style={{ backgroundColor: color.key }}
                                    />
                                    <span className='font-medium'>{color.value}</span>
                                </div>
                            ))}

                            <div className='col-span-3 mt-4 pt-4 border-t'>
                                <ColorPicker
                                    onChangeComplete={(color) => {
                                        handleAddColor({
                                            key: color.toHexString(),
                                            value: 'Màu tùy chỉnh',
                                        });
                                    }}
                                >
                                    <Button icon={<PlusOutlined />} block>
                                        Thêm màu tùy chỉnh
                                    </Button>
                                </ColorPicker>
                            </div>
                        </div>
                    </Modal>

                    {/* buttons */}
                    <div className='flex items-center justify-between mt-10'>
                        <Button
                            onClick={() => navigate('/products')}
                            className='h-12 px-8 rounded-lg hover:scale-105 transition-all duration-200'
                            disabled={loading}
                        >
                            Hủy
                        </Button>
                        <div className='flex items-center gap-5'>
                            <Button
                                onClick={handlePreview}
                                className='h-12 px-8 rounded-lg hover:scale-105 transition-all duration-200 bg-purple-50 text-purple-600 border-purple-200 hover:border-purple-300 hover:text-purple-700 hover:bg-purple-100'
                                icon={<FaEye className='mr-2' />}
                                disabled={loading}
                            >
                                Xem Trước
                            </Button>
                            <Button
                                type='primary'
                                htmlType='submit'
                                loading={loading}
                                className='h-12 px-10 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 border-none hover:scale-105 transition-all duration-200'
                                icon={<SaveOutlined />}
                                disabled={loading}
                            >
                                Lưu Thông Tin
                            </Button>
                        </div>
                    </div>
                </Form>
            </Spin>
        </Card>
    );
}
