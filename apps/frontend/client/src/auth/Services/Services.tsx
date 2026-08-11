import { View, Text, TouchableOpacity, Modal, Image } from "react-native";
import { useState } from "react";
import { useUser } from "@clerk/expo";
import { Icon, ServiceFormModal } from "@edge/ui";
import { useServices, DraftApplication } from "./hooks/useServices";
import { ContentColumn } from "./components/ContentColumn";
import { DetailsColumn } from "./components/DetailsColumn";
import { DraftsModal } from "./components/DraftsModal";
import { ConfirmationDialog } from "../../shared/components/ConfirmationDialog";
import { styles } from "./Services.styles";

const ntcLogo = require("../../../assets/ntc-logo.png");

export type { DraftApplication };

export function Services() {
  const servicesState = useServices();
  const {
    isMobile,
    navigation,
    selectedService,
    isModalOpen,
    setIsModalOpen,
    submitting,
    activeWizardService,
    setActiveWizardService,
    backendCategories,
    setSelectedService,
    resetWizardState,
    confirmModalVisible,
    setConfirmModalVisible,
    pendingConfirmAction,
    drafts,
    viewingDraftsCategory,
    setViewingDraftsCategory,
    saveActiveAsDraft,
    loadDraft,
    hideSidebar,
    hideCategories,
    userProfile,
    handleSignOut,
    confirmSwitchService,
    handleFormSubmit,
  } = servicesState;

  const { user: clerkUser } = useUser();
  const [isLogoutConfirmVisible, setIsLogoutConfirmVisible] = useState(false);
  const [isProfileVisible, setIsProfileVisible] = useState(false);

  const handleSignOutPress = () => {
    setIsLogoutConfirmVisible(true);
  };

  const handleConfirmSignOut = async () => {
    setIsLogoutConfirmVisible(false);
    await handleSignOut();
  };

  return (
    <View style={styles.rootContainer}>
      {/* Top Banner / Brand Header */}
      <View style={styles.topHeader}>
        <View style={styles.logoWrapper}>
          <Image
            source={ntcLogo}
            style={{ width: 140, height: 36, marginRight: 6 }}
            resizeMode="contain"
          />
          <View style={{ flexDirection: "column" }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <View style={styles.goldBadgePill}>
                <Text style={styles.goldBadgeText}>PORTAL</Text>
              </View>
            </View>
            {!isMobile && (
              <Text style={styles.brandAgencySubtext}>
                National Telecommunications Commission · Republic of the Philippines
              </Text>
            )}
          </View>
        </View>
        {userProfile !== null && (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <TouchableOpacity
              onPress={() => setIsProfileVisible(true)}
              style={styles.profileAvatarBtn}
              activeOpacity={0.7}
            >
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>
                  {userProfile.name.charAt(0).toUpperCase()}
                </Text>
              </View>
              {!isMobile && (
                <Text style={{ color: "#ffffff", fontSize: 13, fontWeight: "600" }}>{userProfile.name}</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSignOutPress} style={styles.topLogoutBtn}>
              <Icon
                name="log-out"
                size={14}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              {!isMobile && <Text style={styles.topLogoutText}>Sign Out</Text>}
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Reminder Notice */}
      <View
        style={[
          styles.noticeAlert,
          {
            marginHorizontal: 0,
            marginTop: 0,
            borderRadius: 0,
            borderLeftWidth: 4,
            borderLeftColor: "#D97706",
            borderRightWidth: 0,
            borderTopWidth: 0,
          },
        ]}
      >
        <Icon name="info" size={16} color="#d97706" style={styles.noticeIcon} />
        <Text style={styles.noticeText}>
          <Text style={{ fontWeight: "700", color: "#0F2C59" }}>Official NTC Processing Hours: </Text>
          Applications are processed on business weekdays, 8:00 AM–5:00 PM PST.
          Submissions outside operating hours will be queued for the next business day.
        </Text>
      </View>

      {/* Main Body Area */}
      <View style={styles.mainLayout}>
        {/* Left Sidebar - hidden on mobile / smaller tablet screens during wizard */}
        {!hideSidebar && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarItems}>
              <TouchableOpacity
                style={[styles.sidebarItem, styles.sidebarItemActive]}
              >
                <Icon name="radio" size={20} color="#FFFFFF" />
                <Text style={styles.sidebarItemTextActive}>Services</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => {
                  confirmSwitchService(() =>
                    navigation.navigate("MyApplications"),
                  );
                }}
                style={styles.sidebarItem}
              >
                <Icon name="credit-card" size={20} color="#64748B" />
                <Text style={styles.sidebarItemText}>My Applications</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content Column (Category Grid OR Sub-items List / Bulk Drafts List) */}
        {!hideCategories && <ContentColumn servicesState={servicesState} />}

        {/* Details / Interactive Panel Column (Tablet / Web View) */}
        {(!isMobile ||
          activeWizardService !== null ||
          selectedService !== null) && (
          <DetailsColumn servicesState={servicesState} />
        )}
      </View>

      {/* Footer Banner */}
      <View style={styles.footerBanner}>
        <Text style={styles.footerText}>
          National Telecommunications Commission
        </Text>
        <TouchableOpacity onPress={handleSignOut} style={styles.footerDoneBtn}>
          <Text style={styles.footerButtonText}>I'm done!</Text>
        </TouchableOpacity>
      </View>

      {/* Application Form Modal */}
      {selectedService !== null && (
        <ServiceFormModal
          visible={isModalOpen}
          serviceTitle={selectedService.title}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleFormSubmit}
          isSubmitting={submitting}
        />
      )}

      {/* Navigation Confirm Modal */}
      <ConfirmationDialog
        visible={confirmModalVisible}
        title="Transaction in Progress"
        message="You currently have an active application transaction. Selecting another service or category is locked until you cancel or save your current transaction."
        onClose={() => setConfirmModalVisible(false)}
        actions={[
          {
            text: "Cancel Transaction & Discard",
            style: "destructive",
            onPress: () => {
              resetWizardState();
              setActiveWizardService(null);
              setSelectedService(null);
              setConfirmModalVisible(false);
              if (pendingConfirmAction) pendingConfirmAction();
            },
          },
          {
            text: "Save Draft & Exit",
            style: "default",
            onPress: () => {
              saveActiveAsDraft();
              resetWizardState();
              setActiveWizardService(null);
              setSelectedService(null);
              setConfirmModalVisible(false);
              if (pendingConfirmAction) pendingConfirmAction();
            },
          },
          {
            text: "Continue Application",
            style: "cancel",
            onPress: () => setConfirmModalVisible(false),
          },
        ]}
      />

      {/* Drafts List Modal */}
      <DraftsModal
        viewingDraftsCategory={viewingDraftsCategory}
        onClose={() => setViewingDraftsCategory(null)}
        drafts={drafts}
        loadDraft={loadDraft}
        backendCategories={backendCategories}
      />

      {/* View Profile Modal */}
      <Modal
        visible={isProfileVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsProfileVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.profileCard}>
            <View style={styles.profileAccentLine} />
            <View style={styles.profileHeader}>
              <View style={styles.profileIconContainer}>
                <Icon name="user" size={28} color="#2563EB" />
              </View>
              <Text style={styles.profileTitle}>User Profile</Text>
            </View>

            <View style={styles.profileDetails}>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Full Name</Text>
                <Text style={styles.profileDetailValue}>{userProfile?.name || "N/A"}</Text>
              </View>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Email Address</Text>
                <Text style={styles.profileDetailValue}>{userProfile?.email || "N/A"}</Text>
              </View>
              <View style={styles.profileDetailRow}>
                <Text style={styles.profileDetailLabel}>Clerk ID</Text>
                <Text style={styles.profileDetailValue} numberOfLines={1} ellipsizeMode="middle">{clerkUser?.id || "N/A"}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setIsProfileVisible(false)}
              style={styles.profileCloseButton}
            >
              <Text style={styles.profileCloseButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmationDialog
        visible={isLogoutConfirmVisible}
        title="Sign Out"
        message="Are you sure you want to sign out of your account?"
        iconName="log-out"
        onClose={() => setIsLogoutConfirmVisible(false)}
        actions={[
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setIsLogoutConfirmVisible(false),
          },
          {
            text: "Yes, Sign Out",
            style: "destructive",
            onPress: handleConfirmSignOut,
          },
        ]}
      />
    </View>
  );
}
