import { ReactNode } from "react";

import LeftSidebar from "@/components/navigation/LeftSidebar";
import Navbar from "@/components/navigation/navbar";
import RightSidebar from "@/components/navigation/RightSidebar";
import AppProviders from "@/components/providers/AppProviders";
import { getServerLocale } from "@/lib/i18n-server";

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const locale = await getServerLocale();

  return (
    <main className="background-light850_dark100 realtive overflow-x-clip">
      <AppProviders locale={locale}>
        <Navbar />

        <div className="flex min-w-0">
          <LeftSidebar />

          <section className="flex min-h-screen min-w-0 flex-1 flex-col px-3 pb-4 pt-28 max-md:pb-14 xs:px-4 sm:px-8 sm:pb-6 sm:pt-32 lg:px-14 lg:pt-36">
            <div className="mx-auto w-full max-w-5xl">{children}</div>
          </section>

          <RightSidebar />
        </div>
      </AppProviders>
    </main>
  );
};

export default RootLayout;
