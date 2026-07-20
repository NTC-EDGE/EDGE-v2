import { useState, useEffect, useMemo } from "react";
import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Icon } from "@edge/ui";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useUser, useAuth } from "@clerk/expo";
import { apiClient } from "@edge/api";
import { styles } from "./MyApplications.styles";

interface Application {
  id: string;
  title: string;
  applicantName: string;
  email: string;
  notes?: string;
  status: string;
  createdAt: string;
}

type AuthParamList = {
  Services: undefined;
  MyApplications: undefined;
};

export function MyApplications() {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation();

  // Clerk Contexts
  const { user: clerkUser } = useUser();
  const { signOut, getToken } = useAuth();

  // Layout/UI state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [selectedTab, setSelectedTab] = useState<"All" | "Single" | "Bulk">("All");

  // Selected details item
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);

  // Dynamic applications query
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  const userProfile = useMemo(() => {
    if (clerkUser !== null && clerkUser !== undefined) {
      return {
        name: clerkUser.fullName || clerkUser.primaryEmailAddress?.emailAddress?.split("@")[0] || "Client User",
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
      };
    }
    return null;
  }, [clerkUser]);

  const handleSignOut = async () => {
    await signOut();
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};

      const response = await apiClient.get<Application[]>("/api/applications", { headers });
      setApplications(response.data);
    } catch (err) {
      console.error("Error fetching applications:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  // Filtered applications
  const filteredApps = useMemo(() => {
    return applications.filter((app) => {
      // 1. Filter text
      const matchesSearch =
        app.title.toLowerCase().includes(filterText.toLowerCase()) ||
        app.applicantName.toLowerCase().includes(filterText.toLowerCase());

      if (!matchesSearch) return false;

      // 2. Tab selection
      if (selectedTab === "All") return true;
      // In this system, standard applications are "SINGLE", bulk are "BULK". Let's classify as Single or Bulk.
      // E.g., if notes/data specifies bulk, otherwise Single
      const isBulk = app.title.toLowerCase().includes("bulk") || (app.notes && app.notes.toLowerCase().includes("bulk"));
      if (selectedTab === "Single") return !isBulk;
      if (selectedTab === "Bulk") return !!isBulk;

      return true;
    });
  }, [applications, filterText, selectedTab]);

  const handleBackToGrid = () => {
    setSelectedApp(null);
  };

  const isLeftColumnHiddenOnMobile = isMobile && selectedApp !== null;

  return (
    <View style={styles.rootContainer}>
      {/* Top Banner Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoWrapper}>
          <View style={styles.circularLogo}>
            <Icon name="globe" size={16} color="#1e40af" />
          </View>
          <Text style={styles.brandTitle}>NTC EDGE</Text>
          <Text style={styles.brandSubtitle}>PORTAL</Text>
        </View>

        {userProfile !== null && (
          <TouchableOpacity onPress={handleSignOut} style={styles.topLogoutBtn}>
            <Icon name="log-out" size={14} color="#ffffff" style={{ marginRight: 6 }} />
            {!isMobile && <Text style={styles.topLogoutText}>Sign Out</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Main Body */}
      <View style={styles.mainLayout}>

        {/* Sidebar Navigation */}
        {!isMobile && (
          <View style={[styles.sidebar, isSidebarCollapsed && styles.sidebarCollapsed]}>
            <TouchableOpacity
              onPress={() => setIsSidebarCollapsed((prev) => !prev)}
              style={styles.collapseToggle}
            >
              <Icon name={isSidebarCollapsed ? "chevron-right" : "chevron-left"} size={16} color="#6b7280" />
            </TouchableOpacity>

            <View style={styles.sidebarItems}>
              <TouchableOpacity onPress={() => navigation.navigate('Services')} style={styles.sidebarItem}>
                <Icon name="radio" size={20} color="#9ca3af" />
                {!isSidebarCollapsed && <Text style={styles.sidebarItemText}>Services</Text>}
              </TouchableOpacity>

              <TouchableOpacity style={[styles.sidebarItem, styles.sidebarItemActive]}>
                <Icon name="credit-card" size={20} color="#1d4ed8" />
                {!isSidebarCollapsed && <Text style={styles.sidebarItemTextActive}>My Applications</Text>}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content Column */}
        <View style={[styles.contentColumn, isLeftColumnHiddenOnMobile && styles.hiddenColumn]}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* Filter Search */}
            <View style={styles.searchContainer}>
              <Icon name="search" size={16} color="#9ca3af" style={styles.searchIcon} />
              <TextInput
                placeholder="Type to filter..."
                placeholderTextColor="#9ca3af"
                value={filterText}
                onChangeText={setFilterText}
                style={styles.searchInput}
              />
              {filterText.length > 0 && (
                <TouchableOpacity onPress={() => setFilterText("")} style={styles.clearSearch}>
                  <Icon name="x" size={14} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            {/* Meta Row */}
            <View style={styles.metaSummaryRow}>
              <Text style={styles.summaryText}>
                <Text style={styles.boldSummaryText}>{filteredApps.length}</Text> item(s) found
              </Text>
              <TouchableOpacity onPress={fetchApplications} style={styles.refreshBtn}>
                <Text style={styles.refreshBtnText}>Refresh</Text>
              </TouchableOpacity>
            </View>

            {/* Filter tabs */}
            <View style={styles.filterTabsRow}>
              {(["All", "Single", "Bulk"] as const).map((tab) => (
                <TouchableOpacity
                  key={tab}
                  onPress={() => setSelectedTab(tab)}
                  style={[styles.tabBtn, selectedTab === tab && styles.tabBtnActive]}
                >
                  <Text style={[styles.tabText, selectedTab === tab && styles.tabTextActive]}>
                    {tab}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Applications List */}
            {loading ? (
              <ActivityIndicator size="large" color="#1d4ed8" style={{ marginTop: 24 }} />
            ) : filteredApps.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <Icon name="info" size={24} color="#9ca3af" style={{ marginBottom: 8 }} />
                <Text style={{ color: "#9ca3af", fontSize: 14 }}>No applications found.</Text>
              </View>
            ) : (
              filteredApps.map((app) => {
                const isSelected = selectedApp?.id === app.id;
                const isBulk = app.title.toLowerCase().includes("bulk") || (app.notes && app.notes.toLowerCase().includes("bulk"));
                const daysText = "Submitted recently";
                return (
                  <TouchableOpacity
                    key={app.id}
                    onPress={() => setSelectedApp(app)}
                    style={[styles.appCard, isSelected && styles.appCardActive]}
                  >
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle} numberOfLines={2}>{app.title}</Text>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>{isBulk ? "BULK" : "SINGLE"}</Text>
                      </View>
                    </View>
                    <Text style={styles.cardDetail}>{app.applicantName}</Text>
                    <Text style={styles.cardTime}>{daysText}</Text>
                  </TouchableOpacity>
                );
              })
            )}
          </ScrollView>
        </View>

        {/* Details Column */}
        {(!isMobile || selectedApp !== null) && (
          <View style={[styles.detailsColumn, isMobile && styles.mobileDetailsColumn]}>
            {isMobile && (
              <View style={styles.mobileNavbar}>
                <TouchableOpacity onPress={handleBackToGrid} style={styles.mobileBackBtn}>
                  <Icon name="arrow-left" size={18} color="#1f2937" style={{ marginRight: 6 }} />
                  <Text style={styles.mobileBackBtnText}>Back to Applications</Text>
                </TouchableOpacity>
              </View>
            )}

            <ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
              {selectedApp !== null ? (
                <View style={styles.detailsCard}>
                  {!isMobile && (
                    <TouchableOpacity onPress={handleBackToGrid} style={styles.backLink}>
                      <Icon name="chevron-left" size={14} color="#1d4ed8" />
                      <Text style={styles.backLinkText}>Clear Details Selection</Text>
                    </TouchableOpacity>
                  )}

                  <Text style={styles.detailsTitle}>{selectedApp.title}</Text>

                  <View style={styles.panelDivider} />

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Application ID</Text>
                    <Text style={styles.infoValue}>{selectedApp.id}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Applicant Name</Text>
                    <Text style={styles.infoValue}>{selectedApp.applicantName}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Email Address</Text>
                    <Text style={styles.infoValue}>{selectedApp.email}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Date Submitted</Text>
                    <Text style={styles.infoValue}>
                      {new Date(selectedApp.createdAt).toLocaleDateString()} {new Date(selectedApp.createdAt).toLocaleTimeString()}
                    </Text>
                  </View>

                  <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Status</Text>
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{selectedApp.status}</Text>
                    </View>
                  </View>

                  {selectedApp.notes ? (
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Additional Notes</Text>
                      <Text style={styles.infoValue}>{selectedApp.notes}</Text>
                    </View>
                  ) : null}
                </View>
              ) : (
                !isMobile && (
                  <View style={styles.emptyPlaceholder}>
                    <View style={styles.placeholderIllustration}>
                      <Icon name="file" size={48} color="#d1d5db" />
                      <Icon name="mouse-pointer" size={24} color="#1d4ed8" style={styles.pointerOverlay} />
                    </View>
                    <Text style={styles.placeholderTitleText}>No application selected</Text>
                    <Text style={styles.placeholderSubtitleText}>
                      Select an application card from the list on the left to view detailed status logs and information.
                    </Text>
                  </View>
                )
              )}
            </ScrollView>
          </View>
        )}
      </View>

      {/* Footer Banner */}
      <View style={styles.footerBanner}>
        <Text style={styles.footerText}>National Telecommunications Commission</Text>
        <Text style={styles.footerButtonText}>I'm done!</Text>
      </View>
    </View>
  );
}
