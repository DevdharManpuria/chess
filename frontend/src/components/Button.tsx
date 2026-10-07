export const Button = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => {
    return (
        <button
            onClick={onClick}
            className="px-7 py-3.5 text-lg font-medium tracking-wide rounded-lg bg-emerald-400 text-emerald-950 shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_10px_30px_-10px_rgba(16,185,129,0.8)] hover:bg-emerald-300 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_14px_36px_-10px_rgba(16,185,129,1)] active:scale-[0.98] transition-[background-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0a0a]"        >
            {children}
        </button>
    );
};