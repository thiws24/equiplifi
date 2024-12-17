export interface KeyCloakUserInfo {
    email?: string
    email_verified: boolean
    sub: string
    groups: string[]
    family_name?: string
    given_name?: string
    name?: string
}
