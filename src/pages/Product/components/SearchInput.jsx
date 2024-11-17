import { Input } from 'antd';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { useState, useCallback, memo } from 'react';
import { debounce } from 'lodash';

const SearchInput = memo(({ onSearch, placeholder = 'Tìm kiếm sản phẩm...' }) => {
    const [value, setValue] = useState('');

    const debouncedSearch = useCallback(
        debounce((text) => {
            onSearch(text);
        }, 500),
        []
    );

    const handleChange = (e) => {
        const text = e.target.value;
        setValue(text);
        debouncedSearch(text);
    };

    return (
        <div className='flex-1 relative'>
            <Input
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className='h-11 pl-11 rounded-lg'
                allowClear={{
                    clearIcon: <FaTimes className='text-gray-400 hover:text-gray-600' />,
                }}
            />
            <span className='absolute left-4 top-1/2 -translate-y-1/2'>
                <FaSearch className='w-4 h-4 text-gray-400' />
            </span>
        </div>
    );
});

SearchInput.displayName = 'SearchInput';

export default SearchInput;
