"use client";

import { Menu, Moon, Sun } from "lucide-react";

import { useTheme } from "next-themes";

import { Button } from "./button";

import { useSidebar } from "@/contexts/SidebarContext";

export function Navbar() {
  const { theme, setTheme } = useTheme();

  const { toggle } = useSidebar();

  return (
    <nav className="fixed top-0 w-full z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Button variant="ghost" size="icon" onClick={toggle} className="mr-4">
          <Menu className="h-5 w-5" />

          <span className="sr-only">Toggle sidebar</span>
        </Button>

        <div className="flex-1 flex justify-center">
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            AI Post Generator
          </h1>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />

          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />

          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </nav>
  );
}
