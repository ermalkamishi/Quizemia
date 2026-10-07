import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://quizemia.vercel.app";
  const lastModified = new Date();

  return [
    {
      url: `${baseUrl}`,
      lastModified,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/quiz`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/live/join`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/live/host`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/leaderboard`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about-us`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/my-quizzes`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/dashboard`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.6,
    },
  ];
}
