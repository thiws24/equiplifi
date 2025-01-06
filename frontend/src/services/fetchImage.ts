export async function fetchImage(categoryId: number, token: string): Promise<string> {
    let imageUrl = ""
    try {
        const res = await fetch(
            `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${categoryId}/image`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "image/jpeg"
                }
            }
        )

        if (res.ok) {
            const blob = await res.blob()
            imageUrl = URL.createObjectURL(blob)
        } else {
            console.error("Error fetching image. Status:", res.status)
            imageUrl = "/image-placeholder.jpg"
        }
    } catch (e) {
        console.error('Error fetching image', e)
        imageUrl = "/image-placeholder.jpg"
    }

    return imageUrl
}