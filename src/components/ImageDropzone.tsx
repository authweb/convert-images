import { useDropzone } from 'react-dropzone';
import { FiUpload } from 'react-icons/fi';

interface ImageDropzoneProps {
  onDrop: (files: File[]) => void;
}

export default function ImageDropzone({ onDrop }: ImageDropzoneProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp', '.gif']
    },
    multiple: true
  });

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
        isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600'
      }`}
    >
      <input {...getInputProps()} />
      <FiUpload className="mx-auto h-12 w-12 text-gray-400" />
      <p className="mt-2 text-sm text-gray-400">
        {isDragActive
          ? 'Drop the images here'
          : 'Drag and drop images here, or click to select'}
      </p>
    </div>
  );
} 