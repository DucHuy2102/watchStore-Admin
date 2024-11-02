import { Modal, TextInput, Button } from 'flowbite-react';
import { HiX, HiSearch, HiFilter } from 'react-icons/hi';

const FilterModal = ({
    show,
    onClose,
    searchFilterOption,
    onSearchChange,
    selectedFilters,
    onRemoveFilter,
    filteredOptions,
    onSelect,
    onSubmit,
}) => {
    return (
        <Modal show={show} onClose={onClose} size='lg'>
            <div className='p-6 space-y-6'>
                <div className='flex items-center justify-between border-b border-gray-200 pb-4'>
                    <div className='flex items-center space-x-2'>
                        <HiFilter className='w-6 h-6 text-blue-600' />
                        <h3 className='text-xl font-semibold text-gray-900'>Bộ Lọc Nâng Cao</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className='text-gray-400 hover:text-gray-500 transition-colors'
                    >
                        <HiX className='w-6 h-6' />
                    </button>
                </div>

                <div className='relative'>
                    <HiSearch className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5' />
                    <TextInput
                        className='pl-10'
                        placeholder='Tìm kiếm lựa chọn...'
                        value={searchFilterOption}
                        onChange={(e) => onSearchChange(e.target.value)}
                    />
                </div>

                {selectedFilters.length > 0 && (
                    <div className='flex flex-wrap gap-2'>
                        {selectedFilters.map((filter, index) => (
                            <div
                                key={index}
                                className='flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm'
                            >
                                <span>{filter.label}</span>
                                <button
                                    onClick={() => onRemoveFilter(filter)}
                                    className='hover:text-blue-800'
                                >
                                    <HiX className='w-4 h-4' />
                                </button>
                            </div>
                        ))}
                    </div>
                )}

                <div className='space-y-6 max-h-[400px] overflow-y-auto pr-2'>
                    {filteredOptions.map((option, index) => (
                        <div key={index}>
                            <h4 className='font-medium text-gray-900 mb-3 pb-2 border-b border-gray-200'>
                                {option.title}
                            </h4>
                            <div className='grid grid-cols-2 md:grid-cols-3 gap-2'>
                                {option.choices.map((choice, i) => (
                                    <button
                                        key={i}
                                        onClick={() => onSelect(choice)}
                                        className={`
                      px-4 py-2 text-sm rounded-lg transition-all duration-200
                      ${
                          selectedFilters.some(
                              (f) => f.key === choice.key && f.value === choice.value
                          )
                              ? 'bg-blue-100 text-blue-700 border-blue-200'
                              : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-gray-200'
                      }
                      border
                    `}
                                    >
                                        {choice.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className='flex justify-between items-center px-6 py-1 bg-gray-50 rounded-b-lg'>
                <Button color='gray' onClick={onClose} className='px-4 py-1'>
                    Đóng
                </Button>
                <Button color='blue' onClick={onSubmit} className='px-4 py-1'>
                    Áp dụng bộ lọc
                </Button>
            </div>
        </Modal>
    );
};

export default FilterModal;
