import { usePlatformStore } from '../store/platformStore';

/**
 * Custom hook for platform state management
 * Replaces PlatformContext with Zustand store
 */
export function usePlatform() {
  const store = usePlatformStore();
  
  return {
    state: {
      currentTab: store.currentTab,
      selectedOds: store.selectedOds,
      inputs: store.inputs,
      theme: store.theme,
      language: store.language,
      savedProjects: store.savedProjects,
      toasts: store.toasts,
      onboardingCompleted: store.onboardingCompleted,
      currentProject: store.currentProject,
    },
    dispatch: {
      setTab: store.setTab,
      toggleOds: store.toggleOds,
      setOdsBulk: store.setOdsBulk,
      setInput: store.setInput,
      setTheme: store.setTheme,
      setLanguage: store.setLanguage,
      saveProject: store.saveProject,
      deleteProject: store.deleteProject,
      completeOnboarding: store.completeOnboarding,
      resetOnboarding: store.resetOnboarding,
      addToast: store.addToast,
      removeToast: store.removeToast,
      updateProjectField: store.updateProjectField,
    },
  };
}
