import type { Metadata } from "next";
import AboutUs from "@/components/AboutUs";

export const metadata: Metadata = {
  title: "Quizemia — Turn lessons into play!",
  description: "Learn more about our mission and quiz platform",
};

export default function AboutUsPage() {
  return <AboutUs />;
}
