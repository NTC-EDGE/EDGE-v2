import React from "react";
import { View, Text } from "react-native";
import { MotiView } from "moti";
import { Info } from "lucide-react-native";
import {RFValue} from "react-native-responsive-fontsize";

export default function FloatingNote() {
    return (
        <MotiView
            from={{ opacity: 0, translateY: -20 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{
                type: "timing",
                duration: 500,
            }}
            style={{
                position: "absolute",
                bottom: 20,
                left: 20,
                right: 20,
                backgroundColor: "#fff8dc",
                borderColor: "#e6e2d3",
                borderWidth: 2,
                borderRadius: 12,
                padding: 20,
                flexDirection: "row",
                alignItems: "center",
                shadowColor: "#000",
                shadowOpacity: 0.15,
                shadowOffset: { width: 0, height: 3 },
                shadowRadius: 6,
                elevation: 5,
                zIndex: 999,
            }}
        >
            <Info color="#333" size={(24)} style={{ marginRight: 10 }} />
            <Text style={{ fontSize: (14) }}>
                <Text style={{ fontWeight: "bold" }}>Note:</Text>
                {" "}
                Applications are processed on weekdays, 8:00 AM–5:00 PM. Submissions outside these hours will be processed on the next business day.
            </Text>
        </MotiView>
    );
}
