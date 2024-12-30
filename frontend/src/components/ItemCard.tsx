import * as React from "react"
import { ItemDetailsProps } from "../interfaces/ItemDetailsProps"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { fetchImage } from "../services/fetchImage"

export const ItemCard: React.FC<ItemDetailsProps> = ({
    id,
    name,
    description,
    icon,
    photoUrl
}) => {
    const { token } = useKeycloak()
    const [image, setImage] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(true)

    React.useEffect(() => {
        const fetchItemImage = async () => {
            try {
                const fetchedImage = await fetchImage(id, token ?? "")
                setImage(fetchedImage)
            } catch (error) {
                setImage("/image-placeholder.jpg")
            } finally {
                setLoading(false)
            }
        }

        fetchItemImage()
    }, [id, token])

    return (
        <a href={`/category/${id}`} target="_self">
            <Card className="h-full bg-white text-customBlack border-none drop-shadow-xl flex flex-col justify-between">
                <div>
                    <CardHeader className="text-customBeige">
                        <CardTitle className="item-card-title text-customBlack text-lg flex items-center">
                            {icon && <span className="mr-1">{icon}</span>}
                            {name}
                        </CardTitle>
                        <CardDescription className="item-card-description">
                            {description}
                        </CardDescription>
                    </CardHeader>
                </div>
                <CardContent className="mt-auto">
                    {loading ? (
                        <Skeleton className="w-full h-[200px] rounded-lg bg-gray-200" />
                    ) : (
                        <img
                            src={image || "/image-placeholder.jpg"}
                            alt={name}
                            className="inset-0 w-full h-full rounded-lg object-cover"
                        />
                    )}
                </CardContent>
            </Card>
        </a>
    )
}
