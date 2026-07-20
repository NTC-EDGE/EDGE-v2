import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Icon } from "@edge/ui";
import { NTCService, NTCServiceCategory } from "../../data/servicesData";
import { styles } from "./ServiceList.styles";

interface ServiceListProps {
  searchQuery: string;
  activeCategory: NTCServiceCategory | null;
  searchResults: { categoryTitle: string; service: NTCService }[] | null;
  onServiceSelect: (service: NTCService) => void;
  onBack: () => void;
  isMobile: boolean;
}

export function ServiceList({
  searchQuery,
  activeCategory,
  searchResults,
  onServiceSelect,
  onBack,
  isMobile,
}: ServiceListProps) {
  const isSearchActive = searchQuery.trim() !== "";

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
        {isSearchActive ? (
          /* Search results listing screen */
          <View style={styles.searchResultsWrapper}>
            {/* Back button (Web only) */}
            {!isMobile && (
              <TouchableOpacity onPress={onBack} style={styles.backLink}>
                <Icon name="chevron-left" size={14} color="#1d4ed8" />
                <Text style={styles.backLinkText}>Clear Search Results</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.sectionLabel}>Search Results ({searchResults?.length ?? 0})</Text>
            
            {searchResults === null || searchResults.length === 0 ? (
              <View style={styles.emptyStateContainer}>
                <Icon name="info" size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                <Text style={styles.emptyStateText}>No services match your query.</Text>
              </View>
            ) : (
              searchResults.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  onPress={() => onServiceSelect(item.service)}
                  style={styles.serviceCardItem}
                >
                  <View style={styles.serviceCardItemHeader}>
                    <Text style={styles.serviceCardItemTitle}>{item.service.title}</Text>
                    <Icon name="chevron-right" size={16} color="#1d4ed8" />
                  </View>
                  <Text style={styles.serviceCardItemCategory}>under {item.categoryTitle}</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        ) : activeCategory !== null ? (
          /* Standard Sub-items listing screen */
          <View style={styles.subItemsWrapper}>
            {/* Back button (Web only) */}
            {!isMobile && (
              <TouchableOpacity onPress={onBack} style={styles.backLink}>
                <Icon name="chevron-left" size={14} color="#1d4ed8" />
                <Text style={styles.backLinkText}>Back to Categories</Text>
              </TouchableOpacity>
            )}

            <Text style={styles.subItemsTitle}>{activeCategory.title} Services</Text>
            
            {activeCategory.services.map((service, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => onServiceSelect(service)}
                style={styles.serviceCardItem}
              >
                <View style={styles.serviceCardItemHeader}>
                  <Text style={styles.serviceCardItemTitle}>{service.title}</Text>
                  <Icon name="chevron-right" size={16} color="#1d4ed8" />
                </View>
                <Text style={styles.serviceCardItemDesc} numberOfLines={2}>
                  {service.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}
