import { atom } from 'nanostores';

export type Environment = 'night-ops' | 'deep-space' | 'aurora' | 'mission-control';

export const $environment = atom<Environment>('night-ops');
export const $isTransitioning = atom<boolean>(false);
export const $targetEnvironment = atom<Environment | null>(null);

// Initialize from localStorage or document attribute if on client
if (typeof window !== 'undefined') {
  const saved = localStorage.getItem('cloud-env') as Environment;
  if (saved && ['night-ops', 'deep-space', 'aurora', 'mission-control'].includes(saved)) {
    $environment.set(saved);
  } else {
    // If no localStorage, the inline script in BaseLayout randomly set it on the document.
    const attr = document.documentElement.getAttribute('data-env') as Environment;
    if (attr && ['night-ops', 'deep-space', 'aurora', 'mission-control'].includes(attr)) {
      $environment.set(attr);
    }
  }
}

export function triggerEnvironmentChange(newEnv: Environment) {
  if (newEnv === $environment.get() || $isTransitioning.get()) return;
  $targetEnvironment.set(newEnv);
  $isTransitioning.set(true);
  // The GlassTransition component will listen to $isTransitioning and orchestrate the blur.
  // It will call commitEnvironmentChange() at peak blur.
}

export function commitEnvironmentChange() {
  const target = $targetEnvironment.get();
  if (target) {
    $environment.set(target);
    document.documentElement.setAttribute('data-env', target);
    localStorage.setItem('cloud-env', target);
    $targetEnvironment.set(null);
  }
}
