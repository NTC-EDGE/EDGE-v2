import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

import {RNValue as RFValue} from "@utils/formatting";
const SearchIcon = (props: SvgProps) => (
    <Svg
        width={RFValue(16)}
        height={RFValue(16)}
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M7.33331 13.3335C10.647 13.3335 13.3333 10.6472 13.3333 7.3335C13.3333 4.01979 10.647 1.3335 7.33331 1.3335C4.0196 1.3335 1.33331 4.01979 1.33331 7.3335C1.33331 10.6472 4.0196 13.3335 7.33331 13.3335Z"
            stroke="#A0A3BD"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <Path
            d="M14.6667 14.6667L12 12"
            stroke="#A0A3BD"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default SearchIcon;
