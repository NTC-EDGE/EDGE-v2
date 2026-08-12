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
    loadDraft,
    hideSidebar,
    hideCategories,
    confirmSwitchService,
    handleFormSubmit,
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
    </ClientAppLayout>
  );
}
