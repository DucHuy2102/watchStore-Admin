import { useSelector } from 'react-redux';

export default function ThemeProvider({ children }) {
    const { theme } = useSelector((state) => state.theme);

    return (
        <div className={theme}>
            <div
                className={`min-h-screen ${
                    theme === 'light'
                        ? 'bg-[#fbfcfc] text-[#141a21]'
                        : 'bg-[#141a21] text-[#fbfcfc]'
                }  `}
            >
                {children}
            </div>
        </div>
    );
}
