"use client";

import Image from "next/image";
import { use, useState } from "react";

import { useTranslations } from "@/context/Language";
import { toast } from "@/hooks/use-toast";
import { toggleSaveQuestion } from "@/lib/actions/collection.action";
import type { ActionResponse } from "@/types";

const SaveQuestion = ({
  questionId,
  userId,
  hasSavedQuestionPromise,
}: {
  questionId: string;
  userId?: string;
  hasSavedQuestionPromise: Promise<ActionResponse<{ saved: boolean }>>;
}) => {
  const t = useTranslations();
  const { data } = use(hasSavedQuestionPromise);

  const { saved: hasSaved } = data || {};

  const [isLoading, setIsLoading] = useState(false);

  const handleSave = async () => {
    if (isLoading) return;
    if (!userId)
      return toast({
        title: t("collection.loginRequired"),
        variant: "destructive",
      });

    setIsLoading(true);

    try {
      const { success, data, error } = await toggleSaveQuestion({ questionId });

      if (!success) throw new Error(error?.message || "An error occurred");

      toast({
        title: data?.saved
          ? t("collection.saved")
          : t("collection.unsaved"),
      });
    } catch (error) {
      toast({
        title: t("common.error"),
        description:
          error instanceof Error ? error.message : t("collection.failed"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Image
      src={hasSaved ? "/icons/star-filled.svg" : "/icons/star-red.svg"}
      width={18}
      height={18}
      alt="save"
      className={`interactive-icon cursor-pointer ${isLoading && "opacity-50"}`}
      aria-label={t("collection.saveAria")}
      onClick={handleSave}
    />
  );
};

export default SaveQuestion;
