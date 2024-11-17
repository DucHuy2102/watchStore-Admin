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
} from './pages/exportPage';
import { PrivateRoute } from './components/exportComponent';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path='/login' element={<Login />} />
                    <Route path='/forgot-password' element={<ForgotPassword />} />
                    <Route path='/verify-email' element={<VerifyEmail />} />
                    <Route path='/reset-password/:token' element={<ResetPassword />} />

                    {/* private route */}
                    <Route element={<PrivateRoute />}>
                        <Route element={<DefaultLayout_Page />}>
                            <Route path='/' element={<Dashboard />} />
                            <Route path='/dashboard' element={<Dashboard />} />
                            <Route path='/profile' element={<Profile_Page />} />
                            <Route path='/users' element={<ListUser />} />
                            <Route path='/products' element={<ListProduct />} />
                            <Route path='/product/create' element={<CreateProduct />} />
                            <Route path='/product/edit/:id' element={<EditProduct />} />
                            <Route path='/product-detail/:id' element={<ProductDetail />} />
                            <Route path='/orders' element={<ListOrder />} />
                            <Route path='/order/detail/:id' element={<DetailOrder />} />
                            <Route path='/vouchers' element={<ListVouchers />} />
                            <Route path='/voucher/edit/:id' element={<EditVoucher />} />
                            <Route path='/voucher/create' element={<CreateVoucher />} />
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
