"use client";

import { ReloadIcon } from "@radix-ui/react-icons";
import { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface SubmitButtonProps {
  isPending: boolean;
  idleLabel: string;
  pendingLabel: string;
  className?: string;
  children?: ReactNode;
}

const SubmitButton = ({
  isPending,
  idleLabel,
  pendingLabel,
  className,
  children,
}: SubmitButtonProps) => {
  return (
    <Button type="submit" disabled={isPending} className={className}>
      {isPending ? (
        <>
          <ReloadIcon className="mr-2 size-4 animate-spin" />
          {pendingLabel}
        </>
      ) : (
        children ?? idleLabel
      )}
    </Button>
  );
};

export default SubmitButton;
