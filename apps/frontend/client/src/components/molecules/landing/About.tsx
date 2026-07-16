import { View, Text, StyleSheet } from "react-native";
import EdgeBlue from "@assets/svg/edgeBlue";

const AboutEdge = () => {
    return (
        <View style={styles.wrap}>
            {/* Left Content */}
            <View style={styles.left}>
                <Text style={styles.title}>About EDGE</Text>

                <Text style={styles.p}>
                    Welcome to the Electronic Data Governance and Evaluation (EDGE)
                    application. This system is a <Text style={styles.bold}>
                    flagship initiative by the National Telecommunications Commission (NTC)
                </Text>{" "}
                    to modernize and streamline public services.
                </Text>

                <Text style={styles.p}>
                    Our mission is to provide a <Text style={styles.bold}>transparent, efficient,
                    and accessible online platform</Text> for all stakeholders. EDGE is a secure
                    online platform developed to streamline application processing,
                    licensing, and public requests.
                </Text>

                <Text style={[styles.p, styles.bold]}>
                    This portal issues Certificates, Permits, Licenses, and manages
                    Complaints/Requests efficiently.
                </Text>
            </View>

            {/* Right Logo Card */}
            <View style={styles.right}>
                <View style={styles.logoCard}>
                    <View style={styles.logoBox}>
                       <EdgeBlue/>
                    </View>
                </View>
            </View>
        </View>
    );
};

export default AboutEdge;


const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        paddingVertical: "9%",
        paddingHorizontal: 40,
        flexWrap: "wrap",
        flex: 1,
        justifyContent: "center",
    },
    left: {
        width: "100%",
        maxWidth: 520,
    },
    title: {
        fontSize: 32,
        fontWeight: "800",
        color: "#29465B",
        marginBottom: 14,
        borderBottomWidth: 3,
        borderBottomColor: "#e7e7eb",
        paddingBottom: 6,
        alignSelf: "flex-start",
    },
    p: {
        fontSize: 16,
        lineHeight: 26,
        color: "#556273",
        marginBottom: 14,
    },
    bold: {
        fontWeight: "700",
        color: "#667281",
    },

    right: {
        marginTop: 20,
        width: "100%",
        justifyContent: "center",
        maxWidth: 640,
        alignItems: "center",
    },
    logoCard: {
        backgroundColor: "#ffffff",
        padding: 12,
       // borderRadius: 16,
       // shadowColor: "#000",
        //shadowOpacity: 0.08,
        //shadowRadius: 10,
        //shadowOffset: { width: 0, height: 4 },
        //elevation: 4,
    },
    logoBox: {
        //backgroundColor: BLUE,
        //borderRadius: 12,
        paddingVertical: 40,
        paddingHorizontal: 20,
        justifyContent: "center",
        width: 320,
        height: 240,
        alignItems: "center",
    },
    logoText: {
        color: "#ffffff",
        fontSize: 22,
        fontWeight: "800",
    },
});
