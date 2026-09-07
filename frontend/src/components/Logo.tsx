interface LogoProps {
  size?: 'sm' | 'md' | 'lg'
  showWordmark?: boolean
  className?: string
}

const sizeMap = {
  sm: { box: 28, text: 'text-base', gap: 'gap-2' },
  md: { box: 36, text: 'text-lg', gap: 'gap-2.5' },
  lg: { box: 56, text: 'text-2xl', gap: 'gap-3' },
}

export function Logo({ size = 'md', showWordmark = true, className = '' }: LogoProps) {
  const { box, text, gap } = sizeMap[size]

  return (
    <div className={`flex items-center ${gap} ${className}`}>
      <svg
        width={box}
        height={box}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
        aria-hidden="true"
      >
        <rect width="40" height="40" rx="10" className="fill-slate-900 dark:fill-slate-100" />
        <path
          d="M20 9L31 15V17H9V15L20 9Z"
          className="fill-white dark:fill-slate-900"
        />
        <rect x="11" y="19" width="3" height="10" className="fill-white dark:fill-slate-900" />
        <rect x="18.5" y="19" width="3" height="10" className="fill-white dark:fill-slate-900" />
        <rect x="26" y="19" width="3" height="10" className="fill-white dark:fill-slate-900" />
        <rect x="9" y="30" width="22" height="2.5" rx="1" className="fill-white dark:fill-slate-900" />
      </svg>
      {showWordmark && (
        <span className={`${text} font-semibold tracking-tight text-slate-900 dark:text-slate-100`}>
          Smart<span className="text-slate-400 dark:text-slate-500">Bank</span>
        </span>
      )}
    </div>
  )
}
