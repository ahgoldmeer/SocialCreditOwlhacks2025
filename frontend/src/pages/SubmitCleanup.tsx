import { CleanupForm } from '../components/CleanupForm';

export function SubmitCleanup() {
  return (
    <div className="max-w-md mx-auto">
      <h2 className="font-semibold mb-4 text-lg">Submit Cleanup</h2>
      <p className="text-xs text-gray-600 mb-4">Upload clear before and after photos. Our AI will analyze the difference to validate the cleanup and award points.</p>
      <CleanupForm />
    </div>
  );
}
