export const clerkDeepGlassTheme = {
    layout: {
        socialButtonsPlacement: 'bottom' as const,
        socialButtonsVariant: 'iconButton' as const,
    },
    variables: {
        colorPrimary: '#6366f1', // Indigo-500
        colorText: '#e2e8f0', // Slate-200
        colorTextSecondary: '#94a3b8', // Slate-400
        colorBackground: 'transparent',
        colorInputBackground: 'rgba(2, 6, 23, 0.5)', // Slate-950/50
        colorInputText: '#f8fafc', // Slate-50
        colorDanger: '#ef4444', // Red-500
        borderRadius: '0.75rem',
    },
    elements: {
        rootBox: "w-full",
        card: "bg-transparent shadow-none p-0 w-full", // Remove default card to blend with our glass panel
        header: "hidden", // We already have a custom header in the .astro file

        // Inputs
        formFieldLabel: "text-slate-400 font-medium mb-1.5 block",
        formFieldInput: "w-full bg-slate-950/50 border border-white/10 focus:border-indigo-500/50 transition-all text-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500/20",

        // Buttons
        formButtonPrimary: "w-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border-none py-3 rounded-xl font-bold",
        socialButtonsBlockButton: "bg-white/5 border border-white/10 hover:bg-white/10 text-slate-200",

        // Links & Footer
        footerActionLink: "text-indigo-400 hover:text-indigo-300 font-medium",
        footer: "bg-transparent",

        // Divider
        dividerLine: "bg-white/10",
        dividerText: "text-slate-500",

        // Alerts
        alert: "bg-red-500/10 border border-red-500/20 text-red-200",
    }
};
