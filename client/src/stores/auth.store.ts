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
  bypassActive: boolean;
  realUser: AuthUser | null;
  realIsAuthenticated: boolean;
  toggleBypass: () => void;
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
  bypassActive: false,
  realUser: null,
  realIsAuthenticated: false,

  setError: (error) => set({ error }),

  setRole: (role) => set({ role }),

  toggleBypass: () => {
    const state = get();
    if (state.bypassActive) {
      // Deactivate bypass: Restore real session state
      set({
        bypassActive: false,
        user: state.realUser,
        role: state.realUser ? state.realUser.role : null,
        isAuthenticated: state.realIsAuthenticated,
        realUser: null,
        realIsAuthenticated: false,
      });
    } else {
      // Activate bypass: Stash real session state and inject mock HR Admin
      const mockHRUser: AuthUser = {
        id: 2,
        employeeId: "EMP202600",
        email: "hr@company.com",
        role: "HR",
        isVerified: true,
        profile: {
          id: 2,
          userId: 2,
          fullName: "Alex Rivera (Bypass Mode)",
          dob: "1988-07-22",
          phone: "+1 (555) 234-5678",
          address: "100 Market Street, Suite 500, San Francisco, CA 94105",
          emergencyContact: "Maria Rivera — +1 (555) 876-5432",
          profilePictureUrl: null,
          department: "Human Resources",
          designation: "HR Manager (Bypass)",
          dateOfJoining: "2022-06-01",
          reportingManager: null,
          createdAt: "2022-06-01T00:00:00.000Z",
          updatedAt: "2026-07-01T00:00:00.000Z",
        },
      };

      set({
        bypassActive: true,
        realUser: state.user,
        realIsAuthenticated: state.isAuthenticated,
        user: mockHRUser,
        role: "HR",
        isAuthenticated: true,
      });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null, bypassActive: false, realUser: null, realIsAuthenticated: false });
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
    set({ isLoading: true, error: null, bypassActive: false, realUser: null, realIsAuthenticated: false });
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
    const current = get();

    // If bypass is currently active, do not execute real API checks as it will reset state
    if (current.bypassActive) {
      return current.user;
    }

    // Only set loading if not already loaded to prevent screen flickering
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
