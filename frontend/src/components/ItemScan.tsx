import * as React from "react"
import QrReader from "./QrReader"
import { CheckCircleIcon } from "lucide-react"
import CustomToasts from "./CustomToasts"

interface Props {
    itemId: number
    itemStatus?: string
    reservationId: number
    confirmLending: (reservationId: number) => Promise<boolean>
}

export const ItemScan: React.FC<Props> = ({ itemId, itemStatus, reservationId, confirmLending }) => {
    const [openQrScanner, setOpenQrScanner] = React.useState<boolean>(false)
    const [status, setStatus] = React.useState<string | undefined>(itemStatus)
    async function handleSuccess(foundItemId: number) {
        if (foundItemId === itemId && !itemStatus) {
            const confirmed = await confirmLending(reservationId)
            if (confirmed) {
                setOpenQrScanner(false)
                setStatus("confirmed")
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
                {!status ? <div onClick={() => setOpenQrScanner(true)}
                                     className="cursor-pointer text-sm text-customBlue underline underline-offset-4">Scanner öffnen</div> :
                    <CheckCircleIcon />}
            </div>
            {openQrScanner && <QrReader onSuccess={(id: number) => handleSuccess(id)} setShowQrReader={setOpenQrScanner} />}
        </div>
    )
}