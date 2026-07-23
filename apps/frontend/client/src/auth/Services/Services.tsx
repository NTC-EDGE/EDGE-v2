import { View, Text, TouchableOpacity } from "react-native";
import { Icon, ServiceFormModal } from "@edge/ui";
import { useServices, DraftApplication } from "./hooks/useServices";
import { ContentColumn } from "./components/ContentColumn";
import { DetailsColumn } from "./components/DetailsColumn";
import { DraftsModal } from "./components/DraftsModal";
import { ConfirmationDialog } from "../../shared/components/ConfirmationDialog";
import { styles } from "./Services.styles";

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
        {userProfile !== null && (
          <TouchableOpacity onPress={handleSignOut} style={styles.topLogoutBtn}>
            <Icon
              name="log-out"
              size={14}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            {!isMobile && <Text style={styles.topLogoutText}>Sign Out</Text>}
          </TouchableOpacity>
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
            borderLeftWidth: 0,
            borderRightWidth: 0,
          },
        ]}
      >
        <Icon name="info" size={16} color="#ca8a04" style={styles.noticeIcon} />
        <Text style={styles.noticeText}>
          Note: Applications are processed on weekdays, 8:00 AM–5:00 PM.
          Submissions outside these hours will be processed on the next business
          day.
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
                <Icon name="radio" size={20} color="#1d4ed8" />
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
                <Icon name="credit-card" size={20} color="#9ca3af" />
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
        title="Ongoing Application"
        message="You have an ongoing application. What would you like to do with your changes?"
        onClose={() => setConfirmModalVisible(false)}
        actions={[
          {
            text: "Save & Continue Later",
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
            text: "Discard Changes",
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
            text: "Cancel",
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
      />
    </View>
  );
}
