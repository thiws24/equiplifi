import React from "react"
import { toast } from "react-toastify"
import { CheckCircle } from "lucide-react"
import { FaExclamationCircle } from "react-icons/fa"
import "react-toastify/dist/ReactToastify.css"

type ToastProps = {
    message: string
    onClose?: () => void
    duration?: number
};

export const CustomToasts = {
    success: ({ message, onClose, duration }: ToastProps) => {
        toast.success(
            <div style={{ display: "flex", alignItems: "center" }}>
                <CheckCircle color="#5588c7" size={24} style={{ marginRight: "10px" }} />
                <span className="mr-1 ml-1">{message}</span>
            </div>,
            {
                className: "custom-toast",
                pauseOnFocusLoss: false,
                position: "top-center",
                style: {
                    backgroundColor: "#5588c7"
                },
                icon: false,
                onClose: onClose || undefined,
                autoClose: duration || 5000
            }
        )
    },
    error: ({ message, onClose, duration }: ToastProps) => {
        toast.error(
            <div style={{ display: "flex", alignItems: "center" }}>
                <FaExclamationCircle color="red" size={32} style={{ marginRight: "10px" }} />
                <span className="mr-1 ml-1">{message}</span>
            </div>,
            {
                className: "custom-toast",
                pauseOnFocusLoss: false,
                position: "top-center",
                style: {
                    backgroundColor: "red"
                },
                icon: false,
                onClose: onClose || undefined,
                autoClose: duration || 5000
            }
        )
    }
}

export default CustomToasts