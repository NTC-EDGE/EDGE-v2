import {View, Text, StyleSheet, Platform} from "react-native";
import LandingButton from "@molecules/landing/LandingButton";
import {FilePlus, Search} from "lucide-react-native";
import {MotiView} from "moti";
import React from "react";
import {RFValue} from "react-native-responsive-fontsize";
const styles = StyleSheet.create({
    heroWrap: {
        paddingVertical: "13%",
        paddingHorizontal: 16,
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
    },

    heroGlow: { position: "absolute", left: -20, top: 0, width: 220, height: 220, borderRadius: 110, opacity: 0.4 },
    heroInner: {
        width: "100%",
        maxWidth: 800,
        alignItems: "center",
        justifyContent: "center",
    },
    heroTitle: {
        fontSize: RFValue(29),
        fontWeight: "800",
        color: "#003366",
        textAlign: "center",
        marginBottom: 12,
    },

    heroSubtitle: {
        fontSize: RFValue(8),
        color: "#444",
        textAlign: "center",
        maxWidth: 500,
        marginBottom: 24,
    },
    heroActions: {
        flexDirection: "row",
        flexWrap: "wrap", // ⭐ important for mobile
        justifyContent: "center",
        alignItems: "center",
        marginTop: 8,
    },

    circleGlow: {
        position: "absolute",
        borderRadius: 500,
        opacity: 1,
        filter: Platform.OS === "web" ? "blur(60px)" : undefined,
    },
})
const HeroCircles = () => (
    <>
        {/* Blue glow (top-left) */}
        <MotiView
            from={{ translateX: -25, translateY: -10 }}
            animate={{ translateX: 25, translateY: 10 }}
            transition={{ loop: true, duration: 880, type: "timing" }}
            style={[
                styles.circleGlow,
                {
                    backgroundColor: "rgba(0,51,102,0.22)", // NTC Blue glow
                    top: 0,
                    left: 0,
                    width: 480,
                    height: 480,
                },
            ]}
        />

        {/* Red glow (bottom-right) */}
        <MotiView
            from={{ translateX: 20, translateY: 20 }}
            animate={{ translateX: -20, translateY: -20 }}
            transition={{ loop: true, duration: 840, type: "timing" }}
            style={[
                styles.circleGlow,
                {
                    backgroundColor: "rgba(228,0,43,0.22)", // NTC Red glow
                    bottom: -40,
                    right: -20,
                    width: 480,
                    height: 480,
                },
            ]}
        />
    </>
);


function Hero(props: { onPress: () => void, onPress1: () => void }) {
    return <View style={styles.heroWrap}>

        {/* background circles */}
        <HeroCircles/>

        {/* main content */}
        <View style={styles.heroInner}>
            <Text style={styles.heroTitle}>
                Empowering NTC’s Data Governance
            </Text>

            <Text style={styles.heroSubtitle}>
                Streamline NTC services and applications with{" "}
                <Text style={{fontWeight: "800"}}>EDGE</Text>.
            </Text>

            <View style={styles.heroActions}>

                <LandingButton
                    Icon={FilePlus}
                    label={"Get Started"}
                    onPress={props.onPress}
                />

                {/* spacing between buttons */}
                <View style={{width: 16, height: 16}}/>

                <LandingButton
                    Icon={Search}
                    label={"Track Application"}
                    onPress={props.onPress1}
                />

            </View>
        </View>

    </View>;
}
export default Hero
