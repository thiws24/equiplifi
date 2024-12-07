import {ChevronUp, Home, Inbox, LogOutIcon, User2} from "lucide-react"
import {
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, SidebarProvider, useSidebar,
} from "./ui/sidebar"
import {Sidebar} from "./ui/sidebar"
import React from "react";
import { KeycloakProvider, useKeycloak } from "../keycloak/KeycloakProvider";



const itemsLagerwart = [
    {
        title: "Neues Inventar erfassen",
        url: "http://localhost:3000/category/create",
        icon: Inbox,
    }
]
const itemsAllgemein = [
    {
        title: "Startseite",
        url: "http://localhost:3000",
        icon: Home,
    }
]
const footer = [
    {
        title: "Abmelden",
        url: "http://localhost:3000",
        icon: LogOutIcon,
    }
]


export function AppSidebar() {

    const { keycloak } = useKeycloak();
    async function handleLogout() {
        try {
            await keycloak?.logout()
        } catch (e) {
            console.log(e);
        }
    }
    return (
        (
            <Sidebar collapsible='icon'>
                <SidebarHeader>
                    <img src="/equipli-logo.svg" className="w-12 h-auto" alt="equipli logo"/>
                </SidebarHeader>
                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupLabel className='text-xl text-customBlue'>Allgemein</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {itemsAllgemein.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild
                                                           className="bg-customBeige text-customOrange hover:bg-customRed hover:text-customBeige">
                                            <a href={item.url} className="flex items-center gap-2">
                                                {item.icon && <item.icon/>}
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                    <SidebarGroup>
                        <SidebarGroupLabel className='text-xl text-customBlue'>Lagerwart</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {itemsLagerwart.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton asChild
                                                           className="bg-customBeige text-customOrange hover:bg-customRed hover:text-customBeige">
                                            <a href={item.url} className="flex items-center gap-2">
                                                {item.icon && <item.icon/>}
                                                <span>{item.title}</span>
                                            </a>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>

                {/* Footer der Sidebar */}
                <SidebarFooter>
                    <SidebarMenu>
                        {footer.map((item) => (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton
                                    className="bg-customBeige text-customOrange hover:bg-customRed hover:text-customBeige flex items-center gap-2"
                                    onClick={item.title === "Abmelden" ? handleLogout : undefined}
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        ))}
                    </SidebarMenu>
                </SidebarFooter>
            </Sidebar>
        ));
}