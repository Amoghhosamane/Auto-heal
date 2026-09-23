import { useState, useEffect } from 'react';
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
  const [isDark, setIsDark] = useState(true);

  // Apply / remove the `dark` class on <html> whenever theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  const handleNavigateSection = (sectionId: string) => {
    if (activeView !== 'landing') {
      setActiveView('landing');
      setTimeout(() => {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    } else {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-midnight-950 text-slate-900 dark:text-white font-sans transition-colors duration-200 selection:bg-healblue-600 selection:text-white">
      <Navbar
        activeView={activeView}
        setActiveView={setActiveView}
        onNavigateSection={handleNavigateSection}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
      />

      {activeView === 'landing' ? (
        <main>
          <Hero
            onViewDashboard={() => setActiveView('dashboard')}
            onSeeHowItWorks={() => handleNavigateSection('solution')}
          />
          <ProblemSection />
          <SolutionSection />
          <RecoveryActionsSection />
          <ArchitectureSection />

          {/* Dashboard Preview inline section */}
          <div className="relative">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 -mb-8 flex items-center justify-between">
              <span className="text-xs font-mono text-healblue-600 dark:text-healblue-400 uppercase tracking-wider">
                Section 06 · Live Interface Demonstration
              </span>
              <button
                onClick={() => { setActiveView('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="text-xs font-mono text-healblue-600 dark:text-healblue-300 hover:text-healblue-800 dark:hover:text-white underline underline-offset-4 transition-colors"
              >
                Open Fullscreen Dashboard View →
              </button>
            </div>
            <DashboardPreview isStandalone={false} />
          </div>

          <DemoScenariosSection />
          <KeyBenefitsSection />
        </main>
      ) : (
        <main>
          <DashboardPreview isStandalone={true} />
        </main>
      )}

      <Footer
        onNavigateSection={handleNavigateSection}
        onViewDashboard={() => { setActiveView('dashboard'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
      />
    </div>
  );
}

export default App;
