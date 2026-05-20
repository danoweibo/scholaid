import {
  Folder01Icon,
  UserGroupIcon,
  Settings05Icon,
  SearchIcon,
  Analytics02Icon,
  DocumentCodeIcon,
  PlusSignCircleIcon,
  BotIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { AppSidebar } from "@/components/shadcn/app-sidebar";
import { ChartAreaInteractive } from "@/components/shadcn/chart-area-interactive";
import { DataTable } from "@/components/shadcn/data-table";
import { SectionCards } from "@/components/shadcn/section-cards";
import { SiteHeader } from "@/components/shadcn/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import data from "./data.json";

const SIDEBAR_STYLE = "default";
const menus = {
  navMain: [
    {
      title: "Overview",
      url: "/lecturer/dashboard",
      icon: <HugeiconsIcon icon={Analytics02Icon} strokeWidth={2} />,
    },
    {
      title: "Assessments",
      url: "/lecturer/assessments",
      icon: <HugeiconsIcon icon={Folder01Icon} strokeWidth={2} />,
    },
    {
      title: "Courseware",
      url: "/lecturer/courseware",
      icon: <HugeiconsIcon icon={DocumentCodeIcon} strokeWidth={2} />,
    },
    {
      title: "Classrooms",
      url: "/lecturer/classrooms",
      icon: <HugeiconsIcon icon={UserGroupIcon} strokeWidth={2} />,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "/lecturer/settings",
      icon: <HugeiconsIcon icon={Settings05Icon} strokeWidth={2} />,
    },
    {
      title: "Search",
      url: "/lecturer/search",
      icon: <HugeiconsIcon icon={SearchIcon} strokeWidth={2} />,
    },
  ],
  navMainGroup: {
    isGroup: true,
    label: "Lecturer Options",
  },
  navAction: {
    primary: {
      title: "New Assessment",
      url: "/lecturer/assessments/new",
      icon: <HugeiconsIcon icon={PlusSignCircleIcon} strokeWidth={2} />,
      tooltip: "New Assessment",
    },
    secondary: {
      title: "Scholaid Assist",
      url: "/lecturer/assist",
      icon: <HugeiconsIcon icon={BotIcon} strokeWidth={2} />,
    },
  },
};

export default function Page() {
  return (
    <SidebarProvider
      role={SIDEBAR_STYLE} // ✅ pass the style as a prop to the provider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        logo="/images/logotype-1.png"
        menuItems={menus.navMain}
        secondaryItems={menus.navSecondary}
        mainNavGroup={menus.navMainGroup}
        navAction={menus.navAction}
        variant="inset"
      />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <SectionCards />
              <div className="px-4 lg:px-6">
                <ChartAreaInteractive />
              </div>
              <DataTable data={data} />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
