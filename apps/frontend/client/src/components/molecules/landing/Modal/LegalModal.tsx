import React from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  ScrollView,
} from "react-native";
import { X } from "lucide-react-native";
import Text from "@atoms/text"
type LegalModalProps = {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
};

const LegalModal: React.FC<LegalModalProps> = ({
  visible,
  title,
  onClose,
  children,
}) => {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose}>
              <X size={24} color="#555" />
            </Pressable>
          </View>

          <View style={styles.divider} />

          {/* Scrollable content */}
          <ScrollView
            style={{ flexGrow: 0 }}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContainer: {
    width: "90%",
    maxHeight: "80%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    elevation: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: "#003366",
  },
  divider: {
    height: 1,
    backgroundColor: "#e0e0e0",
    marginVertical: 15,
  },
});

export default LegalModal;
