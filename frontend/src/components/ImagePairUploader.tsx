import { useCallback, useState } from 'react';

interface ImagePairUploaderProps {
  onChange: (files: { before: File | null; after: File | null }) => void;
  required?: boolean;
}

interface LocalPreview {
  file: File;
  url: string;
}

const ACCEPT = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_MB = 8;

export function ImagePairUploader({ onChange }: ImagePairUploaderProps) {
  const [before, setBefore] = useState<LocalPreview | null>(null);
  const [after, setAfter] = useState<LocalPreview | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback((file: File, kind: 'before' | 'after') => {
    setError(null);
    if (!ACCEPT.includes(file.type)) {
      setError('Only JPG, PNG, WEBP allowed');
      return;
    }
    if (file.size / 1024 / 1024 > MAX_MB) {
      setError(`Image must be < ${MAX_MB}MB`);
      return;
    }
    const url = URL.createObjectURL(file);
    const preview = { file, url };
    if (kind === 'before') {
      if (before?.url) URL.revokeObjectURL(before.url);
      setBefore(preview);
      onChange({ before: file, after: after?.file || null });
    } else {
      if (after?.url) URL.revokeObjectURL(after.url);
      setAfter(preview);
      onChange({ before: before?.file || null, after: file });
    }
  }, [before, after, onChange]);

  function renderSlot(label: string, preview: LocalPreview | null, kind: 'before' | 'after') {
    return (
      <label className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-white p-4 text-center text-xs font-medium cursor-pointer hover:border-temple-red transition min-h-[140px]">
        {preview ? (
          <div className="space-y-2">
            <img src={preview.url} alt={label} className="mx-auto max-h-28 rounded object-cover" />
            <p className="truncate max-w-[140px] text-[10px] text-gray-600">{preview.file.name}</p>
            <span className="inline-block rounded bg-gray-100 px-2 py-0.5 text-[10px] text-gray-600">Replace</span>
          </div>
        ) : (
          <div className="space-y-2">
            <span className="block text-sm">{label}</span>
            <span className="text-[10px] text-gray-500">Tap to upload</span>
          </div>
        )}
        <input
          type="file"
          accept={ACCEPT.join(',')}
          className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0], kind)}
        />
      </label>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Before / After Photos</p>
      <div className="grid grid-cols-2 gap-3">
        {renderSlot('Before', before, 'before')}
        {renderSlot('After', after, 'after')}
      </div>
      <p className="text-[10px] text-gray-500">Provide clear, similar-framed shots. These will be analyzed by AI to confirm cleanup impact.</p>
      {error && <p className="text-xs text-red-600">{error}</p>}
    </div>
  );
}
