import * as React from "react"
import QrReader from "./QrReader"
import { CheckCircleIcon } from "lucide-react"
import CustomToasts from "./CustomToasts"

interface Props {
    itemId: number
    alreadyScanned: boolean
    reservationId: number
    confirmLending: (reservationId: number) => Promise<boolean>
}

export const ItemScan: React.FC<Props> = ({ itemId, alreadyScanned, reservationId, confirmLending }) => {
    const [openQrScanner, setOpenQrScanner] = React.useState<boolean>(false)
    const [scanned, setScanned] = React.useState<boolean>(alreadyScanned)
    async function handleSuccess(foundItemId: number) {
        if (foundItemId === itemId && !alreadyScanned) {
            const confirmed = await confirmLending(reservationId)
            if (confirmed) {
                setOpenQrScanner(false)
                setScanned(true)
            }
        } else {
            CustomToasts.error({
                message: `Der gescannte Item entspricht nicht dem zu abholende Item: ${itemId}.`
            })
        }
    }

    return (
        <div>
            <div className="flex items-center gap-2">
                <div>Item <b>{itemId}</b>:</div>
                {!scanned ? <div onClick={() => setOpenQrScanner(true)}
                                     className="cursor-pointer text-sm text-customBlue underline underline-offset-4">Scanner öffnen</div> :
                    <CheckCircleIcon />}
            </div>
            {openQrScanner && <QrReader onSuccess={(id: number) => handleSuccess(id)} setShowQrReader={setOpenQrScanner} />}
        </div>
    )
}