import { createFileRoute } from '@tanstack/react-router';
import {
  Hero,
  BentoGrid,
  CompaniesStrip,
  HowItWorks,
  Reviews,
  TestGenerationSection,
  VideoEvidenceSection,
  FinalCta,
} from '../components/landing/sections';

export const Route = createFileRoute('/')({ component: LandingPage });

function LandingPage() {
  return (
    <main>
      <Hero />
      <BentoGrid />
      <CompaniesStrip />
      <HowItWorks />
      <TestGenerationSection />
      <VideoEvidenceSection />
      <Reviews />
      <FinalCta />
    </main>
  );
}
