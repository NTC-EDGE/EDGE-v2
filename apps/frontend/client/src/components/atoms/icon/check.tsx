import React, { FC } from "react";
import { MotiView } from "moti";
import {
    Check as CheckIcon,
    CheckCircle,
    CheckCircle2,
    CheckSquare,
} from "lucide-react-native";
import { RNValue as RFValue } from "@utils/formatting";

interface Props {
    type?: "circle" | "block-circle" | "square";
    size?: number;
    color?: string;
    active?: boolean;      // when true → animate in
    [x: string]: any;
}

const Check: FC<Props> = ({
                                      type = "",
                                      size = 24,
                                      color = "#000",
                                      active = true,
                                      ...otherProps
                                  }) => {
    const iconProps = {
        size: RFValue(size),
        color,
        strokeWidth: 2,
        ...otherProps,
    };

    const renderIcon = () => {
        switch (type) {
            case "circle":
                return <CheckCircle {...iconProps} />;
            case "block-circle":
                return <CheckCircle2 {...iconProps} />;
            case "square":
                return <CheckSquare {...iconProps} />;
            default:
                return <CheckIcon {...iconProps} />;
        }
    };

    return (
        <MotiView
            from={{
                scale: active ? 0 : 1,
                opacity: active ? 0 : 1,
                rotateZ: active ? "0deg" : "0deg",
            }}
            animate={{
                scale: active ? 1 : 1,
                opacity: active ? 1 : 0.5,
                rotateZ: active ? "0deg" : "0deg",
            }}
            transition={{
                type: "spring",
                damping: 14,
                stiffness: 200,
            }}
        >
            {renderIcon()}
        </MotiView>
    );
};

export default React.memo(Check);
