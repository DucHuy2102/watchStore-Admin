import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Form } from 'antd';

const RichTextEditor = ({ value, onChange }) => {
    const modules = {
        toolbar: [
            [{ header: [1, 2, 3, 4, 5, 6, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ color: [] }, { background: [] }],
            [{ list: 'ordered' }, { list: 'bullet' }],
            [{ align: [] }],
            ['link', 'image'],
            ['clean'],
        ],
    };

    const formats = [
        'header',
        'bold',
        'italic',
        'underline',
        'strike',
        'color',
        'background',
        'list',
        'bullet',
        'align',
        'link',
        'image',
    ];

    return (
        <Form.Item label='Mô tả sản phẩm' name='description' rules={[{ required: true }]}>
            <ReactQuill
                theme='snow'
                value={value}
                onChange={onChange}
                placeholder='Nhập mô tả chi tiết về sản phẩm...'
                modules={modules}
                formats={formats}
                className='bg-white rounded-lg border border-gray-300 hover:border-blue-400 
                focus:border-blue-500 transition-colors duration-300'
                style={{ minHeight: '200px' }}
            />
        </Form.Item>
    );
};

export default RichTextEditor;
