import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Upload, X, Camera, Image as ImageIcon } from "lucide-react";

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

  return (
    <div className="relative w-full aspect-video md:aspect-[16/10] overflow-hidden rounded-[2.5rem] bg-gray-50 dark:bg-gray-800/20 border-2 border-dashed border-gray-200 dark:border-gray-800 transition-all duration-500 group">
      <AnimatePresence mode="wait">
        {previewUrl ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative w-full h-full"
          >
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {isLoading && (
              <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-[2px] flex flex-col items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-4 bg-green-500/20 rounded-full blur-xl animate-pulse"></div>
                  <Loader2 className="w-12 h-12 text-white animate-spin relative z-10" />
                </div>
                <motion.p 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-white font-black uppercase tracking-[0.3em] text-[10px] mt-6"
                >
                  Neural Analysis in Progress
                </motion.p>
                
                {/* Scanning line animation */}
                <motion.div
                  initial={{ top: "0%" }}
                  animate={{ top: "100%" }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-green-400 to-transparent shadow-[0_0_15px_rgba(74,222,128,0.5)] z-20"
                />
              </div>
            )}

            {!isLoading && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onClear();
                }}
                className="absolute top-6 right-6 p-3 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl hover:bg-red-500 hover:border-red-500 transition-all duration-300"
              >
                <X size={18} />
              </button>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            {...getRootProps()}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`w-full h-full flex flex-col items-center justify-center p-12 cursor-pointer transition-all duration-500 ${
              isDragActive ? "bg-green-50/50 dark:bg-green-500/5 border-green-500" : "hover:bg-white dark:hover:bg-gray-800/40"
            }`}
          >
            <input {...getInputProps()} />
            
            <div className="relative mb-8">
              <div className="absolute -inset-4 bg-green-500/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center transition-all duration-500 ${
                isDragActive ? "bg-green-500 text-white scale-110" : "bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 shadow-xl"
              }`}>
                {isDragActive ? <Camera size={32} /> : <Upload size={32} />}
              </div>
            </div>

            <h4 className="text-xl font-black text-gray-900 dark:text-white mb-2 tracking-tight">
              {isDragActive ? "Drop Specimen Now" : "Upload Crop Specimen"}
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium text-center max-w-xs leading-relaxed">
              Drag and drop your image here, or <span className="text-green-600 font-bold">browse</span> from your secure local drive.
            </p>

            <div className="mt-10 flex items-center gap-6 opacity-30 group-hover:opacity-60 transition-opacity">
              <div className="flex items-center gap-2">
                <ImageIcon size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">High Res</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-gray-400"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">PNG / JPG / WEBP</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

