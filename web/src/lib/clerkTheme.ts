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
        formFieldLabel: "!text-slate-400 font-medium mb-2 block !before:hidden !after:hidden",
        formFieldInput: "!w-full !bg-slate-950/50 !border !border-white/10 focus:!border-indigo-500/50 transition-all !text-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-600",
        formFieldInputShowPasswordButton: "!text-slate-400 hover:!text-slate-200",

        // Buttons
        formButtonPrimary: "!w-full !bg-indigo-600 hover:!bg-indigo-500 !text-white !shadow-lg !shadow-indigo-500/20 !border-none !py-3 rounded-xl font-bold transition-all hover:scale-[1.02] !mt-2",

        // Social Buttons
        socialButtons: "!bg-transparent !w-full !mt-4",
        socialButtonsBlockButton: "!w-full !bg-white/5 !border !border-white/10 hover:!bg-white/10 !text-slate-200 transition-all !h-12 !relative",
        socialButtonsBlockButtonText: "font-medium !text-slate-200",
        socialButtonsProviderIcon: "!opacity-80",

        // Hide the "Last used" badge
        badge: "!hidden",
        identityPreviewText: "!hidden",
        identityPreview: "!hidden",

        // Footer
        footerActionLink: "text-indigo-400 hover:text-indigo-300 font-medium !mt-4",
        footer: "!bg-transparent !mt-6",
        footerPage: "!bg-transparent !shadow-none !p-0",

        // Divider
        dividerRow: "!my-6",
        dividerLine: "!bg-white/10 !h-px",
        dividerText: "text-slate-500 !px-4 !text-sm",

        // Alerts
        alert: "bg-red-500/10 border border-red-500/20 text-red-200 !mt-4",
        alertText: "text-red-200",
    }
};
