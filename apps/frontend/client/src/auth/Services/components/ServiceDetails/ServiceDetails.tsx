import {
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Icon } from "@edge/ui";
import { NTCService } from "../../data/servicesData";
import { styles } from "./ServiceDetails.styles";

interface ServiceDetailsProps {
  selectedService: NTCService;
  onBackToServices: () => void;
  onApplyPress: () => void;
  isMobile: boolean;
}

export function ServiceDetails({
  selectedService,
  onBackToServices,
  onApplyPress,
  isMobile,
}: ServiceDetailsProps) {
  return (
    <View style={{ flex: 1 }}>
      {/* Mobile Navbar Back Button Header */}
      {isMobile && (
        <View style={styles.mobileNavbar}>
          <TouchableOpacity onPress={onBackToServices} style={styles.mobileBackBtn}>
            <Icon name="arrow-left" size={18} color="#1f2937" style={{ marginRight: 6 }} />
            <Text style={styles.mobileBackBtnText}>Back to Services</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.detailsContent} showsVerticalScrollIndicator={false}>
        <View style={styles.detailsCard}>
          {/* Back button (Web only) */}
          {!isMobile && (
            <TouchableOpacity onPress={onBackToServices} style={styles.backLink}>
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
            onPress={onApplyPress}
            style={styles.applyBtn}
          >
            <Text style={styles.applyBtnText}>Apply Now</Text>
            <Icon name="external-link" size={14} color="#ffffff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
