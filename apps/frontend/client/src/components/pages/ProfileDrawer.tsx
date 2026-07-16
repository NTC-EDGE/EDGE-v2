// ProfileDrawer.tsx
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    SafeAreaView,
} from 'react-native';
import { MotiView } from 'moti';
import {
    User,
    Shield,
    Palette,
    HelpCircle,
    LogOut,
} from 'lucide-react-native';
import ProfileHeader from '@organisms/ProfileHeader';

type Props = {
    name: string;
    email: string;
    current?: string;

    // menu actions
    onClose: () => void;
    onProfile: () => void;
    onSecurity: () => void;
    onAppearance: () => void;
    onHelp: () => void;
    onLogout: () => void;

    // avatar props
    photo?: string | null;
    isCompact?: boolean | null;
    onUploadAvatar?: () => void;
    onRemoveAvatar?: () => void;
};

const MENU_ITEMS = [
    { key: 'profile', label: 'Profile', Icon: User },
    { key: 'security', label: 'Security', Icon: Shield },
    { key: 'appearance', label: 'Appearance', Icon: Palette },
    { key: 'help', label: 'Help & Support', Icon: HelpCircle },
];

const ACCENT = '#2563FF';

export const ProfileDrawer: React.FC<Props> = ({
                                                   name,
                                                   email,
                                                   current = 'profile',
                                                   onProfile,
                                                   onSecurity,
                                                   onAppearance,
                                                   onHelp,
                                                   onLogout,
                                                   photo,
                                                   onUploadAvatar,
                                                   onRemoveAvatar,
                                                   isCompact = false,
                                               }) => {
    const handlers: Record<string, () => void> = {
        profile: onProfile,
        security: onSecurity,
        appearance: onAppearance,
        help: onHelp,
    };

    return (
        <SafeAreaView
            style={[
                styles.container,
                isCompact && styles.compactContainer,   // 👈 apply compact style
            ]}
        >
            {/* Avatar + name + email */}
            <MotiView
                style={styles.profileHeader}
                from={{ translateY: -20, opacity: 0 }}
                animate={{ translateY: 0, opacity: 1 }}
                transition={{ type: 'timing', duration: 350 }}
            >
                <ProfileHeader
                    name={name}
                    email={email}
                    photo={photo || null}
                    onUpload={onUploadAvatar}
                    onRemove={onRemoveAvatar}
                />
            </MotiView>

            {/* Menu */}
            <View style={styles.menuWrapper}>
                {MENU_ITEMS.map((item, index) => (
                    <MotiView
                        key={item.key}
                        from={{ translateX: -15, opacity: 0 }}
                        animate={{ translateX: 0, opacity: 1 }}
                        transition={{
                            type: 'timing',
                            duration: 250,
                            delay: 150 + index * 90,
                        }}
                    >
                        <Pressable
                            style={[
                                styles.menuItem,
                                item.key === current && styles.menuItemActive,
                            ]}
                            onPress={handlers[item.key]}
                        >
                            <item.Icon
                                size={22}
                                color={item.key === current ? ACCENT : '#444'}
                            />
                            <Text
                                style={[
                                    styles.menuLabel,
                                    item.key === current && styles.menuLabelActive,
                                ]}
                            >
                                {item.label}
                            </Text>
                        </Pressable>
                    </MotiView>
                ))}
                {/* Logout */}
                <MotiView
                    style={styles.logoutWrapper}
                    from={{ translateY: 15, opacity: 0 }}
                    animate={{ translateY: 0, opacity: 1 }}
                    transition={{ type: 'timing', duration: 250, delay: 550 }}
                >
                    <Pressable style={styles.logoutBtn} onPress={onLogout}>
                        <LogOut size={22} color="#e11d48" />
                        <Text style={styles.logoutText}>Log out</Text>
                    </Pressable>
                </MotiView>
            </View>



        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        width: 320,                    // desktop sidebar
        flexShrink: 0,
        borderRightColor: '#e3e3e3',
        borderRightWidth: 1,
        backgroundColor: '#ffffff',
    },
    compactContainer: {
        width: '100%',                 // full-width on small screens
        borderRightWidth: 0,
        borderBottomWidth: 1,
        borderBottomColor: '#e3e3e3',
    },

    profileHeader: {
        alignItems: 'center',
        paddingVertical: 24,
        paddingHorizontal: 24,
    },
    menuWrapper: {
        paddingHorizontal: 20,
        paddingTop: 16,
        flexGrow: 1,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 14,
        marginBottom: 8,
    },
    menuItemActive: {
        backgroundColor: '#eef3ff',
    },
    menuLabel: {
        marginLeft: 12,
        fontSize: 16,
        color: '#111827',
    },
    menuLabelActive: {
        color: ACCENT,
        fontWeight: '600',
    },
    logoutWrapper: {
        paddingHorizontal: 20,
        paddingVertical: 24,
        borderTopWidth: StyleSheet.hairlineWidth,
        borderTopColor: '#e5e7eb',
    },
    logoutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logoutText: {
        marginLeft: 10,
        fontSize: 16,
        fontWeight: '600',
        color: '#e11d48',
    },
});
