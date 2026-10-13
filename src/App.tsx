import { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPreview } from './components/DashboardPreview';
import { Footer } from './components/Footer';

export function App() {
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

  const handleScrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-midnight-950 text-slate-900 dark:text-white font-sans transition-colors duration-200 selection:bg-healblue-600 selection:text-white flex flex-col justify-between">
      <Navbar
        onScrollToSection={handleScrollToSection}
        isDark={isDark}
        onToggleTheme={() => setIsDark(d => !d)}
      />

      <main className="flex-1">
        <DashboardPreview isStandalone={true} />
      </main>

      <Footer onScrollToSection={handleScrollToSection} />
    </div>
  );
}

export default App;

