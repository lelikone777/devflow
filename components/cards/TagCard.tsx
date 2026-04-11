import Image from "next/image";
import Link from "next/link";
import React from "react";

import ROUTES from "@/constants/routes";
import { cn, getDeviconClassName, getTechDescription } from "@/lib/utils";

import { Badge } from "../ui/badge";

interface Props {
  _id: string;
  name: string;
  questions?: number;
  showCount?: boolean;
  compact?: boolean;
  remove?: boolean;
  isButton?: boolean;
  handleRemove?: () => void;
}

const TagCard = ({
  _id,
  name,
  questions,
  showCount,
  compact,
  remove,
  isButton,
  handleRemove,
}: Props) => {
  const iconClass = getDeviconClassName(name);
  const iconDescription = getTechDescription(name);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
  };

  const Content = (
    <>
      <Badge className="subtle-medium interactive-compact border border-primary-500/15 bg-primary-100 text-primary-500 dark:border-primary-500/20 dark:bg-primary-500/16 dark:text-primary-100 flex flex-row gap-2 rounded-md px-4 py-2 uppercase shadow-none">
        <div className="flex-center space-x-2">
          <i className={`${iconClass} text-sm text-inherit`}></i>
          <span>{name}</span>
        </div>

        {remove && (
          <Image
            src="/icons/close.svg"
            width={12}
            height={12}
            alt="close icon"
            className="interactive-icon cursor-pointer object-contain invert-0 dark:invert"
            onClick={handleRemove}
          />
        )}
      </Badge>

      {showCount && (
        <p className="small-medium text-dark500_light700">{questions}</p>
      )}
    </>
  );

  if (compact) {
    return isButton ? (
      <button
        onClick={handleClick}
        className="interactive-inline flex justify-between gap-2"
      >
        {Content}
      </button>
    ) : (
      <Link
        href={ROUTES.TAG(_id)}
        className="interactive-inline flex justify-between gap-2"
      >
        {Content}
      </Link>
    );
  }

  return (
    <Link
      href={ROUTES.TAG(_id)}
      className="shadow-light100_darknone interactive-card block rounded-2xl"
    >
      <article className="background-light900_dark200 light-border flex w-full flex-col rounded-2xl border px-8 py-10 sm:w-[260px]">
        <div className="flex items-center justify-between gap-3">
          <div className="w-fit rounded-sm border border-primary-500/15 bg-primary-100 px-5 py-1.5 dark:border-primary-500/20 dark:bg-primary-500/16">
            <p className="paragraph-semibold text-primary-500 dark:text-primary-100">
              {name}
            </p>
          </div>
          <i
            className={cn(iconClass, "text-2xl text-primary-500 dark:text-primary-100")}
            aria-hidden="true"
          />
        </div>

        <p className="small-regular text-dark500_light700 mt-5 line-clamp-3 w-full">
          {iconDescription}
        </p>

        <p className="small-medium text-dark400_light500 mt-3.5">
          <span className="body-semibold primary-text-gradient mr-2.5">
            {questions}+
          </span>
          Questions
        </p>
      </article>
    </Link>
  );
};

export default TagCard;
