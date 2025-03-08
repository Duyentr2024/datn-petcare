class PostService {
    // URL cơ sở của Firebase Realtime Database
    static BASE_URL = 'https://fir-eed33-default-rtdb.asia-southeast1.firebasedatabase.app/';
  
    /**
     * Lấy toàn bộ danh sách bài viết từ Firebase
     * @returns {Promise} Trả về danh sách bài viết dạng JSON
     */
    static async getAllPosts() {
      try {
        const response = await fetch(`${PostService.BASE_URL}/posts.json`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
  
        // Kiểm tra xem request có thành công không
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        // Chuyển dữ liệu phản hồi thành JSON
        const data = await response.json();
        // Firebase trả về dữ liệu dạng object, cần kiểm tra và xử lý
        if (!data) {
          return []; // Trả về mảng rỗng nếu không có dữ liệu
        }
  
        // Chuyển object thành mảng (nếu cần) và trả về
        return Object.keys(data).map(key => ({
          id: key, // Firebase có thể trả về key tự động, nếu không dùng id trong JSON thì lấy key này
          ...data[key],
        }));
      } catch (error) {
        console.error('Error fetching posts:', error);
        throw error; // Ném lỗi để xử lý ở nơi gọi hàm
      }
    }
  }
  
  // Export lớp để sử dụng ở các file khác
  export default PostService;