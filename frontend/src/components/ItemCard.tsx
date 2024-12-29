import * as React from "react"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "./ui/card"

export const ItemCard: React.FC<ItemDetailsProps> = ({
    id,
    name,
    description,
    icon,
    photoUrl,
}) => {
    return (
        <a href={`/category/${id}`} target="_self">
            <Card className="h-full bg-white text-customBlack">
                <CardHeader className="text-customBeige">
                    <CardTitle className="item-card-title text-customBlack">
                        {name}
                    </CardTitle>
                    <CardDescription className="item-card-description">
                        {description}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <img src={photoUrl} alt={name} className="w-full" />
                </CardContent>
            </Card>
        </a>
    )
}
