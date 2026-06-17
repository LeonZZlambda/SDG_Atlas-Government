import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { generateProject } from '../utils/projectGenerator';
import type { ProjectInputs, GeneratedProjectData } from '../types/project';
import { Logger } from '../utils/logger';
import i18next from '../i18n';

export interface SavedProject {
  id: string;
  name: string;
  summary: string;
  odsIds: number[];
  inputs: ProjectInputs;
  generatedData: GeneratedProjectData;
  createdAt: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info';
}

export interface PlatformState {
  currentTab: 'selection' | 'shuffler' | 'planner' | 'calculator' | 'map' | 'dashboard';
  selectedOds: number[];
  inputs: ProjectInputs;
  theme: 'light' | 'dark' | 'high-contrast';
  language: 'pt-BR' | 'en-US' | 'es-ES';
  savedProjects: SavedProject[];
  toasts: ToastItem[];
  onboardingCompleted: boolean;
  currentProject: GeneratedProjectData | null;
}

const INITIAL_INPUTS: ProjectInputs = {
  budget: 25000,
  beneficiaries: 500,
  duration: 12,
  teamSize: 4,
  riskLevel: 0.2
};

interface PlatformActions {
  setTab: (tab: PlatformState['currentTab']) => void;
  toggleOds: (id: number) => void;
  setOdsBulk: (ids: number[]) => void;
  setInput: (name: keyof ProjectInputs, value: number) => void;
  setTheme: (theme: PlatformState['theme']) => void;
  setLanguage: (language: PlatformState['language']) => void;
  saveProject: (name?: string, summary?: string) => void;
  deleteProject: (id: string) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  addToast: (message: string, type: ToastItem['type']) => void;
  removeToast: (id: string) => void;
  updateProjectField: (field: 'name' | 'summary', value: string) => void;
  regenerateProject: () => void;
}

type PlatformStore = PlatformState & PlatformActions;

const getInitialState = (): PlatformState => {
  const selectedOds = [3, 4, 11]; // default sample ODS selection
  const currentProject = generateProject(selectedOds, INITIAL_INPUTS, 'pt');
  
  return {
    currentTab: 'selection',
    selectedOds,
    inputs: INITIAL_INPUTS,
    theme: 'light',
    language: 'pt-BR',
    savedProjects: [],
    toasts: [],
    onboardingCompleted: false,
    currentProject
  };
};

export const usePlatformStore = create<PlatformStore>()(
  persist(
    (set, get) => ({
      ...getInitialState(),

      setTab: (tab) => set({ currentTab: tab }),

      toggleOds: (id) => {
        const state = get();
        let nextOds = [...state.selectedOds];
        if (nextOds.includes(id)) {
          nextOds = nextOds.filter(odsId => odsId !== id);
        } else {
          if (nextOds.length < 17) nextOds.push(id);
        }
        nextOds.sort((a, b) => a - b);
        
        const langKey = state.language.split('-')[0] as 'pt' | 'en' | 'es';
        const currentProject = generateProject(nextOds, state.inputs, langKey);
        
        set({ selectedOds: nextOds, currentProject });
      },

      setOdsBulk: (ids) => {
        const state = get();
        const bulkOds = [...ids].sort((a, b) => a - b);
        const langKey = state.language.split('-')[0] as 'pt' | 'en' | 'es';
        const currentProject = generateProject(bulkOds, state.inputs, langKey);
        
        set({ selectedOds: bulkOds, currentProject });
      },

      setInput: (name, value) => {
        const state = get();
        const newInputs = { ...state.inputs, [name]: value };
        const langKey = state.language.split('-')[0] as 'pt' | 'en' | 'es';
        const currentProject = generateProject(state.selectedOds, newInputs, langKey);
        
        set({ inputs: newInputs, currentProject });
      },

      setTheme: (theme) => {
        set({ theme });
        localStorage.setItem('sdg_platform_theme', theme);
      },

      setLanguage: (language) => {
        const state = get();
        const langKey = language.split('-')[0] as 'pt' | 'en' | 'es';
        const currentProject = generateProject(state.selectedOds, state.inputs, langKey);
        
        set({ language, currentProject });
        localStorage.setItem('sdg_platform_lang', language);
        i18next.changeLanguage(language);
      },

      saveProject: (name, summary) => {
        const state = get();
        if (state.selectedOds.length === 0 || !state.currentProject) return;
        
        const customName = name || state.currentProject.suggestedName;
        const customSummary = summary || state.currentProject.summary;
        
        const project: SavedProject = {
          id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
          name: customName,
          summary: customSummary,
          odsIds: [...state.selectedOds],
          inputs: { ...state.inputs },
          generatedData: { ...state.currentProject, suggestedName: customName, summary: customSummary },
          createdAt: new Date().toISOString()
        };
        
        const updatedProjects = [project, ...state.savedProjects];
        set({ savedProjects: updatedProjects });
        
        try {
          localStorage.setItem('sdg_platform_projects', JSON.stringify(updatedProjects));
        } catch (e) {
          Logger.error('Failed saving project to localStorage:', e);
        }
        
        get().addToast(i18next.t('toast_project_saved'), 'success');
      },

      deleteProject: (id) => {
        const state = get();
        const updatedProjects = state.savedProjects.filter(p => p.id !== id);
        set({ savedProjects: updatedProjects });
        
        try {
          localStorage.setItem('sdg_platform_projects', JSON.stringify(updatedProjects));
        } catch (e) {
          Logger.error('Failed deleting project from localStorage:', e);
        }
        
        get().addToast(i18next.t('toast_project_deleted'), 'info');
      },

      completeOnboarding: () => {
        set({ onboardingCompleted: true });
        localStorage.setItem('sdg_platform_onboarding', 'true');
      },

      resetOnboarding: () => {
        set({ onboardingCompleted: false });
        localStorage.removeItem('sdg_platform_onboarding');
      },

      addToast: (message, type) => {
        const toast: ToastItem = {
          id: Math.random().toString(36).substring(2, 9),
          message,
          type
        };
        set({ toasts: [...get().toasts, toast] });
        
        setTimeout(() => {
          get().removeToast(toast.id);
        }, 5000);
      },

      removeToast: (id) => {
        set({ toasts: get().toasts.filter(t => t.id !== id) });
      },

      updateProjectField: (field, value) => {
        const state = get();
        if (!state.currentProject) return;
        
        const updatedProject = { ...state.currentProject };
        if (field === 'name') {
          updatedProject.suggestedName = value;
        } else {
          updatedProject.summary = value;
        }
        
        set({ currentProject: updatedProject });
      },

      regenerateProject: () => {
        const state = get();
        const langKey = state.language.split('-')[0] as 'pt' | 'en' | 'es';
        const currentProject = generateProject(state.selectedOds, state.inputs, langKey);
        
        set({ currentProject });
      },
    }),
    {
      name: 'sdg-platform-storage',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        onboardingCompleted: state.onboardingCompleted,
        savedProjects: state.savedProjects,
      }),
    }
  )
);
