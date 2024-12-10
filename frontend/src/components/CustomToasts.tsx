import React from "react"
import { toast } from "react-toastify"
import { FaExclamationCircle, FaCheckCircle } from "react-icons/fa"
import "react-toastify/dist/ReactToastify.css"

type ToastProps = {
    message: string
    onClose?: () => void
};

export const CustomToasts = {
    success: ({ message, onClose }: ToastProps) => {
        toast.success(
            <div style={{ display: "flex", alignItems: "center" }}>
                <FaCheckCircle color="#F27428" size={24} style={{ marginRight: "10px" }} />
                <span>{message}</span>
            </div>,
            {
                className: "custom-toast",
                pauseOnFocusLoss: false,
                position: "top-center",
                progressStyle: {
                    backgroundColor: "#F27428"
                },
                icon: false,
                onClose: onClose || undefined
            }
        )
    },
    error: ({ message, onClose }: ToastProps) => {
        toast.error(
            <div style={{ display: "flex", alignItems: "center" }}>
                <FaExclamationCircle color="red" size={48} style={{ marginRight: "10px" }} />
                <span>{message}</span>
            </div>,
            {
                className: "custom-toast",
                pauseOnFocusLoss: false,
                position: "top-center",
                progressStyle: {
                    backgroundColor: "red" // Fehler-Fortschrittsleisten-Farbe
                },
                icon: false, // Standard-Icon deaktivieren
                onClose: onClose || undefined // Optionales Routing oder Aktion
            }
        )
    }
}

export default CustomToasts