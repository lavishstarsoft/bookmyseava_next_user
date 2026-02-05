export const API_URL = "http://46.225.29.165/api";

export const getImageUrl = (path: string | undefined): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = API_URL.replace("/api", "");
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};
