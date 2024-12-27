import { ReservationItemProps } from "./ReservationItemProps"

export interface ProcessDataValueProps extends ReservationItemProps {
    id: number
    userId: string
    itemId: number
    categoryId: number
    status?: string
}
