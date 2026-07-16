import {Modal, TouchableOpacity, TouchableWithoutFeedback, useWindowDimensions, View} from "react-native";
import {Close} from "@atoms/icon";
import React from "react";
import ForgotPassword from "@screens/forgot-password";

const ForgotPasswordComponent = ({forgotPasswordModal, setForgotPasswordModal, width}) => (

    <Modal transparent={true} visible={forgotPasswordModal}>
        <View style={{  flex: 1, justifyContent: "center", alignItems: "center",}}>
            <TouchableWithoutFeedback onPress={ () => {setForgotPasswordModal(false)} }>
                <View style={ [{
                    width : "100%" ,
                    height : "100%" ,
                    alignItems : "center" ,
                    justifyContent : "flex-end" ,
                    position : "absolute" ,
                    backgroundColor : "rgba(0,0,0, 0.5)"
                }] }/>
            </TouchableWithoutFeedback>;
            <View style={{padding: 20,  backgroundColor: "#fff", borderColor: "#E5E5E5", borderRadius: 10, width:  width > 768 ? width * 0.28 : width * 0.9, flex:  0.77}}>
                <TouchableOpacity onPress={() => setForgotPasswordModal(false)} >
                    <View style={{paddingRight: 20,alignItems: "flex-end"}}><Close/></View>
                </TouchableOpacity>

                <ForgotPassword/>
            </View>
        </View>
    </Modal>
)

export default ForgotPasswordComponent;
