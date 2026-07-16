import * as React from "react";
import Svg , {Circle , Path , SvgProps} from "react-native-svg";
import {RNValue as RFValue} from "@utils/formatting";

const HelpTopBar = (props: SvgProps) => (
    <Svg
        width={RFValue(props.width || 24) }
        height={ RFValue(props.height || 24) }
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        { ...props }
    >
        <Circle cx={ 12 } cy={ 12 } r={ 11 } stroke="white" strokeWidth={ 2 }/>
        <Path
            d="M12 14V13.2295C12 12.2364 12.7627 11.4167 13.6133 10.9041C14.4344 10.4092 15.2185 9.5295 15 7.99999C14.5714 4.99997 10.5 6.5 10.5 6.5"
            stroke="white"
            strokeWidth={ 2 }
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M12 17V17.5"
            stroke="white"
            strokeWidth={ 2 }
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default HelpTopBar;
