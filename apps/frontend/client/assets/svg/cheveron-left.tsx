import * as React from "react";
import Svg, { SvgProps, Path } from "react-native-svg";

const CheveronLeftIcon = (props: SvgProps) => (
    <Svg
        width={9}
        height={16}
        viewBox="0 0 9 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        {...props}
    >
        <Path
            d="M1 15L8 8L1 1"
            stroke={props.color || "#2863D6"}
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </Svg>
);

export default CheveronLeftIcon;
