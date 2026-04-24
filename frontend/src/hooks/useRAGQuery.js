import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryRAG } from "../services/documentService";

export const useRAGQuery = () => {
  return useMutation({
    mutationFn: (payload) => queryRAG(payload),
    onError: (err) => {
      toast.error(
        err?.response?.data?.detail || "Failed to query treatment knowledge base",
      );
    },
  });
};
