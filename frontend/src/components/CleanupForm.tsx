import { useState } from 'react';
import axios from 'axios';
import { ImagePairUploader } from './ImagePairUploader';
import { AddressAutocomplete } from './AddressAutocomplete';

export function CleanupForm({ onSubmitted }: { onSubmitted?: () => void }) {
  // 'address' will hold the normalized short format; we also keep the verbose original when present.
  const [address, setAddress] = useState('');
  const [normalizedAddress, setNormalizedAddress] = useState<string>('');
  const [originalFullAddress, setOriginalFullAddress] = useState<string>('');
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [images, setImages] = useState<{ before: File | null; after: File | null }>({ before: null, after: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<string | null>(null);

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
      if (!normalizedAddress || !coords) {
        setError('Please select an address from suggestions');
        setLoading(false);
        return;
      }
      const form = new FormData();
      form.append('image1', images.before);
      form.append('image2', images.after);
  form.append('address', address); // short normalized
  form.append('normalized_address', normalizedAddress || address);
  if (originalFullAddress) form.append('full_address_raw', originalFullAddress);
      form.append('latitude', String(coords.lat));
      form.append('longitude', String(coords.lon));
      const resp = await axios.post('/genai', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      setAiResult(resp.data?.response || 'No response');
  setAddress('');
  setNormalizedAddress('');
  setOriginalFullAddress('');
      setCoords(null);
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
        <label className="block text-sm font-medium mb-1">Address / Location</label>
        <AddressAutocomplete
          value={address}
          onChange={(v) => { setAddress(v); setNormalizedAddress(''); setOriginalFullAddress(''); setCoords(null); }}
          onSelect={({ value: v, normalized, lat, lon }) => { setAddress(v); setNormalizedAddress(normalized); setOriginalFullAddress(normalized); setCoords({ lat, lon }); }}
          placeholder="Start typing an address or intersection in Philadelphia"
        />
        {normalizedAddress && <p className="mt-1 text-[11px] text-green-600">Selected: {normalizedAddress}</p>}
        </div>
      </div>
  {error && <p className="text-sm text-red-600">{error}</p>}
  {aiResult && <p className="text-sm text-gray-700 border rounded p-2 bg-white">AI Result: {aiResult}</p>}
      <button
        type="submit"
        disabled={loading || !address || !normalizedAddress || !coords}
        className="w-full rounded-md bg-temple-red text-white py-2 font-medium disabled:opacity-50"
      >
        {loading ? 'Submitting...' : 'Submit Cleanup'}
      </button>
    </form>
  );
}
