import { toast } from "../hooks/use-toast"

export const ToastWithCountdown = (
    message: string,
    description: string,
    onEnd: () => void,
    variant: "default" | "destructive" | null | undefined,
    duration?: number,
    progressBarColor?: string
    ) => {
        toast({
            title: message,
            variant: variant,
            duration: duration || 5000,
            description: (
                <div>
                    <p>{description}</p>
                    <div className="h-2 bg-gray-300 mt-2 relative overflow-hidden rounded">
                        <div
                            className="absolute top-0 left-0 h-full progress-bar"
                            style={{
                                "--duration": `${duration}ms`,
                                "--progress-color": progressBarColor
                            } as React.CSSProperties}
                        />
                    </div>
                </div>
            )
        })
    setTimeout(() => {
        onEnd()
    }, duration)
}