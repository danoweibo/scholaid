"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
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

export function NavMain({
  items,
  groupLabel = "Menu Options",
  showGroupLabel = true,
  navAction,
}: {
  groupLabel?: string;
  showGroupLabel?: boolean;
  items: NavItem[];
  navAction?: NavAction;
}) {
  const router = useRouter();

  return (
    <SidebarGroup>
      {showGroupLabel && <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>}
      <SidebarGroupContent className="flex flex-col gap-2">
        {navAction && ( // ✅ only render if provided
          <SidebarMenu>
            <SidebarMenuItem className="flex items-center gap-2">
              <SidebarMenuButton
                tooltip={navAction.primary.tooltip ?? navAction.primary.title}
                className="bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground min-w-8 duration-200 ease-linear"
                onClick={() => router.push(navAction.primary.url)}
              >
                {navAction.primary.icon}
                <span>{navAction.primary.title}</span>
              </SidebarMenuButton>
              <Button
                size="icon"
                className="size-8 group-data-[collapsible=icon]:opacity-0"
                variant="outline"
                onClick={() => router.push(navAction.secondary.url)}
              >
                {navAction.secondary.icon}
                <span className="sr-only">{navAction.secondary.title}</span>
              </Button>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={<a href={item.url} className="cursor-pointer" />}
              >
                {item.icon}
                <span className="valuespott">{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
