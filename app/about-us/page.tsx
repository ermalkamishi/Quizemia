import type { Metadata } from "next";
import AboutUs from "@/components/AboutUs";

export const metadata: Metadata = {
  title: "About Us | Quizemia",
  description: "Learn more about our mission and quiz platform",
};

export default function AboutUsPage() {
  return <AboutUs />;
}
