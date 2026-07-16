import {Dimensions, Platform, StyleSheet} from "react-native";
import {Bold, Regular} from "@styles/font";
import {RNValue as RFValue} from "@utils/formatting";
import {button, outline, text} from "@styles/color";
const { width, height } = Dimensions.get('screen');
const styles = StyleSheet.create({
    footerContainerIsSmall: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        padding: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
    },
    footerLinks: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    footerIsSmall: {
        fontSize: 14,
        color: '#555',
    },
    footerLinkIsSmall:{ fontFamily: Regular,  color: '#fff', fontSize: 18, marginBottom: 20 },
    edgeFooter: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    footerContainer:{
        flexDirection : "row" ,
        paddingVertical : 25 ,
        justifyContent : "center" ,
        alignItems : "center" ,
        backgroundColor : "#F6F6F6",

    },
    footer: {
        lineHeight: 24,
        fontSize: 14,
        fontFamily: Regular
    },
    formTitleText: {
        ...Platform.select({

            native: {
                fontSize: RFValue(20),
                color: text.primary,
                textAlign: 'center',
                marginBottom: 30
            },
            default:{
                fontSize: RFValue(24),
                color: text.primary,
                textAlign: 'left',
                marginBottom: 35,
                marginLeft: 8
            }
        }),
        fontFamily: Bold,

    },
    formContainer: {

        ...Platform.select({
            native: {
                flex: 1,
                borderBottomWidth: 0,
                paddingHorizontal: 30,
            },
            default:{
                borderBottomWidth: 0.5,
                paddingHorizontal: 47,
            }
        }),
        borderRadius: 15,
        borderWidth: 0.5,

        borderColor: outline.disabled,
        backgroundColor: '#fff',

        paddingTop: 39,
        paddingBottom: 30
    },
    bottomContainer: {

    },
    loginButton: {
        borderRadius: 10,
        maxHeight: RFValue(56),
        justifyContent: 'center',
    },
    guestloginButton: {
        borderRadius: 10,
        justifyContent: 'center',
        padding: 15
    },
    boldText: {
        fontFamily: Bold,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    },
    bgImage: {
        height,
        width,
    },
    image: {
        height: width * .15,
        width: width * .60,
        marginTop: height * .10,
        marginVertical: height * .08,
        alignSelf: 'center',
    },
    guestView: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    guestText: {
        color: '#fff',
        fontFamily: Bold,
        fontSize: RFValue(14),
        marginTop: 15
    },
    bottomView: {
        height: width / 1.5,
    },
    modalView: {
        paddingHorizontal: 20,

    },
    modalLabelText: {
        fontFamily: Bold,
        fontSize: RFValue(16),
        color: text?.primary,
        textAlign: 'center',
        marginBottom: 20,
    },
    touchableView: {
        backgroundColor: button?.primary,
        height: width / 3,
        width: width / 3,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    img: {
        height: 50,
        width: 50
    },

    sheet: {
        backgroundColor: "#fff",
        borderRadius: 16,
        overflow: "hidden",
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowRadius: 12,
        elevation: 8,
    },
    header: {
        paddingVertical: 14,
        paddingHorizontal: 16,
        flexDirection: "row",
        alignItems: "center",
    },
    title: {
        flex: 1,
        fontSize: 18,
        fontWeight: "700",
        color: "#111",
    },
    closeBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        marginLeft: 8,
    },
    closeTxt: {
        fontSize: 18,
        color: "#666",
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        backgroundColor: "#E6E6E6",
    },
    body: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        gap: 14,
    },
    footer: {
        padding: 16,
    },
    cta: {
        borderRadius: 12,
        paddingVertical: 12,
        alignItems: "center",
    },
    ctaTxt: {
        fontWeight: "700",
    },




});


export default styles
