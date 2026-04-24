import { useDeleteDocument } from "../../hooks/useDocuments";
import { formatDate } from "../../utils/formatters";
import { Button } from "../ui/Button";

export const DocumentTable = ({ documents }) => {
  const { mutate: delDoc, isPending } = useDeleteDocument();

  if (!documents?.length) {
    return (
      <div className="text-center p-8 text-gray-500 dark:text-slate-400">
        No documents found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow dark:bg-slate-800/60 transition-colors">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-slate-700 dark:bg-slate-900/40 dark:text-slate-300">
          <tr>
            <th className="border-b px-4 py-3 dark:border-slate-700">Title</th>
            <th className="border-b px-4 py-3 dark:border-slate-700">Crop</th>
            <th className="border-b px-4 py-3 dark:border-slate-700">
              Disease
            </th>
            <th className="border-b px-4 py-3 dark:border-slate-700">
              Uploaded
            </th>
            <th className="border-b px-4 py-3 dark:border-slate-700">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id || doc._id}
              className="odd:bg-white even:bg-slate-50/50 dark:odd:bg-slate-800/40 dark:even:bg-slate-800/20"
            >
              <td className="border-b px-4 py-3 font-medium dark:text-slate-100 dark:border-slate-700">
                {doc.title}
              </td>
              <td className="border-b px-4 py-3 dark:text-slate-300 dark:border-slate-700">
                {doc.crop_type}
              </td>
              <td className="border-b px-4 py-3 dark:text-slate-300 dark:border-slate-700">
                {doc.disease_name || "-"}
              </td>
              <td className="border-b px-4 py-3 dark:text-slate-300 dark:border-slate-700">
                {formatDate(doc.created_at)}
              </td>
              <td className="border-b px-4 py-3 dark:border-slate-700">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error"
                  onClick={() => {
                    if (window.confirm("Delete?")) delDoc(doc.id || doc._id);
                  }}
                  disabled={isPending}
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
