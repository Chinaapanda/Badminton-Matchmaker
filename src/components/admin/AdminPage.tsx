"use client";

import { useConfirm } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import type { Profile } from '@/lib/api/auth';
import { banUser, deleteUserProfile, fetchAllProfiles, unbanUser, updateUserElo } from '@/lib/api/profiles';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AdminPage() {
  const { profile: currentProfile } = useAuth();
  const router = useRouter();
  const { confirm, ConfirmDialogComponent } = useConfirm();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingElo, setEditingElo] = useState<{ userId: string; elo: number } | null>(null);

  useEffect(() => {
    if (!currentProfile) return;
    
    if (currentProfile.role !== 'admin') {
      router.push('/');
      return;
    }

    loadProfiles();
  }, [currentProfile, router]);

  const loadProfiles = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAllProfiles();
      setProfiles(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (userId: string, isBanned: boolean) => {
    try {
      if (isBanned) {
        await unbanUser(userId);
      } else {
        await banUser(userId);
      }
      await loadProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to update ban status');
    }
  };

  const handleDelete = async (userId: string, userName: string) => {
    const confirmed = await confirm(
      "Delete User",
      `Are you sure you want to delete user "${userName}"? This action cannot be undone.`,
      "danger"
    );
    if (!confirmed) return;

    try {
      await deleteUserProfile(userId);
      await loadProfiles();
    } catch (err: any) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const handleEloUpdate = async () => {
    if (!editingElo) return;

    try {
      await updateUserElo(editingElo.userId, editingElo.elo);
      await loadProfiles();
      setEditingElo(null);
    } catch (err: any) {
      setError(err.message || 'Failed to update ELO');
    }
  };

  const filteredProfiles = profiles.filter(p => 
    p.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!currentProfile || currentProfile.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-20">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            <span>←</span>
            <span>Back to Home</span>
          </button>
          <h1 className="text-lg font-bold">Admin Dashboard</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12 text-zinc-400">Loading users...</div>
        ) : (
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-zinc-800/50 border-b border-zinc-700">
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">User</th>
                    <th className="px-6 py-4 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">ELO</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">W/L</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800">
                  {filteredProfiles.map((user) => (
                    <tr key={user.id} className="hover:bg-zinc-800/30 transition-colors">
                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center text-sm font-medium">
                            {user.avatar_url ? (
                              <img src={user.avatar_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              user.display_name?.charAt(0).toUpperCase() || '?'
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{user.display_name || 'No name'}</div>
                            {user.id === currentProfile.id && (
                              <div className="text-xs text-emerald-500">You</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-6 py-4 text-sm text-zinc-400">{user.email}</td>

                      {/* Role */}
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          user.role === 'admin' 
                            ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                            : 'bg-zinc-700 text-zinc-300'
                        }`}>
                          {user.role}
                        </span>
                      </td>

                      {/* ELO */}
                      <td className="px-6 py-4 text-center">
                        {editingElo?.userId === user.id ? (
                          <div className="flex items-center justify-center gap-2">
                            <input
                              type="number"
                              value={editingElo.elo}
                              onChange={(e) => setEditingElo({ ...editingElo, elo: parseInt(e.target.value) || 0 })}
                              className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-sm text-center"
                              autoFocus
                            />
                            <button
                              onClick={handleEloUpdate}
                              className="text-emerald-500 hover:text-emerald-400 text-xs"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => setEditingElo(null)}
                              className="text-red-500 hover:text-red-400 text-xs"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingElo({ userId: user.id, elo: user.elo })}
                            className="text-emerald-500 hover:text-emerald-400 font-medium"
                          >
                            {user.elo}
                          </button>
                        )}
                      </td>

                      {/* Win/Loss */}
                      <td className="px-6 py-4 text-center text-sm">
                        <span className="text-emerald-500">{user.wins}</span>
                        {' / '}
                        <span className="text-red-500">{user.losses}</span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4 text-center">
                        {user.is_banned ? (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Active
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Ban/Unban */}
                          <button
                            onClick={() => handleBanToggle(user.id, user.is_banned)}
                            disabled={user.id === currentProfile.id}
                            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                              user.is_banned
                                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                                : 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 border border-orange-500/30'
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {user.is_banned ? 'Unban' : 'Ban'}
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(user.id, user.display_name || 'Unknown')}
                            disabled={user.id === currentProfile.id}
                            className="px-3 py-1 text-xs font-medium rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredProfiles.length === 0 && (
              <div className="text-center py-12 text-zinc-400">
                {searchQuery ? 'No users found matching your search' : 'No users found'}
              </div>
            )}
          </div>
        )}

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-emerald-500">{profiles.length}</div>
            <div className="text-sm text-zinc-400 mt-1">Total Users</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-500">
              {profiles.filter(p => p.role === 'admin').length}
            </div>
            <div className="text-sm text-zinc-400 mt-1">Admins</div>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 text-center">
            <div className="text-3xl font-bold text-red-500">
              {profiles.filter(p => p.is_banned).length}
            </div>
            <div className="text-sm text-zinc-400 mt-1">Banned Users</div>
          </div>
        </div>
      </main>

      {/* Confirm Dialog */}
      <ConfirmDialogComponent />
    </div>
  );
}
