import {
  SearchIcon,
  Analytics02Icon,
  Clock05Icon,
  CheckmarkSquare03Icon,
  DocumentAttachmentIcon,
  InboxCheckIcon,
  UserGroupIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { ConditionalChatFab } from "@/components/conditional-chat-fab";
import { AppSidebar } from "@/components/shadcn/app-sidebar";
import { SiteHeader } from "@/components/shadcn/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const SIDEBAR_STYLE = "theme";
const menus = {
  navMain: [
    {
      title: "Overview",
      url: "/student/dashboard",
      icon: <HugeiconsIcon icon={Analytics02Icon} strokeWidth={2} />,
    },
    {
      title: "Outstanding Assessments",
      url: "/student/outstanding",
      icon: <HugeiconsIcon icon={Clock05Icon} strokeWidth={2} />,
    },
    {
      title: "Submitted Assessments",
      url: "/student/submissions",
      icon: <HugeiconsIcon icon={InboxCheckIcon} strokeWidth={2} />,
    },
    {
      title: "Graded Assessments",
      url: "/student/graded",
      icon: <HugeiconsIcon icon={CheckmarkSquare03Icon} strokeWidth={2} />,
    },
    {
      title: "Resources",
      url: "/student/resources",
      icon: <HugeiconsIcon icon={DocumentAttachmentIcon} strokeWidth={2} />,
    },
  ],
  navSecondary: [
    {
      title: "Classrooms",
      url: "/student/classrooms",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
    },
    {
      title: "Search",
      url: "/student/search",
      icon: <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />,
    },
  ],
  navMainGroup: {
    isGroup: true,
    label: "Student Options",
  },
};

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider
      role={SIDEBAR_STYLE}
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        logo="/images/logotype-0.png"
        menuItems={menus.navMain}
        secondaryItems={menus.navSecondary}
        mainNavGroup={menus.navMainGroup}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader />
        <main className="p-4">{children}</main>
        <ConditionalChatFab />
      </SidebarInset>
    </SidebarProvider>
  );
}
