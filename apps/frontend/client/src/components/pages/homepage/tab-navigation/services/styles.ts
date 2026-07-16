
import {Dimensions,Platform,StyleSheet} from 'react-native';
import {lightPrimaryColor,primaryColor,text} from '@styles/color';
import {Bold,Regular} from '@styles/font';
import {isMobile,isPad,RNValue as RFValue} from "@utils/formatting";

const {width}=Dimensions.get('window');
const serviceContainerSize=isPad ? width * 0.25  :width/4 ;
const serviceViewSize=serviceContainerSize*.70;
const serviceImageSize=serviceViewSize*.60;
export default StyleSheet.create({
    actionMenu: {
        position: "absolute",
        top: 28,
        right: 0,
        minWidth: 140,
        borderRadius: 12,
        backgroundColor: "#FFFFFF",
        paddingVertical: 4,
        shadowColor: "#000",
        shadowOpacity: 0.15,
        shadowOffset: { width: 0, height: 6 },
        shadowRadius: 12,
        elevation: 6,
        zIndex: 10,
    },
    actionMenuItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 6,
        paddingHorizontal: 10,
        gap: 6,
    },
    actionMenuText: {
        fontSize: 13,
        color: "#111827",
    },
    metaText: {
        fontSize: 12,
        color: "#666",
        marginTop: 2,
    },
    metaSubText: {
        fontSize: 11,
        color: "#999",
        marginTop: 2,
    },
    safe: { flex: 1, backgroundColor: "#fff" },
    title: {
        fontSize: 18,
        fontWeight: "600",
    },
    subtitle: {
        fontSize: 16,
        fontWeight: "600",
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#E0E0E0",
        paddingHorizontal: 12,
        height: 40,
        marginBottom: 16,
    },
    searchIcon: { marginRight: 6 },
    searchInput: {
        flex: 1,
        fontSize: 14,
    },
    listContent: {
        paddingBottom: 80, // space for bottom button
    },
    card: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 10,
        backgroundColor: "#fff",
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 8,
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 4,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,

    },
    applicantName: {
        flex: 1,
        fontSize: 14,
        fontWeight: "500",
    },
    cardActions: {
        flex: 0.5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 12,
    },
    reviewText: {
        fontSize: 11,
        color: "#888",
        marginRight: 4,
    },
    fullscreen: { flex: 1 },
    overlay: { flex: 1, justifyContent: "center", alignItems: "center" },


    feedbackBox: {
        marginTop: 22,
        backgroundColor: "#F8F8FA",
        borderRadius: 12,
        padding: 20,
    },
    sectionLabel: {
        textAlign: "center",
        fontWeight: "700",
        marginBottom: 14,
        color: "#424349",
    },
    stars: { flexDirection: "row", justifyContent: "center", gap: 12, marginBottom: 18 },
    label: { marginBottom: 6, color: "#333" },
    textarea: {
        borderWidth: 1,
        borderColor: "#D1D5DB",
        borderRadius: 6,
        minHeight: 85,
        padding: 10,
        color: "#111",
    },
    feedbackBtn: {
        marginTop: 14,
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        gap: 8,
        paddingVertical: 12,
        backgroundColor: "#E5E7EB",
        borderRadius: 8,
    },
    feedbackText: { fontWeight: "600", fontSize: 14 },
    closeBtn: {
        alignSelf: "center",
        marginTop: 20,
        backgroundColor: "#E6E6EE",
        paddingVertical: 10,
        paddingHorizontal: 50,
        borderRadius: 6,
    },
    closeText: { fontWeight: "700", color: "#4F46E5" },



bottomBar: {
        position: "absolute",
        bottom: 24,
        right: 16,
    },
    submitButton: {
        borderRadius: 999,
        paddingHorizontal: 24,
        paddingVertical: 10,
       // deep blue
    },
    submitText: {

        fontWeight: "600",
        fontSize: 14,
    },



    container: { flex: 1 },
    helpCenterBtn: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        backgroundColor: '#1E2A78',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 15
    },
    helpCenterText: {
        color: '#fff',
        fontSize: 14
    },
    tabContainer:{
        flexDirection:'row',
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:primaryColor,
        margin:0,
    },
    tabIcon:{
        marginEnd:5,
    },
    tabText:{
        fontFamily:Bold,
        ...Platform.select({
            native: {
                fontSize:RFValue(16),
            },
            web:{
                fontSize:RFValue(16*0.80),
            }
        })

    },

    searchBarContainer:{
        marginHorizontal:20,
        marginTop:20,
    },

    serviceContainer:{
        ...Platform.select({
            native:{
                width:serviceContainerSize ,
                height:serviceContainerSize*(Platform.isPad ?1.1: 1.40),
                shadowOpacity: 0.1,
                paddingVertical:15,
                alignItems:'center',
                marginTop:30,
                backgroundColor:'#fff',
                borderRadius:10,
                shadowColor:'#000',
                shadowOffset:{width:1,height:1},
                shadowRadius:5,
                elevation:3,
            },
            web:{
                width: isMobile ? serviceContainerSize :120,
                height: 90,
                paddingVertical:  15,
            }
        }),


    },
    serviceView:{

        ...Platform.select({
            native: {

                height:serviceViewSize,
                width:serviceViewSize,
                borderRadius:serviceViewSize,
                backgroundColor: Platform?.isPad ? 'transparent' :lightPrimaryColor,
            },
            web: {
            }
        }),

        justifyContent:'center',
        alignItems:'center',
    },
    serviceImage:{
        ...Platform.select({
            native:{
                height:serviceImageSize,
                width:serviceImageSize,
            },
            web:{
                height:width*0.04883,
                width:width*0.04883,
            }
        })

    },
    serviceText:{
        ...Platform.select({
            native: {

                fontSize:RFValue(11),
                color:text.default,
                marginTop:15,
            },
            web:{

                flexShrink: 1,
                flexWrap: "wrap",
                fontSize: 12, //((width * 0.095)) * 0.1,
                color: "#000",

            }
        }),


        textAlign:'center',

    },
    serviceRowContainer:{
        zIndex:1,
        shadowColor:"rgba(0,0,0,0.1)",
        shadowOffset:{
            width:0,
            height:4
        },
        elevation:30,
        shadowOpacity:1,
        shadowRadius:10,
        backgroundColor: '#fff',
        flexGrow:0,
        flexShrink:0
    },
    search:{
        fontSize: Platform.isPad ? 24 :16,
        paddingLeft:RFValue(35 ),
        borderRadius:10,
        padding:RFValue(10*0.70),
        backgroundColor:"#F0F0F0"
    },
    serviceViewContainer:{
        paddingTop:22,
        paddingHorizontal:24,
        borderBottomWidth:1,
        borderBottomColor:"#EFEFEF"
    },
    serviceTitle:{
        fontFamily: Bold,
        paddingBottom:11,
        fontWeight:"bold",
        fontSize: RFValue(24*0.75),
        color:"#113196"
    },
    searchIcon:{
        justifyContent:"center",
        alignItems:"center",
        height:"100%",
        marginLeft:15,
        position:"absolute",
    },
    serviceShadow:{shadowColor:'#000',
        shadowOffset:{width:1,height:1},
        alignItems:'center',
        marginTop:30,
        backgroundColor:'#fff',
        borderRadius:10,
        ...Platform.select({
            native:{
                shadowOpacity: 0.1,
            },
            web: {
                shadowOpacity: 0.2,
            }
        }),
        shadowOpacity: 0.2,
        shadowRadius:5,
        elevation:3,},

    headerView: {
        marginTop: 30,
        alignSelf: 'flex-start',
        width: width - 80,
        ...Platform.select({
            web: {
                marginLeft: 30,
            }
        }),
    },
    headerText: {
        fontSize: RFValue(16),
        color: text?.default
    }, footer: {
        marginVertical: 30,

    }


});
