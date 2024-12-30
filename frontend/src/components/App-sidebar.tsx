import { CalendarDays, Home, Package, SquarePlus } from "lucide-react"
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
        title: "Inventar",
        url: "/inventory",
        icon: Package
    },
    {
        title: "Reservierungen",
        url: "/reservations",
        icon: CalendarDays
    }
]

export function AppSidebar() {
    const { keycloak, userInfo } = useKeycloak()
    const { open } = useSidebar()

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
            <SidebarContent className="bg-customBeige border-r-2 border-[#B8AC9C]">
                <SidebarGroup>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {itemsAllgemein.map((item) => (
                                <SidebarMenuItem key={item.title}>
                                    <SidebarMenuButton
                                        asChild
                                        className="text-customBlack hover:bg-customBeige hover:text-customOrange"
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
                        <SidebarGroupLabel className="text-customBlack font-bold">
                            Lagerwart
                        </SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {itemsLagerwart.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            asChild
                                            className="text-customBlack hover:bg-customBeige hover:text-customOrange"
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
            <SidebarFooter className="bg-customBeige border-r-2 border-[#B8AC9C]">
                <div className="flex justify-end w-full">
                    <SidebarTrigger />
                </div>
            </SidebarFooter>
        </Sidebar>
    )
}
