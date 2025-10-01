import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import {
  LayoutDashboard,
  Plus,
  History,
  Key,
  Workflow
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Create Stitch",
    url: createPageUrl("CreateIntegration"),
    icon: Plus,
  },
  {
    title: "Pattern Builder",
    url: createPageUrl("PatternBuilder"),
    icon: Workflow,
  },
  {
    title: "Run History",
    url: createPageUrl("RunHistory"),
    icon: History,
  },
  {
    title: "Credentials",
    url: createPageUrl("Credentials"),
    icon: Key,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [hoveredItem, setHoveredItem] = useState(null);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-soft-gray via-white to-soft-gray/50">
        <Sidebar className="bg-primary-dark-blue border-none fixed left-0 top-0 h-screen w-72 flex flex-col z-50 overflow-hidden" style={{ boxShadow: '8px 0 24px rgba(0, 0, 0, 0.15), 4px 0 8px rgba(0, 0, 0, 0.1), inset -1px 0 0 rgba(255, 255, 255, 0.05)', position: 'fixed', left: 0, top: 0, height: '100vh', width: '288px' }}>
          <SidebarHeader className="p-6 pb-8 flex-shrink-0">
            <div className="flex items-center justify-center">
              <img
                src="/Assets/CroppedAndTransparent.png"
                alt="Stitch"
                className="h-24 w-auto object-contain"
              />
            </div>
          </SidebarHeader>

          <SidebarContent className="flex-1 overflow-y-hidden overflow-x-hidden">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-2 px-3">
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <Link
                          to={item.url}
                          className={`
                            flex items-center gap-4 py-4 relative
                            rounded-lg transition-all duration-200
                            ${isActive
                              ? 'bg-accent-teal text-white font-semibold shadow-lg -mx-3 px-6'
                              : 'text-white hover:bg-[#142d45] hover:text-white px-3'
                            }
                          `}
                        >
                          <item.icon className="w-6 h-6 flex-shrink-0" />
                          <span className="text-base font-medium">
                            {item.title}
                          </span>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-white/10 flex-shrink-0">
            <div className="flex items-center gap-3 px-3 py-3 rounded-lg bg-[#0f2537] hover:bg-[#142d45] transition-colors">
              <div className="w-10 h-10 bg-accent-teal rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-sm">HR</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-accent-teal text-sm font-semibold truncate">HR Administrator</p>
                <p className="text-accent-teal text-xs truncate font-medium">Integration Manager</p>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col bg-soft-gray/30" style={{ marginLeft: '288px' }}>
          <header className="bg-white border-b border-soft-gray px-6 py-4 md:hidden shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-soft-gray p-2 rounded-lg transition-colors duration-200 text-primary-dark-blue" />
              <img
                src="/Assets/CroppedAndTransparent.png"
                alt="Stitch"
                className="h-8 w-auto object-contain"
              />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-[1600px] mx-auto px-8 py-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}