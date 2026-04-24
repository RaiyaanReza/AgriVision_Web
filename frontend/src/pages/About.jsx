import { AboutHero } from "../components/about/AboutHero";
import { AboutContent } from "../components/about/AboutContent";

export default function About() {
  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <AboutHero />
      <AboutContent />
    </div>
  );
}
