import { createContext } from 'preact';
import type { ComponentChildren } from 'preact';
import { useContext, useReducer, useEffect } from 'preact/hooks';
import i18next from '../i18n';
import { generateProject } from '../utils/projectGenerator';
import type { ProjectInputs, GeneratedProjectData } from '../types/project';
import { Logger } from '../utils/logger';

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

type PlatformAction =
  | { type: 'SET_TAB'; payload: PlatformState['currentTab'] }
  | { type: 'TOGGLE_ODS'; payload: number }
  | { type: 'SET_ODS_BULK'; payload: number[] }
  | { type: 'SET_INPUT'; payload: { name: keyof ProjectInputs; value: number } }
  | { type: 'SET_THEME'; payload: PlatformState['theme'] }
  | { type: 'SET_LANG'; payload: PlatformState['language'] }
  | { type: 'SAVE_PROJECT'; payload: { name?: string; summary?: string } }
  | { type: 'DELETE_PROJECT'; payload: string }
  | { type: 'COMPLETE_ONBOARDING' }
  | { type: 'RESET_ONBOARDING' }
  | { type: 'ADD_TOAST'; payload: { message: string; type: ToastItem['type'] } }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'UPDATE_PROJECT_FIELD'; payload: { field: 'name' | 'summary'; value: string } };

const INITIAL_INPUTS: ProjectInputs = {
  budget: 25000,
  beneficiaries: 500,
  duration: 12,
  teamSize: 4,
  riskLevel: 0.2
};

const getInitialState = (): PlatformState => {
  const theme = (localStorage.getItem('sdg_platform_theme') as PlatformState['theme']) || 'light';
  const language = (localStorage.getItem('sdg_platform_lang') as PlatformState['language']) || 'pt-BR';
  const onboardingCompleted = localStorage.getItem('sdg_platform_onboarding') === 'true';
  
  let savedProjects: SavedProject[] = [];
  try {
    const raw = localStorage.getItem('sdg_platform_projects');
    if (raw) savedProjects = JSON.parse(raw);
  } catch (e) {
    Logger.error('Failed parsing local projects:', e);
  }

  const selectedOds = [3, 4, 11]; // default sample ODS selection (Health, Education, Sustainable Cities)
  const langKey = language.split('-')[0] as 'pt' | 'en' | 'es';
  const currentProject = generateProject(selectedOds, INITIAL_INPUTS, langKey);

  return {
    currentTab: 'selection',
    selectedOds,
    inputs: INITIAL_INPUTS,
    theme,
    language,
    savedProjects,
    toasts: [],
    onboardingCompleted,
    currentProject
  };
};

function platformReducer(state: PlatformState, action: PlatformAction): PlatformState {
  const langKey = state.language.split('-')[0] as 'pt' | 'en' | 'es';

  switch (action.type) {
    case 'SET_TAB':
      return { ...state, currentTab: action.payload };

    case 'TOGGLE_ODS': {
      let nextOds = [...state.selectedOds];
      if (nextOds.includes(action.payload)) {
        nextOds = nextOds.filter(id => id !== action.payload);
      } else {
        if (nextOds.length < 17) nextOds.push(action.payload);
      }
      nextOds.sort((a, b) => a - b);
      const nextProject = generateProject(nextOds, state.inputs, langKey);
      return {
        ...state,
        selectedOds: nextOds,
        currentProject: nextProject
      };
    }

    case 'SET_ODS_BULK': {
      const bulkOds = [...action.payload].sort((a, b) => a - b);
      const nextProject = generateProject(bulkOds, state.inputs, langKey);
      return {
        ...state,
        selectedOds: bulkOds,
        currentProject: nextProject
      };
    }

    case 'SET_INPUT': {
      const nextInputs = { ...state.inputs, [action.payload.name]: action.payload.value };
      const nextProject = generateProject(state.selectedOds, nextInputs, langKey);
      return {
        ...state,
        inputs: nextInputs,
        currentProject: nextProject
      };
    }

    case 'SET_THEME': {
      localStorage.setItem('sdg_platform_theme', action.payload);
      return { ...state, theme: action.payload };
    }

    case 'SET_LANG': {
      localStorage.setItem('sdg_platform_lang', action.payload);
      i18next.changeLanguage(action.payload);
      const shortLang = action.payload.split('-')[0] as 'pt' | 'en' | 'es';
      const nextProject = generateProject(state.selectedOds, state.inputs, shortLang);
      return { ...state, language: action.payload, currentProject: nextProject };
    }

    case 'UPDATE_PROJECT_FIELD': {
      if (!state.currentProject) return state;
      const updatedProject = { ...state.currentProject };
      if (action.payload.field === 'name') {
        updatedProject.suggestedName = action.payload.value;
      } else {
        updatedProject.summary = action.payload.value;
      }
      return { ...state, currentProject: updatedProject };
    }

    case 'SAVE_PROJECT': {
      if (state.selectedOds.length === 0 || !state.currentProject) return state;
      const customName = action.payload.name || state.currentProject.suggestedName;
      const customSummary = action.payload.summary || state.currentProject.summary;

      const newProject: SavedProject = {
        id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
        name: customName,
        summary: customSummary,
        odsIds: [...state.selectedOds],
        inputs: { ...state.inputs },
        generatedData: { ...state.currentProject, suggestedName: customName, summary: customSummary },
        createdAt: new Date().toISOString()
      };

      const nextProjects = [newProject, ...state.savedProjects];
      localStorage.setItem('sdg_platform_projects', JSON.stringify(nextProjects));
      return { ...state, savedProjects: nextProjects };
    }

    case 'DELETE_PROJECT': {
      const nextProjects = state.savedProjects.filter(p => p.id !== action.payload);
      localStorage.setItem('sdg_platform_projects', JSON.stringify(nextProjects));
      return { ...state, savedProjects: nextProjects };
    }

    case 'COMPLETE_ONBOARDING': {
      localStorage.setItem('sdg_platform_onboarding', 'true');
      return { ...state, onboardingCompleted: true };
    }

    case 'RESET_ONBOARDING': {
      localStorage.removeItem('sdg_platform_onboarding');
      return { ...state, onboardingCompleted: false };
    }

    case 'ADD_TOAST': {
      const newToast: ToastItem = {
        id: Math.random().toString(36).substring(2, 9),
        message: action.payload.message,
        type: action.payload.type
      };
      return { ...state, toasts: [...state.toasts, newToast] };
    }

    case 'REMOVE_TOAST': {
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.payload) };
    }

    default:
      return state;
  }
}

const PlatformContext = createContext<{
  state: PlatformState;
  dispatch: (action: PlatformAction) => void;
} | null>(null);

export function PlatformProvider({ children }: { children: ComponentChildren }) {
  const [state, dispatch] = useReducer(platformReducer, null, getInitialState);

  // Sync theme changes with body element attribute for CSS styling
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  // Sync language with standard document attributes
  useEffect(() => {
    document.documentElement.setAttribute('lang', state.language);
  }, [state.language]);

  return (
    <PlatformContext.Provider value={{ state, dispatch }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) {
    throw new Error('usePlatform must be used within a PlatformProvider');
  }
  return context;
}
