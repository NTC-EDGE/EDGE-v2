import { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { useUser } from "@clerk/expo";
import { useApi } from "../../../shared/hooks/useApi";

export interface UserAddressSettings {
  street: string;
  unit?: string;
  region: string;
  regionId?: string;
  province: string;
  provinceId?: string;
  city: string;
  municipalityId?: string;
  barangay: string;
  barangayId?: string;
  zipCode: string;
}

export interface UserCompanySettings {
  name: string;
  registrationNumber: string;
  tinNumber: string;
  address: string;
  contactNumber: string;
  email: string;
}

export interface UserProfileSettings {
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  email: string;
  phone: string;
  dob: string;
  sex: string;
  nationality: string;
  height?: string;
  weight?: string;
  schoolAttended?: string;
  courseTaken?: string;
  yearGraduated?: string;
  address: UserAddressSettings;
  company: UserCompanySettings;
}

export interface UserFilingPreferences {
  defaultRegionId: string;
  defaultOfficeId: string;
  defaultAppMode: "individual" | "corporate";
  autoSaveDrafts: boolean;
  confirmBeforeLeave: boolean;
}

export interface UserNotificationPreferences {
  emailStatusUpdates: boolean;
  emailPaymentReceipts: boolean;
  expiryReminders: boolean;
  scheduleAlerts: boolean;
  smsAlerts: boolean;
}

const DEFAULT_PROFILE: UserProfileSettings = {
  firstName: "",
  middleName: "",
  lastName: "",
  extensionName: "",
  email: "",
  phone: "",
  dob: "",
  sex: "",
  nationality: "Filipino",
  height: "",
  weight: "",
  schoolAttended: "",
  courseTaken: "",
  yearGraduated: "",
  address: {
    street: "",
    unit: "",
    region: "",
    regionId: "",
    province: "",
    provinceId: "",
    city: "",
    municipalityId: "",
    barangay: "",
    barangayId: "",
    zipCode: "",
  },
  company: {
    name: "",
    registrationNumber: "",
    tinNumber: "",
    address: "",
    contactNumber: "",
    email: "",
  },
};

const DEFAULT_PREFERENCES: UserFilingPreferences = {
  defaultRegionId: "",
  defaultOfficeId: "",
  defaultAppMode: "individual",
  autoSaveDrafts: true,
  confirmBeforeLeave: true,
};

const DEFAULT_NOTIFICATIONS: UserNotificationPreferences = {
  emailStatusUpdates: true,
  emailPaymentReceipts: true,
  expiryReminders: true,
  scheduleAlerts: true,
  smsAlerts: false,
};

export function useClientSettings() {
  const { user: clerkUser } = useUser();
  const api = useApi();

  const [profile, setProfile] = useState<UserProfileSettings>(DEFAULT_PROFILE);
  const [preferences, setPreferences] = useState<UserFilingPreferences>(DEFAULT_PREFERENCES);
  const [notifications, setNotifications] = useState<UserNotificationPreferences>(DEFAULT_NOTIFICATIONS);
  const [savedSignature, setSavedSignature] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Available regions / offices for default preferences
  const [tenants, setTenants] = useState<Array<{ id: string; name: string }>>([]);
  const [offices, setOffices] = useState<Array<{ id: string; name: string }>>([]);
  const [loadingTenants, setLoadingTenants] = useState(false);

  // Load initial settings from Clerk metadata and localStorage
  useEffect(() => {
    if (!clerkUser) return;

    try {
      const userMeta = (clerkUser.unsafeMetadata || {}) as Record<string, unknown>;

      // Load Profile
      const metaProfile = userMeta.profile as Partial<UserProfileSettings> | undefined;
      const firstName = clerkUser.firstName || metaProfile?.firstName || "";
      const lastName = clerkUser.lastName || metaProfile?.lastName || "";
      const email = clerkUser.primaryEmailAddress?.emailAddress || metaProfile?.email || "";
      const phone = clerkUser.primaryPhoneNumber?.phoneNumber || metaProfile?.phone || "";

      setProfile({
        firstName,
        middleName: metaProfile?.middleName || "",
        lastName,
        extensionName: metaProfile?.extensionName || "",
        email,
        phone,
        dob: metaProfile?.dob || "",
        sex: metaProfile?.sex || "",
        nationality: metaProfile?.nationality || "Filipino",
        height: metaProfile?.height || "",
        weight: metaProfile?.weight || "",
        schoolAttended: metaProfile?.schoolAttended || "",
        courseTaken: metaProfile?.courseTaken || "",
        yearGraduated: metaProfile?.yearGraduated || "",
        address: {
          street: metaProfile?.address?.street || "",
          unit: metaProfile?.address?.unit || "",
          barangay: metaProfile?.address?.barangay || "",
          city: metaProfile?.address?.city || "",
          province: metaProfile?.address?.province || "",
          region: metaProfile?.address?.region || "",
          zipCode: metaProfile?.address?.zipCode || "",
        },
        company: {
          name: metaProfile?.company?.name || "",
          registrationNumber: metaProfile?.company?.registrationNumber || "",
          tinNumber: metaProfile?.company?.tinNumber || "",
          address: metaProfile?.company?.address || "",
          contactNumber: metaProfile?.company?.contactNumber || "",
          email: metaProfile?.company?.email || "",
        },
      });

      // Load Preferences
      const metaPrefs = userMeta.preferences as Partial<UserFilingPreferences> | undefined;
      if (metaPrefs) {
        setPreferences({
          defaultRegionId: metaPrefs.defaultRegionId || "",
          defaultOfficeId: metaPrefs.defaultOfficeId || "",
          defaultAppMode: metaPrefs.defaultAppMode || "individual",
          autoSaveDrafts: metaPrefs.autoSaveDrafts !== undefined ? metaPrefs.autoSaveDrafts : true,
          confirmBeforeLeave: metaPrefs.confirmBeforeLeave !== undefined ? metaPrefs.confirmBeforeLeave : true,
        });
      }

      // Load Notifications
      const metaNotifs = userMeta.notifications as Partial<UserNotificationPreferences> | undefined;
      if (metaNotifs) {
        setNotifications({
          emailStatusUpdates: metaNotifs.emailStatusUpdates !== undefined ? metaNotifs.emailStatusUpdates : true,
          emailPaymentReceipts: metaNotifs.emailPaymentReceipts !== undefined ? metaNotifs.emailPaymentReceipts : true,
          expiryReminders: metaNotifs.expiryReminders !== undefined ? metaNotifs.expiryReminders : true,
          scheduleAlerts: metaNotifs.scheduleAlerts !== undefined ? metaNotifs.scheduleAlerts : true,
          smsAlerts: metaNotifs.smsAlerts !== undefined ? metaNotifs.smsAlerts : false,
        });
      }

      // Load Signature
      let sig = "";
      if (typeof userMeta.eSignature === "string" && userMeta.eSignature.trim().length > 0) {
        sig = userMeta.eSignature;
      } else if (typeof userMeta.signature === "string" && userMeta.signature.trim().length > 0) {
        sig = userMeta.signature;
      } else if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
        const localSig = window.localStorage.getItem("ntc_user_saved_signature") || window.localStorage.getItem("user_e_signature");
        if (localSig && localSig.trim().length > 0) {
          sig = localSig;
        }
      }
      setSavedSignature(sig);

      // 3. Fetch from backend database /api/v2/users/profile to enrich all detailed fields
      api.get<any>("/api/v2/users/profile").then((dbUser) => {
        if (dbUser) {
          setProfile((prev) => ({
            ...prev,
            firstName: prev.firstName || dbUser.firstName || "",
            lastName: prev.lastName || dbUser.lastName || "",
            middleName: prev.middleName || dbUser.middleName || "",
            extensionName: prev.extensionName || dbUser.suffix || "",
            phone: prev.phone || dbUser.contactNumber || "",
            sex: prev.sex || dbUser.sex || "",
            nationality: prev.nationality || dbUser.nationality || "Filipino",
            height: prev.height || (dbUser.height ? String(dbUser.height) : ""),
            weight: prev.weight || (dbUser.weight ? String(dbUser.weight) : ""),
            schoolAttended: prev.schoolAttended || dbUser.schoolAttended || "",
            courseTaken: prev.courseTaken || dbUser.courseTaken || "",
            dob: prev.dob || (dbUser.dateOfBirth ? dbUser.dateOfBirth.split("T")[0] : ""),
            address: {
              ...prev.address,
              street: prev.address.street || dbUser.address?.street || dbUser.street || "",
              unit: prev.address.unit || dbUser.address?.unit || dbUser.unit || "",
              zipCode: prev.address.zipCode || dbUser.address?.zipCode || dbUser.zipCode || "",
            },
            company: {
              ...prev.company,
              name: prev.company.name || dbUser.company?.name || "",
              registrationNumber: prev.company.registrationNumber || dbUser.company?.registrationNumber || "",
              tinNumber: prev.company.tinNumber || dbUser.company?.tinNumber || "",
              address: prev.company.address || dbUser.company?.address || "",
              contactNumber: prev.company.contactNumber || dbUser.company?.contactNumber || "",
              email: prev.company.email || dbUser.company?.email || "",
            },
          }));

          if (dbUser.eSignature && !sig) {
            setSavedSignature(dbUser.eSignature);
          }
        }
      }).catch((err) => {
        console.warn("[ClientSettings] Notice: Backend profile fetch failed or returned non-200. Falling back to Clerk/local settings.", err);
      });
    } catch (err) {
      console.warn("Failed to parse settings from Clerk metadata:", err);
    }
  }, [clerkUser]);

  // Fetch Tenants for Region Preference
  useEffect(() => {
    async function fetchTenants() {
      setLoadingTenants(true);
      try {
        const res = await api.get<any>("/api/v2/tenants?pageSize=100&isActive=true").catch(() => null);
        let list: Array<{ id: string; name: string }> = [];
        if (res && res.succeeded && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.items)) {
          list = res.items;
        }
        setTenants(list);
      } catch (err) {
        console.warn("Could not fetch tenants for settings:", err);
      } finally {
        setLoadingTenants(false);
      }
    }
    fetchTenants();
  }, []);

  // Fetch Field Offices when Region changes
  useEffect(() => {
    async function fetchOffices() {
      if (!preferences.defaultRegionId) {
        setOffices([]);
        return;
      }
      try {
        const res = await api.get<any>(`/api/v2/tenants/${preferences.defaultRegionId}/field-offices?isActive=true`).catch(() => null);
        let list: Array<{ id: string; name: string }> = [];
        if (res && res.succeeded && Array.isArray(res.data)) {
          list = res.data;
        } else if (Array.isArray(res)) {
          list = res;
        } else if (res && Array.isArray(res.items)) {
          list = res.items;
        }
        setOffices(list);
      } catch (err) {
        console.warn("Could not fetch offices for settings:", err);
      }
    }
    fetchOffices();
  }, [preferences.defaultRegionId]);

  // Save all settings to Clerk Metadata, Backend DB & LocalStorage
  const saveAllSettings = useCallback(
    async (
      updatedProfile?: UserProfileSettings,
      updatedPreferences?: UserFilingPreferences,
      updatedNotifications?: UserNotificationPreferences,
      updatedSignature?: string
    ) => {
      setIsSaving(true);
      setSaveSuccess(null);
      setSaveError(null);

      const targetProfile = updatedProfile || profile;
      const targetPreferences = updatedPreferences || preferences;
      const targetNotifications = updatedNotifications || notifications;
      const targetSignature = updatedSignature !== undefined ? updatedSignature : savedSignature;

      try {
        // 1. Sync to LocalStorage on Web
        if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
          window.localStorage.setItem("ntc_user_profile_settings", JSON.stringify(targetProfile));
          window.localStorage.setItem("ntc_user_filing_preferences", JSON.stringify(targetPreferences));
          window.localStorage.setItem("ntc_user_notification_settings", JSON.stringify(targetNotifications));
          if (targetSignature) {
            window.localStorage.setItem("ntc_user_saved_signature", targetSignature);
          } else {
            window.localStorage.removeItem("ntc_user_saved_signature");
          }
        }

        // 2. Persist to Clerk user unsafeMetadata
        if (clerkUser) {
          const currentMeta = (clerkUser.unsafeMetadata || {}) as Record<string, unknown>;
          await clerkUser.update({
            unsafeMetadata: {
              ...currentMeta,
              profile: targetProfile,
              preferences: targetPreferences,
              notifications: targetNotifications,
              eSignature: targetSignature,
            },
          });

          // Also update first/last name on Clerk if changed
          if (
            (targetProfile.firstName && targetProfile.firstName !== clerkUser.firstName) ||
            (targetProfile.lastName && targetProfile.lastName !== clerkUser.lastName)
          ) {
            await clerkUser.update({
              firstName: targetProfile.firstName,
              lastName: targetProfile.lastName,
            });
          }
        }

        // 3. Persist to Backend Database via Minimal API Endpoints
        await api.patch<any>("/api/v2/users/me/profile", {
          firstName: targetProfile.firstName,
          lastName: targetProfile.lastName,
          middleName: targetProfile.middleName,
          suffix: targetProfile.extensionName,
          contactNumber: targetProfile.phone,
          dateOfBirth: targetProfile.dob ? new Date(targetProfile.dob).toISOString() : null,
          sex: targetProfile.sex,
          nationality: targetProfile.nationality,
          street: targetProfile.address.street,
          zipCode: targetProfile.address.zipCode,
          eSignature: targetSignature,
        }).catch((err) => {
          console.warn("Backend profile sync notice:", err);
        });

        if (targetSignature) {
          await api.patch<any>("/api/v2/users/me/signature", {
            eSignature: targetSignature,
          }).catch((err) => {
            console.warn("Backend signature sync notice:", err);
          });
        }

        setSaveSuccess("Settings saved successfully.");
        setTimeout(() => setSaveSuccess(null), 4000);
      } catch (err) {
        console.error("Failed to save client settings:", err);
        setSaveError("Failed to save settings. Please try again.");
        setTimeout(() => setSaveError(null), 5000);
      } finally {
        setIsSaving(false);
      }
    },
    [clerkUser, profile, preferences, notifications, savedSignature]
  );

  // Update profile fields
  const updateProfile = useCallback((fields: Partial<UserProfileSettings>) => {
    setProfile((prev) => ({ ...prev, ...fields }));
  }, []);

  // Update address fields
  const updateAddress = useCallback((fields: Partial<UserAddressSettings>) => {
    setProfile((prev) => ({
      ...prev,
      address: { ...prev.address, ...fields },
    }));
  }, []);

  // Update company fields
  const updateCompany = useCallback((fields: Partial<UserCompanySettings>) => {
    setProfile((prev) => ({
      ...prev,
      company: { ...prev.company, ...fields },
    }));
  }, []);

  // Update filing preferences
  const updatePreferences = useCallback((fields: Partial<UserFilingPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...fields }));
  }, []);

  // Update notification preferences
  const updateNotifications = useCallback((fields: Partial<UserNotificationPreferences>) => {
    setNotifications((prev) => ({ ...prev, ...fields }));
  }, []);

  // Save new signature
  const updateSignature = useCallback(
    async (sigDataUrl: string) => {
      setSavedSignature(sigDataUrl);
      await saveAllSettings(undefined, undefined, undefined, sigDataUrl);
    },
    [saveAllSettings]
  );

  // Clear saved signature
  const clearSignature = useCallback(async () => {
    setSavedSignature("");
    await saveAllSettings(undefined, undefined, undefined, "");
  }, [saveAllSettings]);

  // Clear local draft applications cache
  const clearLocalDraftCache = useCallback(() => {
    if (Platform.OS === "web" && typeof window !== "undefined" && window.localStorage) {
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && (key.startsWith("ntc_draft_") || key.startsWith("edge_form_draft_"))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => window.localStorage.removeItem(k));
    }
    setSaveSuccess("Local application drafts and form cache cleared.");
    setTimeout(() => setSaveSuccess(null), 4000);
  }, []);

  return {
    profile,
    updateProfile,
    updateAddress,
    updateCompany,
    preferences,
    updatePreferences,
    notifications,
    updateNotifications,
    savedSignature,
    updateSignature,
    clearSignature,
    tenants,
    offices,
    loadingTenants,
    isSaving,
    saveSuccess,
    saveError,
    saveAllSettings,
    clearLocalDraftCache,
    clerkUser,
  };
}
