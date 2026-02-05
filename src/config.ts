export const API_URL = "https://bookmyseva.com/api";

export const getImageUrl = (path: string | undefined): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = API_URL.replace("/api", "");
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};
