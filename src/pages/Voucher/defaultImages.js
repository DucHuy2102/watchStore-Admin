export const defaultImages = [
    {
        url: 'https://res.cloudinary.com/dajzl4hdt/image/upload/v1731319344/aqsmz8libwikhsvlvfhj.png',
        title: 'Miễn phí vận chuyển',
        description: 'Ưu đãi vận chuyển cho đơn hàng',
    },
    {
        url: 'https://res.cloudinary.com/dajzl4hdt/image/upload/v1731319279/wlp0352fmr4qmjwxn7hc.jpg',
        title: 'Hàng quốc tế',
        description: 'Ưu đãi cho sản phẩm quốc tế',
    },
    {
        url: 'https://res.cloudinary.com/dajzl4hdt/image/upload/v1731319322/lcl9dvcqovgx0wyjenk8.png',
        title: 'Hàng mới về',
        description: 'Ưu đãi cho sản phẩm mới',
    },
    {
        url: 'https://res.cloudinary.com/dajzl4hdt/image/upload/v1731319361/usugcntczyjuai9c3jau.png',
        title: 'Siêu giảm giá',
        description: 'Ưu đãi giảm giá đặc biệt',
    },
];

// Thêm một số constant khác liên quan đến voucher
export const VOUCHER_TYPES = {
    SHIPPING: 'shipping',
    DISCOUNT: 'discount',
    SPECIAL: 'special',
};

export const VOUCHER_STATES = {
    ACTIVE: 'active',
    INACTIVE: 'inactive',
    EXPIRED: 'expired',
};

export const VOUCHER_DEFAULT_VALUES = {
    times: 100,
    state: 'active',
    discount: 0,
    minPrice: 0,
};
