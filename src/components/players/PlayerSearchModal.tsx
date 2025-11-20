import { Profile } from "@/lib/api/auth";
import { fetchAllProfiles, searchProfiles } from "@/lib/api/profiles";
import { useEffect, useState } from "react";

interface PlayerSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (profile: Profile) => void;
  existingPlayerIds: string[];
}

export default function PlayerSearchModal({
  isOpen,
  onClose,
  onSelect,
  existingPlayerIds,
}: PlayerSearchModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadProfiles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      handleSearch();
    } else {
      loadProfiles();
    }
  }, [searchQuery]);

  const loadProfiles = async () => {
    setLoading(true);
    setError("");
    try {
      const allProfiles = await fetchAllProfiles();
      setProfiles(allProfiles);
    } catch (err) {
      console.error("Failed to load profiles:", err);
      setError("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError("");
    try {
      const results = await searchProfiles(searchQuery);
      setProfiles(results);
    } catch (err) {
      console.error("Search failed:", err);
      setError("Search failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (profile: Profile) => {
    onSelect(profile);
    setSearchQuery("");
    onClose();
  };

  if (!isOpen) return null;

  // Filter out users that are already in the roster
  const availableProfiles = profiles.filter(
    (p) => !existingPlayerIds.includes(p.id)
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl w-full max-w-md max-h-[80vh] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
            <h2 className="text-xl font-bold">Add Player from Users</h2>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-white transition-colors p-1"
            >
              ✕
            </button>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-zinc-800">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              autoFocus
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mx-auto mb-2"></div>
                <p className="text-zinc-400 text-sm">Loading...</p>
              </div>
            ) : availableProfiles.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-zinc-400">
                  {searchQuery
                    ? "No users found"
                    : "No available users to add"}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availableProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleSelect(profile)}
                    className="w-full flex items-center gap-3 p-3 bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 hover:border-emerald-500/30 rounded-lg transition-all text-left group"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-zinc-700 flex items-center justify-center text-sm font-medium flex-shrink-0">
                      {profile.avatar_url ? (
                        <img
                          src={profile.avatar_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        profile.display_name?.charAt(0).toUpperCase() || "?"
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">
                        {profile.display_name}
                      </div>
                      <div className="text-xs text-zinc-400 truncate">
                        {profile.email}
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500">
                      ELO: {profile.elo}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
