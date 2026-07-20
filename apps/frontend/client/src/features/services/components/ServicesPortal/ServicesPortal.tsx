import { useState, useMemo } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
} from "react-native";
import { Icon, ServiceFormModal } from "@edge/ui";
import { servicesData, NTCService } from "../../data/servicesData";
import { CategoryGrid } from "../CategoryGrid";
import { ServiceList } from "../ServiceList";
import { ServiceDetails } from "../ServiceDetails";
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

  // Derived selected category object
  const activeCategory = useMemo(() => {
    if (selectedCategoryId === null) return null;
    const category = servicesData.find((c) => c.id === selectedCategoryId);
    return category ?? null;
  }, [selectedCategoryId]);

  // Search results filtering across all categories
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

  // Resolved back actions
  const handleBackToCategories = () => {
    setSelectedCategoryId(null);
    setSelectedService(null);
  };

  const handleBackToServices = () => {
    setSelectedService(null);
    if (isMobile && selectedCategoryId === "search-active") {
      // If we entered details from search results on mobile, going back should clear the search category
      setSelectedCategoryId(null);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSelectedCategoryId(null);
    setSelectedService(null);
  };

  const handleFormSubmit = async (formData: { applicantName: string; email: string; notes: string }) => {
    if (selectedService !== null) {
      await onApplySubmit(selectedService.title, formData);
      setIsModalOpen(false);
    }
  };

  // Check if we should display the left-side list view (standard grid or sub-items list)
  // On mobile, if a detail card or sub-items list is active, we hide the left main grid column
  const isLeftColumnHiddenOnMobile = isMobile && (selectedCategoryId !== null || selectedService !== null);

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
            </View>
          </View>
        )}

        {/* Content Column (Category Grid OR Sub-items List) */}
        <View style={[styles.contentColumn, isLeftColumnHiddenOnMobile && styles.hiddenColumn]}>
          {searchQuery.trim() !== "" ? (
            <ServiceList
              searchQuery={searchQuery}
              activeCategory={null}
              searchResults={searchResults}
              onServiceSelect={(service) => {
                setSelectedService(service);
                if (isMobile) {
                  // Bypass standard grid to show details in mobile stack
                  setSelectedCategoryId("search-active");
                }
              }}
              onBack={handleClearSearch}
              isMobile={isMobile}
            />
          ) : selectedCategoryId !== null ? (
            <ServiceList
              searchQuery=""
              activeCategory={activeCategory}
              searchResults={null}
              onServiceSelect={setSelectedService}
              onBack={handleBackToCategories}
              isMobile={isMobile}
            />
          ) : (
            <CategoryGrid
              user={user}
              searchQuery={searchQuery}
              onSearchQueryChange={setSearchQuery}
              selectedCategoryId={selectedCategoryId}
              onCategorySelect={setSelectedCategoryId}
            />
          )}
        </View>

        {/* Details / Interactive Panel Column (Tablet / Web View) */}
        {/* On mobile, this column takes full screen if category or service is selected */}
        {(!isMobile || selectedCategoryId !== null || selectedService !== null) && (
          <View style={[styles.detailsColumn, isMobile && styles.mobileDetailsColumn]}>
            
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
            <View style={{ flex: 1 }}>
              {selectedService !== null ? (
                <ServiceDetails
                  selectedService={selectedService}
                  onBackToServices={handleBackToServices}
                  onApplyPress={() => setIsModalOpen(true)}
                  isMobile={isMobile}
                />
              ) : activeCategory !== null ? (
                /* Standard listing instructions on web when category is active but no service is selected */
                !isMobile && (
                  <View style={styles.emptyPlaceholder}>
                    <View style={styles.placeholderIllustration}>
                      <Icon name="file" size={48} color="#d1d5db" />
                      <Icon name="mouse-pointer" size={24} color="#1d4ed8" style={styles.pointerOverlay} />
                    </View>
                    <Text style={styles.placeholderTitleText}>Select a service</Text>
                    <Text style={styles.placeholderSubtitleText}>
                      Please choose a specific service from the list on the left to view the required documents and submit an application.
                    </Text>
                  </View>
                )
              ) : (
                /* Empty placeholder screen (Web only since mobile doesn't show details initially) */
                !isMobile && (
                  <View style={styles.emptyPlaceholder}>
                    <View style={styles.placeholderIllustration}>
                      <Icon name="file" size={48} color="#d1d5db" />
                      <Icon name="mouse-pointer" size={24} color="#1d4ed8" style={styles.pointerOverlay} />
                    </View>
                    <Text style={styles.placeholderTitleText}>No service selected</Text>
                    <Text style={styles.placeholderSubtitleText}>
                      Choose a category on the left, then select a service to view its application details and requirements.
                    </Text>
                  </View>
                )
              )}
            </View>

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
