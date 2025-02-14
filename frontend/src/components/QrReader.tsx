import React, { useEffect, useRef, useState } from "react"

// Qr Scanner
import QrScanner from "qr-scanner"
import QrFrame from "../assets/qr-frame.svg"

interface Props {
    onSuccess?: (id: number) => void
    setShowQrReader: (showQrReader: boolean) => void
}

const QrReader = (props: Props) => {
    // QR States
    const scanner = useRef<QrScanner>(null)
    const videoEl = useRef<HTMLVideoElement>(null)
    const qrBoxEl = useRef<HTMLDivElement>(null)
    const [qrOn, setQrOn] = useState<boolean>(true)
    let loading: boolean = false
    // Success
    const onScanSuccess = (result: QrScanner.ScanResult) => {
        if (loading) return
        const urn = result.data

        if (urn.startsWith("urn:de.equipli:item:")) {
            loading = true
            const id = urn.split(":").pop()
            console.log(`Extracted ID: ${id}`)

            if (props.onSuccess) props?.onSuccess(Number(id))

        } else {
            console.error(
                "Ungültige URN. Das Format muss 'urn:de.equipli:item:<id>' sein."
            )
        }

        setTimeout(() => loading = false, 2000)
    }

    // Fail
    const onScanFail = (err: string | Error) => {
        // 🖨 Print the "err" to browser console.
        console.log(err)
    }

    useEffect(() => {
        if (videoEl?.current && !scanner.current) {
            // 👉 Instantiate the QR Scanner
            scanner.current = new QrScanner(videoEl?.current, onScanSuccess, {
                onDecodeError: onScanFail,
                // 📷 This is the camera facing mode. In mobile devices, "environment" means back camera and "user" means front camera.
                preferredCamera: "environment",
                // 🖼 This will help us position our "QrFrame.svg" so that user can only scan when qr code is put in between our QrFrame.svg.
                highlightScanRegion: true,
                // 🔥 This will produce a yellow (default color) outline around the qr code that we scan, showing a proof that our qr-scanner is scanning that qr code.
                highlightCodeOutline: true,
                // 📦 A custom div which will pair with "highlightScanRegion" option above 👆. This gives us full control over our scan region.
                overlay: qrBoxEl?.current || undefined
            })

            // 🚀 Start QR Scanner
            scanner.current
                ?.start()
                .then(() => setQrOn(true))
                .catch((err) => {
                    if (err) setQrOn(false)
                })
        }

        // 🧹 Clean up on unmount.
        // 🚨 This removes the QR Scanner from rendering and using camera when it is closed or removed from the UI.
        return () => {
            if (!videoEl?.current) {
                scanner?.current?.stop()
            }
        }
    }, [])

    useEffect(() => {
        if (!qrOn)
            alert(
                "Kamera kann nicht verwendet werden. Bitte überprüfe die Einstellungen im Browser und lade die Seite neu"
            )
    }, [qrOn])

    return (
        <div className="fixed inset-0 bg-customBlack bg-opacity-50 flex justify-center items-center z-10">
            <div className="bg-customBeige p-4 rounded-lg shadow-lg relative">
                <button
                    className="absolute top-4 right-6 text-customRed text-5xl hover:text-customBlack z-20"
                    onClick={() => props.setShowQrReader(false)}
                >
                    &times;
                </button>
                <div className="w-full sm:w-[430px] h-screen mx-auto relative">
                    {/* QR */}
                    <video ref={videoEl} className="w-full h-full object-cover"></video>
                    <div ref={qrBoxEl} className="w-full left-0">
                        <img
                            src={QrFrame}
                            alt="Qr Frame"
                            width={256}
                            height={256}
                            className="absolute left-1/2 top-1/2 transform -translate-x-[calc(50%-1px)] -translate-y-1/2 ml-[10px]"
                        />
                    </div>
                </div>
            </div>
        </div>
    )
}

export default QrReader
