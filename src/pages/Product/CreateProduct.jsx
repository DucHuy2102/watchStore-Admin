import { useState } from 'react';
import { Button, Card, Form, Input, InputNumber, Select, Upload, message, Spin } from 'antd';
import {
    InboxOutlined,
    InfoCircleOutlined,
    ProfileOutlined,
    ColumnHeightOutlined,
    AppstoreOutlined,
    EyeOutlined,
    DeleteOutlined,
    PlusOutlined,
} from '@ant-design/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Tag, ColorPicker } from 'antd';
import { generate } from '@ant-design/colors';
import 'react-quill/dist/quill.snow.css';
import { toast } from 'react-toastify';

const { TextArea } = Input;

export default function CreateProduct() {
    const [form] = Form.useForm();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fileList, setFileList] = useState([]);
    const { access_token: token } = useSelector((state) => state.user);
    const [selectedColors, setSelectedColors] = useState([]);

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

    const discountPrice = (price, discount) => {
        return (price * discount) / 100;
    };

    const onFinish = async (values) => {
        try {
            setLoading(true);
            const uploadedFiles = await handleUploadToCloudinary();

            const productData = {
                ...values,
                img: uploadedFiles?.map((file) => file.url || file),
                discount: discountPrice(values.price, values.discount),
                state: 'saling',
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
            }, 3000);
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tạo sản phẩm');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);

    const formSections = [
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
                    name: 'brand',
                    label: 'Thương hiệu',
                    rules: [{ required: true, message: 'Vui lòng nhập thương hiệu!' }],
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
                    name: 'price',
                    label: 'Giá',
                    rules: [{ required: true, message: 'Vui lòng nhập giá bán!' }],
                    input: (
                        <InputNumber
                            className='w-full rounded-lg hover:border-blue-400 focus:border-blue-500 h-[38px]'
                            formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                            parser={(value) => value.replace(/\$\s?|(,*)/g, '')}
                            controls={false}
                        />
                    ),
                },
                {
                    name: 'amount',
                    label: 'Số lượng',
                    rules: [{ required: true, message: 'Vui lòng nhập số lượng bán!' }],
                    input: (
                        <InputNumber
                            className='w-full rounded-lg hover:border-blue-400 focus:border-blue-500 h-[38px]'
                            min={0}
                        />
                    ),
                },
                {
                    name: 'discount',
                    label: 'Giảm giá (%)',
                    input: (
                        <InputNumber
                            className='w-full rounded-lg hover:border-blue-400 focus:border-blue-500 h-[38px]'
                            min={0}
                            max={100}
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
                    label: 'Chống nước (ATM)',
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
    ];

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

    const presetColors = [
        '#f5222d',
        '#fa8c16',
        '#fadb14',
        '#52c41a',
        '#13c2c2',
        '#1677ff',
        '#722ed1',
        '#eb2f96',

        '#000000',
        '#262626',
        '#595959',
        '#8c8c8c',
        '#bfbfbf',
        '#ffffff',

        ...generate('#f5222d', { theme: 'dark' }),
        ...generate('#722ed1', { theme: 'dark' }),
        ...generate('#52c41a', { theme: 'dark' }),
    ];

    const colorNames = {
        '#f5222d': 'Đỏ',
        '#fa8c16': 'Cam',
        '#fadb14': 'Vàng',
        '#52c41a': 'Xanh lá',
        '#13c2c2': 'Cyan',
        '#1677ff': 'Xanh dương',
        '#722ed1': 'Tím',
        '#eb2f96': 'Hồng',
        '#000000': 'Đen',
        '#ffffff': 'Trắng',
        // Thêm các tên màu khác...
    };

    const handleColorChange = (color) => {
        const hex = color.toHexString();
        const colorName = colorNames[hex] || 'Màu tùy chỉnh';

        if (!selectedColors.find((c) => c.hex === hex)) {
            const newColor = {
                hex,
                name: colorName,
                palette: generate(hex),
            };
            const updatedColors = [...selectedColors, newColor];
            setSelectedColors(updatedColors);
            form.setFieldsValue({
                color: updatedColors.map((c) => c.hex),
            });
        }
    };

    const handleRemoveColor = (colorToRemove) => {
        const newColors = selectedColors.filter((c) => c.hex !== colorToRemove);
        setSelectedColors(newColors);
        form.setFieldsValue({ color: newColors.map((c) => c.hex) });
    };

    return (
        <Card
            className='m-4 mt-16 rounded-xl border-none'
            title={
                <div className='flex items-center justify-between border-b pb-4'>
                    <div>
                        <h1 className='text-2xl font-bold mb-2'>Thêm sản phẩm mới</h1>
                        <p className='text-gray-500 text-sm'>
                            Điền đầy đủ thông tin để tạo sản phẩm mới
                        </p>
                    </div>
                </div>
            }
        >
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
                        size='small'
                        className='shadow-md hover:shadow-lg transition-shadow duration-300 rounded-xl border-none bg-gray-50 mt-8'
                        title={
                            <span className='font-semibold text-lg flex items-center gap-2'>
                                {getIconForSection('Thông tin khác')}
                                Thông tin khác
                            </span>
                        }
                    >
                        <div className='flex flex-col gap-1'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <Form.Item
                                    label='Màu sắc sản phẩm'
                                    name='color'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn ít nhất một màu!',
                                        },
                                    ]}
                                >
                                    <div className='space-y-3'>
                                        <div className='flex flex-wrap items-center gap-2'>
                                            <ColorPicker
                                                presets={[
                                                    { label: 'Màu cơ bản', colors: presetColors },
                                                ]}
                                                defaultFormat='hex'
                                                onChangeComplete={handleColorChange}
                                            >
                                                <Tag
                                                    className='!m-0 !py-2 !px-3 w-full flex justify-center cursor-pointer hover:!bg-gray-50 !rounded-md border border-dashed'
                                                    icon={<PlusOutlined />}
                                                >
                                                    Thêm màu
                                                </Tag>
                                            </ColorPicker>
                                            {selectedColors.map((color, index) => (
                                                <Tag
                                                    key={index}
                                                    className='!m-0 !py-1.5 !px-3 !border-none !rounded-md flex items-center gap-2'
                                                    style={{
                                                        backgroundColor: color.hex + '15',
                                                        color: color.hex,
                                                        border: `1px solid ${color.hex}`,
                                                    }}
                                                    closable
                                                    onClose={() => handleRemoveColor(color.hex)}
                                                >
                                                    <div
                                                        className='w-5 h-5 rounded-full'
                                                        style={{ backgroundColor: color.hex }}
                                                    />
                                                    <span>{color.name}</span>
                                                </Tag>
                                            ))}
                                        </div>
                                    </div>
                                </Form.Item>

                                <Form.Item
                                    label='Đối tượng sử dụng'
                                    name='genderUser'
                                    rules={[
                                        {
                                            required: true,
                                            message: 'Vui lòng chọn đối tượng sử dụng!',
                                        },
                                    ]}
                                >
                                    <Select
                                        className='w-full h-[38px]'
                                        placeholder='Chọn đối tượng sử dụng'
                                    >
                                        <Select.Option value='Nam'>Nam</Select.Option>
                                        <Select.Option value='Nữ'>Nữ</Select.Option>
                                    </Select>
                                </Form.Item>
                            </div>
                            <Form.Item
                                label='Mô tả'
                                name='description'
                                rules={[
                                    { required: true, message: 'Vui lòng nhập mô tả sản phẩm!' },
                                ]}
                            >
                                <TextArea
                                    className='rounded-lg border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors duration-300'
                                    rows={4}
                                    placeholder='Nhập mô tả chi tiết về sản phẩm...'
                                />
                            </Form.Item>
                        </div>
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
