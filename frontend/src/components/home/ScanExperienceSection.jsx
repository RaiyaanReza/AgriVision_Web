import { ImageUploadZone } from "../prediction/ImageUploadZone";
import { ScanWorkflowCard } from "./ScanWorkflowCard";

export function ScanExperienceSection({
  onUpload,
  onClear,
  previewUrl,
  isPending,
  onSubmit,
  hasImage,
  error,
}) {
  return (
    <div className="mt-8 bg-white p-6 md:p-10 rounded-3xl shadow-xl mb-8 ring-1 ring-emerald-100/70">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.7fr_1fr]">
        <ImageUploadZone
          onUpload={onUpload}
          onClear={onClear}
          previewUrl={previewUrl}
          isLoading={isPending}
        />

        <ScanWorkflowCard
          onSubmit={onSubmit}
          isPending={isPending}
          hasImage={hasImage}
        />
      </div>

      <div className="mt-4 flex flex-col items-center">
        {error && (
          <p className="text-red-500 mt-4 text-sm font-medium animate-pulse">
            {error.message || "Error occurred."}
          </p>
        )}
      </div>
    </div>
  );
}
