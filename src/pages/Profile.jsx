import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toggleTheme } from '../redux/slices/themeSlice';

export default function Profile() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    return (
        <div>
            <h1>profile</h1>
            <button
                className='border rounded-lg px-5 py-3 bg-gray-400'
                onClick={() => dispatch(toggleTheme())}
            >
                Toggle
            </button>
        </div>
    );
}
