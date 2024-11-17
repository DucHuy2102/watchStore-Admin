import { useCallback, useEffect, useMemo, useState } from 'react';
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
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ColorPicker } from 'antd';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';
import { placeholder } from '@cloudinary/react';

const { TextArea } = Input;

export default function CreateProduct() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [customBrand, setCustomBrand] = useState('');
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const { access_token: token } = useSelector((state) => state.user);
    const [productOptions, setProductOptions] = useState([]);
    console.log('productOptions:', productOptions);
    const [isColorModalVisible, setColorModalVisible] = useState(false);

    useEffect(() => {
        if (!category) {
            getAllCategory();
        }
    }, []);

    const getAllCategory = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/category/get-all-category`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (res?.status === 200) {
                const { data } = res;
                const category = data?.map((item) => item?.categoryName);
                setCategory(category);
            }
        } catch (error) {
            console.log('Lỗi khi lấy danh mục sản phẩm:', error);
        } finally {
            setLoading(false);
        }
    };

    const categoryOptions = [...category, 'Hãng khác'];

    const handleBrandChange = useCallback((value) => {
        setSelectedCategory(value);
        if (value !== 'Hãng khác') {
            setCustomBrand('');
            form.setFieldValue('category', value);
        } else {
            form.setFieldValue('category', '');
        }
    }, []);

    const handleUploadToCloudinary = async () => {
        const uploadedFiles = await Promise.all(
            fileList.map(async (file) => {
                if (file.originFileObj) {
                    const formData = new FormData();
                    formData.append('file', file.originFileObj);
                    formData.append(
                        'upload_preset',
                        `${import.meta.env.VITE_CLOUDINARY_PRESETS_NAME}`
                    );

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

                        return {
                            ...file,
                            url: data.secure_url,
                        };
                    } catch (error) {
                        console.error('Lỗi khi upload:', error);
                    }
                }
                return file;
            })
        );

        return uploadedFiles;
    };

    const discountPrice = useMemo((price, discount) => {
        return (price * discount) / 100;
    }, []);

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const uploadedFiles = await handleUploadToCloudinary();

            const productData = {
                ...values,
                img: uploadedFiles?.map((file) => file.url || file),
                discount: discountPrice(values.price, values.discount),
                state: 'waiting',
            };
            console.log('Data:', productData);

            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/product/create`,
                productData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            console.log('Tạo sản phẩm thành công:', res);
            toast.success('Tạo sản phẩm thành công!');
            setTimeout(() => {
                navigate('/products');
            }, 2000);
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tạo sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

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
                            <Input className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]' />
                        ),
                    },
                    {
                        name: 'category',
                        label: 'Hãng đồng hồ',
                        rules: [{ required: true, message: 'Vui lòng chọn hãng đồng hồ!' }],
                        input: (
                            <>
                                <Select
                                    placeholder='Chọn hãng đồng hồ'
                                    onChange={handleBrandChange}
                                    value={selectedCategory}
                                    className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500 transition-colors duration-300'
                                >
                                    {categoryOptions.map((item, index) => (
                                        <Select.Option key={index} value={item}>
                                            {item}
                                        </Select.Option>
                                    ))}
                                </Select>
                                {selectedCategory === 'Hãng khác' && (
                                    <Form.Item
                                        name='customBrand'
                                        rules={[
                                            {
                                                required: true,
                                                message: 'Vui lòng nhập tên hãng đồng hồ!',
                                            },
                                        ]}
                                    >
                                        <Input
                                            placeholder='Nhập tên hãng đồng hồ'
                                            value={customBrand}
                                            className='h-[38px] rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300'
                                            onChange={(e) => setCustomBrand(e.target.value)}
                                        />
                                    </Form.Item>
                                )}
                            </>
                        ),
                    },
                    {
                        name: 'brand',
                        label: 'Danh mục sản phẩm',
                        rules: [{ required: true, message: 'Vui lòng nhập danh mục!' }],
                        input: (
                            <Input className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]' />
                        ),
                    },
                    {
                        name: 'origin',
                        label: 'Xuất xứ',
                        rules: [{ required: true, message: 'Vui lòng nhập xuất xứ sản phẩm!' }],
                        input: (
                            <Input className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]' />
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
                            >
                                <Select.Option value='Nam'>Nam</Select.Option>
                                <Select.Option value='Nữ'>Nữ</Select.Option>
                                <Select.Option value='Thiếu nhi'>Thiếu nhi</Select.Option>
                                <Select.Option value='Người lớn tuổi'>Người lớn tuổi</Select.Option>
                            </Select>
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
                            >
                                <Select.Option value='Đồng hồ cơ tự động'>
                                    Đồng hồ cơ tự động
                                </Select.Option>
                                <Select.Option value='Đồng hồ cơ lên dây cót'>
                                    Đồng hồ cơ lên dây cót
                                </Select.Option>
                                <Select.Option value='Đồng hồ thạch anh'>
                                    Đồng hồ thạch anh
                                </Select.Option>
                                <Select.Option value='Đồng hồ điện tử'>
                                    Đồng hồ điện tử
                                </Select.Option>
                                <Select.Option value=' Đồng hồ thông minh'>
                                    Đồng hồ thông minh
                                </Select.Option>
                                <Select.Option value='Đồng hồ chronograph'>
                                    Đồng hồ chronograph
                                </Select.Option>
                                <Select.Option value='Đồ hồ solar'>Đồ hồ solar</Select.Option>
                                <Select.Option value='Đồng hồ hybrid'>Đồng hồ hybrid</Select.Option>
                            </Select>
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
                            <Input className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]' />
                        ),
                    },
                    {
                        name: 'shellMaterial',
                        label: 'Chất liệu vỏ',
                        rules: [{ required: true, message: 'Vui lòng nhập chất liệu vỏ!' }],
                        input: (
                            <Input className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]' />
                        ),
                    },
                    {
                        name: 'style',
                        label: 'Kiểu dáng',
                        rules: [{ required: true, message: 'Vui lòng nhập kiểu dáng sản phẩm!' }],
                        input: (
                            <Input className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]' />
                        ),
                    },
                    {
                        name: 'shape',
                        label: 'Hình dáng mặt đồng hồ',
                        rules: [{ required: true, message: 'Vui lòng nhập hình dáng mặt!' }],
                        input: (
                            <Input className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300 h-[38px]' />
                        ),
                    },
                    {
                        name: 'feature',
                        label: 'Tính năng',
                        rules: [{ required: true, message: 'Vui lòng nhập tính năng sản phẩm!' }],
                        input: (
                            <TextArea
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
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500'
                                min={0}
                            />
                        ),
                    },
                    {
                        name: 'width',
                        label: 'Chiều rộng (mm)',
                        rules: [{ required: true, message: 'Vui lòng nhập chiều rộng!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500'
                                min={0}
                            />
                        ),
                    },
                    {
                        name: 'height',
                        label: 'Chiều cao (mm)',
                        rules: [{ required: true, message: 'Vui lòng nhập chiều cao!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500'
                                min={0}
                            />
                        ),
                    },
                    {
                        name: 'weight',
                        label: 'Khối lượng (g)',
                        rules: [{ required: true, message: 'Vui lòng nhập khối lượng!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500'
                                min={0}
                            />
                        ),
                    },
                    {
                        name: 'waterproof',
                        label: 'Độ chống nước (ATM)',
                        rules: [{ required: true, message: 'Vui lòng nhập độ chống nước!' }],
                        input: (
                            <InputNumber
                                className='w-full h-[38px] rounded-lg hover:border-blue-400 focus:border-blue-500'
                                min={0}
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
                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-600'>Giá bán</label>
                        <InputNumber
                            className='w-full !rounded-lg'
                            value={localValues.price}
                            onChange={(val) => handleLocalChange('price', val)}
                            formatter={(value) =>
                                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' ₫'
                            }
                            parser={(value) => value.replace(/[^\d]/g, '')}
                            min={0}
                            size='large'
                            controls={false}
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-600'>Số lượng</label>
                        <InputNumber
                            className='w-full !rounded-lg'
                            value={localValues.amount}
                            onChange={(val) => handleLocalChange('amount', val)}
                            min={0}
                            size='large'
                            addonAfter='cái'
                            controls={false}
                        />
                    </div>

                    <div className='space-y-2'>
                        <label className='text-sm font-medium text-gray-600'>Giảm giá</label>
                        <InputNumber
                            className='w-full !rounded-lg'
                            value={localValues.discount}
                            onChange={(val) => handleLocalChange('discount', val)}
                            min={0}
                            max={100}
                            size='large'
                            addonAfter='%'
                            controls={false}
                        />
                    </div>
                </div>

                <div className=' flex items-center justify-between mt-4'>
                    {localValues.discount > 0 &&
                        localValues.price > 0 &&
                        localValues.discount < 100 && (
                            <div className='flex items-center gap-2 text-sm font-bold text-gray-500'>
                                <span>Giá bán sau khi giảm:</span>
                                <span className='font-medium text-green-600'>
                                    {new Intl.NumberFormat('vi-VN').format(
                                        localValues.price * (1 - localValues.discount / 100)
                                    )}{' '}
                                    đ
                                </span>
                            </div>
                        )}

                    <Button type='primary' onClick={() => onSave(localValues)}>
                        Lưu thông tin
                    </Button>
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

    const ColorSelectionModal = () => (
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
    );

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

    return (
        <Card loading={loading} className='m-4 mt-24 rounded-xl border-none relative'>
            <div className='flex items-center justify-between py-4 absolute z-10 -top-24'>
                <div>
                    <h1 className='text-2xl dark:text-[#fbfcfc] font-bold mb-2'>
                        Thêm sản phẩm mới
                    </h1>
                    <p className='text-gray-500 dark:text-gray-400 text-sm'>
                        Điền đầy đủ thông tin để tạo sản phẩm mới
                    </p>
                </div>
            </div>
            <Spin spinning={loading}>
                <Form
                    form={form}
                    layout='vertical'
                    onFinish={onFinish}
                    className='max-w-[1200px] mx-auto'
                    initialValues={{
                        waterproof: 0,
                        discount: 0,
                        length: 0,
                        width: 0,
                        height: 0,
                        weight: 0,
                        state: 'active',
                    }}
                >
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

                    <ColorSelectionModal />

                    <div className='flex justify-end gap-4 mt-8'>
                        <Button
                            size='large'
                            className='min-w-[120px] rounded-lg border-gray-300 hover:border-gray-400'
                            onClick={() => navigate('/products')}
                        >
                            Hủy
                        </Button>
                        <Button
                            type='primary'
                            size='large'
                            className='min-w-[120px] rounded-lg shadow-md hover:shadow-lg'
                            htmlType='submit'
                            loading={loading}
                        >
                            Tạo sản phẩm
                        </Button>
                    </div>
                </Form>
            </Spin>
        </Card>
    );
}
