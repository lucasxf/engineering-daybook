import { FeatureGraphic } from '@/components/store-assets/FeatureGraphic';

export const metadata = {
  title: 'learnimo — Feature Graphic',
  description: 'Google Play Store feature graphic 1024×500px',
};

export default function FeatureGraphicPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 p-8 gap-4">
      <p className="text-white/50 text-sm font-mono">1024 × 500 px — Google Play Feature Graphic</p>
      <FeatureGraphic />
      <p className="text-white/30 text-xs font-mono">learnimo / store-assets / feature-graphic</p>
    </main>
  );
}
