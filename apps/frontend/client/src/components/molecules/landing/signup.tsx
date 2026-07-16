import {Modal, Text, TouchableOpacity, TouchableWithoutFeedback, View} from "react-native";
import Alert from "@atoms/alert";
import {Close} from "@atoms/icon";
import Registration from "../../../navigations/registration";
import React from "react";

const SignUp = ({width, registrationModal, setRegistrationModal, showRegistrationModal, hideAlert, setShowRegistrationModal}) => {
    return (
        <Modal transparent={true} visible={registrationModal}>

            <View style={{  flex: 1, justifyContent: "center", alignItems: "center",}}>
                <TouchableWithoutFeedback onPress={ () => {
                    setRegistrationModal(false)
                }}>
                    <View style={ [{
                        width : "100%" ,
                        height : "100%" ,
                        alignItems : "center" ,
                        justifyContent : "flex-end" ,
                        position : "absolute" ,
                        backgroundColor : "rgba(0,0,0, 0.5)"
                    }] }/>
                </TouchableWithoutFeedback>
                <Alert
                    overlayStyle={{backgroundColor: "rgba(0,0,0,0)"}}
                    alertContainerStyle={{zIndex: 2}}
                    visible={showRegistrationModal}
                    title="Discard Changes"
                    message="You have unsaved changes. Do you want to continue?"
                    cancelText="Cancel"
                    confirmText="OK"
                    contentContainerStyle={{shadowColor: "#000",
                        shadowOffset: {
                            width: 0,
                            height: 7,
                        },
                        shadowOpacity: 0.43,
                        shadowRadius: 9.51,

                        elevation: 15}}
                    onCancel={() => {
                        hideAlert();
                    }}
                    onConfirm={() => {
                        setRegistrationModal(false)
                        hideAlert();
                    }}
                />
                <View style={{padding: 20,  backgroundColor: "#fff", borderColor: "#E5E5E5", borderRadius: 10, width:  width > 768 ? width * 0.28 : width * 0.9, flex:  0.77}}>
                    <TouchableOpacity onPress={() => {
                        setShowRegistrationModal(true)

                    }} >
                        <View style={{paddingRight: 20,alignItems: "flex-end"}}><Close/></View>
                    </TouchableOpacity>

                    <View style={{ paddingLeft: 20,  justifyContent: "center"}}>
                        <Text style={{fontWeight: "bold", fontSize: 24, color: "#03066E"}}>Sign Up</Text>
                    </View>
                    <Registration/>
                </View>
            </View>
        </Modal>
    )
}

export default SignUp
