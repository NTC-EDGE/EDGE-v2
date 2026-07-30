import React from "react";
import { StyleSheet, View } from "react-native";
import { UseFormReturn } from "react-hook-form";
import { Button, FormFieldInput } from "@edge/ui";
import { ForgotPasswordResetFormData } from "../schemas/authSchemas";

export interface ForgotPasswordResetFormProps {
  form: UseFormReturn<ForgotPasswordResetFormData>;
  onSubmit: () => void;
  isSubmitting: boolean;
}

export function ForgotPasswordResetForm({
  form,
  onSubmit,
  isSubmitting,
}: ForgotPasswordResetFormProps) {
  return (
    <View style={styles.formBody}>
      <FormFieldInput
        control={form.control}
        name="code"
        label="6-Digit Verification Code"
        placeholder="123456"
        leftIconName="shield"
        keyboardType="number-pad"
        maxLength={6}
      />

      <FormFieldInput
        control={form.control}
        name="newPassword"
        label="New Password"
        placeholder="At least 8 characters"
        leftIconName="lock"
        isPassword={true}
      />

      <FormFieldInput
        control={form.control}
        name="confirmPassword"
        label="Confirm New Password"
        placeholder="Re-enter password"
        leftIconName="lock"
        isPassword={true}
      />

      <Button
        onPress={onSubmit}
        isLoading={isSubmitting}
        isDisabled={isSubmitting}
        variant="primary"
        size="md"
      >
        Update Password
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  formBody: {
    gap: 16,
  },
});
