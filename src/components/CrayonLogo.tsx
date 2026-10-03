import React from 'react';

export const CrayonLogo: React.FC = () => {
  // Letters with authentic multi-colored crayon fills inspired by user's artwork
  const letters = [
    { char: 'C', color: '#E63946', rotation: '-2deg', crayonShape: 'rounded-full' },
    { char: 'u', color: '#FF7844', rotation: '1deg', crayonShape: 'rounded-lg' },
    { char: 'r', color: '#FFBE0B', rotation: '-1deg', crayonShape: 'rounded-md' },
    { char: 'a', color: '#38B000', rotation: '2deg', crayonShape: 'rounded-full' },
    { char: 't', color: '#00B4D8', rotation: '-2deg', crayonShape: 'rounded-sm' },
    { char: 'o', color: '#3A86FF', rotation: '1deg', crayonShape: 'rounded-full' },
    { char: 'r', color: '#8338EC', rotation: '-1deg', crayonShape: 'rounded-md' },
  ];

  return (
    <div className="flex items-center gap-3">
      {/* Handcrafted Crayon + Fountain Pen Wordmark */}
      <div className="flex flex-col">
        <div className="flex items-center gap-0.5">
          {letters.map((item, idx) => (
            <span
              key={idx}
              className="relative inline-block select-none transition-transform hover:scale-110"
              style={{ transform: `rotate(${item.rotation})` }}
            >
              {/* Crayon pastel smudge underneath */}
              <span
                className="absolute inset-0 -inset-x-0.5 my-auto h-5/6 opacity-45 rounded-sm filter blur-[0.5px]"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              {/* Fountain pen ink lettering */}
              <span 
                className="relative font-naive font-bold text-2xl sm:text-3xl text-[#1C1A17] tracking-tight px-0.5"
                style={{
                  textShadow: '0.5px 0.5px 0px rgba(28,26,23,0.3)',
                }}
              >
                {item.char}
              </span>
            </span>
          ))}

          {/* AI Badge in a charming crayon stamp */}
          <span className="ml-1.5 px-2 py-0.5 text-xs font-hand font-bold bg-[#FFD13B] text-[#1C1A17] border-2 border-[#1C1A17] rounded-lg -rotate-3 shadow-doodle-sm">
            AI
          </span>
        </div>

        {/* Naive handwritten editorial kicker */}
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="font-hand text-xs text-[#6B635B] tracking-wide">
            taccuino studi & visual radar
          </span>
          <span className="text-[#E63946] text-[10px] font-bold">●</span>
          <span className="font-typewriter text-[10px] text-[#8C827A]">
            gemini 3.8
          </span>
        </div>
      </div>
    </div>
  );
};
