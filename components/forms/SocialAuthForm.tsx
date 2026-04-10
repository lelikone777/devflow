"use client";

import Image from "next/image";
import { signIn } from "next-auth/react";
import React from "react";

import ROUTES from "@/constants/routes";
import { useTranslations } from "@/context/Language";
import { toast } from "@/hooks/use-toast";

import { Button } from "../ui/button";

const SocialAuthForm = () => {
  const buttonClass =
    "background-dark400_light900 body-medium text-dark200_light800 min-h-12 flex-1 rounded-2 px-4 py-3.5";
  const t = useTranslations();

  const handleSignIn = async (provider: "github" | "google") => {
    try {
      await signIn(provider, {
        callbackUrl: ROUTES.HOME,
      });
    } catch (error) {
      toast({
        title: t("auth.signInFailed"),
        description:
          error instanceof Error
            ? error.message
            : t("auth.signInError"),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="mt-10 flex flex-wrap gap-2.5">
      <Button className={buttonClass} onClick={() => handleSignIn("github")}>
        <Image
          src="/icons/github.svg"
          alt="GitHub"
          width={20}
          height={20}
          className="invert-colors mr-2.5 object-contain"
        />
        <span>{t("auth.oauthGithub")}</span>
      </Button>

      <Button className={buttonClass} onClick={() => handleSignIn("google")}>
        <Image
          src="/icons/google.svg"
          alt="Google"
          width={20}
          height={20}
          className="mr-2.5 object-contain"
        />
        <span>{t("auth.oauthGoogle")}</span>
      </Button>
    </div>
  );
};

export default SocialAuthForm;
