import { useMutation } from '@tanstack/react-query';
import { predictDisease } from '../services/predictionService';
import { useAppStore } from '../store/useAppStore';
import toast from 'react-hot-toast';

export const usePrediction = () => {
  const addPrediction = useAppStore(state => state.addPrediction);
  
  return useMutation({
    mutationFn: predictDisease,
    onSuccess: (data) => {
      addPrediction(data);
      toast.success('Analysis complete!');
    },
    onError: (err) => {
      toast.error(err.response?.data?.detail || err.message || 'Prediction failed');
    }
  });
};