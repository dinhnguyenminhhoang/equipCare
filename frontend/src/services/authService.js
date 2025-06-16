import instance from "../config/instance";

const customerRegisterApi = (formData) => {
  return instance.post("/register", formData);
};
const customerLoginAPi = (formData) => {
  return instance.post("/login", formData);
};
const forgotPasswordApi = (formData) => {
  return instance.post("/forgot-password", formData);
};
const resetPasswordApi = (formData) => {
  return instance.post("/reset-password", formData);
};
const confirmAccountApi = () => {
  return instance.post("/confirm-account");
};
export {
  customerRegisterApi,
  customerLoginAPi,
  forgotPasswordApi,
  resetPasswordApi,
  confirmAccountApi,
};
