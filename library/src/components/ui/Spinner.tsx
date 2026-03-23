/*
   https://react.dev/learn/passing-props-to-a-component
*/

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-4 w-4 border-2',
  md: 'h-8 w-8 border-2',
  lg: 'h-12 w-12 border-3',
};

/*
    animate-spin: https://tailwindcss.com/docs/animation
*/
export function Spinner({ size = 'md' }: SpinnerProps) {
  return (
    <div className="flex items-center justify-center py-12">
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-slate-200 border-t-indigo-600`}
      >
      </div>
    </div>
  );
}
