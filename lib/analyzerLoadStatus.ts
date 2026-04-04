/**
 * Discriminated-union status tags for async UI flows.
 * Compare and branch with {@link AnalyzerLoadStatus} members, not raw strings.
 */
export const AnalyzerLoadStatus = {
  Idle: "idle",
  Loading: "loading",
  Error: "error",
  Ready: "ready",
} as const;

export type AnalyzerLoadStatusValue =
  (typeof AnalyzerLoadStatus)[keyof typeof AnalyzerLoadStatus];
