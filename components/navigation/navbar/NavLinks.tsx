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
              isActive
                ? "primary-gradient rounded-lg text-light-900"
                : "text-dark300_light900",
              "flex items-center justify-start gap-4 bg-transparent p-4"
            )}
          >
            <Image
              src={item.imgURL}
              alt={translatedLabel}
              width={20}
              height={20}
              className={cn({ "invert-colors": !isActive })}
            />
            <p
              className={cn(
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
