import { usePlatformStore } from '../store/platformStore';

/**
 * Custom hook for project state management
 * Provides convenient access to project-related state and actions
 */
export function useProject() {
  const currentProject = usePlatformStore(state => state.currentProject);
  const selectedOds = usePlatformStore(state => state.selectedOds);
  const inputs = usePlatformStore(state => state.inputs);
  const toggleOds = usePlatformStore(state => state.toggleOds);
  const setOdsBulk = usePlatformStore(state => state.setOdsBulk);
  const setInput = usePlatformStore(state => state.setInput);
  const updateProjectField = usePlatformStore(state => state.updateProjectField);
  const regenerateProject = usePlatformStore(state => state.regenerateProject);

  return {
    currentProject,
    selectedOds,
    inputs,
    toggleOds,
    setOdsBulk,
    setInput,
    updateProjectField,
    regenerateProject,
  };
}
