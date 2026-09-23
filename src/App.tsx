import { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { ProblemSection } from './components/ProblemSection';
import { SolutionSection } from './components/SolutionSection';
import { RecoveryActionsSection } from './components/RecoveryActionsSection';
import { ArchitectureSection } from './components/ArchitectureSection';
import { DashboardPreview } from './components/DashboardPreview';
import { DemoScenariosSection } from './components/DemoScenariosSection';
import { KeyBenefitsSection } from './components/KeyBenefitsSection';
import { Footer } from './components/Footer';

export function App() {
  const [activeView, setActiveView] = useState<'landing' | 'dashboard'>('landing');

  const handleNavigateSection = (sectionId: string) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 50);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-midnight-950 text-white font-sans selection:bg-healblue-600 selection:text-white">
      {/* Top Sticky Navigation */}
      <Navbar 
        activeView={activeView} 
        setActiveView={setActiveView}
        onNavigateSection={handleNavigateSection}
      />

      {activeView === 'landing' ? (
        <main>
          {/* 1. Hero Section */}
          <Hero 
            onViewDashboard={() => setActiveView('dashboard')}
            onSeeHowItWorks={() => handleNavigateSection('solution')}
          />

          {/* 2. Problem Section */}
          <ProblemSection />

          {/* 3. Solution Section (6-Step Flow) */}
          <SolutionSection />

          {/* 4. Recovery Actions Section */}
          <RecoveryActionsSection />

          {/* 5. System Architecture Section */}
          <ArchitectureSection />

          {/* 6. Dashboard Preview Section */}
          <div className="relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 -mb-8 flex items-center justify-between">
              <span className="text-xs font-mono text-healblue-400 uppercase tracking-wider">
                Section 06 • Live Interface Demonstration
              </span>
              <button
                onClick={() => {
                  setActiveView('dashboard');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="text-xs font-mono text-healblue-300 hover:text-white underline underline-offset-4 transition-colors"
              >
                Open Fullscreen Dashboard View →
              </button>
            </div>
            <DashboardPreview isStandalone={false} />
          </div>

          {/* 7. Demo Scenarios Section */}
          <DemoScenariosSection />

          {/* 8. Key Benefits Section */}
          <KeyBenefitsSection />
        </main>
      ) : (
        <main>
          {/* Standalone Fullscreen Dashboard View */}
          <DashboardPreview isStandalone={true} />
        </main>
      )}

      {/* Global Footer */}
      <Footer 
        onNavigateSection={handleNavigateSection}
        onViewDashboard={() => {
          setActiveView('dashboard');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}

export default App;
