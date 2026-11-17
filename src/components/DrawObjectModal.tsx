import React, { useState } from 'react';
import { Pencil, Sparkles, X } from 'lucide-react';
import { DrawnObject } from '../types';
import { DrawingCanvas } from './DrawingCanvas';

interface DrawObjectModalProps {
  isOpen: boolean;
  existingObjects: DrawnObject[];
  onClose: () => void;
  onAddNewObject: (obj: DrawnObject) => void;
  onReuseObject: (obj: DrawnObject) => void;
}

export const DrawObjectModal: React.FC<DrawObjectModalProps> = ({
  isOpen,
  existingObjects,
  onClose,
  onAddNewObject,
  onReuseObject,
}) => {
  const [label, setLabel] = useState('');

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3a2e28]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onPointerDown={(e) => e.stopPropagation()}
    >
      <div className="w-full max-w-3xl max-h-[94vh] flex flex-col rounded-[28px] border-[4px] border-[#3a2e28] bg-[#fffaf0] shadow-[0_8px_0_#3a2e28] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#4ade80] border-b-[3px] border-[#3a2e28] shrink-0">
          <div className="flex items-center gap-2.5">
            <Pencil className="w-6 h-6 text-[#3a2e28]" />
            <h2 className="text-xl sm:text-2xl font-bold text-[#3a2e28]">
              Draw an Object or Thing!
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close object drawing modal"
            className="w-12 h-12 rounded-2xl border-[3px] border-[#3a2e28] bg-white hover:bg-[#ffe5df] flex items-center justify-center text-[#3a2e28]"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {existingObjects.length > 0 && (
            <div className="rounded-3xl border-[3px] border-[#3a2e28] bg-[#fff4dd] p-3 space-y-2">
              <div className="text-sm font-bold text-[#3a2e28] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#ff5946]" />
                <span>Tap one of your drawings to add it again:</span>
              </div>
              <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar pb-1">
                {existingObjects.map((obj) => (
                  <button
                    key={obj.id}
                    type="button"
                    onClick={() => onReuseObject(obj)}
                    className="shrink-0 rounded-2xl border-[2.5px] border-[#3a2e28] bg-white hover:bg-[#fff0c2] px-3 py-2 flex flex-col items-center gap-1 min-w-[84px] active:scale-95 transition-transform"
                  >
                    <img
                      src={obj.dataUrl}
                      alt={obj.name}
                      className="w-14 h-14 object-contain"
                    />
                    <span className="text-xs font-bold text-[#3a2e28] max-w-[80px] truncate">
                      {obj.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-2xl border-[2.5px] border-[#3a2e28] bg-[#fff4dd] px-3.5 py-2.5">
            <label className="text-sm sm:text-base font-bold text-[#3a2e28] shrink-0">
              What are you drawing?
            </label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Dog, Ball, Tree, Ice Cream..."
              className="flex-1 min-h-[44px] px-3 rounded-xl border-2 border-[#3a2e28] bg-white text-base font-bold text-[#3a2e28] focus:outline-none focus:ring-4 focus:ring-[#ffd93d]"
            />
          </div>

          <DrawingCanvas
            mode="object"
            exportLabel="Put on Page!"
            onCancel={onClose}
            onExport={(dataUrl, dims) => {
              const newObj: DrawnObject = {
                id: `obj-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                name: label.trim() || 'My Drawing',
                dataUrl,
                width: dims.width,
                height: dims.height,
              };
              setLabel('');
              onAddNewObject(newObj);
            }}
          />
        </div>
      </div>
    </div>
  );
};
