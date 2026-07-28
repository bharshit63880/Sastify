import { toast } from "react-toastify";

const normalize = (message) => typeof message === "string" ? message : message?.message || "Something went wrong";

export const appToast = {
  success: (message, options) => toast.success(normalize(message), options),
  error: (message, options) => toast.error(normalize(message), options),
  warning: (message, options) => toast.warning(normalize(message), options),
  info: (message, options) => toast.info(normalize(message), options),
  loading: (message, options) => toast.loading(normalize(message), options),
  update: (id, options) => toast.update(id, options),
  promise: (promise, messages, options) => toast.promise(promise, messages, options),
  dismiss: (id) => toast.dismiss(id),
};
