import React, { use, useEffect, useRef } from "react"
import { SidebarProvider, SidebarTrigger, useSidebar } from "./ui/sidebar"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import QrReader from "./QrReader"
import { AppSidebar } from "./App-sidebar"
import { LogOut, ScanQrCode } from "lucide-react"
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar"
import { max } from "lodash"
import { Link } from "react-router-dom"
import { Toast } from "@radix-ui/react-toast"
import { ToastContainer } from "react-toastify"

interface Props {
    children: React.ReactNode
}

export const Layout: React.FC<Props> = ({ children }) => {
    const [showQrReader, setShowQrReader] = React.useState(false)
    const [showDropdown, setShowDropdown] = React.useState(false)
    const { authenticated, keycloak } = useKeycloak()
    const dropdownRef = useRef<HTMLDivElement>(null)

    const handleAvatarClick = () => {
        setShowDropdown(!showDropdown)
    }

    const handleLogout = () => {
        keycloak.logout()
    }

    const getInitials = () => {
        const firstName = keycloak.tokenParsed?.given_name || ""
        const lastName = keycloak.tokenParsed?.family_name || ""
        const username = keycloak.tokenParsed?.preferred_username || ""

        if (firstName && lastName) {
            return `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`
        } else {
            return username.substring(0, 2).toUpperCase()
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false)
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        console.log("Event listener added")

        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
            console.log("Event listener removed")
        }
    }, [dropdownRef])

    if (!authenticated) {
        return <div />
    }

    return (
        <SidebarProvider defaultOpen={false}>
            <div className="flex h-screen w-full">
                <div className="h-full z-50">
                    <AppSidebar />
                </div>
                {/* Header Content */}
                <div className="flex-1 flex flex-col w-full z-100">
                    <div className="bg-customBlack h-[45px] shrink-0 p-1 px-2 flex items-center justify-end max-[767px]:justify-between shadow-md">
                        <div className="hidden max-[767px]:flex items-center">
                            <SidebarTrigger />
                            <Link to="/">
                                <div className="flex items-center">
                                    <img
                                        src="/equipli-logo.svg"
                                        className="h-[32px] w-auto"
                                        alt="equipli Logo"
                                    />

                                    <span className="ml-2 text-xl text-customBeige pb-0.5">
                                        equipli
                                    </span>
                                </div>
                            </Link>
                        </div>
                        <div
                            className="relative inline-block"
                            ref={dropdownRef}
                        >
                            <Avatar
                                onClick={handleAvatarClick}
                                className="inline-flex size-[32px] select-none items-center justify-center overflow-hidden rounded-full align-middle cu"
                            >
                                <AvatarFallback className="leading-1 flex size-full items-center justify-center bg-customBeige text-[15px] font-medium text-violet11">
                                    {getInitials()}
                                </AvatarFallback>
                            </Avatar>

                            {showDropdown && (
                                <div className="z-50 absolute right-0 mt-0 w-48 bg-white border rounded shadow-lg">
                                    <div className="border-b">
                                        <div className="p-2 text-sm text-gray-600">
                                            Angemeldet als{" "}
                                            {
                                                keycloak.tokenParsed
                                                    ?.preferred_username
                                            }
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleLogout}
                                        className="block w-full px-4 py-2 text-left text-sm text-red-700 hover:bg-gray-100"
                                    >
                                        <LogOut className="inline-block w-4 h-4 mr-2" />
                                        Abmelden
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <main className="flex flex-col h-screen overflow-auto">
                        <ToastContainer />
                        {children}
                    </main>

                    {/* Floating Action Button */}
                    <button
                        onClick={() => setShowQrReader(true)}
                        className="fixed bottom-5 right-5 bg-orange-500 text-white rounded-full p-4 shadow-lg hover:bg-orange-600"
                    >
                        <ScanQrCode />
                    </button>
                </div>
                {/* QR Code Reader Modal */}{" "}
                {showQrReader && (
                    <div className="z-[100]">
                        <QrReader
                            onSuccess={(id: number) =>
                                window.open(`/item/${id}`, "_self")
                            }
                            setShowQrReader={setShowQrReader}
                        />
                    </div>
                )}
            </div>
        </SidebarProvider>
    )
}
