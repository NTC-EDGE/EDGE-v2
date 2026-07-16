import { StyleSheet } from 'react-native';
export default StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: 24,
    },
    title: {
        fontSize: 28,
        fontWeight: "700",
        color: "#111827",
    },
    subtitle: {
        fontSize: 14,
        color: "#6B7280",
    },

    /* Cards */
    card: {
        backgroundColor: "#fff",
        borderRadius: 14,
        paddingHorizontal: 24,
        paddingVertical: 22,
        marginBottom: 18,
        shadowColor: "#000",
        shadowOpacity: 0.04,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    cardHeaderRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
    },
    cardTitle: {
        fontSize: 17,
        fontWeight: "700",
        color: "#111827",
    },
    cardDesc: {
        fontSize: 14,
        color: "#6B7280",
        marginBottom: 14,
        lineHeight: 20,
    },

    /* Links + Lists */
    linkText: {
        fontSize: 14,
        color: "#2563EB",
        fontWeight: "600",
    },
    sectionLabel: {
        fontSize: 15,
        fontWeight: "600",
        marginBottom: 8,
    },
    listContainer: { gap: 6 },
    bullet: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
    },

    /* Contact section */
    email: {
        fontSize: 15,
        color: "#2563EB",
        fontWeight: "600",
        marginBottom: 16,
    },
    responseBox: {
        backgroundColor: "#E8F1FF",
        padding: 14,
        borderRadius: 10,
    },
    responseTitle: {
        fontSize: 14,
        fontWeight: "600",
        color: "#1D4ED8",
        marginBottom: 3,
    },
    responseText: {
        fontSize: 13,
        color: "#1E3A8A",
        lineHeight: 18,
    },

    /* Footer */
    footerLabel: {
        fontSize: 13,
        fontWeight: "600",
        color: "#6B7280",
        marginBottom: 4,
    },
    footerText: {
        fontSize: 12,
        color: "#9CA3AF",
    },
});
