import React, {
    FC,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from "react";
import { Modal, View, Text, StyleSheet } from "react-native";
import { MotiView } from "moti";
import { MotiPressable } from "moti/interactions";
import { BlurView } from "expo-blur";
import {
    X,
    Send,
    CheckCircle2,
    Mail,
    Phone,
    Building2,
} from "lucide-react-native";

import { InputField } from "@molecules/form-fields";
import { RootStateOrAny, useSelector } from "react-redux";

type Props = {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

const EMAIL_REGEX = /\S+@\S+\.\S+/;

const SubmitConfirmModalComponent: FC<Props> = ({
                                                    visible,
                                                    onCancel,
                                                    onConfirm,
                                                }) => {
    const session = useSelector(
        (state: RootStateOrAny) => state.user?.session
    );

    const initialCompanyName = session?.applicant?.companyName ?? "";
    const initialEmail = session?.email ?? "";
    const initialPhone = session?.contactNumber ?? "";

    const [mode, setMode] = useState<"confirm" | "success">("confirm");
    const [companyName, setCompanyName] = useState(initialCompanyName);
    const [email, setEmail] = useState(initialEmail);
    const [phone, setPhone] = useState(initialPhone);

    const [companyError, setCompanyError] = useState<string | undefined>();
    const [emailError, setEmailError] = useState<string | undefined>();
    const [phoneError, setPhoneError] = useState<string | undefined>();

    // Reset form when modal is (re)opened
    useEffect(() => {
        if (visible) {
            setMode("confirm");
            setCompanyName(initialCompanyName);
            setEmail(initialEmail);
            setPhone(initialPhone);
            setCompanyError(undefined);
            setEmailError(undefined);
            setPhoneError(undefined);
        }
    }, [visible, initialCompanyName, initialEmail, initialPhone]);

    const canSubmit = useMemo(
        () =>
            !!companyName?.trim() &&
            !!email?.trim() &&
            !!phone?.trim(),
        [companyName, email, phone]
    );

    const handleConfirm = useCallback(() => {
        let hasError = false;

        // Company
        if (!companyName.trim()) {
            setCompanyError("Company Name is required.");
            hasError = true;
        } else {
            setCompanyError(undefined);
        }

        // Email
        const trimmedEmail = email.trim();
        if (!trimmedEmail) {
            setEmailError("Email Address is required.");
            hasError = true;
        } else if (!EMAIL_REGEX.test(trimmedEmail)) {
            setEmailError("Please enter a valid email address.");
            hasError = true;
        } else {
            setEmailError(undefined);
        }

        // Phone
        if (!phone.trim()) {
            setPhoneError("Phone Number is required.");
            hasError = true;
        } else {
            setPhoneError(undefined);
        }

        if (hasError) return;

        setMode("success");
        onConfirm();
    }, [companyName, email, phone, onConfirm]);

    if (!visible) return null;

    return (
        <Modal transparent visible={visible} animationType="none">
            <View style={StyleSheet.absoluteFill}>
                {/* BLUR + DIM OVERLAY */}
                <MotiView
                    style={styles.overlay}
                    from={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ type: "timing", duration: 220 }}
                >
                    <BlurView
                        style={StyleSheet.absoluteFill}
                        blurType="light"
                        blurAmount={18}
                        reducedTransparencyFallbackColor="rgba(0,0,0,0.35)"
                    />

                    {/* CARD – SLIDE FROM BOTTOM */}
                    <MotiView
                        from={{ opacity: 0, translateY: 80 }}
                        animate={{ opacity: 1, translateY: 0 }}
                        exit={{ opacity: 0, translateY: 60 }}
                        transition={{
                            type: "spring",
                            damping: 18,
                            stiffness: 220,
                        }}
                        style={styles.card}
                    >
                        {mode === "confirm" ? (
                            <>
                                <Text style={styles.title}>Submit applications?</Text>
                                <Text style={styles.subtitle}>
                                    Please review all details before proceeding. After
                                    submission, changes may no longer be allowed.
                                </Text>

                                <InputField
                                    label="Company Name"
                                    placeholder="Enter your Company Name."
                                    value={companyName}
                                    required
                                    hasValidation
                                    error={companyError}
                                    icon={<Building2 size={18} color="#6B7280" />}
                                    onChangeText={(value: string) => {
                                        setCompanyName(value);
                                        if (companyError) setCompanyError(undefined);
                                    }}
                                />

                                <InputField
                                    label="Email Address"
                                    placeholder="Enter your Email Address."
                                    value={email}
                                    required
                                    hasValidation
                                    error={emailError}
                                    icon={<Mail size={18} color="#6B7280" />}
                                    iconPosition="left"
                                    description={"We'll send the updates to this address."}
                                    onChangeText={(value: string) => {
                                        setEmail(value);
                                        if (emailError) setEmailError(undefined);
                                    }}
                                />

                                <InputField
                                    label="Phone Number"
                                    placeholder="Enter your Phone Number."
                                    value={phone}
                                    required
                                    hasValidation
                                    error={phoneError}
                                    icon={<Phone size={18} color="#9CA3AF" />}
                                    onChangeText={(value: string) => {
                                        setPhone(value);
                                        if (phoneError) setPhoneError(undefined);
                                    }}
                                />

                                <View style={styles.divider} />

                                <View style={styles.actions}>
                                    {/* CANCEL */}
                                    <MotiPressable
                                        onPress={onCancel}
                                        style={[styles.btn, styles.btnCancel]}
                                        animate={({ pressed }) => ({
                                            scale: pressed ? 0.97 : 1,
                                            opacity: pressed ? 0.75 : 1,
                                        })}
                                    >
                                        <View style={styles.btnContent}>
                                            <X size={16} color="#4B5563" />
                                            <Text style={styles.cancelText}>Cancel</Text>
                                        </View>
                                    </MotiPressable>

                                    {/* SUBMIT */}
                                    <MotiPressable
                                        onPress={handleConfirm}
                                        disabled={!canSubmit}
                                        style={[
                                            styles.btn,
                                            styles.btnConfirm,
                                            !canSubmit && { opacity: 0.5 },
                                        ]}
                                        animate={({ pressed }) => ({
                                            scale: pressed ? 0.97 : 1,
                                            opacity: pressed ? 0.85 : 1,
                                        })}
                                    >
                                        <View style={styles.btnContent}>
                                            <Send size={16} color="#FFFFFF" />
                                            <Text style={styles.confirmText}>Submit</Text>
                                        </View>
                                    </MotiPressable>
                                </View>
                            </>
                        ) : (
                            // SUCCESS STATE
                            <View style={styles.successContainer}>
                                {/* soft pulse halo */}
                                <MotiView
                                    style={styles.successHalo}
                                    from={{ opacity: 0, scale: 0.6 }}
                                    animate={{ opacity: 0.12, scale: 1.7 }}
                                    transition={{ type: "timing", duration: 600 }}
                                />
                                <MotiView
                                    from={{ scale: 0.6, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{
                                        type: "spring",
                                        damping: 12,
                                        stiffness: 260,
                                    }}
                                >
                                    <CheckCircle2 size={56} color="#16A34A" />
                                </MotiView>

                                <Text style={styles.successTitle}>
                                    Applications submitted
                                </Text>
                                <Text style={styles.successSubtitle}>
                                    Your applications have been queued for processing.
                                </Text>

                                <MotiPressable
                                    onPress={onCancel}
                                    style={[styles.btn, styles.successBtn]}
                                    animate={({ pressed }) => ({
                                        scale: pressed ? 0.97 : 1,
                                        opacity: pressed ? 0.85 : 1,
                                    })}
                                >
                                    <View style={styles.btnContent}>
                                        <Text style={styles.successBtnText}>Close</Text>
                                    </View>
                                </MotiPressable>
                            </View>
                        )}
                    </MotiView>
                </MotiView>
            </View>
        </Modal>
    );
};

export default React.memo(SubmitConfirmModalComponent);

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    card: {
        width: "88%",
        maxWidth: 480,
        backgroundColor: "rgba(255,255,255,0.96)",
        borderRadius: 20,
        paddingVertical: 24,
        paddingHorizontal: 22,
        elevation: 12,
        shadowColor: "#000",
        shadowOpacity: 0.18,
        shadowOffset: { width: 0, height: 8 },
        shadowRadius: 18,
    },
    title: {
        fontSize: 18,
        fontWeight: "600",
        marginBottom: 6,
        color: "#111827",
    },
    subtitle: {
        fontSize: 13,
        color: "#6B7280",
        marginBottom: 20,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E5E7EB",
        marginBottom: 16,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "flex-end",
        gap: 12,
    },
    btn: {
        minWidth: 110,
        height: 42,
        borderRadius: 999,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 16,
    },
    btnCancel: {
        backgroundColor: "#F3F4F6",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    btnConfirm: {
        backgroundColor: "#4F46E5",
    },
    btnContent: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
    },
    cancelText: {
        color: "#4B5563",
        fontSize: 14,
        fontWeight: "500",
    },
    confirmText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "600",
    },

    // success state
    successContainer: {
        alignItems: "center",
    },
    successHalo: {
        position: "absolute",
        top: 32,
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: "#16A34A",
    },
    successTitle: {
        marginTop: 16,
        fontSize: 18,
        fontWeight: "600",
        color: "#111827",
        textAlign: "center",
    },
    successSubtitle: {
        marginTop: 6,
        fontSize: 13,
        color: "#6B7280",
        textAlign: "center",
        marginBottom: 18,
    },
    successBtn: {
        backgroundColor: "#111827",
        marginTop: 6,
        paddingHorizontal: 24,
    },
    successBtnText: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "500",
    },
});
