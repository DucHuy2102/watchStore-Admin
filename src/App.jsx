import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DefaultLayout_Page, Login } from './pages/exportPage';
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
                        {/* <Route path='/' element={<DefaultLayout_Page />} /> */}
                        <Route path='/dashboard' element={<DefaultLayout_Page />} />
                    </Route>
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
