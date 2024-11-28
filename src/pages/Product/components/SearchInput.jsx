import { useState, useEffect } from 'react';
import { Input } from 'antd';
import debounce from 'lodash/debounce';
import { IoIosSearch } from 'react-icons/io';

const SearchInput = ({ onSearch, placeholder }) => {
    const [searchText, setSearchText] = useState('');

    const debouncedSearch = debounce((value) => {
        onSearch(value);
    }, 500);

    useEffect(() => {
        return () => {
            debouncedSearch.cancel();
        };
    }, []);

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchText(value);
        debouncedSearch(value);
    };

    return (
        <Input
            placeholder={placeholder}
            value={searchText}
            onChange={handleChange}
            allowClear
            className='rounded-lg border-gray-300 h-11 w-full'
            suffix={<IoIosSearch className='text-gray-400' />}
        />
    );
};

export default SearchInput;
