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
import { PricingSection } from '../components/PricingSection';
import { useRedirectIfAuthed } from '../lib/auth';

export const Route = createFileRoute('/')({ component: LandingPage });

function LandingPage() {
  useRedirectIfAuthed();
  return (
    <main>
      <Hero />
      <BentoGrid />
      <CompaniesStrip />
      <HowItWorks />
      <TestGenerationSection />
      <VideoEvidenceSection />
      <Reviews />
      <PricingSection />
      <FinalCta />
    </main>
  );
}
