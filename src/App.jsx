import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement } from './redux/slices/counterSlice';

export default function App() {
    const count = useSelector((state) => state.counter.value);
    const dispatch = useDispatch();

    return (
        <div>
            <div className='flex gap-x-5'>
                <button onClick={() => dispatch(increment())}>Increment</button>
                <span>{count}</span>
                <button onClick={() => dispatch(decrement())}>Decrement</button>
            </div>
        </div>
    );
}
