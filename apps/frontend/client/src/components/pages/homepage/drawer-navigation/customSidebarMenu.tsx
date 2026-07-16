import {DrawerDescriptorMap,DrawerNavigationHelpers} from "@react-navigation/drawer/lib/typescript/src/types";
import {CommonActions,DrawerActions,DrawerNavigationState,ParamListBase} from "@react-navigation/native";
import {DrawerContentScrollView,DrawerItem} from "@react-navigation/drawer";
import Services from "@assets/svg/services";
import MyApplications from "@assets/svg/myApplications";
import {Text, TouchableOpacity, View} from "react-native";
import styles from "@pages/homepage/drawer-navigation/styles";
import React,{useEffect} from "react";
import {useSelector} from "react-redux";
import {Dot, License, RadioTower} from "@atoms/icon";
import {RFValue} from "react-native-responsive-fontsize";
import {Switch} from "react-native-gesture-handler";

export function CustomSidebarMenu(props:{
    onCollapseOn?: () => void;     // set collapsed = true
    onCollapseOff?: () => void;
    collapsed?: boolean;
    onToggleCollapse?: () => void;
    descriptors:DrawerDescriptorMap,navigation:DrawerNavigationHelpers,state:DrawerNavigationState<ParamListBase>}){
    const {state}=props;
    const {routes,index}=state;
    const focusedRoute=routes[index];
    const stateApplication = useSelector(state => state?.application);
    const { list } = stateApplication;

    return (
        <>
            <DrawerContentScrollView>

                {state.routes.map((route,i)=>{
                    const focused=i===state.index;
                    const focusedDescriptor=props.descriptors[focusedRoute.key];
                    const focusedOptions=focusedDescriptor.options;

                    const {}=focusedOptions;
                    const {
                        title,
                        drawerLabel,
                    }=props.descriptors[route.key].options;
                    const onPress=()=>{

                        //if(((route.name == CHAT && !isMobile)  || (route.name == MEET && !isMobile) || (route.name == SCANQR && !isMobile)  ) ) return

                        const event=props.navigation.emit({
                            type:'drawerItemPress',
                            target:route.key,
                            canPreventDefault:true,
                        });

                        if(!event.defaultPrevented){
                            props.navigation.dispatch({
                                ...(
                                    focused
                                    ? DrawerActions.closeDrawer()
                                    : CommonActions.navigate({name:route.name,merge:true})),
                                target:state.key,
                            });
                        }
                    };

                    let tabIcon:any=null;

                    switch(route.name){
                        case "Services":
                            tabIcon=<RadioTower  color={focused ? "#113196" : "#6E7191"} size={RFValue(15)} />;
                            break;
                        case "Applications":
                            tabIcon=<License  color={focused ? "#113196" : "#6E7191"} size={RFValue(15)} />
                            break;

                        default:
                            tabIcon=null;
                    }

                    return <View key={route.key}>
                        <DrawerItem key={route.key} label={""} activeBackgroundColor={"transparent"} focused={focused}
                                    icon={()=>(
                                        <View style={{width:"100%"}}>
                                            <View
                                                style={[styles.itemContainer,{borderLeftColor:focused ? "#113196" : "transparent",}]}>
                                                <View style={{
                                                    alignItems:"center",
                                                    justifyContent:"center",
                                                }}>

                                                    {tabIcon}

                                                    <Text
                                                          style={[styles.label,{color:focused ? "#113196" : "#6E7191"}]}>{drawerLabel!==undefined
                                                                                                                          ? drawerLabel
                                                                                                                          : title!==undefined
                                                                                                                            ? title
                                                                                                                            : route.name}</Text>
                                                </View>

                                            </View>

                                        </View>

                                    )} style={styles.item} onPress={onPress}/>
                    </View>

                })}

            </DrawerContentScrollView>
        </>

    );
}
