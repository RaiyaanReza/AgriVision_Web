import { useDeleteDocument } from "../../hooks/useDocuments";
import { formatDate } from "../../utils/formatters";
import { Button } from "../ui/Button";

export const DocumentTable = ({ documents }) => {
  const { mutate: delDoc, isPending } = useDeleteDocument();

  if (!documents?.length) {
    return (
      <div className="text-center p-8 text-gray-500">No documents found.</div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-slate-50 text-left text-slate-700">
          <tr>
            <th className="border-b px-4 py-3">Title</th>
            <th className="border-b px-4 py-3">Crop</th>
            <th className="border-b px-4 py-3">Disease</th>
            <th className="border-b px-4 py-3">Uploaded</th>
            <th className="border-b px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((doc) => (
            <tr
              key={doc.id || doc._id}
              className="odd:bg-white even:bg-slate-50/50"
            >
              <td className="border-b px-4 py-3 font-medium">{doc.title}</td>
              <td className="border-b px-4 py-3">{doc.crop_type}</td>
              <td className="border-b px-4 py-3">{doc.disease_name || "-"}</td>
              <td className="border-b px-4 py-3">
                {formatDate(doc.created_at)}
              </td>
              <td className="border-b px-4 py-3">
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
