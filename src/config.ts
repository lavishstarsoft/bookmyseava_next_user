const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname.startsWith("192.168.") ||
    window.location.hostname.startsWith("10.") ||
    window.location.hostname.startsWith("172.");

export const API_URL =
    import.meta.env.VITE_API_URL ||
    (isLocal ? `http://${window.location.hostname}:5001/api` : "https://bookmysevaa.com/api");

export const getImageUrl = (path: string | undefined): string => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    const baseUrl = API_URL.replace("/api", "");
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
};


// export const API_URL = "https://bookmysevaa.com/api";

// export const getImageUrl = (path: string | undefined): string => {
//     if (!path) return "";
//     if (path.startsWith("http")) return path;
//     const baseUrl = API_URL.replace("/api", "");
//     return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
// };










