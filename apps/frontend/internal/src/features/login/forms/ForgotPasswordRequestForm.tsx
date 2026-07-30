import React from "react";
import { StyleSheet, View } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { Button, FormFieldInput } from "@edge/ui";
import { ForgotPasswordRequestFormData } from "../schemas/authSchemas";

export interface ForgotPasswordRequestFormProps {
  form: UseFormReturn<ForgotPasswordRequestFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ForgotPasswordRequestForm({
  form,
  onSubmit,
  isSubmitting,
}: ForgotPasswordRequestFormProps) {
  return (
    <View style={styles.formBody}>
      <FormFieldInput
        control={form.control}
        name="email"
        label="Staff Email Address"
        placeholder="staff@ntc.gov.ph"
        leftIconName="mail"
        keyboardType="email-address"
      />

      <Button
        onPress={onSubmit}
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
        variant="primary"
        size="md"
      >
        Send Reset Code
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  formBody: {
    gap: 16,
  },
});
