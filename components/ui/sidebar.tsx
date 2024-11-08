"use client";

import { Home, BookMarked } from "lucide-react";

import Link from "next/link";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

import { useSidebar } from "@/contexts/SidebarContext";



export function Sidebar() {

  const pathname = usePathname();

  const { isOpen } = useSidebar();



  return (

    <div

      className={cn(

        "fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] w-56 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-transform duration-300",

        !isOpen && "-translate-x-full"

      )}

    >

      <div className="space-y-4 py-4">

        <div className="px-3 py-2">

          <div className="space-y-1">

            <Link

              href="/"

              className={cn(

                "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",

                pathname === "/" ? "bg-accent" : "transparent"

              )}

            >

              <Home className="mr-2 h-4 w-4" />

              Generate

            </Link>

            <Link

              href="/saved"

              className={cn(

                "flex items-center rounded-lg px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",

                pathname === "/saved" ? "bg-accent" : "transparent"

              )}

            >

              <BookMarked className="mr-2 h-4 w-4" />

              Saved Posts

            </Link>

          </div>

        </div>

      </div>

    </div>

  );

} 






