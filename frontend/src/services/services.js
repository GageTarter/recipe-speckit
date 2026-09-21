import axios from "axios";

var baseurl = "";
if (import.meta.env.DEV) {
  baseurl = "http://localhost:3200/recipeapi/";
} else {
  baseurl = "/recipeapi/";
}

const apiClient = axios.create({
  baseURL: baseurl,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Access-Control-Allow-Origin": "*",
    crossDomain: true,
  },
  transformRequest: (data, headers) => {
    let token = null;
    if (localStorage.getItem("user") !== null) {
      token = JSON.parse(localStorage.getItem("user")).token;
    }
    let authHeader = "";
    if (token !== null && token !== "") {
      authHeader = "Bearer " + token;
      headers["Authorization"] = authHeader;
    }
    return JSON.stringify(data);
  },
  transformResponse: function (data) {
    if (typeof data !== "string" || data === "") {
      return data;
    }
    try {
      data = JSON.parse(data);
    } catch {
      return data;
    }
    if (data && !data.success && data.code == "expired-session") {
      localStorage.removeItem("user");
    }
    return data;
  },
});

export default apiClient;
