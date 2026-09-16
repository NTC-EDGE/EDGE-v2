import { View } from "react-native";
import { ServiceFormModal } from "@edge/ui";
import { useServices, DraftApplication } from "./hooks/useServices";
import { ContentColumn } from "./components/ContentColumn";
import { DetailsColumn } from "./components/DetailsColumn";
import { DraftsModal } from "./components/DraftsModal";
import { ConfirmationDialog } from "../../shared/components/ConfirmationDialog";
import { ClientAppLayout } from "../../shared/components/ClientAppLayout";
import { styles } from "./Services.styles";

export type { DraftApplication };

export function Services() {
  const servicesState = useServices();
  const {
    isMobile,
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
    deleteDraft,
    isSavingDraft,
    draftErrorMessage,
    setDraftErrorMessage,
    loadDraft,
    hideSidebar,
    hideCategories,
    confirmSwitchService,
    handleFormSubmit,
    requestAccessModalVisible,
    setRequestAccessModalVisible,
    handleRequestAccess,
  } = servicesState;

  return (
    <ClientAppLayout
      activeTab="services"
      hideSidebar={hideSidebar}
      onBeforeNavigate={(_targetTab, proceed) => {
        confirmSwitchService(proceed);
      }}
    >
      <View style={styles.mainLayout}>
        {/* Content Column (Category Grid OR Sub-items List / Bulk Drafts List) */}
        {!hideCategories && <ContentColumn servicesState={servicesState} />}

        {/* Details / Interactive Panel Column (Tablet / Web View) */}
        {(!isMobile ||
          activeWizardService !== null ||
          selectedService !== null) && (
          <DetailsColumn servicesState={servicesState} />
        )}
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

      {/* Internal Account Request Access Modal */}
      <ConfirmationDialog
        visible={requestAccessModalVisible}
        title="Request Application Access"
        message="Your internal staff account currently does not have permission to create or submit citizen service applications. Would you like to submit an access request to your tenant administrator for application submission privileges (applications.submit)?"
        hint="Once your administrator grants submission permission to your internal role, you will be able to apply and file applications."
        iconName="alert-circle"
        onClose={() => setRequestAccessModalVisible(false)}
        actions={[
          {
            text: "Submit Access Request",
            style: "default",
            iconName: "send",
            onPress: handleRequestAccess,
          },
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => setRequestAccessModalVisible(false),
          },
        ]}
      />

      {/* Navigation Confirm Modal */}
      <ConfirmationDialog
        visible={confirmModalVisible}
        title="Transaction in Progress"
        message="You currently have an active application in progress. Selecting another service or navigating away requires saving or discarding your current work."
        hint="You can save your current progress as a draft even if not fully completed, and resume anytime."
        errorMessage={draftErrorMessage}
        onClose={() => {
          if (!isSavingDraft) {
            setConfirmModalVisible(false);
            setDraftErrorMessage(null);
          }
        }}
        actions={[
          {
            text: isSavingDraft ? "Saving Draft..." : "Save Draft & Exit",
            style: "default",
            loading: isSavingDraft,
            disabled: isSavingDraft,
            iconName: "save",
            onPress: async () => {
              setDraftErrorMessage(null);
              const success = await saveActiveAsDraft();
              if (success) {
                setConfirmModalVisible(false);
                setDraftErrorMessage(null);
                resetWizardState();
                setActiveWizardService(null);
                setSelectedService(null);
                if (pendingConfirmAction) pendingConfirmAction();
              }
            },
          },
          {
            text: "Discard & Exit",
            style: "destructive",
            disabled: isSavingDraft,
            iconName: "trash-2",
            onPress: () => {
              setDraftErrorMessage(null);
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
            disabled: isSavingDraft,
            onPress: () => {
              setDraftErrorMessage(null);
              setConfirmModalVisible(false);
            },
          },
        ]}
      />

      {/* Drafts List Modal */}
      <DraftsModal
        viewingDraftsCategory={viewingDraftsCategory}
        onClose={() => setViewingDraftsCategory(null)}
        drafts={drafts}
        loadDraft={loadDraft}
        deleteDraft={deleteDraft}
        backendCategories={backendCategories}
      />
    </ClientAppLayout>
  );
}
