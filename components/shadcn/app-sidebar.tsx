"use client";

import * as React from "react";
import Image from "next/image";
import { NavMain } from "@/components/shadcn/nav-main";
import { NavSecondary } from "@/components/shadcn/nav-secondary";
import { NavUser } from "@/components/shadcn/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

type NavItem = {
  title: string;
  url: string;
  icon: React.ReactNode;
};

type NavActionItem = NavItem & { tooltip?: string };

type NavAction = {
  primary: NavActionItem;
  secondary: NavItem;
};

type NavMainGroup = {
  isGroup: boolean;
  label?: string;
};

export function AppSidebar({
  logo,
  menuItems,
  secondaryItems,
  mainNavGroup,
  navAction,
  ...props
}: {
  logo: string;
  menuItems: NavItem[];
  secondaryItems: NavItem[];
  mainNavGroup: NavMainGroup;
  navAction?: NavAction;
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<a href="#" />}
            >
              <Image
                src={logo}
                alt="Scholaid"
                width={120}
                height={30}
                className="h-auto w-30 object-contain"
                priority
              />
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain
          groupLabel={mainNavGroup.label}
          showGroupLabel={mainNavGroup.isGroup}
          items={menuItems}
          navAction={navAction}
        />
        <NavSecondary items={secondaryItems} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  );
}
