import React from 'react';
import QrReader from "./QrReader";
import { useKeycloak } from "../keycloak/KeycloakProvider";

interface Props {
    children: React.ReactNode
}

export const Layout: React.FC<Props> = ({children}) => {
    const [showQrReader, setShowQrReader] = React.useState(false);
    const { authenticated } = useKeycloak();

    if (authenticated) {
        return (
        <div>
            <div className="bg-white p-2.5 flex items-center shadow-md">
                <img src="/equipli-logo.svg" className="w-16 h-auto" alt="equipli logo"/>
                <header className="ml-2 text-2xl font-semibold text-customBlue flex-grow">equipli</header>
                <button
                    className="text-sm bg-customBlue text-customBeige px-4 py-2 rounded hover:bg-customRed"
                    onClick={() => setShowQrReader(true)}>
                    QR Code scannen
                </button>
            </div>
            {children}
            {showQrReader && (
                <div className="fixed inset-0 bg-customBlack bg-opacity-50 flex justify-center items-center z-10">
                    <div className="bg-customBeige p-4 rounded-lg shadow-lg relative">
                        <button
                            className="absolute top-4 right-6 text-customRed text-5xl hover:text-customBlack z-20"
                            onClick={() => setShowQrReader(false)}
                        >
                            &times;
                        </button>
                        <QrReader/>
                    </div>
                </div>
            )}
        </div>
        );
    }
    return (<div/>)
};