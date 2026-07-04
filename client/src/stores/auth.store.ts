import { create } from "zustand";
import type { AuthUser, Role } from "@/types";

interface AuthState {
  user: AuthUser | null;
  role: Role | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  signup: (payload: any) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  checkAuth: () => Promise<AuthUser | null>;
  setError: (error: string | null) => void;
  setRole: (role: Role) => void; // Allow local view-role toggling
}

// Helper to handle API responses and throw detailed errors
async function fetchAPI(url: string, options: RequestInit = {}) {
  const defaults = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include" as const, // Send and receive cookies (same-site)
  };

  const response = await fetch(url, {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorObj: any = new Error(data.message || data.error || "An unexpected error occurred");
    if (data.details) {
      errorObj.details = data.details; // Attach Zod field validation details
    }
    throw errorObj;
  }

  return data;
}

// Transforms backend GET /api/employee/profile payload to frontend AuthUser format
function formatProfileToAuthUser(apiProfile: any): AuthUser {
  return {
    id: apiProfile.user.id,
    employeeId: apiProfile.user.employeeId,
    email: apiProfile.user.email,
    role: apiProfile.user.role as Role,
    isVerified: apiProfile.user.isVerified,
    profile: {
      id: apiProfile.id,
      userId: apiProfile.userId,
      fullName: apiProfile.fullName,
      dob: apiProfile.dob,
      phone: apiProfile.phone,
      address: apiProfile.address,
      emergencyContact: apiProfile.emergencyContact,
      profilePictureUrl: apiProfile.profilePictureUrl,
      department: apiProfile.department,
      designation: apiProfile.designation,
      dateOfJoining: apiProfile.dateOfJoining,
      reportingManager: apiProfile.reportingManager,
      createdAt: apiProfile.createdAt,
      updatedAt: apiProfile.updatedAt,
    },
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  setError: (error) => set({ error }),

  setRole: (role) => set({ role }),

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      // Step 1: Request login
      await fetchAPI("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      // Step 2: Fetch the full profile details using the newly set cookie session
      const profileData = await fetchAPI("/api/employee/profile");
      const user = formatProfileToAuthUser(profileData.profile);

      set({
        user,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    set({ isLoading: true, error: null });
    try {
      await fetchAPI("/api/auth/logout", {
        method: "POST",
      });
    } catch (err) {
      // Proceed to clear frontend state even if API call fails
      console.warn("Logout endpoint failed:", err);
    } finally {
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    }
  },

  signup: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      await fetchAPI("/api/auth/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  verifyEmail: async (token) => {
    set({ isLoading: true, error: null });
    try {
      await fetchAPI(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
      set({ isLoading: false, error: null });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      throw err;
    }
  },

  checkAuth: async () => {
    // Only set loading if not already loaded to prevent screen flickering
    const current = get();
    if (!current.user) {
      set({ isLoading: true, error: null });
    }

    try {
      const profileData = await fetchAPI("/api/employee/profile");
      const user = formatProfileToAuthUser(profileData.profile);

      set({
        user,
        role: user.role,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return user;
    } catch (err) {
      // Silently fail session restoration if no active session/cookie exists
      set({
        user: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return null;
    }
  },
}));
