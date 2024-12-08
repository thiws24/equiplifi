export interface CategoryProps {
    id: number
    name: string
    description?: string
    icon: string
    photoUrl: string
    items: [id: number, status: string, location: string, urn: string]
}

// itemStatus Enum: [ OK, BROKEN, IN_MAINTENANCE, MAINTENANCE_REQUIRED, LOST ]
