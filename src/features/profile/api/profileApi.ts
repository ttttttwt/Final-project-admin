import api from "@/lib/api";

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string;
  timezone?: string;
  language?: string;
  currentLevel?: string;
  learningGoal?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ProfileResponse {
  userId: string;
  email: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  phoneNumber?: string;
  avatarUrl?: string;
  timezone?: string;
  language?: string;
  currentLevel?: string;
  learningGoal?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Profile API service for managing user profile operations
 */
export const profileApi = {
  /**
   * Get current user's profile
   */
  getProfile: async (): Promise<ProfileResponse> => {
    const response = await api.get<ProfileResponse>("/users/profile");
    return response.data;
  },

  /**
   * Update current user's profile
   */
  updateProfile: async (
    data: UpdateProfileRequest
  ): Promise<ProfileResponse> => {
    const response = await api.put<ProfileResponse>("/users/profile", data);
    return response.data;
  },

  /**
   * Change current user's password
   */
  changePassword: async (data: ChangePasswordRequest): Promise<void> => {
    await api.put("/auth/change-password", data);
  },

  /**
   * Upload user avatar
   */
  uploadAvatar: async (file: File): Promise<ProfileResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ProfileResponse>(
      "/users/avatar",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  /**
   * Delete current user's avatar
   */
  deleteAvatar: async (): Promise<void> => {
    await api.delete("/users/profile/avatar");
  },
};
