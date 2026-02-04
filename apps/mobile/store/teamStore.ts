// Team State Store
// Manages teams for multi-person challenges

import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { Team, TeamMember } from '@solvterra/shared';

interface TeamState {
  // Current user's teams
  myTeams: Team[];
  isLoading: boolean;

  // Actions
  fetchMyTeams: () => Promise<void>;
  getTeamForChallenge: (challengeId: string) => Team | undefined;

  // Team creation (called when inviting friends)
  createTeam: (challengeId: string, invitedUserIds: string[]) => Promise<Team | null>;

  // Team invite responses
  acceptTeamInvite: (teamId: string) => Promise<boolean>;
  declineTeamInvite: (teamId: string) => Promise<boolean>;

  // Get team members with details
  fetchTeamDetails: (teamId: string) => Promise<Team | null>;
}

export const useTeamStore = create<TeamState>((set, get) => ({
  myTeams: [],
  isLoading: false,

  fetchMyTeams: async () => {
    set({ isLoading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ isLoading: false });
        return;
      }

      // Get teams where user is a member
      const { data: membershipData, error: memberError } = await supabase
        .from('team_members')
        .select('team_id')
        .eq('user_id', user.id);

      if (memberError) throw memberError;

      if (!membershipData || membershipData.length === 0) {
        set({ myTeams: [], isLoading: false });
        return;
      }

      const teamIds = membershipData.map(m => m.team_id);

      // Fetch team details
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          *,
          challenge:challenges(id, title, min_team_size, max_team_size, xp_reward),
          members:team_members(
            id, user_id, role, status, invited_at, accepted_at,
            user:users(id, name, avatar, level)
          )
        `)
        .in('id', teamIds);

      if (teamsError) throw teamsError;

      const teams: Team[] = (teamsData || []).map(t => ({
        id: t.id,
        challengeId: t.challenge_id,
        creatorId: t.creator_id,
        status: t.status,
        createdAt: new Date(t.created_at),
        activatedAt: t.activated_at ? new Date(t.activated_at) : undefined,
        challenge: t.challenge,
        members: t.members?.map((m: Record<string, unknown>) => {
          const userData = m.user as Record<string, unknown> | null;
          return {
            id: m.id,
            teamId: t.id,
            userId: m.user_id,
            role: m.role,
            status: m.status,
            invitedAt: new Date(m.invited_at as string),
            acceptedAt: m.accepted_at ? new Date(m.accepted_at as string) : undefined,
            user: userData ? {
              id: userData.id as string,
              name: userData.name as string,
              avatarUrl: userData.avatar as string | undefined,
              level: userData.level as number,
            } : undefined,
          } as TeamMember;
        }),
      }));

      set({ myTeams: teams, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      set({ isLoading: false });
    }
  },

  getTeamForChallenge: (challengeId: string) => {
    return get().myTeams.find(t => t.challengeId === challengeId);
  },

  createTeam: async (challengeId: string, invitedUserIds: string[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Create team
      const { data: teamData, error: teamError } = await supabase
        .from('teams')
        .insert({
          challenge_id: challengeId,
          creator_id: user.id,
          status: 'forming',
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Add creator as accepted member
      await supabase.from('team_members').insert({
        team_id: teamData.id,
        user_id: user.id,
        role: 'creator',
        status: 'accepted',
        accepted_at: new Date().toISOString(),
      });

      // Add invited members
      if (invitedUserIds.length > 0) {
        const invites = invitedUserIds.map(userId => ({
          team_id: teamData.id,
          user_id: userId,
          role: 'member',
          status: 'invited',
        }));
        await supabase.from('team_members').insert(invites);
      }

      // Refresh teams
      await get().fetchMyTeams();

      return get().myTeams.find(t => t.id === teamData.id) || null;
    } catch (error) {
      console.error('Failed to create team:', error);
      return null;
    }
  },

  acceptTeamInvite: async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('team_members')
        .update({
          status: 'accepted',
          accepted_at: new Date().toISOString()
        })
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      await get().fetchMyTeams();
      return true;
    } catch (error) {
      console.error('Failed to accept team invite:', error);
      return false;
    }
  },

  declineTeamInvite: async (teamId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { error } = await supabase
        .from('team_members')
        .update({ status: 'declined' })
        .eq('team_id', teamId)
        .eq('user_id', user.id);

      if (error) throw error;

      await get().fetchMyTeams();
      return true;
    } catch (error) {
      console.error('Failed to decline team invite:', error);
      return false;
    }
  },

  fetchTeamDetails: async (teamId: string) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          challenge:challenges(id, title, min_team_size, max_team_size, xp_reward),
          members:team_members(
            id, user_id, role, status, invited_at, accepted_at,
            user:users(id, name, avatar, level),
            submission:submissions(id, status)
          )
        `)
        .eq('id', teamId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        challengeId: data.challenge_id,
        creatorId: data.creator_id,
        status: data.status,
        createdAt: new Date(data.created_at),
        activatedAt: data.activated_at ? new Date(data.activated_at) : undefined,
        challenge: data.challenge,
        members: data.members?.map((m: Record<string, unknown>) => {
          const userData = m.user as Record<string, unknown> | null;
          return {
            id: m.id,
            teamId: data.id,
            userId: m.user_id,
            role: m.role,
            status: m.status,
            invitedAt: new Date(m.invited_at as string),
            acceptedAt: m.accepted_at ? new Date(m.accepted_at as string) : undefined,
            user: userData ? {
              id: userData.id as string,
              name: userData.name as string,
              avatarUrl: userData.avatar as string | undefined,
              level: userData.level as number,
            } : undefined,
            submission: m.submission,
          } as TeamMember;
        }),
      } as Team;
    } catch (error) {
      console.error('Failed to fetch team details:', error);
      return null;
    }
  },
}));
