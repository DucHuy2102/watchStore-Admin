import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';
import { store, persistor } from './redux/store.js';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { ThemeProvider } from './components/exportComponent.js';
import { GoogleOAuthProvider } from '@react-oauth/google';

createRoot(document.getElementById('root')).render(
    <PersistGate loading={null} persistor={persistor}>
        <Provider store={store}>
            <ThemeProvider>
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
                    <App />
                </GoogleOAuthProvider>
            </ThemeProvider>
        </Provider>
    </PersistGate>
);
