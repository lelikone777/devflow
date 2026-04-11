import type { Metadata } from "next";

const DEFAULT_SITE_URL = "https://devflow-one.vercel.app";

const normalizeUrl = (url: string) => url.replace(/\/+$/, "");

export const getSiteUrl = () => {
  const rawUrl =
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL ||
    DEFAULT_SITE_URL;

  if (rawUrl.startsWith("http://") || rawUrl.startsWith("https://")) {
    return normalizeUrl(rawUrl);
  }

  return `https://${normalizeUrl(rawUrl)}`;
};

export const siteConfig = {
  name: "DevFlow",
  shortName: "DevFlow",
  description:
    "DevFlow — платформа для разработчиков с вопросами, ответами, тегами, профилями, голосованием, сохранёнными публикациями, поиском вакансий и AI-помощником для генерации ответов.",
  keywords: [
    "DevFlow",
    "сообщество разработчиков",
    "вопросы по программированию",
    "разработка",
    "Next.js приложение",
    "TypeScript платформа",
    "вакансии для разработчиков",
    "Q&A платформа",
  ],
  creator: "lelikone777",
};

interface CreatePageMetadataParams {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  noIndex?: boolean;
}

export const createPageMetadata = ({
  title,
  description,
  path = "/",
  keywords = [],
  noIndex = false,
}: CreatePageMetadataParams): Metadata => {
  const siteUrl = getSiteUrl();
  const canonicalUrl = `${siteUrl}${path}`;

  return {
    title,
    description,
    keywords: [...siteConfig.keywords, ...keywords],
    alternates: {
      canonical: path,
    },
    openGraph: {
      title: `${title} | ${siteConfig.name}`,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      type: "website",
      locale: "ru_RU",
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${siteConfig.name}`,
      description,
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        },
  };
};
