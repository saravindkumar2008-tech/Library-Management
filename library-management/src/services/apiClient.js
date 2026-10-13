/**
 * Unified API Client Dispatcher
 * Seamlessly routes calls to either Axios or Fetch based on active configuration.
 * Demonstrates both REST API technologies side by side.
 */

import { apiConfig } from "./apiConfig";
import { axiosRequest } from "./axiosClient";
import { fetchRequest } from "./fetchClient";

export async function request(options) {
  const engine = apiConfig.clientType;
  if (engine === "fetch") {
    return fetchRequest(options);
  }
  return axiosRequest(options);
}

export const apiClient = {
  get(url, options = {}) {
    return request({ method: "GET", url, ...options });
  },
  post(url, data, options = {}) {
    return request({ method: "POST", url, data, ...options });
  },
  put(url, data, options = {}) {
    return request({ method: "PUT", url, data, ...options });
  },
  patch(url, data, options = {}) {
    return request({ method: "PATCH", url, data, ...options });
  },
  delete(url, options = {}) {
    return request({ method: "DELETE", url, ...options });
  }
};
