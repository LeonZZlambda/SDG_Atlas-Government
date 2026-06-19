import { lazy, Suspense } from 'preact/compat';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import { AppLayout } from './components/AppLayout';
import { Onboarding } from './components/Onboarding';
import { Toast } from './components/Toast';
import { TabSkeleton } from './components/TabSkeleton';
import { AnimatePresence, motion } from 'framer-motion';

const ODSGrid = lazy(() =>
  import('./components/ODSGrid').then((m) => ({ default: m.ODSGrid }))
);
const ODSRandomizer = lazy(() =>
  import('./components/ODSRandomizer').then((m) => ({ default: m.ODSRandomizer }))
);
const ProjectPlanner = lazy(() =>
  import('./components/ProjectPlanner').then((m) => ({ default: m.ProjectPlanner }))
);
const ImpactCalculator = lazy(() =>
  import('./components/ImpactCalculator').then((m) => ({ default: m.ImpactCalculator }))
);
const ODSMap = lazy(() =>
  import('./components/ODSMap').then((m) => ({ default: m.ODSMap }))
);
const Dashboard = lazy(() =>
  import('./components/Dashboard').then((m) => ({ default: m.Dashboard }))
);


function AppContent() {
  const { state } = usePlatform();

  const renderTabContent = () => {
    switch (state.currentTab) {
      case 'selection':
        return <ODSGrid />;
      case 'shuffler':
        return <ODSRandomizer />;
      case 'planner':
        return <ProjectPlanner />;
      case 'calculator':
        return <ImpactCalculator />;
      case 'map':
        return <ODSMap />;
      case 'dashboard':
        return <Dashboard />;
      default:
        return <ODSGrid />;
    }
  };

  return (
    <AppLayout>
      <Onboarding />
      <Toast />

      <AnimatePresence mode="wait">
        <motion.div
          key={state.currentTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
        >
          <Suspense fallback={<TabSkeleton />}>
            {renderTabContent()}
          </Suspense>
        </motion.div>
      </AnimatePresence>
    </AppLayout>
  );
}

export function App() {
  return (
    <PlatformProvider>
      <AppContent />
    </PlatformProvider>
  );
}
export default App;
