import { useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardPreview } from './components/DashboardPreview';
import { Footer } from './components/Footer';

export function App() {
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const handleScrollToSection = (sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-colors duration-200 selection:bg-healblue-600 selection:text-white flex flex-col justify-between">
      <Navbar
        onScrollToSection={handleScrollToSection}
      />

      <main className="flex-1">
        <DashboardPreview isStandalone={true} />
      </main>

      <Footer onScrollToSection={handleScrollToSection} />
    </div>
  );
}

export default App;

