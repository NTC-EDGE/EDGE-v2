import React from "react";
import { View, Text, ScrollView, Linking } from "react-native";
import styles from "./../styles";
import MotiSection from "@pages/homepage/tab-navigation/MotiSection";

interface ApplicationDetailProps { item: any }

const ApplicationDetail: React.FC<ApplicationDetailProps> = ({ item }) => {
    const { service, applicant } = item;

    const basic = service?.basic;
    const appType = service?.applicationType;
    const region = service?.region;
    const employment = service?.employment;
    const examSeminar = service?.examSeminar;

    const fullName = [basic?.firstName, basic?.middleName, basic?.lastName].filter(Boolean).join(" ");
    const address = applicant?.address;
    const contact = applicant?.contact;
    const requirements = appType?.requirements ?? [];

    return (
        <ScrollView style={styles.detailContainer} contentContainerStyle={{ paddingBottom: 40 }}>

            {/* Header — always visible */}
            <View style={styles.detailHeader}>
                <Text style={styles.detailTitle}>{service?.name}</Text>
                <Text style={styles.detailSubtitle}>{appType?.label} {appType?.element && `(${appType?.element})`}</Text>
            </View>



        </ScrollView>
    );
};

export default ApplicationDetail;
