import React from 'react';
import { X } from 'lucide-react';
import { Adjective } from '../types';

export const VOCAB_CARD_TEXT: Record<Adjective, string> = {
  sporty:
    'Sporty means that you like to play sport and keep fit, a lot!',
  nerdy:
    'A nerd is someone who really likes one subject a lot (like computers, science, comics, or video games) and spends a lot of time learning about it and talking about it.\n\nSometimes people used to say “nerd” as a mean word, but now it often just means someone who is keen on their favourite things and knows a lot about them.',
  friendly:
    'Friendly means you are kind and happy to meet people. A friendly person smiles, says hello, and likes to make new friends.',
  healthy:
    'Healthy means you look after your body and feel well. You eat good food, drink water, sleep well, and move around a lot.',
  humble:
    'Humble means you are proud of what you can do, but you do not boast. You are happy to share the praise and listen to other people too.',
  calm:
    'Calm means you feel peaceful and do not get upset easily. A calm person takes a deep breath and thinks carefully when something is tricky.',
  kind:
    'Kind means you care about other people and want to help them. A kind person shares, uses gentle words, and thinks about how others feel.',
  naughty:
    'Naughty means you sometimes do things you know you should not, like playing a little trick or not following a rule. It can be funny, but we still try to make good choices.',
  neat:
    'Neat means you keep things tidy and in the right place. A neat person packs their bag carefully and likes things to look clean and organised.',
  shy:
    'Shy means you feel a little nervous around people you do not know well. A shy person may speak quietly or take time to join in, and that is okay.',
  smart:
    'Smart means you think carefully and like to learn new things. A smart person asks good questions and finds clever ways to solve problems.',
};

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

interface VocabCardProps {
  adjective: Adjective;
  onClose: () => void;
}

export const VocabCard: React.FC<VocabCardProps> = ({ adjective, onClose }) => {
  const title = titleCase(adjective);
  const definition = VOCAB_CARD_TEXT[adjective];
  const imgSrc = `./vocab-cards/${adjective}.png`;

  const renderDefinition = () => {
    if (definition.startsWith(title)) {
      return (
        <>
          <span className="text-[#ff5946]">{title}</span>
          {definition.slice(title.length)}
        </>
      );
    }
    return definition;
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3a2e28]/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5"
      onPointerDown={(e) => {
        e.stopPropagation();
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="vocab-card-title"
        className="w-full max-w-lg max-h-[94vh] flex flex-col rounded-[28px] border-[4px] border-[#3a2e28] bg-[#fffaf0] shadow-[0_8px_0_#3a2e28] overflow-hidden"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-3.5 bg-[#ffd93d] border-b-[3px] border-[#3a2e28] shrink-0">
          <h2
            id="vocab-card-title"
            className="text-2xl sm:text-3xl font-bold text-[#ff5946]"
          >
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close vocab card"
            className="w-12 h-12 rounded-2xl border-[3px] border-[#3a2e28] bg-white hover:bg-[#ffe5df] flex items-center justify-center text-[#3a2e28] shrink-0"
          >
            <X className="w-6 h-6 stroke-[3]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <img
            src={imgSrc}
            alt=""
            className="w-full max-w-[340px] mx-auto aspect-square object-contain rounded-3xl border-[3px] border-[#3a2e28] bg-white"
          />
          <p className="text-lg sm:text-xl font-bold text-[#3a2e28] leading-relaxed whitespace-pre-line">
            {renderDefinition()}
          </p>
        </div>
      </div>
    </div>
  );
};
