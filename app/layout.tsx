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

export const metadata: Metadata = {
  title: "Quizemia — Turn lessons into play!",
  description:
    "Turn lessons into play! An interactive educational quiz platform inspired by Kahoot. Generate quizzes, compete with friends, and master any subject.",
  icons: {
    icon: "/quiz.png",
    shortcut: "/quiz.png",
    apple: "/quiz.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
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
