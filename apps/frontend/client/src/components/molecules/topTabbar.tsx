import {Menu,MenuOption,MenuOptions,MenuTrigger} from "react-native-popup-menu";
import {Image, View} from "react-native";
import * as React from "react";
import Text from "@atoms/text"
import {RNValue as RFValue} from "@utils/formatting";
function ProfileMenu(props:{onClose:()=>void,onSelect:(value)=>void,user:any}){
    return <Menu onClose={props.onClose} onSelect={props.onSelect}>

        <MenuTrigger>
            <Image
                style={{borderRadius: RFValue(30), width: RFValue(30), height: RFValue(30)}}
                source={props.user?.profilePicture?.small}
            />
        </MenuTrigger>

        <MenuOptions optionsContainerStyle={{
            marginTop:30,
            shadowColor:"rgba(0,0,0,1)",
            paddingVertical:10,
            borderRadius:8,
            shadowOffset:{
                width:0,
                height:0
            },
            elevation:45,
            shadowOpacity:0.1,
            shadowRadius:15,
        }}>
            <MenuOption value={'editProfile'}>
                <View>
                    <Text style={{fontSize: RFValue(12) }}>{'Settings'}</Text>
                </View>
            </MenuOption>
        </MenuOptions>

    </Menu>;
}

export default  React.memo(ProfileMenu)
