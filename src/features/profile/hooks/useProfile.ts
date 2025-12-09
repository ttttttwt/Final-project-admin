import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profileApi";
import type {
  UpdateProfileRequest,
  ChangePasswordRequest,
} from "../api/profileApi";
import { toast } from "@/hooks/use-toast";
import { useAuthStore } from "@/store/authStore";

/**
 * Hook to fetch current user's profile
 */
export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: profileApi.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook to update user's profile
 */
export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  const { user, accessToken, refreshToken, login } = useAuthStore();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => profileApi.updateProfile(data),
    onSuccess: (updatedProfile) => {
      // Invalidate and refetch profile
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // Update auth store with new profile data
      // Combine firstName and lastName into fullName for the auth store
      if (user && accessToken && refreshToken) {
        const fullName = [updatedProfile.firstName, updatedProfile.lastName]
          .filter(Boolean)
          .join(" ");
        login(
          {
            ...user,
            fullName: fullName || user.fullName,
            currentLevel: updatedProfile.currentLevel,
            learningGoal: updatedProfile.learningGoal,
            avatarUrl: updatedProfile.avatarUrl,
          },
          accessToken,
          refreshToken
        );
      }

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to update profile",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to change user's password
 */
export const useChangePassword = () => {
  return useMutation({
    mutationFn: (data: ChangePasswordRequest) =>
      profileApi.changePassword(data),
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Password changed successfully",
      });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast({
        title: "Error",
        description:
          error.response?.data?.message || "Failed to change password",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to upload avatar
 */
export const useUploadAvatar = () => {
  const queryClient = useQueryClient();
  const { user, accessToken, refreshToken, login } = useAuthStore();

  return useMutation({
    mutationFn: (file: File) => profileApi.uploadAvatar(file),
    onSuccess: (updatedProfile) => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // Update auth store with new avatar URL
      if (user && accessToken && refreshToken) {
        login(
          {
            ...user,
            avatarUrl: updatedProfile.avatarUrl,
          },
          accessToken,
          refreshToken
        );
      }

      toast({
        title: "Success",
        description: "Avatar updated successfully",
      });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update avatar",
        variant: "destructive",
      });
    },
  });
};

/**
 * Hook to delete avatar
 */
export const useDeleteAvatar = () => {
  const queryClient = useQueryClient();
  const { user, accessToken, refreshToken, login } = useAuthStore();

  return useMutation({
    mutationFn: () => profileApi.deleteAvatar(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      // Update auth store to remove avatar URL
      if (user && accessToken && refreshToken) {
        login(
          {
            ...user,
            avatarUrl: undefined,
          },
          accessToken,
          refreshToken
        );
      }

      toast({
        title: "Success",
        description: "Avatar deleted successfully",
      });
    },
    onError: (
      error: Error & { response?: { data?: { message?: string } } }
    ) => {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete avatar",
        variant: "destructive",
      });
    },
  });
};
