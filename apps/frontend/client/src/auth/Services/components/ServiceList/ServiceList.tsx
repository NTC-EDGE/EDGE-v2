import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Icon, TYPOGRAPHY } from "@edge/ui";
import { NTCService, NTCServiceCategory } from "../../data/servicesData";
import { styles } from "./ServiceList.styles";

interface ServiceListProps {
  searchQuery: string;
  activeCategory: NTCServiceCategory | null;
  searchResults: { categoryTitle: string; service: NTCService }[] | null;
  onServiceSelect: (service: NTCService) => void;
  onBack: () => void;
  isMobile: boolean;
  isWizardActive?: boolean;
}

export function ServiceList({
  searchQuery,
  activeCategory,
  searchResults,
  onServiceSelect,
  onBack,
  isMobile,
  isWizardActive = false,
}: ServiceListProps) {
  const isSearchActive = searchQuery.trim() !== "";
  const [showActiveBanner, setShowActiveBanner] = useState(true);

  useEffect(() => {
    if (isWizardActive) {
      setShowActiveBanner(true);
      const timer = setTimeout(() => {
        setShowActiveBanner(false);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [isWizardActive]);

  const serviceCount = activeCategory?.services.length ?? 0;

  return (
    <View style={{ flex: 1 }}>
      {/* Mobile Navbar Header */}
      {isMobile && (
        <View style={styles.mobileNavbar}>
          <TouchableOpacity onPress={onBack} style={styles.mobileBackBtn}>
            <Icon name="arrow-left" size={18} color="#1f2937" style={{ marginRight: 6 }} />
            <Text style={styles.mobileBackBtnText}>
              {isSearchActive ? "Clear Search" : "Back to Categories"}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Transaction Active Lock Banner */}
        {isWizardActive && showActiveBanner && (
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
                Selecting a different service requires canceling your current application transaction.
              </Text>
            </View>
          </View>
        )}

        {isSearchActive ? (
          /* Search results listing screen */
          <View style={styles.searchResultsWrapper}>
            {/* Clear search link */}
            <TouchableOpacity onPress={onBack} style={styles.backLink}>
              <Icon name="chevron-left" size={14} color="#1d4ed8" />
              <Text style={styles.backLinkText}>Clear Search Results</Text>
            </TouchableOpacity>

            <Text style={styles.sectionLabel}>Search Results ({searchResults?.length ?? 0})</Text>
            
            {searchResults === null || searchResults.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="info" size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyStateText}>No services match your query.</Text>
              </View>
            ) : (
              <View style={styles.servicesGrid}>
                {searchResults.map((item, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onServiceSelect(item.service)}
                    style={styles.serviceCardItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceCardItemHeader}>
                      <Text style={styles.serviceCardItemTitle}>{item.service.title}</Text>
                      <Icon name="chevron-right" size={18} color="#1E40AF" />
                    </View>
                    <Text style={styles.serviceCardItemCategory}>under {item.categoryTitle}</Text>
                    {item.service.description && (
                      <Text style={styles.serviceCardItemDesc} numberOfLines={2}>
                        {item.service.description}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : activeCategory !== null ? (
          /* Standard Category Services listing screen */
          <View style={styles.subItemsWrapper}>
            {/* Category Header Banner */}
            <View style={styles.categoryHeaderBanner}>
              <View style={styles.categoryHeaderRow}>
                <Text style={styles.categoryHeaderTitle}>{activeCategory.title}</Text>
                <View style={styles.categoryHeaderBadge}>
                  <Text style={styles.categoryHeaderBadgeText}>
                    {serviceCount} {serviceCount === 1 ? "Service Available" : "Services Available"}
                  </Text>
                </View>
              </View>
              <Text style={styles.categoryHeaderDesc}>{activeCategory.description}</Text>
            </View>

            <Text style={styles.subItemsTitle}>Available Services</Text>
            
            {activeCategory.services.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="info" size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyStateText}>No services currently available under this category.</Text>
              </View>
            ) : (
              <View style={styles.servicesGrid}>
                {activeCategory.services.map((service, idx) => (
                  <TouchableOpacity
                    key={idx}
                    onPress={() => onServiceSelect(service)}
                    style={styles.serviceCardItem}
                    activeOpacity={0.7}
                  >
                    <View style={styles.serviceCardItemHeader}>
                      <Text style={styles.serviceCardItemTitle}>{service.title}</Text>
                      <Icon name="chevron-right" size={18} color="#1E40AF" />
                    </View>
                    <Text style={styles.serviceCardItemDesc} numberOfLines={2}>
                      {service.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
