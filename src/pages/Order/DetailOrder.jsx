import { useParams } from 'react-router-dom';

export default function DetailOrder() {
    const { id } = useParams();

    return <div>DetailOrder has idOrder = {id}</div>;
}
