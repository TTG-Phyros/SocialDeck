"use client";

import { Icon } from "@iconify/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { LogoutButton } from "@/components/logoutButton";
import { Button, ButtonLink, Text } from "@/components/ui";
import { cn } from "@/lib/cn";

type TopNavigationProps = {
  userDisplayName: string | null;
};

type ThemeMode = "light" | "dark";

const THEME_STORAGE_KEY = "socialdeck-theme";

function getInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "dark" || storedTheme === "light") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function TopNavigation({ userDisplayName }: TopNavigationProps) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme);

  const isNavActive = (href: string) => {
    if (!pathname) {
      return false;
    }

    if (href === "/") {
      return pathname === "/";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === "dark" ? "light" : "dark"));
  };

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="topbar-main">
          <Link href="/" className="brand">
            SocialDeck
          </Link>

          <Button
            variant="ghost"
            size="small"
            className="nav-burger"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-controls="main-navigation"
            aria-label={menuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          >
            <span className="nav-burger-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </Button>
        </div>

        <nav
          id="main-navigation"
          className={cn("topnav", menuOpen ? "is-open" : undefined)}
          onClick={() => setMenuOpen(false)}
        >
          <ButtonLink
            variant="ghost"
            size="small"
            href="/dashboard"
            className={cn("topnav-link", isNavActive("/dashboard") ? "is-active" : undefined)}
          >
            Dashboard
          </ButtonLink>
          <ButtonLink
            variant="ghost"
            size="small"
            href="/settings"
            className={cn("topnav-link", isNavActive("/settings") ? "is-active" : undefined)}
          >
            Parametres
          </ButtonLink>
          <Button
            variant="outline"
            size="small"
            className="theme-toggle-btn"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Activer le mode clair" : "Activer le mode sombre"}
            title={theme === "dark" ? "Mode clair" : "Mode sombre"}
          >
            <Icon
              icon={theme === "dark" ? "solar:sun-2-bold" : "solar:moon-stars-bold"}
              width="18"
              height="18"
              className="theme-toggle-icon"
              aria-hidden="true"
            />
          </Button>

          {userDisplayName ? (
            <>
              <Text as="span" className="nav-user">
                {userDisplayName}
              </Text>
              <LogoutButton />
            </>
          ) : (
            <>
              <ButtonLink
                variant="ghost"
                size="small"
                href="/login"
                className={cn("topnav-link", isNavActive("/login") ? "is-active" : undefined)}
              >
                Connexion
              </ButtonLink>
              <ButtonLink
                variant="primary"
                size="small"
                href="/register"
                className={cn("topnav-link", isNavActive("/register") ? "is-active" : undefined)}
              >
                Inscription
              </ButtonLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
