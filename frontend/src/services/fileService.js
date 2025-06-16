import instance from "../config/instance";

export const uploadFile = async (file, category = "general") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);

  const response = await instance.post("/v1/api/upload", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const uploadMultipleFiles = async (files, category = "general") => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("category", category);

  const response = await instance.post("/v1/api/upload/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await instance.delete(`/v1/api/upload/${fileId}`);
  return response.data;
};

export const getFileInfo = async (fileId) => {
  const response = await instance.get(`/v1/api/upload/${fileId}`);
  return response.data;
};
