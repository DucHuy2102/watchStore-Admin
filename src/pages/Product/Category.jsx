import axios from 'axios';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Button, Modal, TextInput } from 'flowbite-react';
import { toast } from 'react-toastify';
import { Modal as AntModal } from 'antd';
import { getAllCategory } from '../../redux/slices/productSlice';

export default function Category() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { access_token: token } = useSelector((state) => state.user);
    const [category, setCategory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expandedCategory, setExpandedCategory] = useState(null);
    const [modalCreateCategory, setModalCreateCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [modalEditCategory, setModalEditCategory] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState(null);
    const [editCategoryName, setEditCategoryName] = useState('');

    // get all category
    const getCategory = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/category/get-all-category`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res.status === 200) {
                setCategory(res.data);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (category.length === 0) {
            getCategory();
        }

        return () => {
            if (category.length > 0) {
                dispatch(getAllCategory(category));
            }
        };
    }, []);

    const toggleCategory = (categoryId) => {
        setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
    };

    // create category
    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) {
            toast.warning('Tên danh mục không được trống');
            return;
        }

        const checkCategoryExists = category.some(
            (category) => category.categoryName.toLowerCase() === newCategoryName.toLowerCase()
        );

        if (checkCategoryExists) {
            toast.warning('Danh mục này đã tồn tại');
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/category/create`,
                {
                    categoryName:
                        newCategoryName.trim().charAt(0).toUpperCase() +
                        newCategoryName.trim().slice(1),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res?.status === 201) {
                toast.success('Tạo danh mục thành công');
                setModalCreateCategory(false);
                setNewCategoryName('');
                setCategory([...category, res.data]);
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi tạo danh mục');
        } finally {
            setIsSubmitting(false);
        }
    };

    // delete category
    const handleDeleteCategory = async (categoryId) => {
        AntModal.confirm({
            title: 'Xác nhận xóa',
            content:
                'Bạn có chắc chắn muốn xóa danh mục này? Tất cả sản phẩm trong danh mục sẽ bị xóa.',
            okText: 'Xóa',
            okType: 'danger',
            cancelText: 'Hủy',
            async onOk() {
                try {
                    const res = await axios.delete(
                        `${import.meta.env.VITE_API_URL}/api/category/delete`,
                        {
                            params: {
                                categoryId: categoryId,
                            },
                            headers: {
                                Authorization: `Bearer ${token}`,
                            },
                        }
                    );
                    if (res.status === 200) {
                        toast.success('Xóa danh mục thành công');
                        setCategory(category.filter((cat) => cat.id !== categoryId));
                    }
                } catch (error) {
                    console.error(error);
                    toast.error('Có lỗi xảy ra khi xóa danh mục');
                }
            },
        });
    };

    // edit category
    const handleEditCategory = async () => {
        if (!editCategoryName.trim()) {
            toast.warning('Tên danh mục không được trống');
            return;
        }

        const checkCategoryExists = category.some(
            (cat) =>
                cat.categoryName.toLowerCase() === editCategoryName.toLowerCase() &&
                cat.id !== editCategoryId
        );

        if (checkCategoryExists) {
            toast.warning('Danh mục này đã tồn tại');
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await axios.put(
                `${import.meta.env.VITE_API_URL}/api/category/update`,
                {
                    categoryId: editCategoryId,
                    categoryName:
                        editCategoryName.trim().charAt(0).toUpperCase() +
                        editCategoryName.trim().slice(1),
                },
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );
            if (res?.status === 200) {
                toast.success('Cập nhật danh mục thành công');
                setModalEditCategory(false);
                setEditCategoryName('');
                setEditCategoryId(null);
                setCategory(
                    category.map((cat) =>
                        cat.id === editCategoryId
                            ? { ...cat, categoryName: res.data.categoryName }
                            : cat
                    )
                );
            }
        } catch (error) {
            console.error(error);
            toast.error('Có lỗi xảy ra khi cập nhật danh mục');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className='min-h-screen p-8'>
            <div className='flex justify-between items-center mb-12'>
                <div>
                    <h1 className='text-2xl font-bold'>Quản lý danh mục sản phẩm</h1>
                    <p className='text-gray-500 mt-1'>
                        Quản lý tất cả danh mục sản phẩm đang có trong hệ thống
                    </p>
                </div>
                <Button
                    pill
                    color='blue'
                    className='flex items-center justify-center !ring-0'
                    onClick={() => {
                        setModalCreateCategory(true);
                    }}
                >
                    <FaPlus className='text-sm mt-0.5 mr-1' />
                    <span>Thêm danh mục mới</span>
                </Button>
            </div>

            {loading ? (
                <div className='flex justify-center'>
                    <div className='animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gold'></div>
                </div>
            ) : (
                <div className='space-y-6'>
                    {category.map((cat) => (
                        <motion.div
                            key={cat.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className='bg-gray-200 rounded-lg overflow-hidden backdrop-blur-sm'
                        >
                            <div
                                className='p-6 cursor-pointer'
                                onClick={() => toggleCategory(cat.id)}
                            >
                                <div className='flex justify-between items-center'>
                                    <h2 className='text-2xl font-semibold text-gold'>
                                        {cat.categoryName}
                                    </h2>
                                    <div className='flex items-center gap-4'>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditCategoryId(cat.id);
                                                setEditCategoryName(cat.categoryName);
                                                setModalEditCategory(true);
                                            }}
                                            className='p-2 hover:bg-blue-100 rounded-full transition-colors'
                                        >
                                            <FaEdit className='text-blue-500 hover:text-blue-700' />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDeleteCategory(cat.id);
                                            }}
                                            className='p-2 hover:bg-red-100 rounded-full transition-colors'
                                        >
                                            <FaTrash className='text-red-500 hover:text-red-700' />
                                        </button>
                                        {expandedCategory === cat.id ? (
                                            <FaChevronUp />
                                        ) : (
                                            <FaChevronDown />
                                        )}
                                    </div>
                                </div>

                                {expandedCategory === cat.id && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6'
                                    >
                                        {cat.products?.map((product) => (
                                            <motion.div
                                                key={product.id}
                                                whileHover={{ scale: 1.02 }}
                                                className='rounded-lg border border-gray-300 shadow-md'
                                            >
                                                <div className='relative aspect-square'>
                                                    <img
                                                        src={product.img[0]}
                                                        alt={product.productName}
                                                        className='object-cover w-full h-full rounded-t-lg'
                                                    />
                                                    <div className='absolute top-2 right-2 flex gap-2'>
                                                        <button
                                                            className='p-2 bg-gray-500/50 hover:bg-gray-700/70 rounded-full transition-colors'
                                                            onClick={(e) => {
                                                                navigate(
                                                                    `/product-detail/${product.id}`
                                                                );
                                                            }}
                                                        >
                                                            <FaEdit className='text-blue-500 hover:text-white' />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className='p-4'>
                                                    <h3
                                                        className='text-lg font-medium mb-2'
                                                        onClick={() =>
                                                            navigate(
                                                                `/product-detail/${product.id}`
                                                            )
                                                        }
                                                    >
                                                        {product.productName}
                                                    </h3>
                                                    <div className='space-y-1 text-sm text-gray-800'>
                                                        <p>Giới tính: {product.genderUser}</p>
                                                        <p>
                                                            Kích thước: {product.length} x{' '}
                                                            {product.width} x {product.height}mm
                                                        </p>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* modal create category */}
            <Modal
                show={modalCreateCategory}
                onClose={() => {
                    setModalCreateCategory(false);
                    setNewCategoryName('');
                }}
                size='sm'
                popup
            >
                <Modal.Header>
                    <span className='text-lg pl-4 font-semibold'>Tạo danh mục mới</span>
                </Modal.Header>
                <Modal.Body>
                    <div className='space-y-4 py-2'>
                        <TextInput
                            type='text'
                            placeholder='Nhập tên danh mục'
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <div className='flex justify-between items-center'>
                            <Button
                                color='gray'
                                className='!ring-0'
                                onClick={() => {
                                    setModalCreateCategory(false);
                                    setNewCategoryName('');
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                color='blue'
                                className='!ring-0'
                                onClick={handleCreateCategory}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang tạo...' : 'Tạo danh mục'}
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>

            {/* modal edit category */}
            <Modal
                show={modalEditCategory}
                onClose={() => {
                    setModalEditCategory(false);
                    setEditCategoryName('');
                    setEditCategoryId(null);
                }}
                size='sm'
                popup
            >
                <Modal.Header>
                    <span className='text-lg pl-4 font-semibold'>Chỉnh sửa danh mục</span>
                </Modal.Header>
                <Modal.Body>
                    <div className='space-y-4 py-2'>
                        <TextInput
                            type='text'
                            placeholder='Nhập tên danh mục'
                            value={editCategoryName}
                            onChange={(e) => setEditCategoryName(e.target.value)}
                        />
                        <p className='text-sm text-yellow-400 italic'>
                            Việc cập nhật sẽ ảnh hưởng lên toàn bộ sản phẩm trong danh mục. Hãy cân
                            nhắc kỹ lưỡng trước khi thực hiện thao tác này!
                        </p>
                        <div className='flex justify-between items-center'>
                            <Button
                                color='gray'
                                className='!ring-0'
                                onClick={() => {
                                    setModalEditCategory(false);
                                    setEditCategoryName('');
                                    setEditCategoryId(null);
                                }}
                            >
                                Hủy
                            </Button>
                            <Button
                                color='blue'
                                className='!ring-0'
                                onClick={handleEditCategory}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
                            </Button>
                        </div>
                    </div>
                </Modal.Body>
            </Modal>
        </div>
    );
}
