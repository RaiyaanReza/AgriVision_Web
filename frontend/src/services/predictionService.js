import api from './api';

export const predictDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);
  const { data } = await api.post('/predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return data;
};