import React, { FC, useMemo } from "react";
import { View, ScrollView } from "react-native";
import Box from "@atoms/box";
import Text from "@atoms/text";
import { AnimatedModal } from "@atoms/modals";
import CheckBox from "@molecules/checkbox";
import { Bottom } from "@molecules/buttons";
import styles from "./styles";
import { RootStateOrAny, useSelector } from "react-redux";
import { isMobile } from "@utils/formatting";
import { MotiView } from "moti";

interface Props {
	visible?: boolean;
	agree?: boolean;
	onClick?: () => void;
	buttonLabel?: string;
	onPress?: () => void;
	disabled?: boolean;
	loading?: boolean;
	onDismiss?: () => void;
}

const TermsAndConditions: FC<Props> = ({
										   visible,
										   agree,
										   onClick = () => {},
										   buttonLabel = "OK",
										   onPress = () => {},
										   disabled,
										   loading,
										   onDismiss = () => {},
									   }) => {
	const stylesMemo = useMemo(() => styles, []);
	const { serviceLayout } = useSelector((state: RootStateOrAny) => state.service);

	return (
		<AnimatedModal
			containerStyle={
				!isMobile
					? {
						width: serviceLayout?.width,
						alignSelf: "center",
					}
					: {}
			}
			onDismiss={onDismiss}
			visible={visible}
		>
			{/* MAIN CONTENT CARD */}
			<MotiView
				style={stylesMemo.contentContainer}
				from={{ opacity: 0, translateY: 32 }}
				animate={{ opacity: 1, translateY: 0 }}
				transition={{
					type: "timing",
					duration: 260,
				}}
			>
				<Box>
					<ScrollView
						style={styles.scroll}
						contentContainerStyle={{ paddingBottom: 8 }}
						contentInsetAdjustmentBehavior="automatic"
						keyboardShouldPersistTaps="handled"
					>
						<Text style={stylesMemo.text}>
							I hereby declare that all the entries are true and correct. Under the Revised
							Penal Code, I shall be held liable for any willful false statement(s) or
							misrepresentation(s) made in this application form that may serve as a valid
							ground for the denial of this application and/or cancellation/revocation of
							the permit issued/granted. Further, I am freely giving full consent for the
							collection and processing of personal information in accordance with Republic
							Act No. 10713,{" "}
							<Text style={styles.coloredText}>Data Privacy Act of 2012</Text>.
						</Text>
					</ScrollView>
				</Box>

				<CheckBox
					style={{ margin: 20 }}
					isChecked={agree}
					onClick={onClick}
					label="I agree to the Terms and Conditions"
					textStyle={stylesMemo.checkboxLabel}
					type="circle"
				/>

				<View style={stylesMemo.bottomView} />
			</MotiView>

			{/* BOTTOM ACTION BUTTON – SLIGHT STAGGER */}
			<MotiView
				from={{ opacity: 0, translateY: 24 }}
				animate={{ opacity: 1, translateY: 0 }}
				transition={{
					type: "timing",
					duration: 240,
					delay: 120,
				}}
			>
				<Bottom
					label={buttonLabel}
					onPress={onPress}
					disabled={disabled}
					loading={loading}
					noShadow
				/>
			</MotiView>
		</AnimatedModal>
	);
};

export default React.memo(TermsAndConditions);
