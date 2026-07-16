import * as React from "react";
import Svg,{Circle,Path,SvgProps, Text} from "react-native-svg";
import {RNValue as RFValue} from "@utils/formatting";
const MyApplications=(props:SvgProps)=>(
    <Svg
        width={RFValue(36)}
        height={RFValue(30)}
        viewBox="0 0 36 30"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M10.2587 5C10.8344 5 11.3941 5.17661 11.8637 5.50294L12.0592 5.65188L15.0275 8.125H24.6875C26.1084 8.125 27.2833 9.17871 27.4731 10.5473L27.4935 10.7449L27.5 10.9375V22.1875C27.5 23.6761 26.3435 24.8945 24.88 24.9935L24.6875 25H5.3125C3.82392 25 2.60545 23.8435 2.50649 22.38L2.5 22.1875V7.8125C2.5 6.32392 3.65645 5.10545 5.11994 5.00649L5.3125 5H10.2587ZM12.0592 12.4731C11.6169 12.8416 11.0738 13.0644 10.5042 13.1142L10.2587 13.125L4.375 13.1237V22.1875C4.375 22.6621 4.72769 23.0544 5.18529 23.1165L5.3125 23.125H24.6875C25.1621 23.125 25.5544 22.7723 25.6165 22.3148L25.625 22.1875V10.9375C25.625 10.4629 25.2723 10.0706 24.8148 10.0086L24.6875 10H15.0262L12.0592 12.4731ZM10.2587 6.875H5.3125C4.83787 6.875 4.44564 7.22769 4.38356 7.68529L4.375 7.8125V11.2487L10.2587 11.25C10.4341 11.25 10.6051 11.2008 10.7528 11.1092L10.8588 11.0327L13.2225 9.06125L10.8588 7.09229C10.724 6.97998 10.5612 6.9083 10.3891 6.88412L10.2587 6.875Z"
            fill= {props.color || "#808196"}
        />

        <Circle cx={28} cy={8} r={7.5} fill={props.myApplicationLength ? "#CF0327" : "none"} stroke={props.myApplicationLength ? "white" : "none"}/>

        <Text fontSize={10}  textAnchor="middle" fill="white" x="28" y="12">{props.myApplicationLength || undefined}</Text>
    </Svg>
);

export default MyApplications;
