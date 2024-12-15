import { render, screen } from "@testing-library/react";
import {
    ToastProvider,
    Toast,
    ToastTitle,
    ToastDescription,
    ToastViewport,
} from "./ui/toast";

const renderToast = (ui: any) => {
    return render(
        <ToastProvider>
            {ui}
            <ToastViewport />
        </ToastProvider>
    );
};

describe("Toast Component", () => {
    test("renders Toast with title and description", () => {
        renderToast(
            <Toast>
                <ToastTitle>Test Title</ToastTitle>
                <ToastDescription>Test Description</ToastDescription>
            </Toast>
        );

        expect(screen.getByText("Test Title")).toBeInTheDocument();
        expect(screen.getByText("Test Description")).toBeInTheDocument();
    });

    test("renders Toast with default variant styling", () => {
        renderToast(<Toast>Default Variant</Toast>);

        const toast = screen.getByText("Default Variant");
        expect(toast).toHaveClass("bg-background", "text-foreground");
    });

    test("renders Toast with destructive variant styling", () => {
        renderToast(<Toast variant="destructive">Destructive Variant</Toast>);

        const toast = screen.getByText("Destructive Variant");
        expect(toast).toHaveClass("bg-destructive", "text-destructive-foreground");
    });

    test("supports swipe-to-dismiss interaction", () => {
        // This test requires mocking gestures or ensuring Radix's behavior is covered in end-to-end tests.
        renderToast(<Toast>Swipe Dismiss Test</Toast>);

        const toast = screen.getByText("Swipe Dismiss Test");
        expect(toast).toHaveAttribute("data-state", "open");

        // Simulate swipe behavior (optional: requires library-specific mocking or Radix integration testing)
    });

    test("renders multiple toasts", () => {
        renderToast(
            <>
                <Toast>
                    <ToastTitle>Toast 1</ToastTitle>
                </Toast>
                <Toast>
                    <ToastTitle>Toast 2</ToastTitle>
                </Toast>
            </>
        );

        expect(screen.getByText("Toast 1")).toBeInTheDocument();
        expect(screen.getByText("Toast 2")).toBeInTheDocument();
    });
});
