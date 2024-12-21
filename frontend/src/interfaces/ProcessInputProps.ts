import { ReservationItemProps } from "./ReservationItemProps"

export interface ProcessInputProps extends ReservationItemProps {
    userId: string
    userName: string
    itemId: number
    count: number
    categoryId: number
    categoryName?: number
}
