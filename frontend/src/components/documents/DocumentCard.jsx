import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { useDeleteDocument } from "../../hooks/useDocuments";
import { formatDate } from "../../utils/formatters";

export const DocumentCard = ({ doc }) => {
  const { mutate: delDoc, isPending } = useDeleteDocument();

  return (
    <Card className="p-4 flex flex-col justify-between h-full bg-white hover:shadow-2xl transition">
      <div>
        <h3 className="font-bold text-lg mb-2 truncate" title={doc.title}>
          {doc.title}
        </h3>
        <div className="flex gap-2 mb-2 flex-wrap">
          <span className="rounded-full border border-slate-300 px-2.5 py-0.5 text-xs text-slate-600">
            {doc.crop_type}
          </span>
          {doc.disease_name && (
            <span className="rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs text-amber-700">
              {doc.disease_name}
            </span>
          )}
        </div>
        <p className="text-xs text-gray-400">
          Added: {formatDate(doc.created_at)}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          className="text-error"
          onClick={() => {
            if (window.confirm("Delete this document?")) {
              delDoc(doc.id || doc._id);
            }
          }}
          disabled={isPending}
        >
          Delete
        </Button>
      </div>
    </Card>
  );
};
