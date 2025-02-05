import axios from "axios";
import API_BASE_URL from "../../config"; // Import BASE_URL từ config.js
import { storage, ref, uploadBytesResumable, getDownloadURL } from "../../firebaseConfig";

const UserUpdateService = {
  updateUser: async (userId, formData) => {
    try {
      const token = Cookies.get("token");
      const response = await axios.put(
        `${API_BASE_URL}/api/users/update/${userId}`,
        {
          fullName: formData.fullName,
          phone: formData.phone,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Lỗi cập nhật thông tin:", error);
      throw error;
    }
  },

  uploadAvatar: async (userId, file, token) => {
    if (!file) {
      throw new Error("Vui lòng chọn một ảnh hợp lệ.");
    }

    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      throw new Error("Chỉ hỗ trợ định dạng JPEG, PNG.");
    }

    if (file.size > 1024 * 1024) {
      throw new Error("Dung lượng ảnh không được vượt quá 1MB.");
    }

    try {
      // 🟢 1. Upload ảnh lên Firebase Storage
      const storageRef = ref(storage, `avatars/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return new Promise((resolve, reject) => {
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
          },
          (error) => {
            console.error("Lỗi khi upload ảnh:", error);
            reject(new Error("Không thể tải ảnh lên Firebase."));
          },
          async () => {
            // 🟢 2. Lấy URL ảnh sau khi upload thành công
            const imageUrl = await getDownloadURL(uploadTask.snapshot.ref);
            console.log("Ảnh đã upload, URL:", imageUrl);

            // 🟢 3. Gửi URL ảnh về BE để cập nhật avatar
            const response = await axios.put(
              `${API_BASE_URL}/api/users/update/avatar/${userId}`,
              { imageUrl },
              {
                headers: { Authorization: `Bearer ${token}` },
              }
            );

            if (response.status === 200) {
              resolve(response.data);
            } else {
              reject(new Error("Có lỗi xảy ra khi cập nhật avatar."));
            }
          }
        );
      });
    } catch (error) {
      console.error("Lỗi khi tải ảnh lên:", error);
      throw new Error("Không thể tải ảnh lên.");
    }
  },
};

export default UserUpdateService;
