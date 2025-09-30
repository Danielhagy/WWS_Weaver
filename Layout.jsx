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
    title: "Create Integration",
    url: createPageUrl("CreateIntegration"),
    icon: Plus,
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
      <div className="min-h-screen flex w-full bg-gradient-to-br from-slate-700 via-slate-600 to-slate-800">
        <Sidebar className="border border-gray-300/50 bg-gray-50 rounded-2xl overflow-hidden m-4 mr-0 h-[calc(100vh-2rem)]" style={{ boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1125), 0 4px 20px rgba(0, 0, 0, 0.075), inset 0 1px 0 rgba(255, 255, 255, 0.6)' }}>
          <SidebarHeader className="border-b border-gray-200 p-4 bg-white">
            <div className="flex items-center justify-start gap-2 max-w-full">
              <img
                src="/Assets/BrandLogo.png"
                alt="Workday Weaver Logo"
                className="h-15 w-auto object-contain flex-shrink-0"
                style={{ height: '3.75rem' }}
              />
              <img
                src="/Assets/BrandNameV2.png"
                alt="Workday Weaver"
                className="h-12 w-auto object-contain flex-shrink-0"
              />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4 pt-6 pb-4 flex-1">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const isActive = location.pathname === item.url;
                    const isHovered = hoveredItem === item.title;

                    return (
                      <SidebarMenuItem key={item.title}>
                        <Link
                          to={item.url}
                          className={`
                            flex items-center gap-3 px-2 py-3 relative
                            rounded-xl mb-2 overflow-hidden
                            transition-all duration-300 ease-out
                            text-gray-700 border border-transparent
                            ${isActive
                              ? 'bg-green-400/30 shadow-lg shadow-green-400/50 scale-[1.02] font-semibold text-slate-900 border-green-400/40'
                              : 'hover:bg-gray-200'
                            }
                            ${isHovered && !isActive
                              ? 'bg-green-100 text-green-700 translate-x-1 border-green-300'
                              : ''
                            }
                          `}
                          style={{
                            boxShadow: isActive ? '0 0 15px rgba(74, 222, 128, 0.3), 0 0 25px rgba(74, 222, 128, 0.15)' : ''
                          }}
                          onMouseEnter={() => setHoveredItem(item.title)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <item.icon
                            className={`
                              w-5 h-5 transition-all duration-300
                              ${isActive ? 'scale-110 text-green-600' : 'text-gray-600'}
                              ${isHovered && !isActive ? 'scale-105 rotate-3 text-green-600' : ''}
                            `}
                          />
                          <span className={`
                            font-medium transition-all duration-300
                            ${isActive ? 'tracking-wide' : ''}
                            ${isHovered && !isActive ? 'tracking-wide' : ''}
                          `}>
                            {item.title}
                          </span>

                          {/* Animated border effect */}
                          {(isHovered || isActive) && (
                            <div
                              className={`
                                absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-green-400 to-cyan-400
                                ${isActive ? 'opacity-100 w-1.5' : 'opacity-70'}
                              `}
                              style={{
                                animation: isHovered && !isActive ? 'slideDown 0.3s ease-out' : 'none'
                              }}
                            />
                          )}
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <style jsx>{`
            @keyframes slideDown {
              from {
                transform: translateY(-100%);
              }
              to {
                transform: translateY(0);
              }
            }
          `}</style>
        </Sidebar>

        {/* Fixed User Info at Bottom Left */}
        <div
          className="fixed z-50 bg-white border-2 border-gray-300 rounded-lg shadow-xl p-3 max-w-xs"
          style={{ bottom: '1.5rem', left: '1.5rem' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 min-w-[2.25rem] min-h-[2.25rem] bg-gradient-to-br from-cyan-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white font-semibold text-sm">HR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-gray-800 text-sm truncate">HR Administrator</p>
              <p className="text-xs text-gray-600 truncate">Integration Manager</p>
            </div>
          </div>
        </div>

        <main className="flex-1 flex flex-col">
          <header className="bg-slate-800/95 backdrop-blur-sm border-b border-cyan-500/20 px-6 py-4 md:hidden shadow-sm sticky top-0 z-30">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-cyan-500/10 p-2 rounded-lg transition-colors duration-200 text-gray-300" />
              <img
                src="/Assets/BrandName.png"
                alt="Workday Weaver"
                className="h-8 w-auto object-contain"
              />
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}