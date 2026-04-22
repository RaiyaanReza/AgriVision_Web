import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { queryRAG } from "../services/documentService";

export const useRAGQuery = () => {
  return useMutation({
    mutationFn: ({ question, cropType }) => queryRAG(question, cropType),
    onError: (err) => {
      toast.error(
        err?.response?.data?.detail || "Failed to query treatment knowledge base",
      );
    },
  });
};
