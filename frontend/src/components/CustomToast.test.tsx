import React from "react"
import { render, screen } from "@testing-library/react"
import { toast } from "react-toastify"
import CustomToasts from "./CustomToasts"
import { vi, afterEach, test, expect, describe } from "vitest"

// Mock toast
vi.mock("react-toastify", () => ({
    toast: {
        success: vi.fn(),
        error: vi.fn(),
    },
}));

describe("CustomToasts", () => {
    afterEach(() => {
        vi.clearAllMocks();
    });

    test("success toast renders with correct props", () => {
        const onCloseMock = vi.fn();

        CustomToasts.success({
            message: "Operation erfolgreich",
            onClose: onCloseMock,
            duration: 3000,
        });

        expect(toast.success).toHaveBeenCalledTimes(1);

        const toastProps = (toast.success as ReturnType<typeof vi.fn>).mock.calls[0][1];
        expect(toastProps).toMatchObject({
            className: "custom-toast",
            pauseOnFocusLoss: false,
            position: "top-center",
            style: { backgroundColor: "#5588c7" },
            icon: false,
            onClose: onCloseMock,
            autoClose: 3000,
        });
    });

    test("error toast renders with correct props", () => {
        const onCloseMock = vi.fn();

        CustomToasts.error({
            message: "Es ist ein Fehler aufgetreten",
            onClose: onCloseMock,
            duration: 4000,
        });

        expect(toast.error).toHaveBeenCalledTimes(1);

        const toastProps = (toast.error as ReturnType<typeof vi.fn>).mock.calls[0][1];
        expect(toastProps).toMatchObject({
            className: "custom-toast",
            pauseOnFocusLoss: false,
            position: "top-center",
            style: { backgroundColor: "red" },
            icon: false,
            onClose: onCloseMock,
            autoClose: 4000,
        });
    });

    test("success toast displays correct message", () => {
        CustomToasts.success({
            message: "Test Erfolg",
        });

        const toastContent = (toast.success as ReturnType<typeof vi.fn>).mock.calls[0][0];
        render(toastContent);
        expect(screen.getByText("Test Erfolg")).toBeInTheDocument();
    });

    test("error toast displays correct message", () => {
        CustomToasts.error({
            message: "Test Fehler",
        });

        const toastContent = (toast.error as ReturnType<typeof vi.fn>).mock.calls[0][0];
        render(toastContent);
        expect(screen.getByText("Test Fehler")).toBeInTheDocument();
    });

    test("onClose callback is triggered when success toast closes", () => {
        const onCloseMock = vi.fn();

        CustomToasts.success({
            message: "Test Erfolg",
            onClose: onCloseMock,
        });

        const toastProps = (toast.success as ReturnType<typeof vi.fn>).mock.calls[0][1];
        toastProps.onClose();
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });

    test("onClose callback is triggered when error toast closes", () => {
        const onCloseMock = vi.fn();

        CustomToasts.error({
            message: "Test Fehler",
            onClose: onCloseMock,
        });

        const toastProps = (toast.error as ReturnType<typeof vi.fn>).mock.calls[0][1];
        toastProps.onClose();
        expect(onCloseMock).toHaveBeenCalledTimes(1);
    });
});

