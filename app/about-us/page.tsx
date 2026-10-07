import type { Metadata } from "next";
import AboutUs from "@/components/AboutUs";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn about Quizemia's mission to turn classroom lessons and study notes into engaging, gamified quiz competitions.",
  alternates: {
    canonical: "/about-us",
  },
};

export default function AboutUsPage() {
  return <AboutUs />;
}
