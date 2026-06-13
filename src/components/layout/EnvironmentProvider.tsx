import React, { createContext, useContext, useEffect, useState } from 'react';

export type Environment = 'night-ops' | 'deep-space' | 'aurora' | 'mission-control';

interface EnvContextType {
  environment: Environment;
  setEnvironment: (env: Environment) => void;
  isTransitioning: boolean;
  setIsTransitioning: (val: boolean) => void;
  targetEnvironment: Environment | null;
  commitEnvironment: () => void;
}

const EnvContext = createContext<EnvContextType | undefined>(undefined);

export function EnvironmentProvider({ children }: { children: React.ReactNode }) {
  const [environment, setEnvState] = useState<Environment>('night-ops');
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [targetEnvironment, setTargetEnvironment] = useState<Environment | null>(null);

  useEffect(() => {
    // Initial load from localStorage
    const saved = localStorage.getItem('cloud-env') as Environment;
    if (saved && ['night-ops', 'deep-space', 'aurora', 'mission-control'].includes(saved)) {
      setEnvState(saved);
      document.documentElement.setAttribute('data-env', saved);
    }
  }, []);

  const setEnvironment = (env: Environment) => {
    if (env === environment || isTransitioning) return;
    setTargetEnvironment(env);
    setIsTransitioning(true);
    // The actual DOM change is deferred to commitEnvironment, 
    // which is called by the GlassTransition component at peak blur.
  };

  const commitEnvironment = () => {
    if (targetEnvironment) {
      setEnvState(targetEnvironment);
      document.documentElement.setAttribute('data-env', targetEnvironment);
      localStorage.setItem('cloud-env', targetEnvironment);
    }
  };

  return (
    <EnvContext.Provider
      value={{
        environment,
        setEnvironment,
        isTransitioning,
        setIsTransitioning,
        targetEnvironment,
        commitEnvironment,
      }}
    >
      {children}
    </EnvContext.Provider>
  );
}

export function useEnvironment() {
  const context = useContext(EnvContext);
  if (context === undefined) {
    throw new Error('useEnvironment must be used within an EnvironmentProvider');
  }
  return context;
}
