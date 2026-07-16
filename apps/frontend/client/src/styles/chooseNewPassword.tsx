import {Dimensions , Platform , StyleSheet} from "react-native";
import {outline , text} from "@styles/color";
import {Bold , Regular} from "@styles/font";
import {RFValue} from "react-native-responsive-fontsize";
const { width, height } = Dimensions.get('screen');


export const styles = StyleSheet.create({
    edgeFooter: {
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    footerContainer:{
        flexDirection : "row" ,
        paddingVertical : 45 ,
        justifyContent : "center" ,
        alignItems : "center" ,
        backgroundColor : "#fff",
        //flexWrap: "wrap"
    },
    footer: {
        lineHeight: 24,
        fontSize: 14,
        fontFamily: Regular
    },
    bgImage: {
        backgroundColor: "#fff",
        height ,
        width,
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
                fontSize: (24),
                color: text.primary,
                textAlign: 'left',
                marginBottom: 35,
                marginLeft: 8
            }
        }),
        fontFamily: Bold,

    },
    image: {
        height: width * .15,
        width: width * .60,
        marginTop: height * .10,
        marginVertical: height * .08,
        alignSelf: 'center',
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
        ...Platform.select({
            native: {
                maxHeight: RFValue(56),
            },
            default: {
                maxHeight: (56),
            },
        }),


        justifyContent: 'center',
    },
    boldText: {
        fontFamily: Bold,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20,
    }
});
