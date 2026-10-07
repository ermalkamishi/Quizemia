import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";
import { ToastProvider } from "@/components/ui/toast";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthModal } from "@/components/AuthModal";
import { ScrollToTop } from "@/components/ScrollToTop";
import { IntroSplashScreen } from "@/components/IntroSplashScreen";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "https://quizemia.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Quizemia — Turn lessons into play!",
    template: "%s | Quizemia",
  },
  description:
    "Turn lessons into play! An interactive educational quiz platform inspired by Kahoot. Generate quizzes with AI, compete live with friends, and master any subject.",
  keywords: [
    "Quizemia",
    "quiz maker",
    "AI quiz generator",
    "interactive quiz",
    "Kahoot alternative",
    "live multiplayer quiz",
    "classroom quiz",
    "educational games",
    "study tool",
    "flashcards",
    "gamified learning",
  ],
  authors: [{ name: "Quizemia Team" }],
  creator: "Quizemia",
  publisher: "Quizemia",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Quizemia — Turn lessons into play!",
    description:
      "Turn lessons into play! An interactive educational quiz platform inspired by Kahoot. Generate quizzes with AI, compete live with friends, and master any subject.",
    url: siteUrl,
    siteName: "Quizemia",
    images: [
      {
        url: "/quiz.png",
        width: 1200,
        height: 630,
        alt: "Quizemia — Turn lessons into play!",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Quizemia — Turn lessons into play!",
    description:
      "Turn lessons into play! An interactive educational quiz platform inspired by Kahoot. Generate quizzes with AI, compete live with friends, and master any subject.",
    images: ["/quiz.png"],
    creator: "@quizemia",
  },
  icons: {
    icon: [
      { url: "/quiz.png" },
      { url: "/favicon.ico" },
    ],
    shortcut: "/quiz.png",
    apple: "/quiz.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Quizemia",
        url: siteUrl,
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/quiz.png`,
        },
        description:
          "Interactive educational quiz platform inspired by Kahoot with AI question generation and real-time multiplayer games.",
      },
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Quizemia",
        description:
          "Turn lessons into play! Play, create, and host interactive quizzes powered by AI.",
        publisher: {
          "@id": `${siteUrl}/#organization`,
        },
      },
    ],
  };

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLd),
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 font-sans selection:bg-blue-600 selection:text-white">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var seen = sessionStorage.getItem('quizemia_intro_seen');
                  var force = window.location.search.indexOf('intro=1') !== -1;
                  if (seen && !force) {
                    document.documentElement.classList.add('intro-seen');
                  } else {
                    document.documentElement.classList.add('intro-active');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        <IntroSplashScreen />
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <div id="page-content" className="min-h-full flex flex-col flex-1">
                <Navbar />
                <main className="flex-1 flex flex-col">{children}</main>
                <Footer />
                <AuthModal />
                <ScrollToTop />
              </div>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
