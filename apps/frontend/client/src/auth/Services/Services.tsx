import { useState, useMemo } from "react";
import axios from "axios";
import {
  Text,
  View,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from "react-native";
import { Icon, ServiceFormModal } from "@edge/ui";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { useUser, useAuth } from "@clerk/expo";
import { apiClient } from "@edge/api";
import { servicesData, NTCService } from "./data/servicesData";
import { CategoryGrid } from "./components/CategoryGrid";
import { ServiceList } from "./components/ServiceList";
import { ServiceDetails } from "./components/ServiceDetails";
import { CPEAccreditationWizard, ApplicantData, initialApplicant, BulkApplicantsPanel } from "./accreditation/customer-premises";
import { RadioOperatorExamWizard, ExamApplicantData, initialExamApplicant, ExamBulkApplicantsPanel } from "./exams/radio-operator";
import { styles } from "./Services.styles";

type AuthParamList = {
  Services: undefined;
  MyApplications: undefined;
};

export function Services() {
  const { width } = useWindowDimensions();
  const isMobile = width < 640;
  const navigation = useNavigation();

  // Clerk Contexts
  const { user: clerkUser } = useUser();
  const { signOut, getToken } = useAuth();

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<NTCService | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeWizardService, setActiveWizardService] = useState<string | null>(null);
  const [isDetailsExpanded, setIsDetailsExpanded] = useState(false);

  // Shared Wizard States
  const [wizardStep, setWizardStep] = useState(1);
  const [selectedRegionId, setSelectedRegionId] = useState("");
  const [selectedOfficeId, setSelectedOfficeId] = useState("");
  const [appMode, setAppMode] = useState<"SINGLE" | "BULK">("BULK");
  const [bulkMethod, setBulkMethod] = useState<"MANUAL" | "EXCEL">("MANUAL");
  const [isFileUploaded, setIsFileUploaded] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [applicants, setApplicants] = useState<ApplicantData[]>([initialApplicant(1)]);
  const [currentApplicantIndex, setCurrentApplicantIndex] = useState(0);
  const [examWizardStep, setExamWizardStep] = useState(1);
  const [examApplicants, setExamApplicants] = useState<ExamApplicantData[]>([initialExamApplicant(1)]);
  const [currentExamApplicantIndex, setCurrentExamApplicantIndex] = useState(0);
  const [isBulkSubmitOpen, setIsBulkSubmitOpen] = useState(false);

  const resetWizardState = () => {
    setWizardStep(1);
    setExamWizardStep(1);
    setSelectedRegionId("");
    setSelectedOfficeId("");
    setAppMode("BULK");
    setBulkMethod("MANUAL");
    setIsFileUploaded(false);
    setUploadedFileName("");
    setApplicants([initialApplicant(1)]);
    setExamApplicants([initialExamApplicant(1)]);
    setCurrentApplicantIndex(0);
    setCurrentExamApplicantIndex(0);
    setIsBulkSubmitOpen(false);
  };

  const handleAddExamApplicant = () => {
    const nextId = examApplicants.length + 1;
    const newApp = initialExamApplicant(nextId);
    setExamApplicants((prev) => [...prev, newApp]);
    setCurrentExamApplicantIndex(examApplicants.length);
    setExamWizardStep(3);
  };

  const handleRemoveExamApplicant = (idx: number) => {
    setExamApplicants((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length === 0) {
        setCurrentExamApplicantIndex(0);
        return [initialExamApplicant(1)];
      }
      setCurrentExamApplicantIndex((prevIdx) => Math.max(0, Math.min(prevIdx, updated.length - 1)));
      return updated;
    });
  };

  const handleRemoveApplicant = (idx: number) => {
    setApplicants((prev) => {
      const updated = prev.filter((_, i) => i !== idx);
      if (updated.length === 0) {
        setCurrentApplicantIndex(0);
        return [initialApplicant(1)];
      }
      setCurrentApplicantIndex((prevIdx) => Math.max(0, Math.min(prevIdx, updated.length - 1)));
      return updated;
    });
  };

  // Check if we should display the left-side list view (standard grid or sub-items list)
  // On mobile, if a detail card or wizard is active, we hide the left main grid column
  const isLeftColumnHiddenOnMobile = isMobile && (selectedService !== null || activeWizardService !== null);

  // Hide navigation/categories if wizard is active on smaller screens
  const isWizardActive = activeWizardService !== null;
  const hideSidebar = isMobile || (isWizardActive && width < 1024);
  const hideCategories = (isWizardActive && isDetailsExpanded) || (isWizardActive && width < 1024) || isLeftColumnHiddenOnMobile;

  // User Profile Memo
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
    if (selectedService === null) return;
    setSubmitting(true);
    try {
      const token = await getToken();
      const headers = token !== null ? { Authorization: `Bearer ${token}` } : {};

      await apiClient.post(
        "/api/v2/applications",
        {
          title: selectedService.title,
          applicantName: formData.applicantName,
          email: formData.email,
          notes: formData.notes,
        },
        { headers }
      );
      setIsModalOpen(false);
      Alert.alert("Success", "Your application has been submitted successfully.");
    } catch (err: unknown) {
      console.error(err);
      let errMsg = "Failed to submit application.";
      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        if (responseData && typeof responseData === "object" && "message" in responseData) {
          errMsg = String(responseData.message);
        }
      } else if (err instanceof Error) {
        errMsg = err.message;
      }
      Alert.alert("Error", errMsg);
    } finally {
      setSubmitting(false);
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
        {userProfile !== null && (
          <TouchableOpacity onPress={handleSignOut} style={styles.topLogoutBtn}>
            <Icon name="log-out" size={14} color="#ffffff" style={{ marginRight: 6 }} />
            {!isMobile && <Text style={styles.topLogoutText}>Sign Out</Text>}
          </TouchableOpacity>
        )}
      </View>

      {/* Main Body Area */}
      <View style={styles.mainLayout}>
        {/* Left Sidebar - hidden on mobile / smaller tablet screens during wizard */}
        {!hideSidebar && (
          <View style={styles.sidebar}>
            <View style={styles.sidebarItems}>
              <TouchableOpacity style={[styles.sidebarItem, styles.sidebarItemActive]}>
                <Icon name="radio" size={20} color="#1d4ed8" />
                <Text style={styles.sidebarItemTextActive}>Services</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("MyApplications")} style={styles.sidebarItem}>
                <Icon name="credit-card" size={20} color="#9ca3af" />
                <Text style={styles.sidebarItemText}>My Applications</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Content Column (Category Grid OR Sub-items List / Bulk Drafts List) */}
        {!hideCategories && (
          <View style={[styles.contentColumn, isLeftColumnHiddenOnMobile && styles.hiddenColumn]}>
            {activeWizardService === "cpe-accreditation" && appMode === "BULK" && wizardStep >= 4 ? (
              <BulkApplicantsPanel
                applicants={applicants}
                currentApplicantIndex={currentApplicantIndex}
                onSelectApplicant={setCurrentApplicantIndex}
                setStep={setWizardStep}
                resetWizardState={resetWizardState}
                onRemoveApplicant={handleRemoveApplicant}
              />
            ) : activeWizardService === "radio-operator-exam" && appMode === "BULK" && examWizardStep >= 3 ? (
              <ExamBulkApplicantsPanel
                applicants={examApplicants}
                currentApplicantIndex={currentExamApplicantIndex}
                onSelectApplicant={setCurrentExamApplicantIndex}
                setStep={setExamWizardStep}
                resetWizardState={resetWizardState}
                onSubmitPress={() => setIsBulkSubmitOpen(true)}
                onRemoveApplicant={handleRemoveExamApplicant}
                bulkMethod={bulkMethod}
                onAddApplicant={handleAddExamApplicant}
              />
            ) : searchQuery.trim() !== "" ? (
              <ServiceList
                searchQuery={searchQuery}
                activeCategory={null}
                searchResults={searchResults}
                onServiceSelect={(service) => {
                  setSelectedService(service);
                  if (service.title.includes("Premises")) {
                    setActiveWizardService("cpe-accreditation");
                  } else if (service.title.includes("Radio Operator")) {
                    setActiveWizardService("radio-operator-exam");
                  }
                  if (isMobile) {
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
                onServiceSelect={(service) => {
                  setSelectedService(service);
                  if (service.title.includes("Premises")) {
                    setActiveWizardService("cpe-accreditation");
                  } else if (service.title.includes("Radio Operator")) {
                    setActiveWizardService("radio-operator-exam");
                  }
                }}
                onBack={handleBackToCategories}
                isMobile={isMobile}
              />
            ) : (
              <CategoryGrid
                user={userProfile}
                searchQuery={searchQuery}
                onSearchQueryChange={setSearchQuery}
                selectedCategoryId={selectedCategoryId}
                onCategorySelect={setSelectedCategoryId}
              />
            )}
          </View>
        )}

        {/* Details / Interactive Panel Column (Tablet / Web View) */}
        {/* On mobile, this column takes full screen if category or service is selected */}
        {(!isMobile || activeWizardService !== null || selectedService !== null) && (
          <View style={[styles.detailsColumn, (isMobile || (isWizardActive && width < 1024)) && styles.mobileDetailsColumn]}>

            {/* Interactive Panel Content */}
            <View style={{ flex: 1 }}>
              {activeWizardService === "cpe-accreditation" ? (
                <CPEAccreditationWizard
                  onClose={() => {
                    setActiveWizardService(null);
                    setIsDetailsExpanded(false);
                    setSelectedService(null);
                    resetWizardState();
                  }}
                  onSuccess={() => {
                    setActiveWizardService(null);
                    setIsDetailsExpanded(false);
                    setSelectedService(null);
                    resetWizardState();
                    navigation.navigate("MyApplications");
                  }}
                  isDetailsExpanded={isDetailsExpanded}
                  onToggleExpand={() => setIsDetailsExpanded((prev) => !prev)}
                  step={wizardStep}
                  setStep={setWizardStep}
                  selectedRegionId={selectedRegionId}
                  setSelectedRegionId={setSelectedRegionId}
                  selectedOfficeId={selectedOfficeId}
                  setSelectedOfficeId={setSelectedOfficeId}
                  appMode={appMode}
                  setAppMode={setAppMode}
                  bulkMethod={bulkMethod}
                  setBulkMethod={setBulkMethod}
                  isFileUploaded={isFileUploaded}
                  setIsFileUploaded={setIsFileUploaded}
                  uploadedFileName={uploadedFileName}
                  setUploadedFileName={setUploadedFileName}
                  applicants={applicants}
                  setApplicants={setApplicants}
                  currentApplicantIndex={currentApplicantIndex}
                  setCurrentApplicantIndex={setCurrentApplicantIndex}
                />
              ) : activeWizardService === "radio-operator-exam" ? (
                <RadioOperatorExamWizard
                  onClose={() => {
                    setActiveWizardService(null);
                    setIsDetailsExpanded(false);
                    setSelectedService(null);
                    resetWizardState();
                  }}
                  onSuccess={() => {
                    setActiveWizardService(null);
                    setIsDetailsExpanded(false);
                    setSelectedService(null);
                    resetWizardState();
                    navigation.navigate("MyApplications");
                  }}
                  isDetailsExpanded={isDetailsExpanded}
                  onToggleExpand={() => setIsDetailsExpanded((prev) => !prev)}
                  step={examWizardStep}
                  setStep={setExamWizardStep}
                  selectedRegionId={selectedRegionId}
                  setSelectedRegionId={setSelectedRegionId}
                  selectedOfficeId={selectedOfficeId}
                  setSelectedOfficeId={setSelectedOfficeId}
                  appMode={appMode}
                  setAppMode={setAppMode}
                  bulkMethod={bulkMethod}
                  setBulkMethod={setBulkMethod}
                  isFileUploaded={isFileUploaded}
                  setIsFileUploaded={setIsFileUploaded}
                  uploadedFileName={uploadedFileName}
                  setUploadedFileName={setUploadedFileName}
                  applicants={examApplicants}
                  setApplicants={setExamApplicants}
                  currentApplicantIndex={currentExamApplicantIndex}
                  setCurrentApplicantIndex={setCurrentExamApplicantIndex}
                  isBulkSubmitOpen={isBulkSubmitOpen}
                  setIsBulkSubmitOpen={setIsBulkSubmitOpen}
                />
              ) : selectedService !== null ? (
                <ServiceDetails
                  selectedService={selectedService}
                  onBackToServices={handleBackToServices}
                  onApplyPress={() => {
                    if (selectedService.title.includes("Premises")) {
                      setActiveWizardService("cpe-accreditation");
                    } else if (selectedService.title.includes("Radio Operator")) {
                      setActiveWizardService("radio-operator-exam");
                    } else {
                      setIsModalOpen(true);
                    }
                  }}
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
            {!isMobile && selectedService === null && activeWizardService === null && (
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
    </View>
  );
}
