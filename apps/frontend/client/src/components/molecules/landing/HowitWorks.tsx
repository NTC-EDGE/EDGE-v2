import React from "react";
import { Dimensions, StyleSheet, Text, View } from "react-native";
import { MotiView } from "moti";
import { ArrowRight } from "lucide-react-native";

type Step = { n: number; title: string; body: string };

const HowItWorks = ({ steps }: { steps: Step[] }) => {
    if (steps.length < 5) return null;

    const [s1, s2, s3, s4, s5] = steps;

    return (
        <View style={[styles.section, { backgroundColor: "#F8FAFC" }]}>
            <View style={[styles.sectionInner, { flexDirection: "column" }]}>
                <Text style={[styles.h2, { textAlign: "center", marginBottom: 32 }]}>
                    How It Works
                </Text>

                {/* TOP ROW: 1 → 2 → 3 */}
                <View style={styles.row}>
                    <StepCard step={s1} delay={s1.n * 120} />

                    <View style={styles.hiwArrow}>
                        <ArrowRight size={22} color={BLUE} />
                    </View>

                    <StepCard step={s2} delay={s2.n * 120} />

                    {/* simple arrow between 2 and 3 */}
                    <View style={styles.hiwArrow}>
                        <ArrowRight size={22} color={BLUE} />
                    </View>

                    <StepCard step={s3} delay={s3.n * 120} />
                </View>

                {/* down arrow from 2 → 4 */}
                <View style={styles.downArrowWrap}>
                    <ArrowRight
                        size={22}
                        color={BLUE}
                        style={{ transform: [{ rotate: "90deg" }] }}
                    />
                </View>

                {/* BOTTOM ROW: 4 → 5 */}
                <View style={styles.row}>
                    <StepCard step={s4} delay={s4.n * 120} />

                    <View style={styles.hiwArrow}>
                        <ArrowRight size={22} color={BLUE} />
                    </View>

                    <StepCard step={s5} delay={s5.n * 120} />
                </View>
            </View>
        </View>
    );
};

const StepCard = ({ step, delay }: { step: Step; delay: number }) => (
    <MotiView
        from={{ opacity: 0, translateY: 8 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: "timing", duration: 260, delay }}
        style={styles.hiwCard}
    >
        <View style={styles.hiwCircle}>
            <Text style={styles.hiwCircleText}>{step.n}</Text>
        </View>
        <Text style={styles.hiwTitle}>{step.title}</Text>
        <Text style={styles.hiwDesc}>{step.body}</Text>
    </MotiView>
);

const BLUE = "#003366";
const TEXT = "#29465B";
const { width } = Dimensions.get("window");

const styles = StyleSheet.create({
    section: { paddingVertical: "6%" },
    sectionInner: {
        maxWidth: 1200,
        width: "100%",
        alignSelf: "center",
        paddingHorizontal: 16,
    },
    h2: { fontSize: 28, fontWeight: "900", color: TEXT },

    row: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 32,
        gap: 16,
    },

    hiwCard: {
        width: Math.min(260, (width - 64) / 3),
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 18,
        paddingHorizontal: 12,
        borderWidth: 1,
        borderColor: "#E2E8F0",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 5,
        elevation: 2,
    },
    hiwCircle: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: BLUE,
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 10,
    },
    hiwCircleText: {
        color: "#fff",
        fontSize: 20,
        fontWeight: "800",
    },
    hiwTitle: {
        fontSize: 16,
        fontWeight: "700",
        textAlign: "center",
        color: TEXT,
        marginBottom: 6,
    },
    hiwDesc: {
        fontSize: 13,
        textAlign: "center",
        color: "#475569",
        lineHeight: 18,
    },

    arrowSquare: {
        width: 44,
        height: 44,
        borderRadius: 8,
        backgroundColor: "#E5F0FF",
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 12,
    },
    hiwArrow: {
        justifyContent: "center",
        alignItems: "center",
        marginHorizontal: 12,
    },
    downArrowWrap: {
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 24,
    },
});

export default HowItWorks;
