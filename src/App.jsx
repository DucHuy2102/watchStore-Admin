import React from 'react';
import { useDispatch } from 'react-redux';
import { toggleTheme } from './redux/slices/themeSlice';

export default function App() {
    const dispatch = useDispatch();

    return (
        <div>
            <button
                className='p-10 border rounded-lg m-10 text-2xl hover:bg-white hover:text-black transition-colors duration-200 font-medium'
                onClick={() => dispatch(toggleTheme())}
            >
                Toggle
            </button>
        </div>
    );
}
