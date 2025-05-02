"use client"
import { useRouter } from 'next/navigation';
import { Button } from '../../../../components/ui/button';
import UploadForm from './upload-form';

export default function MediaUploadPage() {
  const router = useRouter();

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Upload Media</h1>
        <Button
          variant="outline"
          onClick={() => router.back()}
          className="border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          Back
        </Button>
      </div>
      <UploadForm />
    </div>
  );
}