import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, X } from "lucide-react";
import { Button } from "../ui/Button";

export const ImageUploadZone = ({
  onUpload,
  onClear,
  previewUrl,
  isLoading,
}) => {
  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.length > 0) {
        onUpload(acceptedFiles[0]);
      }
    },
    [onUpload],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp"] },
    maxFiles: 1,
    disabled: isLoading,
  });

  if (previewUrl) {
    return (
      <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden shadow-lg border-2 border-gray-200">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        <button
          onClick={onClear}
          disabled={isLoading}
          className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
        >
          <X size={20} />
        </button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`w-full h-64 md:h-96 border-4 border-dashed rounded-xl flex flex-col items-center justify-center p-6 cursor-pointer transition-colors duration-200 ${
        isDragActive
          ? "border-agri-primary bg-agri-primary/10"
          : "border-gray-300 hover:border-agri-primary/50"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <Upload size={48} className="text-gray-400 mb-4" />
      <p className="text-lg text-gray-600 text-center mb-2">
        {isDragActive
          ? "Drop the image here..."
          : "Drag & drop a crop image here"}
      </p>
      <p className="text-sm text-gray-400 mb-6">
        or click to select files (JPEG, PNG, WEBP)
      </p>
      <Button type="button" variant="outline" disabled={isLoading}>
        Select File
      </Button>
    </div>
  );
};
