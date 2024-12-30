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

export const InventoryPreviewCard: React.FC<ItemDetailsProps> = ({
    id,
    name,
    description,
    icon
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
            <Card className="h-60 w-60 bg-white text-customBlack border-none drop-shadow-xl flex flex-col justify-between">
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent rounded-lg"></div>
                <div className="absolute bottom-0 p-2 text-white">
                    <CardHeader className="text-white">
                        <CardTitle className="item-card-title text-lg flex items-center">
                            {name}
                        </CardTitle>
                        <CardDescription className="text-white line-clamp-2">
                            {description}
                        </CardDescription>
                    </CardHeader>
                </div>

                {loading ? (
                    <Skeleton className="w-full h-full rounded-lg bg-gray-200" />
                ) : (
                    <img
                        src={image || "/image-placeholder.jpg"}
                        alt={name}
                        className="inset-0 w-full h-full rounded-lg object-cover"
                    />
                )}
            </Card>
        </a>
    )
}

export default InventoryPreviewCard
