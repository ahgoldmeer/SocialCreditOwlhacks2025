import { useState } from 'react';
import axios from 'axios';
import { ImagePairUploader } from './ImagePairUploader';

export function CleanupForm({ onSubmitted }: { onSubmitted?: () => void }) {
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<{ before: File | null; after: File | null }>({ before: null, after: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!images.before || !images.after) {
        setError('Before and after images are required');
        setLoading(false);
        return;
      }
      const form = new FormData();
      form.append('description', description);
      form.append('before_image', images.before);
      form.append('after_image', images.after);
      await axios.post('/cleanups', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setDescription('');
      setImages({ before: null, after: null });
      onSubmitted?.();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Submission failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-4">
        <ImagePairUploader onChange={setImages} />
        <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <textarea
          required
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full rounded-md border p-2 text-sm"
          placeholder="What area did you clean? Any details?"
        />
        </div>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-md bg-temple-red text-white py-2 font-medium disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Cleanup'}
      </button>
    </form>
  );
}
