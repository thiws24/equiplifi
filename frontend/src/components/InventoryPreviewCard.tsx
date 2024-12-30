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
            {loading ? (
                <Skeleton className="h-60 w-60 rounded-lg bg-gray-200 bg-gradient-to-b from-transparent to-black" />
            ) : (
                <Card className="h-60 w-60 relative bg-cover bg-center bg-no-repeat border-none flex flex-col justify-end rounded-lg" style={{ backgroundImage: `url(${image || "/image-placeholder.jpg"})` }}>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black rounded-lg" />
                    <div className="relative z-10">
                        <CardHeader className="text-white mt-auto">
                            <CardTitle className="text-lg flex items-center">
                                {name}
                            </CardTitle>
                            <CardDescription className="text-white line-clamp-2">
                                {description}
                            </CardDescription>
                        </CardHeader>
                    </div>
                </Card>
            )}
        </a>
    )
}

export default InventoryPreviewCard
