interface ServiceFormModalProps {
    visible: boolean;
    serviceTitle: string;
    onClose: () => void;
    onSubmit: (data: {
        applicantName: string;
        email: string;
        notes: string;
    }) => Promise<void>;
    isSubmitting: boolean;
}
export declare function ServiceFormModal({ visible, serviceTitle, onClose, onSubmit, isSubmitting, }: ServiceFormModalProps): import("react").JSX.Element;
export {};
