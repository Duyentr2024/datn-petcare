export function decodeToken(token) {
    try {
        const payload = token.split(".")[1];
        // Giải mã base64
        const decoded = atob(payload);

        // Xử lý ký tự UTF-8 nếu có
        const decodedUtf8 = decodeURIComponent(escape(decoded));

        // Parse JSON sau khi xử lý UTF-8
        return JSON.parse(decodedUtf8);
    } catch (error) {
        console.error("Invalid token format:", error);
        return null;
    }
}
