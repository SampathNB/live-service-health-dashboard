import React from 'react';
import { useStore } from '@/store';
import { FeatureFlags } from '@shared/types';

interface FeatureFlagProps {
  name: keyof FeatureFlags;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Centered Feature Flag component to demonstrate a scalable pattern.
 * This prevents "if" checks from being scattered across the codebase.
 */
export function FeatureFlag({ name, children, fallback = null }: FeatureFlagProps) {
  const { featureFlags } = useStore();
  const isEnabled = featureFlags[name];

  if (!isEnabled) return <>{fallback}</>;
  return <>{children}</>;
}

export function useFeatureFlag(name: keyof FeatureFlags) {
  const { featureFlags } = useStore();
  return featureFlags[name];
}
