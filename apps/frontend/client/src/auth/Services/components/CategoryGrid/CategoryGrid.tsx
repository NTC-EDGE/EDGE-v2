import { useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { COLORS, Icon } from "@edge/ui";
import { servicesData } from "../../data/servicesData";
import { styles } from "./CategoryGrid.styles";

interface CategoryGridProps {
  user: { name: string; email: string; avatarUrl?: string } | null;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  selectedCategoryId: string | null;
  onCategorySelect: (categoryId: string) => void;
}

export function CategoryGrid({
  user,
  searchQuery,
  onSearchQueryChange,
  selectedCategoryId,
  onCategorySelect,
}: CategoryGridProps) {
  // Derive time of day greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = user?.name ?? "Guest";

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
        <View style={styles.menuIconContainer}>
          <Icon name="menu" size={18} color="#1f2937" />
        </View>
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
        {servicesData.map((category) => {
          const theme = getCategoryTheme(category.id);
          const isActive = selectedCategoryId === category.id;
          return (
            <TouchableOpacity
              key={category.id}
              onPress={() => onCategorySelect(category.id)}
              style={[
                styles.categoryCard,
                isActive && styles.categoryCardActive,
              ]}
            >
              <View style={[styles.iconBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                <Icon name={category.icon as any} size={22} color={theme.icon} />
              </View>
              <Text style={styles.categoryCardTitle}>{category.title}</Text>
              <Text style={styles.categoryCardCount}>
                {category.services.length} {category.services.length === 1 ? "Service" : "Services"}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </ScrollView>
  );
}
