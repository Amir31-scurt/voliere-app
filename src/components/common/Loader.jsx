export default function Loader({ size = 'md', text = '' }) {
  const sizes = { sm: 'h-5 w-5 border-2', md: 'h-9 w-9 border-[3px]', lg: 'h-14 w-14 border-4' };
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12 px-4">
      <div className={`${sizes[size]} animate-spin rounded-full border-emerald-100 border-t-emerald-500`} />
      {text && (
        <p className="text-sm font-medium text-slate-400" style={{ fontFamily: "'Inter', sans-serif" }}>
          {text}
        </p>
      )}
    </div>
  );
}
