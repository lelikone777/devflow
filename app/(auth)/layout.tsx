import Image from "next/image";
import { ReactNode } from "react";

import SocialAuthForm from "@/components/forms/SocialAuthForm";
import AppProviders from "@/components/providers/AppProviders";
import { getServerLocale } from "@/lib/i18n-server";
import { getServerTranslator } from "@/lib/i18n-server";

const AuthLayout = async ({ children }: { children: ReactNode }) => {
  const locale = await getServerLocale();
  const { t } = await getServerTranslator();

  return (
    <main className="flex min-h-screen items-center justify-center overflow-x-hidden bg-auth-light bg-cover bg-center bg-no-repeat px-3 py-6 xs:px-4 xs:py-8 sm:py-10 dark:bg-auth-dark">
      <AppProviders locale={locale}>
        <section className="light-border background-light800_dark200 shadow-light100_dark100 w-full max-w-[560px] rounded-[10px] border px-3 py-8 shadow-md xs:px-4 sm:px-8 sm:py-10">
          <div className="flex items-start justify-between gap-3 xs:items-center">
            <div className="space-y-2.5">
              <h1 className="h2-bold text-dark100_light900">
                {t("auth.joinDevFlow")}
              </h1>
              <p className="paragraph-regular text-dark500_light400">
                {t("auth.subtitle")}
              </p>
            </div>
            <Image
              src="/images/site-logo.svg"
              alt="DevFlow Logo"
              width={50}
              height={50}
              className="size-10 shrink-0 object-contain xs:size-12"
            />
          </div>

          {children}

          <SocialAuthForm />
        </section>
      </AppProviders>
    </main>
  );
};

export default AuthLayout;
