import axios from 'axios';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

export default function ListVouchers() {
    const { access_token: tokenUser } = useSelector((state) => state.user);
    const [loading, setLoading] = useState(false);
    const [vouchers, setVouchers] = useState([]);
    console.log(vouchers);

    useEffect(() => {
        getAllVouchers();
    }, []);

    const getAllVouchers = async () => {
        try {
            setLoading(true);
            const res = await axios.get(
                `${import.meta.env.VITE_API_URL}/api/coupon/get-all-coupon`,
                {
                    headers: {
                        Authorization: `Bearer ${tokenUser}`,
                    },
                }
            );
            if (res.status === 200) {
                setVouchers(res.data);
            }
        } catch (error) {
            console.log(error);
            toast.error('Lỗi hệ thống!');
        } finally {
            setLoading(false);
        }
    };

    return <div>ListVouchers</div>;
}
