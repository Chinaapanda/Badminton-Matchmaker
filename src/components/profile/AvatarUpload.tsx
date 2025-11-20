"use client";

import { uploadAvatar } from '@/lib/api/profiles';
import { useState } from 'react';

interface AvatarUploadProps {
  userId: string;
  currentAvatarUrl: string | null;
  onUploadComplete: (url: string) => void;
}

export default function AvatarUpload({ userId, currentAvatarUrl, onUploadComplete }: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentAvatarUrl);
  const [error, setError] = useState('');

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be less than 2MB');
      return;
    }

    setError('');
    setUploading(true);

    try {
      // Preview image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);

      // Upload to Supabase
      const url = await uploadAvatar(userId, file);
      onUploadComplete(url);
    } catch (err: any) {
      setError(err.message || 'Failed to upload avatar');
      setPreview(currentAvatarUrl);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Avatar Display */}
      <div className="relative group">
        <div className="w-32 h-32 rounded-full overflow-hidden bg-zinc-800 border-4 border-zinc-700 shadow-lg">
          {preview ? (
            <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-zinc-600">
              {userId.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        
        {/* Upload overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent"></div>
          </div>
        )}
      </div>

      {/* Upload Button */}
      <label className="cursor-pointer px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-lg transition-all text-sm font-medium">
        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
        />
        {uploading ? 'Uploading...' : 'Change Avatar'}
      </label>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}
