"use client";

import { useAuth } from '@/contexts/AuthContext';
import { updateProfile } from '@/lib/api/profiles';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import AvatarUpload from './AvatarUpload';

export default function ProfilePage() {
  const { profile, user, refreshProfile } = useAuth();
  const router = useRouter();
  const [editingName, setEditingName] = useState(false);
  const [displayName, setDisplayName] = useState(profile?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (!user || !profile) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  const handleSaveName = async () => {
    if (!displayName.trim()) {
      setError('Display name cannot be empty');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateProfile(user.id, { display_name: displayName.trim() });
      await refreshProfile();
      setEditingName(false);
    } catch (err: any) {
      setError(err.message || 'Failed to update name');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (url: string) => {
    await refreshProfile();
  };

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
          <h1 className="text-lg font-bold">My Profile</h1>
          <div className="w-24"></div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          {/* Avatar Section */}
          <div className="mb-8">
            <AvatarUpload
              userId={user.id}
              currentAvatarUrl={profile.avatar_url}
              onUploadComplete={handleAvatarUpload}
            />
          </div>

          {/* Display Name Section */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-zinc-400 mb-3">Display Name</label>
            {editingName ? (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  disabled={saving}
                  className="px-6 py-3 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-700 text-zinc-950 font-medium rounded-lg transition-all"
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
                <button
                  onClick={() => {
                    setEditingName(false);
                    setDisplayName(profile.display_name || '');
                    setError('');
                  }}
                  className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-lg">
                <span className="text-lg">{profile.display_name || 'No name set'}</span>
                <button
                  onClick={() => setEditingName(true)}
                  className="text-emerald-500 hover:text-emerald-400 font-medium text-sm"
                >
                  Edit
                </button>
              </div>
            )}
            {error && <p className="mt-2 text-red-400 text-sm">{error}</p>}
          </div>

          {/* Email (Read-only) */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-zinc-400 mb-3">Email</label>
            <div className="px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-lg text-zinc-400">
              {profile.email}
            </div>
          </div>

          {/* Stats Grid (Read-only) */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-zinc-400 mb-3">Statistics</label>
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-500">{profile.elo}</div>
                <div className="text-xs text-zinc-400 mt-1">ELO Rating</div>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-500">{profile.wins}</div>
                <div className="text-xs text-zinc-400 mt-1">Wins</div>
              </div>
              <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-500">{profile.losses}</div>
                <div className="text-xs text-zinc-400 mt-1">Losses</div>
              </div>
            </div>
          </div>

          {/* Win Rate */}
          {(profile.wins + profile.losses) > 0 && (
            <div className="bg-zinc-800/30 border border-zinc-700/30 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-zinc-400">Win Rate</span>
                <span className="text-sm font-medium">
                  {((profile.wins / (profile.wins + profile.losses)) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(profile.wins / (profile.wins + profile.losses)) * 100}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
