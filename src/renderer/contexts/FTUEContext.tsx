import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

export type FTUEStep =
  | 'welcome'
  | 'resources_header'
  | 'resources_map_card'
  | 'resources_on_map_button'
  | 'rotations_header'
  | 'rotations_editor';

export type FTUEScreen = 'main' | 'rotations';

/** Steps that belong to the main (resources) FTUE flow */
const MAIN_STEPS: FTUEStep[] = [
  'welcome',
  'resources_header',
  'resources_map_card',
  'resources_on_map_button',
];

/** Steps that belong to the rotations FTUE flow */
const ROTATIONS_STEPS: FTUEStep[] = ['rotations_header', 'rotations_editor'];

interface FTUEContextType {
  isFTUEComplete: boolean;
  completedSteps: Set<FTUEStep>;
  markStepComplete: (step: FTUEStep) => void;
  resetFTUE: () => void;
  shouldShowStep: (step: FTUEStep) => boolean;
  /** Call when the user navigates to the Rotations view to kick off its FTUE. */
  startRotationsFTUE: () => void;
  /** Call when the user visits the Interactive Map view to clear its new badge. */
  markInteractiveMapSeen: () => void;
  /**
   * Returns true when a view has an FTUE the user hasn't seen yet.
   * Use this to show a "New" badge on sidebar items, cards, etc.
   * To support a new feature, add a case inside the provider.
   */
  hasUnseenFTUE: (viewName: string) => boolean;
}

interface FTUEProviderProps {
  children: ReactNode;
  /** Called when FTUE is reset (e.g. from settings). Use to close settings and switch to main view. */
  onReset?: () => void;
}

const FTUEContext = createContext<FTUEContextType | undefined>(undefined);

const STORAGE_KEY = 'endfield_companion_ftue_completed';
const STEPS_STORAGE_KEY = 'endfield_companion_ftue_steps';
const ROTATIONS_FTUE_STORAGE_KEY =
  'endfield_companion_rotations_ftue_completed';
const INTERACTIVE_MAP_FTUE_STORAGE_KEY =
  'endfield_companion_interactive_map_ftue_completed';

export const FTUEProvider: React.FC<FTUEProviderProps> = ({
  children,
  onReset,
}) => {
  // ── Main FTUE ──────────────────────────────────────────────
  const [isFTUEComplete, setIsFTUEComplete] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) === 'true';
    } catch {
      return false;
    }
  });

  // ── Rotations FTUE ────────────────────────────────────────
  const [isRotationsFTUEComplete, setIsRotationsFTUEComplete] =
    useState<boolean>(() => {
      try {
        return localStorage.getItem(ROTATIONS_FTUE_STORAGE_KEY) === 'true';
      } catch {
        return false;
      }
    });

  // ── Interactive Map FTUE ──────────────────────────────────
  const [isInteractiveMapFTUEComplete, setIsInteractiveMapFTUEComplete] =
    useState<boolean>(() => {
      try {
        return (
          localStorage.getItem(INTERACTIVE_MAP_FTUE_STORAGE_KEY) === 'true'
        );
      } catch {
        return false;
      }
    });

  /** Runtime flag – true while the rotations FTUE is being presented. */
  const [isRotationsFTUEActive, setIsRotationsFTUEActive] = useState(false);

  // ── Shared completed-steps set ────────────────────────────
  const [completedSteps, setCompletedSteps] = useState<Set<FTUEStep>>(() => {
    try {
      const stored = localStorage.getItem(STEPS_STORAGE_KEY);
      if (stored) {
        const steps = JSON.parse(stored) as FTUEStep[];
        return new Set(steps);
      }
    } catch {
      // Ignore errors
    }
    return new Set<FTUEStep>();
  });

  const markStepComplete = (step: FTUEStep) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      newSet.add(step);

      try {
        localStorage.setItem(
          STEPS_STORAGE_KEY,
          JSON.stringify(Array.from(newSet)),
        );
      } catch {
        // Ignore errors
      }

      return newSet;
    });
  };

  const resetFTUE = () => {
    setIsFTUEComplete(false);
    setIsRotationsFTUEComplete(false);
    setIsRotationsFTUEActive(false);
    setIsInteractiveMapFTUEComplete(false);
    setCompletedSteps(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(STEPS_STORAGE_KEY);
      localStorage.removeItem(ROTATIONS_FTUE_STORAGE_KEY);
      localStorage.removeItem(INTERACTIVE_MAP_FTUE_STORAGE_KEY);
    } catch {
      // Ignore errors
    }
    onReset?.();
  };

  // ── Completion helpers ────────────────────────────────────
  const completeMainFTUE = () => {
    setIsFTUEComplete(true);
    try {
      localStorage.setItem(STORAGE_KEY, 'true');
    } catch {
      // Ignore errors
    }
  };

  const completeRotationsFTUE = () => {
    setIsRotationsFTUEComplete(true);
    setIsRotationsFTUEActive(false);
    try {
      localStorage.setItem(ROTATIONS_FTUE_STORAGE_KEY, 'true');
    } catch {
      // Ignore errors
    }
  };

  const completeInteractiveMapFTUE = () => {
    setIsInteractiveMapFTUEComplete(true);
    try {
      localStorage.setItem(INTERACTIVE_MAP_FTUE_STORAGE_KEY, 'true');
    } catch {
      // Ignore errors
    }
  };

  // ── Step sequencing ───────────────────────────────────────
  const shouldShowStep = useCallback(
    (step: FTUEStep): boolean => {
      if (completedSteps.has(step)) return false;

      // Main FTUE flow
      if (MAIN_STEPS.includes(step)) {
        if (isFTUEComplete) return false;
        const nextMainStep = MAIN_STEPS.find((s) => !completedSteps.has(s));
        return nextMainStep === step;
      }

      // Rotations FTUE flow
      if (ROTATIONS_STEPS.includes(step)) {
        if (isRotationsFTUEComplete || !isRotationsFTUEActive) return false;
        const nextRotationsStep = ROTATIONS_STEPS.find(
          (s) => !completedSteps.has(s),
        );
        return nextRotationsStep === step;
      }

      return false;
    },
    [
      completedSteps,
      isFTUEComplete,
      isRotationsFTUEComplete,
      isRotationsFTUEActive,
    ],
  );

  /** Activate the rotations FTUE (no-op if already completed). */
  const startRotationsFTUE = useCallback(() => {
    if (!isRotationsFTUEComplete) {
      setIsRotationsFTUEActive(true);
    }
  }, [isRotationsFTUEComplete]);

  /** Mark the interactive map as seen so its new badge disappears. */
  const markInteractiveMapSeen = useCallback(() => {
    if (!isInteractiveMapFTUEComplete) {
      completeInteractiveMapFTUE();
    }
  }, [isInteractiveMapFTUEComplete]);

  /**
   * Generic check: does this view have an unseen FTUE?
   * Add a case for each new feature that has its own FTUE flow.
   */
  const hasUnseenFTUE = useCallback(
    (viewName: string): boolean => {
      switch (viewName) {
        case 'Rotations':
          return !isRotationsFTUEComplete;
        case 'Interactive Map':
          return !isInteractiveMapFTUEComplete;
        default:
          return false;
      }
    },
    [isRotationsFTUEComplete, isInteractiveMapFTUEComplete],
  );

  // ── Auto-complete when all steps in a group are done ──────
  useEffect(() => {
    const allMainComplete = MAIN_STEPS.every((step) =>
      completedSteps.has(step),
    );
    if (allMainComplete && !isFTUEComplete) {
      completeMainFTUE();
    }
  }, [completedSteps, isFTUEComplete]);

  useEffect(() => {
    const allRotationsComplete = ROTATIONS_STEPS.every((step) =>
      completedSteps.has(step),
    );
    if (allRotationsComplete && !isRotationsFTUEComplete) {
      completeRotationsFTUE();
    }
  }, [completedSteps, isRotationsFTUEComplete]);

  return (
    <FTUEContext.Provider
      value={{
        isFTUEComplete,
        completedSteps,
        markStepComplete,
        resetFTUE,
        shouldShowStep,
        startRotationsFTUE,
        markInteractiveMapSeen,
        hasUnseenFTUE,
      }}
    >
      {children}
    </FTUEContext.Provider>
  );
};

export const useFTUE = (): FTUEContextType => {
  const context = useContext(FTUEContext);
  if (!context) {
    throw new Error('useFTUE must be used within FTUEProvider');
  }
  return context;
};
