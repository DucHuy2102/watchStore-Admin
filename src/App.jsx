import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
    CreateProduct,
    Dashboard,
    DefaultLayout_Page,
    DetailOrder,
    EditProduct,
    ListOrder,
    ListProduct,
    ListUser,
    ListVouchers,
    CreateVoucher,
    Login,
    PageNotFound,
    Profile_Page,
    EditVoucher,
    ForgotPassword,
    VerifyEmail,
    ResetPassword,
    ProductDetail,
    ProductPreview,
    ListReview,
} from './pages/exportPage';
import { PrivateRoute } from './components/exportComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { getAllCategory } from './redux/slices/productSlice';

export default function App() {
    const dispatch = useDispatch();
    const { access_token: token, isAdmin } = useSelector((state) => state.user);
    const [category, setCategory] = useState([]);

    useEffect(() => {
        const getCategory = async () => {
            try {
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
                    setCategory(data);
                    dispatch(getAllCategory(data));
                }
            } catch (error) {
                console.log('Lỗi khi lấy danh mục sản phẩm:', error);
            }
        };

        if (category.length === 0 && token) {
            getCategory();
        }
    }, [category.length, dispatch, token]);

    return (
        <>
            <Router>
                <Routes>
                    {/* public route */}
                    <Route path='/login' element={<Login />} />
                    <Route path='/forgot-password' element={<ForgotPassword />} />
                    <Route path='/verify-email' element={<VerifyEmail />} />
                    <Route path='/reset-password/:token' element={<ResetPassword />} />

                    {/* private route */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<DefaultLayout_Page />}>
                            {/* dashboard */}
                            <Route path='/' element={<Dashboard />} />
                            <Route path='/dashboard' element={<Dashboard />} />

                            {/* profile */}
                            <Route path='/profile' element={<Profile_Page />} />

                            {/* user */}
                            <Route path='/users' element={<ListUser />} />

                            {/* product */}
                            <Route path='/products' element={<ListProduct />} />
                            <Route path='/product/create' element={<CreateProduct />} />
                            <Route path='/product/edit/:id' element={<EditProduct />} />
                            <Route path='/product-detail/:id' element={<ProductDetail />} />

                            {/* order */}
                            <Route path='/orders' element={<ListOrder />} />
                            <Route path='/order/detail/:id' element={<DetailOrder />} />

                            {/* voucher */}
                            <Route path='/vouchers' element={<ListVouchers />} />
                            <Route path='/voucher/edit/:id' element={<EditVoucher />} />
                            <Route path='/voucher/create' element={<CreateVoucher />} />
                            <Route path='/product/product-preview' element={<ProductPreview />} />

                            {/* review */}
                            <Route path='/reviews' element={<ListReview />} />
                        </Route>
                    </Route>

                    {/* page not found */}
                    <Route path='*' element={<PageNotFound />} />
                </Routes>
            </Router>

            <ToastContainer
                className={'w-fit'}
                position='bottom-right'
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme='light'
            />
        </>
    );
}
