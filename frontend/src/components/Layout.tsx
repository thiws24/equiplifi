import React from "react";
import { SidebarProvider, SidebarTrigger, useSidebar } from "./ui/sidebar";
import { useKeycloak } from "../keycloak/KeycloakProvider";
import QrReader from "./QrReader";
import { AppSidebar } from "./app-sidebar";

interface Props {
    children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
    const [showQrReader, setShowQrReader] = React.useState(false);
    const { authenticated } = useKeycloak();

    if (!authenticated) {
        return <div />;
    }

    return (
        // Hier wird SidebarProvider um alle Komponenten gelegt
        <SidebarProvider>
            <LayoutContent
                children={children}
                showQrReader={showQrReader}
                setShowQrReader={setShowQrReader}
            />
        </SidebarProvider>
    );
};

// Separate Komponente für den Inhalt, wo useSidebar verwendet wird
const LayoutContent: React.FC<{
    children: React.ReactNode;
    showQrReader: boolean;
    setShowQrReader: React.Dispatch<React.SetStateAction<boolean>>;
}> = ({ children, showQrReader, setShowQrReader }) => {
    const { open, setOpen } = useSidebar(); // useSidebar innerhalb des SidebarProviders

    return (
        <div className="flex h-screen w-full">
            {/* Sidebar */}
            {open && (
                <div className="h-full z-50">
                    <AppSidebar />
                </div>
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col">
                {/* Top Navigation */}
                <div className="bg-white p-2.5 flex items-center justify-between shadow-md">
                    {/* Sidebar Trigger (links) */}
                    <SidebarTrigger
                        onClick={() => {
                            setOpen(!open); // Sidebar öffnen oder schließen
                        }}
                    />

                    <a
                        href="/"
                        className="absolute left-1/2 transform -translate-x-1/2 flex items-center"
                    >
                        <img
                            src="/equipli-logo.svg"
                            className="w-16 h-auto"
                            alt="equipli logo"
                        />
                        <header className="ml-2 text-2xl font-semibold text-customBlue">
                            equipli
                        </header>
                    </a>

                    <button
                        className="text-sm bg-customBlue text-customBeige px-4 py-2 rounded hover:bg-customRed"
                        onClick={() => setShowQrReader(true)}
                    >
                        QR Code scannen
                    </button>
                </div>

                {/* Hauptinhalt */}
                <main className="flex flex-col h-screen overflow-auto">
                    {children}
                </main>
            </div>

            {/* QR Code Reader Modal */}
            {showQrReader && (
                <div className="fixed inset-0 bg-customBlack bg-opacity-50 flex justify-center items-center z-10">
                    <div className="bg-customBeige p-4 rounded-lg shadow-lg relative">
                        <button
                            className="absolute top-4 right-6 text-customRed text-5xl hover:text-customBlack z-20"
                            onClick={() => setShowQrReader(false)}
                        >
                            &times;
                        </button>
                        <QrReader />
                    </div>
                </div>
            )}
        </div>
    );
};
