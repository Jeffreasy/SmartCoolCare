export const clerkDeepGlassTheme = {
    layout: {
        socialButtonsPlacement: 'bottom' as const,
        socialButtonsVariant: 'iconButton' as const,
    },
    variables: {
        colorPrimary: '#6366f1',
        colorText: '#e2e8f0',
        colorTextSecondary: '#94a3b8',
        colorBackground: 'transparent',
        colorInputBackground: 'rgba(2, 6, 23, 0.5)',
        colorInputText: '#f8fafc',
        colorDanger: '#ef4444',
        borderRadius: '0.75rem',
    },
    elements: {
        // Root and Containers - FORCE FULL WIDTH
        rootBox: "!w-full !max-w-none",
        card: "!bg-transparent !shadow-none !p-0 !w-full !max-w-none",
        cardBox: "!w-full !max-w-none",
        main: "!bg-transparent gap-6 !w-full !max-w-none",

        // Form - Better spacing and full width
        form: "gap-6 !w-full !max-w-none",
        formFieldRow: "gap-4 !w-full !max-w-none",

        // Input Fields - Remove artifacts by hiding pseudo-elements
        formFieldLabel: "!text-muted-foreground font-medium mb-2 block !before:hidden !after:hidden",
        formFieldInput: "!w-full !bg-input !border !border-border focus:!border-primary/50 transition-all !text-foreground rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground",
        formFieldInputShowPasswordButton: "!text-muted-foreground hover:!text-foreground",

        // Buttons
        formButtonPrimary: "!w-full !bg-primary hover:!bg-primary/90 !text-primary-foreground !shadow-lg !shadow-primary/20 !border-none !py-3 rounded-xl font-bold transition-all hover:scale-[1.02] !mt-2",

        // Social Buttons
        socialButtons: "!bg-transparent !w-full !mt-4",
        socialButtonsBlockButton: "!w-full !bg-secondary !border !border-border hover:!bg-secondary/80 !text-foreground transition-all !h-12 !relative",
        socialButtonsBlockButtonText: "font-medium !text-foreground",
        socialButtonsProviderIcon: "!opacity-80",

        // Hide the "Last used" badge
        badge: "!hidden",
        identityPreviewText: "!hidden",
        identityPreview: "!hidden",

        // Footer
        footerActionLink: "text-brand-primary hover:text-brand-primary/80 font-medium !mt-4",
        footer: "!bg-transparent !mt-6",
        footerPage: "!bg-transparent !shadow-none !p-0",

        // Divider
        dividerRow: "!my-6",
        dividerLine: "!bg-border !h-px",
        dividerText: "text-muted-foreground !px-4 !text-sm",

        // Alerts
        alert: "bg-status-error/10 border border-status-error/20 text-status-offline !mt-4",
        alertText: "text-status-offline",
    }
};
