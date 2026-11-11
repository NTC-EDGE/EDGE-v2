"use client";

import React from "react";
import { FormSchema, LinkedServiceItem } from "../types";
import { ServiceItem, ServiceCategory } from "@/services/catalogService";
import { LinkServiceModal } from "../LinkServiceModal";
import { ConfirmActionDialog } from "@/components/ui/confirm-action-dialog";

export function CanvasDialogs({
  form,
  catalogServices,
  catalogCategories,
  selectedVariant,
  isLinkServiceModalOpen,
  onCloseLinkServiceModal,
  onSaveLinkedServices,
  isResetConfirmOpen,
  onCloseResetConfirm,
  onResetFromBaseForm,
  sectionDeleteTarget,
  onCloseSectionDelete,
  onDeleteField,
}: {
  form: FormSchema;
  catalogServices: ServiceItem[];
  catalogCategories: ServiceCategory[];
  selectedVariant: string;
  isLinkServiceModalOpen: boolean;
  onCloseLinkServiceModal: () => void;
  onSaveLinkedServices: (services: LinkedServiceItem[], variants?: string[]) => void;
  isResetConfirmOpen: boolean;
  onCloseResetConfirm: () => void;
  onResetFromBaseForm?: () => void;
  sectionDeleteTarget: { id: string; title: string; childCount: number } | null;
  onCloseSectionDelete: () => void;
  onDeleteField: (id: string) => void;
}) {
  return (
    <>
      <LinkServiceModal
        isOpen={isLinkServiceModalOpen}
        onClose={onCloseLinkServiceModal}
        form={form}
        catalogServices={catalogServices}
        catalogCategories={catalogCategories}
        onSaveLinkedServices={onSaveLinkedServices}
      />
      <ConfirmActionDialog
        isOpen={isResetConfirmOpen}
        onClose={onCloseResetConfirm}
        title="Reset Variant to Base Form Blueprint"
        description={`Are you sure you want to reset "${selectedVariant}" back to the base form ("${form.name || "Base Form"}")? This will remove any fields added exclusively for "${selectedVariant}" and restore any base sections or fields that were previously hidden for "${selectedVariant}".`}
        confirmLabel="Confirm & Reset Variant"
        cancelLabel="Keep Current View"
        loading={false}
        onConfirm={() => {
          onCloseResetConfirm();
          if (onResetFromBaseForm) onResetFromBaseForm();
        }}
      />
      <ConfirmActionDialog
        isOpen={Boolean(sectionDeleteTarget)}
        onClose={onCloseSectionDelete}
        title={selectedVariant === "ALL" ? "Delete Section" : `Remove Section from "${selectedVariant}"`}
        description={
          sectionDeleteTarget
            ? selectedVariant === "ALL"
              ? `Are you sure you want to delete section "${sectionDeleteTarget.title}" and all ${sectionDeleteTarget.childCount} field(s) inside it from the base form?`
              : `Are you sure you want to remove section "${sectionDeleteTarget.title}" and its ${sectionDeleteTarget.childCount} active field(s) from "${selectedVariant}"? This will hide the section for "${selectedVariant}" while keeping it intact on the shared base form for other service variants.`
            : "Are you sure you want to delete this section?"
        }
        confirmLabel={selectedVariant === "ALL" ? "Delete Section & Fields" : "Remove from This Variant"}
        cancelLabel="Cancel"
        loading={false}
        onConfirm={() => {
          if (sectionDeleteTarget) {
            onDeleteField(sectionDeleteTarget.id);
            onCloseSectionDelete();
          }
        }}
      />
    </>
  );
}
