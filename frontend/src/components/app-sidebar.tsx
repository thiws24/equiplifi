import {Calendar, ChevronUp, Home, Inbox, Search, Settings, User2} from "lucide-react"
import {
    SidebarContent, SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel, SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem, SidebarProvider,
} from "./ui/sidebar"
import { Sidebar } from "./ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "./ui/dropdown-menu";
import React from "react";

// Menu items.
const items = [
    {
        title: "Home",
        url: "#",
        icon: Home,
    },
    {
        title: "Item erstellen",
        url: "#",
        icon: Inbox,
    }
]

export function AppSidebar() {
    return (
        (
            <SidebarProvider>
                <Sidebar>
                    {/* Hauptinhalt der AppSidebar */}
                    <SidebarContent>
                        <SidebarGroup>
                            <SidebarGroupLabel className='text-xl text-customBlack'>Lagerwart</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {items.map((item) => (
                                        <SidebarMenuItem key={item.title}>
                                            <SidebarMenuButton asChild className="bg-customOrange text-customBeige">
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

                    {/* Footer der AppSidebar */}
                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button className="flex items-center gap-2">
                                            <User2 /> Username
                                            <ChevronUp className="ml-auto" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent side="top" className="bg-white shadow-lg rounded-md">
                                        <DropdownMenuItem>
                                            <span>Abmelden</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>
            </SidebarProvider>
        ));
}