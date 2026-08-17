/**
 * Local/demo data is opt-in.  Authenticated production sessions must never
 * hydrate financial state from browser storage or bundled fixtures.
 */
export const isExplicitDemoMode = (): boolean =>
  Boolean(import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEMO_MODE === 'true');

export const emptyIfNotDemo = <T>(demoValue: () => T): T | undefined =>
  isExplicitDemoMode() ? demoValue() : undefined;
