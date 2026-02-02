// AchievementProvider
// Global provider that handles badge achievement modals
// Syncs badges on mount and shows modals for newly earned badges

import { useEffect, useCallback } from 'react';
import { useUserStore } from '@/store/userStore';
import AchievementModal from '@/components/AchievementModal';

interface AchievementProviderProps {
  children: React.ReactNode;
}

export default function AchievementProvider({ children }: AchievementProviderProps) {
  const user = useUserStore(state => state.user);
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const pendingAchievements = useUserStore(state => state.pendingAchievements);
  const syncBadges = useUserStore(state => state.syncBadges);
  const dismissAchievement = useUserStore(state => state.dismissAchievement);

  // Sync badges when user becomes authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      syncBadges();
    }
  }, [isAuthenticated, user?.id]);

  // Handle dismissing the current achievement modal
  const handleDismiss = useCallback(() => {
    dismissAchievement();
  }, [dismissAchievement]);

  // Get the first pending achievement to display
  const currentAchievement = pendingAchievements.length > 0 ? pendingAchievements[0] : null;

  return (
    <>
      {children}
      <AchievementModal
        badge={currentAchievement}
        visible={currentAchievement !== null}
        onDismiss={handleDismiss}
      />
    </>
  );
}

// Hook to manually trigger badge sync (call after submission approval)
export function useSyncBadges() {
  const syncBadges = useUserStore(state => state.syncBadges);
  const refreshStats = useUserStore(state => state.refreshStats);

  return useCallback(async () => {
    // First refresh stats (which triggers badge check on server)
    await refreshStats();
    // Then sync badges to get any newly earned ones
    return syncBadges();
  }, [syncBadges, refreshStats]);
}
