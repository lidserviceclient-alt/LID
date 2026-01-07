import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-neutral-900 text-white hover:bg-neutral-800',
  secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200',
  outline: 'border border-neutral-200 bg-white hover:bg-neutral-100 text-neutral-900',
  ghost: 'hover:bg-neutral-100 text-neutral-900',
  link: 'text-neutral-900 underline-offset-4 hover:underline',
  danger: 'bg-red-500 text-white hover:bg-red-600',
};

const sizesX = {
  '0': 'px-0',
  '1': 'px-1',
  '2': 'px-2',
  '3': 'px-3',
  '4': 'px-4',
  '5': 'px-5',
  '6': 'px-6',
  '8': 'px-8',
  '10': 'px-10',
  '12': 'px-12',
};

const sizesY = {
  '0': 'py-0',
  '1': 'py-1',
  '2': 'py-2',
  '3': 'py-3',
  '4': 'py-4',
  '5': 'py-5',
  '6': 'py-6',
  '8': 'py-8',
};

export default function Button({
  children,
  type = 'button',
  bg = 'primary', // mapping to variant
  variant, // alternative prop name
  sizeX,
  sizeY,
  disabled = false,
  onClick,
  className = '',
}) {
  const selectedVariant = variant || bg;
  const variantClass = variants[selectedVariant] || variants.primary;
  
  // Resolve padding classes
  const pxClass = sizeX ? sizesX[sizeX] : 'px-4';
  const pyClass = sizeY ? sizesY[sizeY] : 'py-2';

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-neutral-950 disabled:pointer-events-none disabled:opacity-50',
        variantClass,
        pxClass,
        pyClass,
        className
      )}
    >
      {children}
    </button>
  )
}
