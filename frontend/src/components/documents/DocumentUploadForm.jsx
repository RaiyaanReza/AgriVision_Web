import { useState } from "react";
import { useUploadDocument } from "../../hooks/useDocuments";
import { Button } from "../ui/Button";

export const DocumentUploadForm = ({ onSuccess }) => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [cropType, setCropType] = useState("Rice");
  const [diseaseName, setDiseaseName] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");

  const { mutate: upload, isPending } = useUploadDocument();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file || !title) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("crop_type", cropType);
    formData.append("disease_name", diseaseName);
    formData.append("content", content);
    formData.append("tags", tags);

    upload(formData, {
      onSuccess: () => {
        setFile(null);
        setTitle("");
        setDiseaseName("");
        setContent("");
        setTags("");
        onSuccess?.();
      },
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Title
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 transition-colors"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Crop Type
        </label>
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 transition-colors"
          value={cropType}
          onChange={(e) => setCropType(e.target.value)}
          required
        >
          <option>Rice</option>
          <option>Potato</option>
          <option>Corn</option>
          <option>Tomato</option>
          <option>Cabbage</option>
          <option>Cauliflower</option>
          <option>Gourd</option>
          <option>Guava</option>
          <option>Eggplant</option>
          <option>Chili</option>
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Disease Name (Optional)
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 transition-colors"
          value={diseaseName}
          onChange={(e) => setDiseaseName(e.target.value)}
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Treatment Content (Recommended)
        </label>
        <textarea
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 transition-colors"
          rows={4}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Add treatment notes to make local fallback search useful."
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          Tags (comma-separated, optional)
        </label>
        <input
          type="text"
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none ring-agri-primary/30 focus:ring dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 transition-colors"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="fungicide, organic, preventive"
        />
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
          File (PDF/JSON/TXT)
        </label>
        <input
          type="file"
          className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:bg-slate-900/60 dark:border-slate-600 dark:text-slate-100 transition-colors"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".pdf,.json,.txt"
          required
        />
      </div>
      <div className="flex justify-end mt-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Uploading..." : "Upload Knowledge"}
        </Button>
      </div>
    </form>
  );
};
