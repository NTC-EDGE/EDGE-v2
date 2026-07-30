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
import { servicesData } from "../../data/servicesData";
import { styles } from "./CategoryGrid.styles";

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
}: CategoryGridProps) {
  // Derive time of day greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = user?.name ?? "Guest";

  const visibleCategories = useMemo(() => {
    if (!backendCategories) return servicesData;
    return servicesData.filter((cat) => {
      return backendCategories.some((c: any) => {
        const code = c.code?.toUpperCase();
        if (cat.id === "exams" && code === "EXAM") return true;
        if (cat.id === "certificates" && code === "CERT") return true;
        if (cat.id === "licenses" && code === "LIC") return true;
        if (cat.id === "permits" && code === "PRM") return true;
        if (cat.id === "accreditations" && code === "ACCR") return true;
        if (cat.id === "complaints" && (code === "REQ" || c.type === "RequestsAndComplaints")) return true;
        return false;
      });
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
      {/* Column Header */}
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Services</Text>
      </View>

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

      {/* Greeting banner */}
      <View style={styles.greetingBanner}>
        <Text style={styles.greetingText}>
          {greeting}, <Text style={styles.greetingName}>{displayName}!</Text>
        </Text>
        <Text style={styles.greetingSubtext}>Select a service category below to get started.</Text>
      </View>

      {/* Grid of Categories */}
      <View style={styles.gridContainer}>
        {visibleCategories.map((category) => {
          const theme = getCategoryTheme(category.id);
          const isActive = selectedCategoryId === category.id;
          const categoryDraftsCount = drafts.filter((d) =>
            category.services.some((s) => s.title === d.service?.title)
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
              {CATEGORY_IMAGES[category.id] !== undefined ? (
                <Image
                  source={CATEGORY_IMAGES[category.id]}
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
                const servicesCount = allBackendServices && backendCat
                  ? allBackendServices.filter((s: any) => s.serviceCategoryId === backendCat.id).length
                  : category.services.length;

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
    </ScrollView>
  );
}
