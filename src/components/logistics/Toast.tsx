import { useEffect } from 'react';

interface ToastProps {
  message: string;
  type: 'info' | 'ok' | 'warn' | 'err';
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, type, visible, onHide }: ToastProps) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 3000);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  const borderColor = type === 'ok' ? 'border-hq-green' : type === 'warn' ? 'border-hq-amber' : type === 'err' ? 'border-hq-red' : 'border-hq-cyan';

  return (
    <div
      className={`fixed bottom-5 right-5 bg-hq-card2 border ${borderColor} border-l-[3px] text-hq-txt px-4 py-3 text-[12px] z-[10000] max-w-[300px] transition-transform duration-300 ${visible ? 'translate-x-0' : 'translate-x-[120%]'}`}
    >
      {message}
    </div>
  );
}
