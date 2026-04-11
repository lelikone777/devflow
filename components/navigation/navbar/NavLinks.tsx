"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

import { SheetClose } from "@/components/ui/sheet";
import { sidebarLinks } from "@/constants";
import { useTranslations } from "@/context/Language";
import { cn } from "@/lib/utils";

const NavLinks = ({
  isMobileNav = false,
  userId,
}: {
  isMobileNav?: boolean;
  userId?: string;
}) => {
  const pathname = usePathname();
  const t = useTranslations();

  return (
    <>
      {sidebarLinks.map((item) => {
        const route =
          item.route === "/profile" && userId ? `${item.route}/${userId}` : item.route;
        const isActive =
          (pathname.includes(route) && route.length > 1) || pathname === route;

        if (item.route === "/profile" && !userId) return null;

        const labelMap: Record<string, string> = {
          "/": "nav.home",
          "/community": "nav.community",
          "/collection": "nav.collections",
          "/jobs": "nav.jobs",
          "/tags": "nav.tags",
          "/profile": "nav.profile",
          "/ask-question": "nav.askQuestion",
        };
        const translatedLabel = t(labelMap[item.route] ?? item.label);

        const LinkComponent = (
          <Link
            href={route}
            key={route}
            className={cn(
              "group relative isolate flex items-center justify-start gap-4 overflow-hidden rounded-lg border p-4 transition-all duration-300 ease-out will-change-transform motion-reduce:transition-none",
              "before:absolute before:inset-0 before:rounded-lg before:opacity-0 before:transition-opacity before:duration-300 before:content-['']",
              isActive
                ? "primary-gradient border-transparent text-light-900 shadow-[0_14px_30px_-16px_rgba(255,112,0,0.95)] before:bg-linear-to-r before:from-white/18 before:via-white/6 before:to-transparent before:opacity-100 hover:-translate-y-0.5 hover:shadow-[0_20px_38px_-18px_rgba(255,112,0,1)]"
                : "text-dark300_light900 border-transparent bg-transparent before:bg-linear-to-r before:from-primary-500/22 before:via-primary-500/10 before:to-transparent hover:-translate-y-0.5 hover:border-primary-500/20 hover:bg-primary-500/12 hover:text-light-900 hover:shadow-[0_18px_34px_-22px_rgba(255,112,0,0.95)] hover:before:opacity-100 dark:hover:bg-primary-500/16"
            )}
          >
            <span
              className={cn(
                "pointer-events-none absolute inset-y-2 left-2 w-1 rounded-full transition-all duration-300 motion-reduce:transition-none",
                isActive
                  ? "bg-light-900/80"
                  : "bg-primary-500 opacity-0 scale-y-50 group-hover:opacity-100 group-hover:scale-y-100"
              )}
            />
            <span
              className={cn(
                "pointer-events-none absolute -left-12 top-0 h-full w-10 -skew-x-12 bg-white/30 opacity-0 blur-md transition-all duration-500 motion-reduce:hidden",
                isActive
                  ? "left-[72%] opacity-70"
                  : "group-hover:left-[88%] group-hover:opacity-100"
              )}
            />
            <Image
              src={item.imgURL}
              alt={translatedLabel}
              width={20}
              height={20}
              className={cn(
                "relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:scale-110 motion-reduce:transition-none",
                { "invert-colors": !isActive }
              )}
            />
            <p
              className={cn(
                "relative z-10 transition-transform duration-300 ease-out group-hover:translate-x-1 motion-reduce:transition-none",
                isActive ? "base-bold" : "base-medium",
                !isMobileNav && "max-lg:hidden"
              )}
            >
              {translatedLabel}
            </p>
          </Link>
        );

        return isMobileNav ? (
          <SheetClose asChild key={route}>
            {LinkComponent}
          </SheetClose>
        ) : (
          <React.Fragment key={route}>{LinkComponent}</React.Fragment>
        );
      })}
    </>
  );
};

export default NavLinks;
