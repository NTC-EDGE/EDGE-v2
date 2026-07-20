import { useState, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { ServiceFormModal, Icon } from "@edge/ui";
import { servicesData, NTCService } from "../../data/servicesData";
import { styles } from "./ServicesPortal.styles";

interface ServicesPortalProps {
  user: { name: string; email: string; avatarUrl?: string } | null;
  onLogout: () => void | Promise<void>;
  onApplySubmit: (serviceTitle: string, data: { applicantName: string; email: string; notes: string }) => Promise<void>;
  isSubmitting: boolean;
}

export function ServicesPortal({
  user,
  onLogout,
  onApplySubmit,
  isSubmitting,
}: ServicesPortalProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<NTCService | null>(null);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Derive time of day greeting
  const greeting = useMemo(() => {
    const hours = new Date().getHours();
    if (hours < 12) return "Good morning";
    if (hours < 18) return "Good afternoon";
    return "Good evening";
  }, []);

  const displayName = user?.name ?? "Guest";

  // Selected category object
  const activeCategory = useMemo(() => {
    if (selectedCategoryId === null) return null;
    const category = servicesData.find((c) => c.id === selectedCategoryId);
    return category ?? null;
  }, [selectedCategoryId]);

  // Search results filtering
  const searchResults = useMemo(() => {
    if (searchQuery.trim() === "") return null;
    const query = searchQuery.toLowerCase();
    const results: { categoryTitle: string; service: NTCService }[] = [];
    
    servicesData.forEach((category) => {
      category.services.forEach((service) => {
        if (
          service.title.toLowerCase().includes(query) ||
          service.description.toLowerCase().includes(query)
        ) {
          results.push({ categoryTitle: category.title, service });
        }
      });
    });
    return results;
  }, [searchQuery]);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedService(null);
    setSearchQuery(""); // Clear search when picking a category
  };

  const handleServiceSelect = (service: NTCService) => {
    setSelectedService(service);
  };

  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedService(null);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
  };

  const handleFormSubmit = async (formData: { applicantName: string; email: string; notes: string }) => {
    if (selectedService !== null) {
      await onApplySubmit(selectedService.title, formData);
      setIsModalOpen(false);
    }
  };

  // Helper to map category ID to icon color gradient styles
  const getCategoryTheme = (id: string) => {
    switch (id) {
      case "accreditations":
        return { bg: "rgba(37, 99, 235, 0.08)", icon: styles.categoryCardActive.borderColor as string || "#2563eb", border: "rgba(37, 99, 235, 0.15)" };
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
    <View style={styles.rootContainer}>
      {/* Top Banner / Brand Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoWrapper}>
          <View style={styles.circularLogo}>
            <Icon name="globe" size={16} color="#1e40af" />
          </View>
          <Text style={styles.brandTitle}>NTC EDGE</Text>
          <Text style={styles.brandSubtitle}>PORTAL</Text>
        </View>
        {user !== null && (
          <TouchableOpacity onPress={onLogout} style={styles.topLogoutBtn}>
            <Icon name="log-out" size={14} color="#ffffff" style={{ marginRight: 6 }} />
            {!isMobile && <Text style={styles.topLogoutText}>Sign Out</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Main Body Area */}
      <View style={styles.mainLayout}>
        {/* Left Mini Sidebar (Collapsible) - hidden on mobile */}
        {!isMobile && (
          <View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed]}>
            <TouchableOpacity
              onPress={() => setIsSidebarCollapsed((prev) => !prev)}
              style={styles.collapseToggle}
            >
              <Icon name={isSidebarCollapsed ? "chevron-right" : "chevron-left"} size={16} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.sidebarItems}>
              <TouchableOpacity style={[styles.sidebarItem, styles.sidebarItemActive]}>
                <Icon name="radio" size={20} color="#1d4ed8" />
                {!isSidebarCollapsed && <Text style={styles.sidebarItemTextActive}>Services</Text>}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.sidebarItem} disabled={true}>
                <Icon name="grid" size={20} color="#9ca3af" />
                {!isSidebarCollapsed && <Text style={styles.sidebarItemText}>Dashboard</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={styles.sidebarItem} disabled={true}>
                <Icon name="help-circle" size={20} color="#9ca3af" />
                {!isSidebarCollapsed && <Text style={styles.sidebarItemText}>Help Center</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Categories/Selector Column */}
        <View style={[styles.contentColumn, (isMobile && (selectedCategoryId !== null || selectedService !== null)) && styles.hiddenColumn]}>
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
                onChangeText={setSearchQuery}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearch}>
                  <Icon name="x" size={14} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {/* Conditional Render: Search Results vs Standard Categories */}
            {searchResults !== null ? (
              <View style={styles.searchResultsWrapper}>
                <Text style={styles.sectionLabel}>Search Results ({searchResults.length})</Text>
                {searchResults.length === 0 ? (
                  <View style={styles.emptyStateContainer}>
                    <Icon name="info" size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                    <Text style={styles.emptyStateText}>No services match your query.</Text>
                  </View>
                ) : (
                  searchResults.map((item, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => {
                        handleServiceSelect(item.service);
                        if (isMobile) {
                          // In mobile, we must set selectedCategoryId to bypass main grid
                          setSelectedCategoryId("search-active");
                        }
                      }}
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
            ) : (
              <>
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
                        onPress={() => handleCategorySelect(category.id)}
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
              </>
            )}
          </ScrollView>
        </View>

        {/* Details / Interactive Panel Column (Tablet / Web View) */}
        {/* On mobile, this column takes full screen if category or service is selected */}
        {(!isMobile || selectedCategoryId !== null || selectedService !== null) && (
          <View style={[styles.detailsColumn, isMobile && styles.mobileDetailsColumn]}>
            
            {/* Mobile Header Back Button */}
            {isMobile && (
              <View style={styles.mobileNavbar}>
                <TouchableOpacity
                  onPress={selectedService !== null ? handleBackToServices : handleBackToCategories}
                  style={styles.mobileBackBtn}
                >
                  <Icon name="arrow-left" size={18} color="#1f2937" style={{ marginRight: 6 }} />
                  <Text style={styles.mobileBackBtnText}>
                    {selectedService !== null ? "Back to Services" : "Back to Categories"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Note alert at top */}
            <View style={styles.noticeAlert}>
              <View style={styles.noticeIcon}>
                <Icon name="clock" size={16} color="#1e40af" />
              </View>
              <Text style={styles.noticeText}>
                <Text style={{ fontWeight: "700" }}>Note:</Text> Applications are processed on weekdays, 8:00 AM–5:00 PM. Submissions outside these hours will be processed on the next business day.
              </Text>
            </View>

            {/* Interactive Panel Content */}
            <ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
              {selectedService !== null ? (
                /* Service details screen */
                <View style={styles.detailsCard}>
                  {/* Back button (Web only) */}
                  {!isMobile && (
                    <TouchableOpacity onPress={handleBackToServices} style={styles.backLink}>
                      <Icon name="chevron-left" size={14} color="#1d4ed8" />
                      <Text style={styles.backLinkText}>Back to Services List</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.detailsTitle}>{selectedService.title}</Text>
                  <Text style={styles.detailsDescription}>{selectedService.description}</Text>

                  {/* Divider */}
                  <View style={styles.panelDivider} />

                  {/* Requirements Section */}
                  <Text style={styles.sectionHeading}>Required Documents</Text>
                  {selectedService.requirements.map((req, idx) => (
                    <View key={idx} style={styles.requirementRow}>
                      <View style={styles.bulletDot} />
                      <Text style={styles.requirementText}>{req}</Text>
                    </View>
                  ))}

                  {/* Divider */}
                  <View style={styles.panelDivider} />

                  {/* Metadata Row */}
                  <View style={styles.metadataGrid}>
                    <View style={styles.metaBox}>
                      <Icon name="credit-card" size={16} color="#6b7280" style={{ marginBottom: 4 }} />
                      <Text style={styles.metaLabel}>Processing Fee</Text>
                      <Text style={styles.metaValue}>{selectedService.fee}</Text>
                    </View>

                    <View style={styles.metaBox}>
                      <Icon name="calendar" size={16} color="#6b7280" style={{ marginBottom: 4 }} />
                      <Text style={styles.metaLabel}>Estimated Duration</Text>
                      <Text style={styles.metaValue}>{selectedService.time}</Text>
                    </View>
                  </View>

                  {/* Action Button */}
                  <TouchableOpacity
                    onPress={() => setIsModalOpen(true)}
                    style={styles.applyBtn}
                  >
                    <Text style={styles.applyBtnText}>Apply Now</Text>
                    <Icon name="external-link" size={14} color="#ffffff" style={{ marginLeft: 6 }} />
                  </TouchableOpacity>
                </View>
              ) : activeCategory !== null ? (
                /* Sub-items listing screen */
                <View style={styles.subItemsWrapper}>
                  {/* Back button (Web only) */}
                  {!isMobile && (
                    <TouchableOpacity onPress={handleBackToCategories} style={styles.backLink}>
                      <Icon name="chevron-left" size={14} color="#1d4ed8" />
                      <Text style={styles.backLinkText}>Back to Categories</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.subItemsTitle}>{activeCategory.title} Services</Text>
                  
                  {activeCategory.services.map((service, idx) => (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleServiceSelect(service)}
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
              ) : (
                /* Empty placeholder screen (Web only since mobile doesn't show details initially) */
                !isMobile && (
                  <View style={styles.emptyPlaceholder}>
                    <View style={styles.placeholderIllustration}>
                      <Icon name="file" size={48} color="#d1d5db" />
                      <Icon
                        name="mouse-pointer"
                        size={24}
                        color="#1d4ed8"
                        style={styles.pointerOverlay}
                      />
                    </View>
                    <Text style={styles.placeholderTitleText}>No service selected</Text>
                    <Text style={styles.placeholderSubtitleText}>
                      Choose a category on the left, then select a service to view its application details and requirements.
                    </Text>
                  </View>
                )
              )}
            </ScrollView>

            {/* Web Help Button overlay */}
            {!isMobile && (
              <TouchableOpacity style={styles.helpButton}>
                <Text style={styles.helpButtonText}>Help Center</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Footer Banner */}
      <View style={styles.footerBanner}>
        <Text style={styles.footerText}>National Telecommunications Commission</Text>
        <Text style={styles.footerButtonText}>I'm done!</Text>
      </View>

      {/* Application Form Modal */}
      {selectedService !== null && (
        <ServiceFormModal
          visible={isModalOpen}
          serviceTitle={selectedService.title}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </View>
  );
}
