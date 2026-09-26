import React from 'react';

export default function LoadingSpinner({ size = 'md', text = 'Loading...' }) {
  const sizeMap = {
    sm: 'w-4 h-4 border-2',
    md: 'w-7 h-7 border-2',
    lg: 'w-10 h-10 border-3',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <div
        className={`${sizeMap[size] || sizeMap.md} border-slate-200 border-t-blue-700 rounded-full animate-spin`}
      />
      {text && <p className="text-xs text-slate-500 font-medium">{text}</p>}
    </div>
  );
}
