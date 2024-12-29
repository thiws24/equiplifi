import { Home, LogOutIcon, ScrollText, SquarePlus } from "lucide-react"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarTrigger,
    useSidebar
} from "./ui/sidebar"
import { useKeycloak } from "../keycloak/KeycloakProvider"
import { Link } from "react-router-dom"

const itemsLagerwart = [
    {
        title: "Neues Inventar erfassen",
        url: "/category/create",
        icon: SquarePlus
    }
]
const itemsAllgemein = [
    {
        title: "Startseite",
        url: "/",
        icon: Home
    },
    {
        title: "Reservierungen",
        url: "/reservations",
        icon: ScrollText
    }
]

export function AppSidebar() {
    const { keycloak, userInfo } = useKeycloak()
    const { open } = useSidebar()

    async function handleLogout() {
        try {
            await keycloak?.logout()
        } catch (e) {
            console.log(e)
        }
    }

    const isInventoryManager = userInfo?.groups?.includes("Inventory-Manager")

    return (
        <Sidebar collapsible="icon" className="border-none">
            <SidebarHeader className="bg-customBlack h-[45px]">
                <Link to="/">
                    <div className="flex items-center">
                        <img
                            src="/equipli-logo.svg"
                            className="h-[32px] w-auto"
                            alt="equipli Logo"
                        />

                        <span className="ml-2 text-xl text-customBeige pb-0.5">
                            equipli
                        </span>
                    </div>
                </Link>
            </SidebarHeader>
            <SidebarContent className="bg-customBeige border-r-[1px] border-gray-600">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {itemsAllgemein.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className="bg-customBeige text-customOrange hover:bg-customRed hover:text-customBeige"
                                    >
                                        <a
                                            href={item.url}
                                            className="flex items-center gap-2"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                {isInventoryManager && (
                    <SidebarGroup>
                        <SidebarGroupLabel className="text-xl text-customBlue">
                            Lagerwart
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {itemsLagerwart.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className="bg-customBeige text-customOrange hover:bg-customRed hover:text-customBeige"
                                        >
                                            <a
                                                href={item.url}
                                                className="flex items-center gap-2"
                                            >
                                                {item.icon && <item.icon />}
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                )}
            </SidebarContent>

            {/* Footer der Sidebar */}
            <SidebarFooter className="bg-customBeige border-r-[1px] border-gray-600">
                <div className="flex justify-end w-full">
                    <SidebarTrigger />
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
