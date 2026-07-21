"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServicesPortal = ServicesPortal;
const react_1 = require("react");
const react_native_1 = require("react-native");
const tokens_1 = require("../theme/tokens");
const vector_icons_1 = require("@expo/vector-icons");
const servicesData_1 = require("./servicesData");
const ServiceFormModal_1 = require("./ServiceFormModal");
function ServicesPortal({ user, onLogout, onApplySubmit, isSubmitting, }) {
    const { width } = (0, react_native_1.useWindowDimensions)();
    const isMobile = width < 768;
    // Search & Navigation States
    const [searchQuery, setSearchQuery] = (0, react_1.useState)("");
    const [selectedCategoryId, setSelectedCategoryId] = (0, react_1.useState)(null);
    const [selectedService, setSelectedService] = (0, react_1.useState)(null);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = (0, react_1.useState)(false);
    const [isModalOpen, setIsModalOpen] = (0, react_1.useState)(false);
    // Derive time of day greeting
    const greeting = (0, react_1.useMemo)(() => {
        const hours = new Date().getHours();
        if (hours < 12)
            return "Good morning";
        if (hours < 18)
            return "Good afternoon";
        return "Good evening";
    }, []);
    const displayName = user?.name ?? "Guest";
    // Selected category object
    const activeCategory = (0, react_1.useMemo)(() => {
        if (selectedCategoryId === null)
            return null;
        const category = servicesData_1.servicesData.find((c) => c.id === selectedCategoryId);
        return category ?? null;
    }, [selectedCategoryId]);
    // Search results filtering
    const searchResults = (0, react_1.useMemo)(() => {
        if (searchQuery.trim() === "")
            return null;
        const query = searchQuery.toLowerCase();
        const results = [];
        servicesData_1.servicesData.forEach((category) => {
            category.services.forEach((service) => {
                if (service.title.toLowerCase().includes(query) ||
                    service.description.toLowerCase().includes(query)) {
                    results.push({ categoryTitle: category.title, service });
                }
            });
        });
        return results;
    }, [searchQuery]);
    const handleCategorySelect = (categoryId) => {
        setSelectedCategoryId(categoryId);
        setSelectedService(null);
        setSearchQuery(""); // Clear search when picking a category
    };
    const handleServiceSelect = (service) => {
        setSelectedService(service);
    };
    const handleBackToCategories = () => {
        setSelectedCategoryId(null);
        setSelectedService(null);
    };
    const handleBackToServices = () => {
        setSelectedService(null);
    };
    const handleFormSubmit = async (formData) => {
        if (selectedService !== null) {
            await onApplySubmit(selectedService.title, formData);
            setIsModalOpen(false);
        }
    };
    // Helper to map category ID to icon color gradient styles
    const getCategoryTheme = (id) => {
        switch (id) {
            case "accreditations":
                return { bg: "rgba(37, 99, 235, 0.08)", icon: tokens_1.COLORS.brand[700], border: "rgba(37, 99, 235, 0.15)" };
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
    return (<react_native_1.View style={styles.rootContainer}>
      {/* Top Banner / Brand Header */}
      <react_native_1.View style={styles.topHeader}>
        <react_native_1.View style={styles.logoWrapper}>
          <react_native_1.View style={styles.circularLogo}>
            <vector_icons_1.Feather name="globe" size={16} color={tokens_1.COLORS.brand[800]}/>
          </react_native_1.View>
          <react_native_1.Text style={styles.brandTitle}>NTC EDGE</react_native_1.Text>
          <react_native_1.Text style={styles.brandSubtitle}>PORTAL</react_native_1.Text>
        </react_native_1.View>
        {user !== null && (<react_native_1.TouchableOpacity onPress={onLogout} style={styles.topLogoutBtn}>
            <vector_icons_1.Feather name="log-out" size={14} color={tokens_1.COLORS.neutral.white} style={{ marginRight: 6 }}/>
            {!isMobile && <react_native_1.Text style={styles.topLogoutText}>Sign Out</react_native_1.Text>}
          </react_native_1.TouchableOpacity>)}
      </react_native_1.View>

      {/* Main Body Area */}
      <react_native_1.View style={styles.mainLayout}>
        {/* Left Mini Sidebar (Collapsible) - hidden on mobile */}
        {!isMobile && (<react_native_1.View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed]}>
            <react_native_1.TouchableOpacity onPress={() => setIsSidebarCollapsed((prev) => !prev)} style={styles.collapseToggle}>
              <vector_icons_1.Feather name={isSidebarCollapsed ? "chevron-right" : "chevron-left"} size={16} color={tokens_1.COLORS.neutral[500]}/>
            </react_native_1.TouchableOpacity>

            <react_native_1.View style={styles.sidebarItems}>
              <react_native_1.TouchableOpacity style={[styles.sidebarItem, styles.sidebarItemActive]}>
                <vector_icons_1.Feather name="radio" size={20} color={tokens_1.COLORS.brand[700]}/>
                {!isSidebarCollapsed && <react_native_1.Text style={styles.sidebarItemTextActive}>Services</react_native_1.Text>}
              </react_native_1.TouchableOpacity>
              
              <react_native_1.TouchableOpacity style={styles.sidebarItem} disabled={true}>
                <vector_icons_1.Feather name="grid" size={20} color={tokens_1.COLORS.neutral[400]}/>
                {!isSidebarCollapsed && <react_native_1.Text style={styles.sidebarItemText}>Dashboard</react_native_1.Text>}
              </react_native_1.TouchableOpacity>

              <react_native_1.TouchableOpacity style={styles.sidebarItem} disabled={true}>
                <vector_icons_1.Feather name="help-circle" size={20} color={tokens_1.COLORS.neutral[400]}/>
                {!isSidebarCollapsed && <react_native_1.Text style={styles.sidebarItemText}>Help Center</react_native_1.Text>}
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
          </react_native_1.View>)}

        {/* Categories/Selector Column */}
        <react_native_1.View style={[styles.contentColumn, (isMobile && (selectedCategoryId !== null || selectedService !== null)) && styles.hiddenColumn]}>
          <react_native_1.ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Column Header */}
            <react_native_1.View style={styles.panelHeader}>
              <react_native_1.View style={styles.menuIconContainer}>
                <vector_icons_1.Feather name="menu" size={18} color={tokens_1.COLORS.neutral[800]}/>
              </react_native_1.View>
              <react_native_1.Text style={styles.panelTitle}>Services</react_native_1.Text>
            </react_native_1.View>

            {/* Search Input */}
            <react_native_1.View style={styles.searchContainer}>
              <vector_icons_1.Feather name="search" size={16} color={tokens_1.COLORS.neutral[400]} style={styles.searchIcon}/>
              <react_native_1.TextInput placeholder="Search services or licenses..." placeholderTextColor={tokens_1.COLORS.neutral[400]} value={searchQuery} onChangeText={setSearchQuery} style={styles.searchInput}/>
              {searchQuery.length > 0 && (<react_native_1.TouchableOpacity onPress={() => setSearchQuery("")} style={styles.clearSearch}>
                  <vector_icons_1.Feather name="x" size={14} color={tokens_1.COLORS.neutral[400]}/>
                </react_native_1.TouchableOpacity>)}
            </react_native_1.View>

            {/* Conditional Render: Search Results vs Standard Categories */}
            {searchResults !== null ? (<react_native_1.View style={styles.searchResultsWrapper}>
                <react_native_1.Text style={styles.sectionLabel}>Search Results ({searchResults.length})</react_native_1.Text>
                {searchResults.length === 0 ? (<react_native_1.View style={styles.emptyStateContainer}>
                    <vector_icons_1.Feather name="info" size={24} color={tokens_1.COLORS.neutral[400]} style={{ marginBottom: 8 }}/>
                    <react_native_1.Text style={styles.emptyStateText}>No services match your query.</react_native_1.Text>
                  </react_native_1.View>) : (searchResults.map((item, idx) => (<react_native_1.TouchableOpacity key={idx} onPress={() => {
                    handleServiceSelect(item.service);
                    if (isMobile) {
                        // In mobile, we must set selectedCategoryId to bypass main grid
                        setSelectedCategoryId("search-active");
                    }
                }} style={[styles.serviceCardItem, tokens_1.SHADOWS.card]}>
                      <react_native_1.View style={styles.serviceCardItemHeader}>
                        <react_native_1.Text style={styles.serviceCardItemTitle}>{item.service.title}</react_native_1.Text>
                        <vector_icons_1.Feather name="chevron-right" size={16} color={tokens_1.COLORS.brand[700]}/>
                      </react_native_1.View>
                      <react_native_1.Text style={styles.serviceCardItemCategory}>under {item.categoryTitle}</react_native_1.Text>
                    </react_native_1.TouchableOpacity>)))}
              </react_native_1.View>) : (<>
                {/* Greeting banner */}
                <react_native_1.View style={styles.greetingBanner}>
                  <react_native_1.Text style={styles.greetingText}>
                    {greeting}, <react_native_1.Text style={styles.greetingName}>{displayName}!</react_native_1.Text>
                  </react_native_1.Text>
                  <react_native_1.Text style={styles.greetingSubtext}>Select a service category below to get started.</react_native_1.Text>
                </react_native_1.View>

                {/* Grid of Categories */}
                <react_native_1.View style={styles.gridContainer}>
                  {servicesData_1.servicesData.map((category) => {
                const theme = getCategoryTheme(category.id);
                const isActive = selectedCategoryId === category.id;
                return (<react_native_1.TouchableOpacity key={category.id} onPress={() => handleCategorySelect(category.id)} style={[
                        styles.categoryCard,
                        tokens_1.SHADOWS.card,
                        isActive && styles.categoryCardActive,
                    ]}>
                        <react_native_1.View style={[styles.iconBadge, { backgroundColor: theme.bg, borderColor: theme.border }]}>
                          <vector_icons_1.Feather name={category.icon} size={22} color={theme.icon}/>
                        </react_native_1.View>
                        <react_native_1.Text style={styles.categoryCardTitle}>{category.title}</react_native_1.Text>
                        <react_native_1.Text style={styles.categoryCardCount}>
                          {category.services.length} {category.services.length === 1 ? "Service" : "Services"}
                        </react_native_1.Text>
                      </react_native_1.TouchableOpacity>);
            })}
                </react_native_1.View>
              </>)}
          </react_native_1.ScrollView>
        </react_native_1.View>

        {/* Details / Interactive Panel Column (Tablet / Web View) */}
        {/* On mobile, this column takes full screen if category or service is selected */}
        {(!isMobile || selectedCategoryId !== null || selectedService !== null) && (<react_native_1.View style={[styles.detailsColumn, isMobile && styles.mobileDetailsColumn]}>
            
            {/* Mobile Header Back Button */}
            {isMobile && (<react_native_1.View style={styles.mobileNavbar}>
                <react_native_1.TouchableOpacity onPress={selectedService !== null ? handleBackToServices : handleBackToCategories} style={styles.mobileBackBtn}>
                  <vector_icons_1.Feather name="arrow-left" size={18} color={tokens_1.COLORS.neutral[800]} style={{ marginRight: 6 }}/>
                  <react_native_1.Text style={styles.mobileBackBtnText}>
                    {selectedService !== null ? "Back to Services" : "Back to Categories"}
                  </react_native_1.Text>
                </react_native_1.TouchableOpacity>
              </react_native_1.View>)}

            {/* Note alert at top */}
            <react_native_1.View style={[styles.noticeAlert, tokens_1.SHADOWS.card]}>
              <react_native_1.View style={styles.noticeIcon}>
                <vector_icons_1.Feather name="clock" size={16} color={tokens_1.COLORS.brand[800]}/>
              </react_native_1.View>
              <react_native_1.Text style={styles.noticeText}>
                <react_native_1.Text style={{ fontWeight: "700" }}>Note:</react_native_1.Text> Applications are processed on weekdays, 8:00 AM–5:00 PM. Submissions outside these hours will be processed on the next business day.
              </react_native_1.Text>
            </react_native_1.View>

            {/* Interactive Panel Content */}
            <react_native_1.ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
              {selectedService !== null ? (
            /* Service details screen */
            <react_native_1.View style={[styles.detailsCard, tokens_1.SHADOWS.card]}>
                  {/* Back button (Web only) */}
                  {!isMobile && (<react_native_1.TouchableOpacity onPress={handleBackToServices} style={styles.backLink}>
                      <vector_icons_1.Feather name="chevron-left" size={14} color={tokens_1.COLORS.brand[700]}/>
                      <react_native_1.Text style={styles.backLinkText}>Back to Services List</react_native_1.Text>
                    </react_native_1.TouchableOpacity>)}

                  <react_native_1.Text style={styles.detailsTitle}>{selectedService.title}</react_native_1.Text>
                  <react_native_1.Text style={styles.detailsDescription}>{selectedService.description}</react_native_1.Text>

                  {/* Divider */}
                  <react_native_1.View style={styles.panelDivider}/>

                  {/* Requirements Section */}
                  <react_native_1.Text style={styles.sectionHeading}>Required Documents</react_native_1.Text>
                  {selectedService.requirements.map((req, idx) => (<react_native_1.View key={idx} style={styles.requirementRow}>
                      <react_native_1.View style={styles.bulletDot}/>
                      <react_native_1.Text style={styles.requirementText}>{req}</react_native_1.Text>
                    </react_native_1.View>))}

                  {/* Divider */}
                  <react_native_1.View style={styles.panelDivider}/>

                  {/* Metadata Row */}
                  <react_native_1.View style={styles.metadataGrid}>
                    <react_native_1.View style={styles.metaBox}>
                      <vector_icons_1.Feather name="credit-card" size={16} color={tokens_1.COLORS.neutral[500]} style={{ marginBottom: 4 }}/>
                      <react_native_1.Text style={styles.metaLabel}>Processing Fee</react_native_1.Text>
                      <react_native_1.Text style={styles.metaValue}>{selectedService.fee}</react_native_1.Text>
                    </react_native_1.View>

                    <react_native_1.View style={styles.metaBox}>
                      <vector_icons_1.Feather name="calendar" size={16} color={tokens_1.COLORS.neutral[500]} style={{ marginBottom: 4 }}/>
                      <react_native_1.Text style={styles.metaLabel}>Estimated Duration</react_native_1.Text>
                      <react_native_1.Text style={styles.metaValue}>{selectedService.time}</react_native_1.Text>
                    </react_native_1.View>
                  </react_native_1.View>

                  {/* Action Button */}
                  <react_native_1.TouchableOpacity onPress={() => setIsModalOpen(true)} style={styles.applyBtn}>
                    <react_native_1.Text style={styles.applyBtnText}>Apply Now</react_native_1.Text>
                    <vector_icons_1.Feather name="external-link" size={14} color={tokens_1.COLORS.neutral.white} style={{ marginLeft: 6 }}/>
                  </react_native_1.TouchableOpacity>
                </react_native_1.View>) : activeCategory !== null ? (
            /* Sub-items listing screen */
            <react_native_1.View style={styles.subItemsWrapper}>
                  {/* Back button (Web only) */}
                  {!isMobile && (<react_native_1.TouchableOpacity onPress={handleBackToCategories} style={styles.backLink}>
                      <vector_icons_1.Feather name="chevron-left" size={14} color={tokens_1.COLORS.brand[700]}/>
                      <react_native_1.Text style={styles.backLinkText}>Back to Categories</react_native_1.Text>
                    </react_native_1.TouchableOpacity>)}

                  <react_native_1.Text style={styles.subItemsTitle}>{activeCategory.title} Services</react_native_1.Text>
                  
                  {activeCategory.services.map((service, idx) => (<react_native_1.TouchableOpacity key={idx} onPress={() => handleServiceSelect(service)} style={[styles.serviceCardItem, tokens_1.SHADOWS.card]}>
                      <react_native_1.View style={styles.serviceCardItemHeader}>
                        <react_native_1.Text style={styles.serviceCardItemTitle}>{service.title}</react_native_1.Text>
                        <vector_icons_1.Feather name="chevron-right" size={16} color={tokens_1.COLORS.brand[700]}/>
                      </react_native_1.View>
                      <react_native_1.Text style={styles.serviceCardItemDesc} numberOfLines={2}>
                        {service.description}
                      </react_native_1.Text>
                    </react_native_1.TouchableOpacity>))}
                </react_native_1.View>) : (
            /* Empty placeholder screen (Web only since mobile doesn't show details initially) */
            !isMobile && (<react_native_1.View style={styles.emptyPlaceholder}>
                    <react_native_1.View style={styles.placeholderIllustration}>
                      <vector_icons_1.Feather name="file" size={48} color={tokens_1.COLORS.neutral[300]}/>
                      <vector_icons_1.Feather name="mouse-pointer" size={24} color={tokens_1.COLORS.brand[700]} style={styles.pointerOverlay}/>
                    </react_native_1.View>
                    <react_native_1.Text style={styles.placeholderTitleText}>No service selected</react_native_1.Text>
                    <react_native_1.Text style={styles.placeholderSubtitleText}>
                      Choose a category on the left, then select a service to view its application details and requirements.
                    </react_native_1.Text>
                  </react_native_1.View>))}
            </react_native_1.ScrollView>

            {/* Web Help Button overlay */}
            {!isMobile && (<react_native_1.TouchableOpacity style={styles.helpButton}>
                <react_native_1.Text style={styles.helpButtonText}>Help Center</react_native_1.Text>
              </react_native_1.TouchableOpacity>)}
          </react_native_1.View>)}
      </react_native_1.View>

      {/* Footer Banner */}
      <react_native_1.View style={styles.footerBanner}>
        <react_native_1.Text style={styles.footerText}>National Telecommunications Commission</react_native_1.Text>
        <react_native_1.Text style={styles.footerButtonText}>I'm done!</react_native_1.Text>
      </react_native_1.View>

      {/* Application Form Modal */}
      {selectedService !== null && (<ServiceFormModal_1.ServiceFormModal visible={isModalOpen} serviceTitle={selectedService.title} onClose={() => setIsModalOpen(false)} onSubmit={handleFormSubmit} isSubmitting={isSubmitting}/>)}
    </react_native_1.View>);
}
const styles = react_native_1.StyleSheet.create({
    rootContainer: {
        flex: 1,
        backgroundColor: tokens_1.COLORS.bg,
        flexDirection: "column",
    },
    topHeader: {
        height: 60,
        backgroundColor: tokens_1.COLORS.brand[900],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: tokens_1.SPACING[20],
        ...react_native_1.Platform.select({
            web: {
                backgroundImage: `linear-gradient(135deg, ${tokens_1.COLORS.brand[900]} 0%, ${tokens_1.COLORS.brand[800]} 100%)`,
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            },
        }),
    },
    logoWrapper: {
        flexDirection: "row",
        alignItems: "center",
    },
    circularLogo: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: tokens_1.COLORS.neutral.white,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 8,
    },
    brandTitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 16,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral.white,
        letterSpacing: 0.5,
    },
    brandSubtitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 11,
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
        color: "rgba(255, 255, 255, 0.7)",
        marginLeft: 6,
        borderLeftWidth: 1,
        borderLeftColor: "rgba(255, 255, 255, 0.3)",
        paddingLeft: 6,
    },
    topLogoutBtn: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 6,
        backgroundColor: "rgba(255,255,255,0.08)",
    },
    topLogoutText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.neutral.white,
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
    },
    mainLayout: {
        flex: 1,
        flexDirection: "row",
    },
    sidebar: {
        width: 200,
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderRightWidth: 1,
        borderRightColor: tokens_1.COLORS.neutral[200],
        paddingTop: tokens_1.SPACING[20],
        position: "relative",
    },
    sidebarCollapsed: {
        width: 64,
    },
    collapseToggle: {
        position: "absolute",
        right: -12,
        top: 20,
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderWidth: 1,
        borderColor: tokens_1.COLORS.neutral[200],
        justifyContent: "center",
        alignItems: "center",
        zIndex: 10,
        ...react_native_1.Platform.select({
            web: {
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            },
        }),
    },
    sidebarItems: {
        flexDirection: "column",
        paddingHorizontal: 8,
        gap: 8,
    },
    sidebarItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingHorizontal: 12,
        paddingVertical: 10,
        borderRadius: 8,
    },
    sidebarItemActive: {
        backgroundColor: "rgba(37, 99, 235, 0.08)",
    },
    sidebarItemTextActive: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.brand[700],
        marginLeft: 12,
    },
    sidebarItemText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
        color: tokens_1.COLORS.neutral[400],
        marginLeft: 12,
    },
    contentColumn: {
        flex: 1.2,
        backgroundColor: tokens_1.COLORS.neutral[50],
        borderRightWidth: 1,
        borderRightColor: tokens_1.COLORS.neutral[200],
    },
    hiddenColumn: {
        display: "none",
    },
    scrollContent: {
        padding: tokens_1.SPACING[24],
    },
    panelHeader: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: tokens_1.SPACING[16],
    },
    menuIconContainer: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: tokens_1.COLORS.neutral[100],
        justifyContent: "center",
        alignItems: "center",
        marginRight: 10,
    },
    panelTitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 20,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[900],
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderColor: tokens_1.COLORS.neutral[200],
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        height: 40,
        marginBottom: tokens_1.SPACING[24],
    },
    searchIcon: {
        marginRight: 8,
    },
    searchInput: {
        flex: 1,
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        color: tokens_1.COLORS.neutral[900],
        ...react_native_1.Platform.select({
            web: {
                outlineWidth: 0,
            },
        }),
    },
    clearSearch: {
        padding: 4,
    },
    greetingBanner: {
        marginBottom: tokens_1.SPACING[24],
    },
    greetingText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 16,
        color: tokens_1.COLORS.neutral[600],
    },
    greetingName: {
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[900],
    },
    greetingSubtext: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.neutral[400],
        marginTop: 4,
    },
    gridContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: tokens_1.SPACING[16],
    },
    categoryCard: {
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderColor: tokens_1.COLORS.neutral[200],
        borderWidth: 1,
        borderRadius: 12,
        padding: tokens_1.SPACING[20],
        width: "47%",
        minWidth: 130,
        flexGrow: 1,
        alignItems: "flex-start",
        ...react_native_1.Platform.select({
            web: {
                cursor: "pointer",
                transition: "transform 200ms ease-out, box-shadow 200ms ease-out",
            },
        }),
    },
    categoryCardActive: {
        borderColor: tokens_1.COLORS.brand[700],
        backgroundColor: "rgba(37, 99, 235, 0.02)",
    },
    iconBadge: {
        width: 44,
        height: 44,
        borderRadius: 10,
        borderWidth: 1,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: tokens_1.SPACING[12],
    },
    categoryCardTitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[800],
        marginBottom: 4,
    },
    categoryCardCount: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 12,
        color: tokens_1.COLORS.neutral[400],
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
    },
    detailsColumn: {
        flex: 1.8,
        backgroundColor: tokens_1.COLORS.neutral[50],
        position: "relative",
    },
    mobileDetailsColumn: {
        flex: 1,
    },
    mobileNavbar: {
        height: 50,
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderBottomWidth: 1,
        borderBottomColor: tokens_1.COLORS.neutral[200],
        justifyContent: "center",
        paddingHorizontal: tokens_1.SPACING[16],
    },
    mobileBackBtn: {
        flexDirection: "row",
        alignItems: "center",
    },
    mobileBackBtnText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        fontWeight: tokens_1.TYPOGRAPHY.weights.semibold,
        color: tokens_1.COLORS.neutral[800],
    },
    noticeAlert: {
        marginHorizontal: tokens_1.SPACING[24],
        marginTop: tokens_1.SPACING[24],
        backgroundColor: "#fef9c3", // Light yellow alert background
        borderColor: "#fef08a",
        borderWidth: 1,
        borderRadius: 8,
        padding: tokens_1.SPACING[16],
        flexDirection: "row",
    },
    noticeIcon: {
        marginRight: 10,
        marginTop: 2,
    },
    noticeText: {
        flex: 1,
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.brand[900],
        lineHeight: 18,
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
    },
    detailsContent: {
        padding: tokens_1.SPACING[24],
    },
    backLink: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: tokens_1.SPACING[16],
    },
    backLinkText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        fontWeight: tokens_1.TYPOGRAPHY.weights.semibold,
        color: tokens_1.COLORS.brand[700],
        marginLeft: 4,
    },
    detailsCard: {
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderColor: tokens_1.COLORS.neutral[200],
        borderWidth: 1,
        borderRadius: 12,
        padding: tokens_1.SPACING[24],
    },
    detailsTitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 22,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[900],
        marginBottom: tokens_1.SPACING[12],
        lineHeight: 28,
    },
    detailsDescription: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        color: tokens_1.COLORS.neutral[500],
        lineHeight: 22,
        marginBottom: tokens_1.SPACING[20],
    },
    panelDivider: {
        height: 1,
        backgroundColor: tokens_1.COLORS.neutral[200],
        marginVertical: tokens_1.SPACING[20],
    },
    sectionHeading: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[800],
        textTransform: "uppercase",
        marginBottom: tokens_1.SPACING[12],
        letterSpacing: 0.5,
    },
    requirementRow: {
        flexDirection: "row",
        alignItems: "flex-start",
        marginBottom: tokens_1.SPACING[12],
    },
    bulletDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: tokens_1.COLORS.brand[700],
        marginRight: 10,
        marginTop: 7,
    },
    requirementText: {
        flex: 1,
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        color: tokens_1.COLORS.neutral[700],
        lineHeight: 20,
    },
    metadataGrid: {
        flexDirection: "row",
        gap: tokens_1.SPACING[16],
        marginBottom: tokens_1.SPACING[24],
    },
    metaBox: {
        flex: 1,
        backgroundColor: tokens_1.COLORS.neutral[50],
        borderColor: tokens_1.COLORS.neutral[200],
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        alignItems: "center",
    },
    metaLabel: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 11,
        color: tokens_1.COLORS.neutral[400],
        fontWeight: tokens_1.TYPOGRAPHY.weights.semibold,
        textTransform: "uppercase",
        marginBottom: 2,
    },
    metaValue: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[800],
        textAlign: "center",
    },
    applyBtn: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: tokens_1.COLORS.brand[700],
        paddingVertical: 12,
        borderRadius: 8,
        ...react_native_1.Platform.select({
            web: {
                cursor: "pointer",
            },
        }),
    },
    applyBtnText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 15,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral.white,
    },
    subItemsWrapper: {
        flexDirection: "column",
    },
    subItemsTitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 20,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[900],
        marginBottom: tokens_1.SPACING[16],
    },
    serviceCardItem: {
        backgroundColor: tokens_1.COLORS.neutral.white,
        borderColor: tokens_1.COLORS.neutral[200],
        borderWidth: 1,
        borderRadius: 10,
        padding: tokens_1.SPACING[16],
        marginBottom: tokens_1.SPACING[12],
        ...react_native_1.Platform.select({
            web: {
                cursor: "pointer",
                transition: "box-shadow 150ms ease-out",
            },
        }),
    },
    serviceCardItemHeader: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
    },
    serviceCardItemTitle: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[800],
        flex: 1,
        marginRight: 10,
    },
    serviceCardItemDesc: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.neutral[400],
        lineHeight: 18,
        marginTop: 6,
    },
    serviceCardItemCategory: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 11,
        color: tokens_1.COLORS.neutral[400],
        fontWeight: tokens_1.TYPOGRAPHY.weights.medium,
        marginTop: 4,
    },
    searchResultsWrapper: {
        flexDirection: "column",
    },
    sectionLabel: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 12,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[500],
        textTransform: "uppercase",
        marginBottom: tokens_1.SPACING[12],
        letterSpacing: 0.5,
    },
    emptyStateContainer: {
        alignItems: "center",
        paddingVertical: tokens_1.SPACING[40],
    },
    emptyStateText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 14,
        color: tokens_1.COLORS.neutral[400],
    },
    emptyPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: tokens_1.SPACING[40],
        paddingHorizontal: tokens_1.SPACING[24],
        marginTop: tokens_1.SPACING[40],
    },
    placeholderIllustration: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: tokens_1.COLORS.neutral[100],
        justifyContent: "center",
        alignItems: "center",
        marginBottom: tokens_1.SPACING[16],
        position: "relative",
    },
    pointerOverlay: {
        position: "absolute",
        bottom: 12,
        right: 12,
    },
    placeholderTitleText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 16,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral[700],
        marginBottom: 6,
    },
    placeholderSubtitleText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        color: tokens_1.COLORS.neutral[400],
        textAlign: "center",
        lineHeight: 18,
        maxWidth: 280,
    },
    helpButton: {
        position: "absolute",
        right: tokens_1.SPACING[24],
        bottom: tokens_1.SPACING[24],
        backgroundColor: tokens_1.COLORS.brand[900],
        paddingHorizontal: 16,
        paddingVertical: tokens_1.SPACING[8],
        borderRadius: 20,
        ...react_native_1.Platform.select({
            web: {
                cursor: "pointer",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            },
        }),
    },
    helpButtonText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 12,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral.white,
    },
    footerBanner: {
        height: 48,
        backgroundColor: tokens_1.COLORS.brand[900],
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: tokens_1.SPACING[24],
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.15)",
    },
    footerText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 12,
        color: "rgba(255, 255, 255, 0.7)",
    },
    footerButtonText: {
        fontFamily: tokens_1.TYPOGRAPHY.fonts.primary,
        fontSize: 13,
        fontWeight: tokens_1.TYPOGRAPHY.weights.bold,
        color: tokens_1.COLORS.neutral.white,
    },
});
