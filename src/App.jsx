import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import {
    Dashboard,
    DefaultLayout_Page,
    ListProduct,
    Login,
    PageNotFound,
    Profile_Page,
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
                    <Route element={<PrivateRoute />}>
                        <Route element={<DefaultLayout_Page />}>
                            <Route path='/' element={<Dashboard />} />
                            <Route path='/dashboard' element={<Dashboard />} />
                            <Route path='/profile' element={<Profile_Page />} />
                            <Route path='/products' element={<ListProduct />} />
                        </Route>
                    </Route>
                    <Route path='*' element={<PageNotFound />} />
                </Routes>
            </Router>

            <ToastContainer
                className={'w-fit'}
                position='bottom-right'
                autoClose={2500}
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
