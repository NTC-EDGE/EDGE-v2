import { StyleSheet, Dimensions, Platform } from 'react-native';
import { input, outline, text } from '@styles/color';
import { Bold } from '@styles/font';
import { RNValue as RFValue, RNValue } from '@utils/formatting';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
    controlsRow: {
        marginTop: 12,
        alignItems: 'stretch',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 12,
    },

    actionBtn: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 8,
        alignItems: 'center',
        backgroundColor: '#e0e0e0', // default background
    },

    saveBtn: {
        backgroundColor: '#4caf50',
    },

    saveBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
    },
    modalContent: {
        width: '90%',
        maxWidth: 800,
        alignSelf: 'center',
        padding: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        ...((Platform.OS === 'android') ? { elevation: 12 } : {}),
    },

    modalTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
        color: (text?.default ?? '#111'),
    },

    signatureWrapper: {
        width: '100%',
        height: 260,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        marginBottom: 16,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    buttonText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#FFF',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#4A90E2',
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    uploadContainerPrimary: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        paddingHorizontal: 16,
        backgroundColor: '#4A90E2',
        borderRadius: 8,
        ...(Platform.OS === 'ios'
            ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 2,
            }
            : Platform.OS === 'android'
                ? { elevation: 3 }
                : {}),
    },
    uploadTextPrimary: {
        marginLeft: 8,
        fontSize: 16,
        fontWeight: '600',
        color: '#FFF',
    },

    // Raw variant
    uploadContainerRaw: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#4A90E2',
    },
    uploadTextRaw: {
        color: '#4A90E2',
    },

    // Disabled state
    uploadContainerDisabled: {
        backgroundColor: '#CCC',
    },
    uploadTextDisabled: {
        color: '#888',
    },

    // Card / Modal
    container: {
        padding: 20,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        shadowOffset: { width: 0, height: 1 },
        backgroundColor: '#fff',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: outline.default,
    },
    backdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    card: {
        width: '90%',
        maxWidth: 800,
        padding: 24,
        borderRadius: 12,
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 12,
    },
    header: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        textAlign: 'center',
    },

    cropperContainer: {
        width: '100%',
        height: 300,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
        marginBottom: 20,
    },

    // Buttons
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    buttonBase: {
        flex: 1,
        paddingVertical: 12,
        marginHorizontal: 5,
        borderRadius: 8,
        alignItems: 'center',
        ...(Platform.OS === 'web' ? { transitionDuration: '200ms' as any } : {}),
    },
    btnCancel: { backgroundColor: '#e0e0e0' },
    btnConfirm: { backgroundColor: '#4A90E2' },
    btnText: { fontSize: 16, fontWeight: '500' },

    // File row
    fileContainer: {
        ...(Platform.OS === 'web'
            ? { padding: 10 }
            : { flexDirection: 'row', justifyContent: 'space-between' }),
        marginTop: 10,
    },
    fileIconTextContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileIcon: { marginRight: 10 },
    fileTextContainer50: { width: '50%' },
    fileText: { fontFamily: Bold },
    fileXContainer: { width: '10%', alignItems: 'flex-end' },

    filePreview: {
        ...(Platform.OS === 'web'
            ? { height: width * 0.11044973545, width: width * 0.11044973545 }
            : { height: width / 4, width: width / 4 }),
    },
    xPreviewContainer: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        alignSelf: 'flex-end',
        borderRadius: 30,
        padding: 3,
        margin: 3,
    },

    progressText: { color: text.default, marginLeft: 5 },
    progressBar: {
        marginTop: 10,
        ...(Platform.OS === 'web' ? { position: 'absolute' as const, width: '100%' } : {}),
    },

    separator: { height: 10 },

    selectionRow: {
        ...(Platform.OS !== 'web' ? { flexDirection: 'row' } : {}),
        alignItems: 'center',
        justifyContent: 'center',
        marginHorizontal: 15,
    },
    selectionSeparator: {
        height: 1,
        backgroundColor: input.background?.default,
        margin: 15,
    },
    selectionText: { fontSize: RFValue(16) },
    selectionIcon: { color: text?.default, marginRight: 10 },
    descriptionText: { fontSize: RNValue(12), color: text?.disabled, marginTop: 3 },
});
