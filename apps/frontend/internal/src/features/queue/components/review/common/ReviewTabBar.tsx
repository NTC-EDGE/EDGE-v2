import React, { useRef, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Pressable,
  Platform,
} from "react-native";
import {
  COLORS,
  RADIUS,
  SPACING,
  TYPOGRAPHY,
  Icon as Lucide,
  useTheme,
} from "@edge/ui";

export type InnerTab = "details" | "applicant-record" | "soa";

export interface ReviewTabBarProps {
  innerTab: InnerTab;
  onSelectTab: (tab: InnerTab) => void;
  isNarrow: boolean;
  onTopAction: (action: "View" | "Print") => void;
  onClose: () => void;
  onCollapse?: () => void;
  isCollapsed?: boolean;
}

const INNER_TABS: {
  key: InnerTab;
  label: string;
  icon: "file-text" | "user" | "credit-card";
}[] = [
    { key: "details", label: "Application Details", icon: "file-text" },
    { key: "applicant-record", label: "Applicant Records", icon: "user" },
    { key: "soa", label: "SOA / Payment", icon: "credit-card" },
  ];

export function ReviewTabBar({
  innerTab,
  onSelectTab,
  isNarrow,
  onTopAction,
  onClose,
  onCollapse,
  isCollapsed,
}: ReviewTabBarProps) {
  const { colors, isDark } = useTheme();
  const tabScrollRef = useRef<ScrollView>(null);

  // Mouse drag-to-scroll for the tab bar on web
  useEffect(() => {
    if (Platform.OS !== "web" || !isNarrow) return;
    const node = (tabScrollRef.current as unknown as { getScrollableNode?: () => HTMLElement })?.getScrollableNode?.();
    if (!(node instanceof HTMLElement)) return;

    node.style.cursor = "grab";

    let dragging = false;
    let startX = 0;
    let originScrollLeft = 0;

    const onMouseDown = (e: MouseEvent) => {
      dragging = true;
      startX = e.pageX - node.offsetLeft;
      originScrollLeft = node.scrollLeft;
      node.style.cursor = "grabbing";
      node.style.userSelect = "none";
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      e.preventDefault();
      const x = e.pageX - node.offsetLeft;
      node.scrollLeft = originScrollLeft - (x - startX);
    };

    const stopDrag = () => {
      if (!dragging) return;
      dragging = false;
      node.style.cursor = "grab";
      node.style.userSelect = "";
    };

    node.addEventListener("mousedown", onMouseDown);
    node.addEventListener("mousemove", onMouseMove);
    node.addEventListener("mouseup", stopDrag);
    node.addEventListener("mouseleave", stopDrag);

    return () => {
      node.removeEventListener("mousedown", onMouseDown);
      node.removeEventListener("mousemove", onMouseMove);
      node.removeEventListener("mouseup", stopDrag);
      node.removeEventListener("mouseleave", stopDrag);
      node.style.cursor = "";
      node.style.userSelect = "";
    };
  }, [isNarrow]);

  return (
    <View
      style={[
        styles.innerTabBarWrapper,
        {
          borderBottomColor: isDark ? colors.neutral[700] : colors.neutral[200],
          backgroundColor: isDark ? colors.neutral[800] : COLORS.neutral.white,
        },
      ]}
    >
      {isNarrow ? (
        <>
          {/* Row 1: Scrollable tabs */}
          <ScrollView
            ref={tabScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.innerTabScrollContent}
            style={styles.innerTabScroll}
          >
            {INNER_TABS.map((tab) => {
              const isActive = innerTab === tab.key;
              return (
                <Pressable
                  key={tab.key}
                  style={styles.innerTabItem}
                  onPress={() => onSelectTab(tab.key)}
                >
                  <Lucide
                    name={tab.icon}
                    size={13}
                    color={
                      isActive
                        ? isDark
                          ? colors.brand[500]
                          : COLORS.brand[700]
                        : isDark
                          ? colors.neutral[500]
                          : colors.neutral[400]
                    }
                  />
                  <Text
                    style={[
                      styles.innerTabText,
                      {
                        color: isActive
                          ? isDark
                            ? colors.brand[500]
                            : COLORS.brand[700]
                          : isDark
                            ? colors.neutral[400]
                            : colors.neutral[500],
                      },
                    ]}
                  >
                    {tab.label}
                  </Text>
                  {isActive && (
                    <View
                      style={[
                        styles.innerTabUnderline,
                        {
                          backgroundColor: isDark
                            ? colors.brand[500]
                            : colors.brand[700],
                        },
                      ]}
                    />
                  )}
                </Pressable>
              );
            })}
          </ScrollView>

          {/* Row 2: Actions */}
          <View
            style={[
              styles.innerTabActionsRow,
              {
                borderTopColor: isDark ? colors.neutral[700] : colors.neutral[100],
              },
            ]}
          >
            <View style={styles.headerActionRow}>
              <Pressable
                style={styles.headerActionLink}
                onPress={() => onTopAction("View")}
              >
                <Lucide
                  name="eye"
                  size={14}
                  color={isDark ? colors.brand[500] : COLORS.brand[700]}
                />
                <Text
                  style={[
                    styles.headerActionLinkText,
                    {
                      color: isDark ? colors.brand[500] : colors.brand[700],
                    },
                  ]}
                >
                  View
                </Text>
              </Pressable>
              <View
                style={[
                  styles.headerActionDivider,
                  {
                    backgroundColor: isDark
                      ? colors.neutral[700]
                      : colors.neutral[200],
                  },
                ]}
              />
              <Pressable
                style={styles.headerActionLink}
                onPress={() => onTopAction("Print")}
              >
                <Lucide
                  name="printer"
                  size={14}
                  color={isDark ? colors.brand[500] : COLORS.brand[700]}
                />
                <Text
                  style={[
                    styles.headerActionLinkText,
                    {
                      color: isDark ? colors.brand[500] : colors.brand[700],
                    },
                  ]}
                >
                  Print
                </Text>
              </Pressable>
            </View>
            <View style={styles.innerTabSpacer} />
            {onCollapse !== undefined && (
              <Pressable
                style={[
                  styles.iconBtn,
                  Platform.select({ web: { cursor: "pointer" } as object }),
                ]}
                onPress={onCollapse}
              >
                <Lucide
                  name={isCollapsed ? "minimize-2" : "maximize-2"}
                  size={14}
                  color={isDark ? colors.neutral[400] : colors.neutral[500]}
                />
              </Pressable>
            )}
            <Pressable
              style={[
                styles.iconBtn,
                Platform.select({ web: { cursor: "pointer" } as object }),
              ]}
              onPress={onClose}
            >
              <Lucide
                name="x"
                size={16}
                color={isDark ? colors.neutral[400] : colors.neutral[500]}
              />
            </Pressable>
          </View>
        </>
      ) : (
        /* Wide: single row */
        <View style={styles.innerTabBar}>
          {INNER_TABS.map((tab) => {
            const isActive = innerTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={styles.innerTabItem}
                onPress={() => onSelectTab(tab.key)}
              >
                <Lucide
                  name={tab.icon}
                  size={13}
                  color={
                    isActive
                      ? isDark
                        ? colors.brand[500]
                        : COLORS.brand[700]
                      : isDark
                        ? colors.neutral[500]
                        : colors.neutral[400]
                  }
                />
                <Text
                  style={[
                    styles.innerTabText,
                    {
                      color: isActive
                        ? isDark
                          ? colors.brand[500]
                          : COLORS.brand[700]
                        : isDark
                          ? colors.neutral[400]
                          : colors.neutral[500],
                    },
                  ]}
                >
                  {tab.label}
                </Text>
                {isActive && (
                  <View
                    style={[
                      styles.innerTabUnderline,
                      {
                        backgroundColor: isDark
                          ? colors.brand[500]
                          : colors.brand[700],
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
          <View style={styles.innerTabSpacer} />
          <View style={styles.headerActionRow}>
            <Pressable
              style={styles.headerActionLink}
              onPress={() => onTopAction("View")}
            >
              <Lucide
                name="eye"
                size={14}
                color={isDark ? colors.brand[500] : COLORS.brand[700]}
              />
              <Text
                style={[
                  styles.headerActionLinkText,
                  {
                    color: isDark ? colors.brand[500] : colors.brand[700],
                  },
                ]}
              >
                View
              </Text>
            </Pressable>
            <View
              style={[
                styles.headerActionDivider,
                {
                  backgroundColor: isDark
                    ? colors.neutral[700]
                    : colors.neutral[200],
                },
              ]}
            />
            <Pressable
              style={styles.headerActionLink}
              onPress={() => onTopAction("Print")}
            >
              <Lucide
                name="printer"
                size={14}
                color={isDark ? colors.brand[500] : COLORS.brand[700]}
              />
              <Text
                style={[
                  styles.headerActionLinkText,
                  {
                    color: isDark ? colors.brand[500] : colors.brand[700],
                  },
                ]}
              >
                Print
              </Text>
            </Pressable>
          </View>
          <View style={{ width: SPACING[16] }} />
          {onCollapse !== undefined && (
            <Pressable
              style={[
                styles.iconBtn,
                Platform.select({ web: { cursor: "pointer" } as object }),
              ]}
              onPress={onCollapse}
            >
              <Lucide
                name={isCollapsed ? "minimize-2" : "maximize-2"}
                size={14}
                color={isDark ? colors.neutral[400] : colors.neutral[500]}
              />
            </Pressable>
          )}
          <Pressable
            style={[
              styles.iconBtn,
              Platform.select({ web: { cursor: "pointer" } as object }),
            ]}
            onPress={onClose}
          >
            <Lucide
              name="x"
              size={16}
              color={isDark ? colors.neutral[400] : colors.neutral[500]}
            />
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  innerTabBarWrapper: {
    borderBottomWidth: 1,
  },
  innerTabBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[16],
    height: 44,
  },
  innerTabScroll: {
    flexGrow: 0,
  },
  innerTabScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[16],
    height: 44,
  },
  innerTabActionsRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING[16],
    paddingVertical: SPACING[6],
    borderTopWidth: 1,
  },
  innerTabItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[6],
    paddingHorizontal: SPACING[12],
    height: "100%",
    position: "relative",
  },
  innerTabText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  innerTabUnderline: {
    position: "absolute",
    bottom: 0,
    left: SPACING[12],
    right: SPACING[12],
    height: 2,
    borderRadius: 1,
  },
  innerTabSpacer: {
    flex: 1,
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[8],
  },
  headerActionLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING[4],
    paddingVertical: SPACING[4],
    paddingHorizontal: SPACING[6],
    borderRadius: RADIUS.button,
  },
  headerActionLinkText: {
    fontFamily: TYPOGRAPHY.fonts.primary,
    fontSize: TYPOGRAPHY.sizes.body,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  headerActionDivider: {
    width: 1,
    height: 14,
  },
  iconBtn: {
    padding: SPACING[6],
    borderRadius: RADIUS.button,
    marginLeft: SPACING[4],
  },
});
