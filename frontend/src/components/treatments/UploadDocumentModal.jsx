import { Modal } from "../ui/Modal";
import { DocumentUploadForm } from "../documents/DocumentUploadForm";

export function UploadDocumentModal({ isOpen, onClose }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Upload Knowledge Base Document"
    >
      <DocumentUploadForm onSuccess={onClose} />
    </Modal>
  );
}
