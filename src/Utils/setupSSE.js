let eventSource = null;

export const setupSSE = (token, dispatch, updateOrder) => {
    if (eventSource) {
        eventSource.close();
    }

    eventSource = new EventSource(
        `${
            import.meta.env.VITE_API_URL
        }/api/order/get-all-order-realtime?token=${`Bearer ${token}`}`
    );

    eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        dispatch(updateOrder(data));
        console.log('SSE open: ', data);
    };

    eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        setTimeout(() => setupSSE(token, dispatch, updateOrder), 5000);
    };
};

export const closeSSE = () => {
    if (eventSource) {
        eventSource.close();
        eventSource = null;
        console.log('SSE closed');
    }
};
