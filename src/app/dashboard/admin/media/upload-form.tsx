"use client"
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import Image from 'next/image';
import { toast } from 'sonner';

type Destination = {
  id: string;
  name: string;
  location: string;
  description?: string;
};

type Media = {
  id: string;
  title: string;
  description?: string;
  type: 'IMAGE' | 'VIDEO' | 'REEL';
  url: string;
  destinationId?: string;
  createdAt: string;
};

export default function AdminMediaPage() {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [destinationId, setDestinationId] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [mediaType, setMediaType] = useState<'IMAGE' | 'VIDEO' | 'REEL'>('IMAGE');
  const [uploading, setUploading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [newDestination, setNewDestination] = useState({
    name: '',
    location: '',
    description: ''
  });
  const [creatingDestination, setCreatingDestination] = useState(false);

  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [currentTab, setCurrentTab] = useState<'upload' | 'manage'>('upload');

  useEffect(() => {
    fetchDestinations();
    fetchMedia();
  }, []);

  const fetchDestinations = async () => {
    try {
      const response = await axios.get('/api/admin/destinations');
      setDestinations(response.data);
    } catch (error) {
      toast.error('Failed to fetch destinations');
      console.error(error);
    }
  };

  const fetchMedia = async () => {
    setLoadingMedia(true);
    try {
      const response = await axios.get('/api/admin/media-upload');
      setMediaList(response.data);
    } catch (error) {
      toast.error('Failed to fetch media');
      console.error(error);
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleUpload = async () => {
    if (!file || !title || !destinationId) {
      setError('Please fill all required fields and select a file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { 
      setError('File size exceeds 10MB limit');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);
      formData.append('mediaType', mediaType);
      formData.append('destinationId', destinationId);

      const response = await axios.post('/api/admin/media-upload', formData);

      if (response.data.success) {
        toast.success('Media uploaded successfully!');
        setTitle('');
        setDescription('');
        setDestinationId('');
        setFile(null);
        setMediaType('IMAGE');
        if (fileInputRef.current) fileInputRef.current.value = '';
        fetchMedia();
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload media');
      toast.error('Failed to upload media');
    } finally {
      setUploading(false);
    }
  };

  const handleCreateDestination = async () => {
    if (!newDestination.name || !newDestination.location) {
      toast.error('Name and location are required');
      return;
    }

    setCreatingDestination(true);
    try {
      const response = await axios.post('/api/admin/destinations', newDestination);
      if (response.data.success) {
        toast.success('Destination created successfully!');
        setNewDestination({ name: '', location: '', description: '' });
        fetchDestinations();
      }
    } catch (error) {
      toast.error('Failed to create destination');
      console.error(error);
    } finally {
      setCreatingDestination(false);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Are you sure you want to delete this media?')) return;

    try {
      const response = await axios.delete(`/api/admin/media-upload/${mediaId}`);
      if (response.data.success) {
        toast.success('Media deleted successfully');
        fetchMedia();
      }
    } catch (error) {
      toast.error('Failed to delete media');
      console.error(error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 rounded-xl shadow space-y-6 mt-10">
      <h1 className="text-2xl font-bold text-center">Admin Media Management</h1>

      <div className="flex border-b">
        <button
          className={`px-4 py-2 font-medium ${currentTab === 'upload' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setCurrentTab('upload')}
        >
          Upload Media
        </button>
        <button
          className={`px-4 py-2 font-medium ${currentTab === 'manage' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          onClick={() => setCurrentTab('manage')}
        >
          Manage Media
        </button>
      </div>

      {currentTab === 'upload' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Upload New Media</h2>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-medium">Title*</label>
              <input
                type="text"
                placeholder="e.g. Kerala Backwaters"
                className="w-full border p-2 rounded"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Description</label>
              <textarea
                placeholder="Short description of the media..."
                className="w-full border p-2 rounded"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Destination*</label>
              <select
                className="w-full border p-2 rounded"
                value={destinationId}
                onChange={(e) => setDestinationId(e.target.value)}
                required
              >
                <option value="">Select a destination</option>
                {destinations.map(dest => (
                  <option key={dest.id} value={dest.id}>
                    {dest.name} ({dest.location})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Media Type</label>
              <select
                className="w-full border p-2 rounded"
                value={mediaType}
                onChange={(e) => setMediaType(e.target.value as 'IMAGE' | 'VIDEO' | 'REEL')}
              >
                <option value="IMAGE">Image</option>
                <option value="VIDEO">Video</option>
                <option value="REEL">Reel</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block font-medium">File*</label>
              <input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                ref={fileInputRef}
                className="w-full"
                required
              />
            </div>

            <button
              onClick={handleUpload}
              disabled={uploading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              {uploading ? 'Uploading...' : 'Upload Media'}
            </button>
          </div>

          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Create New Destination</h2>
            
            <div className="space-y-2">
              <label className="block font-medium">Name*</label>
              <input
                type="text"
                placeholder="e.g. Kerala"
                className="w-full border p-2 rounded"
                value={newDestination.name}
                onChange={(e) => setNewDestination({...newDestination, name: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Location*</label>
              <input
                type="text"
                placeholder="e.g. India"
                className="w-full border p-2 rounded"
                value={newDestination.location}
                onChange={(e) => setNewDestination({...newDestination, location: e.target.value})}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="block font-medium">Description</label>
              <textarea
                placeholder="Description of the destination..."
                className="w-full border p-2 rounded"
                value={newDestination.description}
                onChange={(e) => setNewDestination({...newDestination, description: e.target.value})}
              />
            </div>

            <button
              onClick={handleCreateDestination}
              disabled={creatingDestination}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              {creatingDestination ? 'Creating...' : 'Create Destination'}
            </button>

            <div className="mt-6">
              <h3 className="font-medium mb-2">Existing Destinations</h3>
              <div className="border rounded-lg divide-y">
                {destinations.map(dest => (
                  <div key={dest.id} className="p-3 hover:bg-gray-50">
                    <div className="font-medium">{dest.name}</div>
                    <div className="text-sm text-gray-500">{dest.location}</div>
                    {dest.description && (
                      <div className="text-sm mt-1">{dest.description}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <h2 className="text-xl font-semibold mb-4">Manage Media</h2>
          
          {loadingMedia ? (
            <div className="text-center py-8">Loading media...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaList.map(media => (
                <div key={media.id} className="border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                  <div className="h-48 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                    {media.type === 'IMAGE' ? (
                      <Image
                        src={media.url}
                        alt={media.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                        className="object-cover"
                        priority={false}
                      />
                    ) : (
                      <div className="text-center p-4">
                        <div className="text-4xl mb-2">🎥</div>
                        <p>Video/Reel</p>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h3 className="font-medium">{media.title}</h3>
                    {media.description && (
                      <p className="text-sm text-gray-600 mt-1">{media.description}</p>
                    )}
                    <div className="flex justify-between items-center mt-3">
                      <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                        {media.type}
                      </span>
                      <button 
                        onClick={() => handleDeleteMedia(media.id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                    {media.destinationId && (
                      <div className="mt-2 text-xs text-gray-500">
                        Destination: {destinations.find(d => d.id === media.destinationId)?.name || 'Unknown'}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}