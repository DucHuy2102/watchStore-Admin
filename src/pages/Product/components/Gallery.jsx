import { Card, Carousel } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import { useRef } from 'react';

export default function Gallery({ images, productName }) {
    const carouselRef = useRef();

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        arrows: false,
    };

    return (
        <Card className='shadow-xl rounded-lg overflow-hidden'>
            <div className='relative'>
                <Carousel ref={carouselRef} {...settings}>
                    {images.map((image, index) => (
                        <div key={index} className='aspect-square'>
                            <img
                                src={image}
                                alt={`${productName} - View ${index + 1}`}
                                className='w-full h-full object-cover'
                            />
                        </div>
                    ))}
                </Carousel>

                <button
                    onClick={() => carouselRef.current.prev()}
                    className='absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 shadow-lg z-10'
                >
                    <LeftOutlined className='text-gray-800' />
                </button>
                <button
                    onClick={() => carouselRef.current.next()}
                    className='absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-white bg-opacity-80 hover:bg-opacity-100 transition-all duration-200 shadow-lg z-10'
                >
                    <RightOutlined className='text-gray-800' />
                </button>
            </div>

            <div className='grid grid-cols-5 gap-3 mt-6 px-2'>
                {images.map((image, index) => (
                    <button
                        key={index}
                        onClick={() => carouselRef.current.goTo(index)}
                        className='relative aspect-square rounded-lg overflow-hidden transition-all duration-200 hover:ring-2 hover:ring-gray-300'
                    >
                        <img
                            src={image}
                            alt={`${productName} ${index + 1}`}
                            className='w-full h-full object-cover'
                        />
                    </button>
                ))}
            </div>
        </Card>
    );
}
