import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { LoaderCircle, Upload, X } from "lucide-react";
import { Button } from "../ui/Button";

const MotionDiv = motion.div;

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
      <div className="relative w-full h-64 md:h-96 rounded-2xl overflow-hidden shadow-lg border border-emerald-200/70 dark:border-slate-700 transition-colors">
        <img
          src={previewUrl}
          alt="Preview"
          className="w-full h-full object-cover"
        />
        {isLoading && (
          <div className="absolute inset-0 bg-slate-900/35 backdrop-blur-[1px]">
            <MotionDiv
              initial={{ y: "-20%" }}
              animate={{ y: "105%" }}
              transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
              className="absolute left-0 right-0 h-16 bg-gradient-to-b from-transparent via-emerald-300/55 to-transparent"
            />
            <div className="absolute inset-x-0 bottom-4 flex items-center justify-center gap-2 text-sm font-medium text-white">
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Processing image...
            </div>
          </div>
        )}
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
      className={`w-full h-64 md:h-96 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 cursor-pointer transition-colors duration-200 ${
        isDragActive
          ? "border-agri-primary bg-agri-primary/10"
          : "border-emerald-300/70 bg-gradient-to-br from-emerald-50 to-teal-50 hover:border-agri-primary/60 dark:border-slate-600 dark:from-slate-800/40 dark:to-slate-800/20 dark:hover:border-slate-500"
      } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      <input {...getInputProps()} />
      <Upload
        size={44}
        className="text-emerald-700 mb-4 dark:text-emerald-400"
      />
      <p className="text-lg text-slate-700 text-center mb-2 font-medium dark:text-slate-300">
        {isDragActive
          ? "Drop the image here..."
          : "Drag & drop a crop image here"}
      </p>
      <p className="text-sm text-slate-500 mb-6 dark:text-slate-400">
        or click to select files (JPEG, PNG, WEBP)
      </p>
      <Button type="button" variant="outline" disabled={isLoading}>
        Select File
      </Button>
    </div>
  );
};
