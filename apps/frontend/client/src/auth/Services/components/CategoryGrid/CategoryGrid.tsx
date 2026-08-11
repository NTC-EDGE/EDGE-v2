import { useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ImageSourcePropType,
} from "react-native";
import { COLORS, Icon, TYPOGRAPHY } from "@edge/ui";
import { styles } from "./CategoryGrid.styles";
import { CategorySkeletonGrid } from "./CategorySkeletonGrid";
import { ServerUnavailableBanner } from "../../../../shared/components/ServerUnavailableBanner";

const ACCREDITATIONS_PNG = require("../../../../../assets/services/Accreditations.png");
const CERTIFICATES_PNG = require("../../../../../assets/services/Certificates.png");
const EXAMS_PNG = require("../../../../../assets/services/Exams.png");
const LICENCES_PNG = require("../../../../../assets/services/Licences.png");
const PERMITS_PNG = require("../../../../../assets/services/Permits.png");
const COMPLAINTS_PNG = require("../../../../../assets/services/Request-or-Complaints.png");

const CATEGORY_IMAGES: Record<string, ImageSourcePropType> = {
  accreditations: ACCREDITATIONS_PNG,
  certificates: CERTIFICATES_PNG,
  exams: EXAMS_PNG,
  licenses: LICENCES_PNG,
  permits: PERMITS_PNG,
  complaints: COMPLAINTS_PNG,
};

interface CategoryGridProps {
  user: { name: string; email: string; avatarUrl?: string } | null;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
  drafts: any[];
  onViewDrafts: (categoryId: string) => void;
  backendCategories: any[] | null;
  allBackendServices: any[] | null;
  isWizardActive?: boolean;
}

export function CategoryGrid({
  user,
  searchQuery,
  onSearchQueryChange,
  selectedCategoryId,
  onCategorySelect,
  drafts,
  onViewDrafts,
  backendCategories,
  allBackendServices,
  isWizardActive = false,
}: CategoryGridProps) {
  // Derive time of day greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = user?.name ?? "Guest";

  const isLoadingCategories = backendCategories === null;

  const visibleCategories = useMemo(() => {
    if (!backendCategories) return [];
    return backendCategories.map((c: any) => {
      const code = c.code?.toUpperCase();
      const id = code === "EXAM" ? "exams"
               : code === "CERT" ? "certificates"
               : code === "LIC" ? "licenses"
               : code === "PRM" ? "permits"
               : code === "ACCR" ? "accreditations"
               : "complaints";

      const icon = id === "exams" ? "award"
                 : id === "certificates" ? "file-text"
                 : id === "licenses" ? "shield"
                 : id === "permits" ? "key"
                 : id === "accreditations" ? "activity"
                 : "help-circle";

      return {
        id: c.id,
        staticId: id,
        title: c.name,
        icon: icon as any,
        description: c.description || `NTC ${c.name} services.`,
        totalServices: typeof c.totalServices === "number" ? c.totalServices : undefined,
        services: []
      };
    });
  }, [backendCategories]);

  // Helper to map category ID to icon color gradient styles
  const getCategoryTheme = (id: string) => {
    switch (id) {
      case "accreditations":
        return { bg: "rgba(37, 99, 235, 0.08)", icon: COLORS.brand[700], border: "rgba(37, 99, 235, 0.15)" };
      case "certificates":
        return { bg: "rgba(16, 185, 129, 0.08)", icon: "#10b981", border: "rgba(16, 185, 129, 0.15)" };
      case "exams":
        return { bg: "rgba(245, 158, 11, 0.08)", icon: "#f59e0b", border: "rgba(245, 158, 11, 0.15)" };
      case "licenses":
        return { bg: "rgba(99, 102, 241, 0.08)", icon: "#6366f1", border: "rgba(99, 102, 241, 0.15)" };
      case "permits":
        return { bg: "rgba(139, 92, 246, 0.08)", icon: "#8b5cf6", border: "rgba(139, 92, 246, 0.15)" };
      case "complaints":
        return { bg: "rgba(239, 68, 68, 0.08)", icon: "#ef4444", border: "rgba(239, 68, 68, 0.15)" };
      default:
        return { bg: "rgba(107, 114, 128, 0.08)", icon: "#6b7280", border: "rgba(107, 114, 128, 0.15)" };
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
      {/* Server Offline / Network Error Banner */}
      <ServerUnavailableBanner />

      {/* Column Header */}
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Services</Text>
      </View>

      {/* Transaction Active Lock Banner */}
      {isWizardActive && (
        <View style={{
          backgroundColor: "#fffbebf",
          borderColor: "#fde68a",
          borderWidth: 1,
          borderRadius: 12,
          padding: 12,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 10,
        }}>
          <Icon name="lock" size={18} color="#d97706" />
          <View style={{ flex: 1 }}>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 12, fontWeight: "700", color: "#92400e" }}>
              Application Transaction Active
            </Text>
            <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#b45309", marginTop: 2 }}>
              Category & service switching is locked until you cancel or complete the current transaction.
            </Text>
          </View>
        </View>
      )}

      {/* Search Input */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
        <TextInput
          placeholder="Search services or licenses..."
          placeholderTextColor="#9ca3af"
          value={searchQuery}
          onChangeText={onSearchQueryChange}
          style={styles.searchInput}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchQueryChange("")} style={styles.clearSearch}>
            <Icon name="x" size={14} color="#9ca3af" />
          </TouchableOpacity>
        )}
      </View>

      {/* NTC e-Services Citizen Welcome Hero Banner */}
      <View style={styles.greetingBanner}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <View style={{ flex: 1, minWidth: 260 }}>
            <Text style={styles.greetingText}>
              {greeting}, <Text style={styles.greetingName}>{displayName}!</Text>
            </Text>
            <Text style={styles.greetingSubtext}>
              Welcome to the official NTC Online Services Portal. Choose a regulatory category below to file licenses, permits, examinations, or accreditations.
            </Text>
          </View>
        </View>
      </View>

      {/* Grid of Categories or Skeleton Loader */}
      {isLoadingCategories ? (
        <CategorySkeletonGrid />
      ) : (
        <View style={styles.gridContainer}>
          {visibleCategories.map((category) => {
            const staticId = category.staticId || category.id;
            const theme = getCategoryTheme(staticId);
            const isActive = selectedCategoryId === category.id;
            const categoryDraftsCount = drafts.filter((d) =>
              d.service?.serviceCategoryId === category.id || d.service?.category === category.title
            ).length;

            return (
              <TouchableOpacity
                key={category.id}
                onPress={() => onCategorySelect(category.id)}
                style={[
                  styles.categoryCard,
                  isActive && styles.categoryCardActive,
                ]}
              >
                {CATEGORY_IMAGES[staticId] !== undefined ? (
                  <Image
                    source={CATEGORY_IMAGES[staticId]}
                    style={styles.categoryImage}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={[styles.iconBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                    <Icon name={category.icon} size={22} color={theme.icon} />
                  </View>
                )}
                <Text style={styles.categoryCardTitle}>{category.title}</Text>
                {(() => {
                  const backendCat = backendCategories?.find((bc: any) => {
                    const code = bc.code?.toUpperCase();
                    if (category.id === "exams" && code === "EXAM") return true;
                    if (category.id === "certificates" && code === "CERT") return true;
                    if (category.id === "licenses" && code === "LIC") return true;
                    if (category.id === "permits" && code === "PRM") return true;
                    if (category.id === "accreditations" && code === "ACCR") return true;
                    if (category.id === "complaints" && (code === "REQ" || bc.type === "RequestsAndComplaints")) return true;
                    return false;
                  });
                  const servicesCount = category.totalServices !== undefined
                    ? category.totalServices
                    : (allBackendServices && backendCat
                        ? allBackendServices.filter((s: any) => s.serviceCategoryId === backendCat.id).length
                        : category.services.length);

                  return (
                    <Text style={styles.categoryCardCount}>
                      {servicesCount} {servicesCount === 1 ? "Service" : "Services"}
                    </Text>
                  );
                })()}

                {categoryDraftsCount > 0 && (
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      onViewDrafts(category.id);
                    }}
                    style={{
                      marginTop: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: "#eff6ff",
                      borderColor: "#bfdbfe",
                      borderWidth: 1,
                      borderRadius: 12,
                      paddingVertical: 4,
                      paddingHorizontal: 8,
                      gap: 4,
                    }}
                  >
                    <Icon name="file-text" size={12} color="#1d4ed8" />
                    <Text style={{ fontFamily: TYPOGRAPHY.fonts.primary, fontSize: 11, color: "#1d4ed8", fontWeight: "600" }}>
                      {categoryDraftsCount} {categoryDraftsCount === 1 ? "Draft" : "Drafts"}
                    </Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}
