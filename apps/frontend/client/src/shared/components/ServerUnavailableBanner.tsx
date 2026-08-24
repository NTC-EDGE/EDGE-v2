import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Icon, COLORS, TYPOGRAPHY } from "@edge/ui";
import {
  getIsServerUnreachable,
  subscribeServerUnreachable,
  setServerUnreachable,
  apiClient,
} from "@edge/api";

export function ServerUnavailableBanner() {
  const [isOffline, setIsOffline] = useState(getIsServerUnreachable());
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeServerUnreachable((unreachable) => {
      setIsOffline(unreachable);
    });
    return unsubscribe;
  }, []);

  const handleTestConnection = async () => {
    try {
      setIsTesting(true);
      await apiClient.get("/api/v2/service-categories", { timeout: 4000 });
      setServerUnreachable(false);
      setIsOffline(false);
    } catch {
      setServerUnreachable(true);
      setIsOffline(true);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOffline) return null;

  return (
    <View
      style={{
        backgroundColor: "#FEF2F2",
        borderColor: "#FCA5A5",
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 8,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        shadowColor: "#EF4444",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
        elevation: 3,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center", gap: 10, flex: 1 }}>
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: "#FEE2E2",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Icon name="wifi-off" size={16} color="#DC2626" />
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 13,
              fontWeight: "700",
              color: "#991B1B",
            }}
          >
            Server Unavailable
          </Text>
          <Text
            style={{
              fontFamily: TYPOGRAPHY.fonts.primary,
              fontSize: 11,
              color: "#B91C1C",
              marginTop: 2,
            }}
          >
            Unable to connect to NTC EDGE Server. Automated requests are paused to save resources.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={handleTestConnection}
        disabled={isTesting}
        style={{
          backgroundColor: "#DC2626",
          paddingHorizontal: 12,
          paddingVertical: 6,
          borderRadius: 8,
          flexDirection: "row",
          alignItems: "center",
          gap: 6,
          marginLeft: 12,
        }}
      >
        {isTesting ? (
          <ActivityIndicator size="small" color="#FFFFFF" />
        ) : (
          <>
            <Icon name="refresh-cw" size={12} color="#FFFFFF" />
            <Text
              style={{
                fontFamily: TYPOGRAPHY.fonts.primary,
                fontSize: 12,
                fontWeight: "600",
                color: "#FFFFFF",
              }}
            >
              Retry
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
