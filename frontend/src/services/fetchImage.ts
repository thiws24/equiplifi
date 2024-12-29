export async function fetchImage(categoryId: number, token: string): Promise<string> {
    let base64 = ""
    try {
        const res = await fetch(
            `${import.meta.env.VITE_INVENTORY_SERVICE_HOST}/categories/${categoryId}/image`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        )

        if (res.ok) {
            base64 = "data:image/jpeg;base64," + await res.text()
        }
    } catch (e) {
        console.error('Error fetching image', e)
    }

    return base64
}