interface ServicesPortalProps {
    user: {
        name: string;
        email: string;
        avatarUrl?: string;
    } | null;
    onLogout: () => void | Promise<void>;
    onApplySubmit: (serviceTitle: string, data: {
        applicantName: string;
        email: string;
        notes: string;
    }) => Promise<void>;
    isSubmitting: boolean;
}
export declare function ServicesPortal({ user, onLogout, onApplySubmit, isSubmitting, }: ServicesPortalProps): import("react").JSX.Element;
export {};
