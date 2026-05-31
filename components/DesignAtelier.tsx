import React, { useState } from 'react';
import { Wand2, Download, Share2, Loader2, Image as ImageIcon, Sparkles } from 'lucide-react';
import { generateLuxuryConcept } from '../services/gemini';

export const DesignAtelier: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Gold Gradient Classes
  const goldText = "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500";
  const goldGradient = "bg-gradient-to-r from-emerald-400 via-emerald-500 to-green-500";

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;
    
    setIsGenerating(true);
    setGeneratedImage(null);
    
    const imageBase64 = await generateLuxuryConcept(prompt);
    
    setGeneratedImage(imageBase64);
    setIsGenerating(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in duration-700">
      {/* Controls Section */}
      <div className="space-y-8">
        <div>
          <h2 className="text-4xl font-serif mb-4 text-slate-800 dark:text-white">The Atelier</h2>
          <p className="text-slate-600 dark:text-gray-400 leading-relaxed border-l-2 border-[#10B981]/30 pl-4">
            Visualize your own luxury concepts. Describe a packaging idea, a uniform detail, or an architectural feature, and let our AI artisan sketch it for you in our signature style.
          </p>
        </div>

        <div className="space-y-4">
          <label className="text-[10px] uppercase tracking-widest font-bold text-[#10B981]">Vision Description</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="E.g. A matte black perfume bottle with gold filigree geometry, sitting on black sand..."
            className="w-full h-32 bg-white dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/10 rounded-2xl p-6 text-slate-800 dark:text-white focus:outline-none focus:border-[#10B981] focus:ring-1 focus:ring-[#10B981]/50 transition-all resize-none placeholder-slate-400 dark:placeholder-gray-700 shadow-sm"
          />
          
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className={`w-full py-4 rounded-xl font-bold tracking-widest uppercase text-xs flex items-center justify-center gap-3 transition-all ${
              isGenerating || !prompt.trim() 
                ? 'bg-slate-100 text-slate-400 dark:bg-white/5 dark:text-gray-500 cursor-not-allowed border border-slate-200 dark:border-transparent' 
                : 'hover:opacity-90 active:scale-95 text-white dark:text-black font-extrabold shadow-md'
            }`}
            style={{ 
              background: isGenerating || !prompt.trim() ? '' : 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
            }}
          >
            {isGenerating ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Crafting Vision...
              </>
            ) : (
              <>
                <Wand2 size={16} />
                Materialize Concept
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {['Black velvet shopping bag', 'Golden architectural facade', 'Silk uniform with gold embroidery'].map((suggestion, i) => (
             <button
                key={i}
                onClick={() => setPrompt(suggestion)}
                className="text-left p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 hover:border-[#10B981]/30 hover:bg-slate-100 dark:hover:bg-white/10 transition-all text-xs text-slate-500 dark:text-gray-400 hover:text-[#10B981] shadow-xs"
             >
                "{suggestion}"
             </button>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="relative aspect-square rounded-[2rem] bg-slate-50 dark:bg-[#0d0d0d] border border-slate-200 dark:border-white/10 overflow-hidden flex items-center justify-center group shadow-md dark:shadow-none">
         {/* Background Pattern */}
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
         
         {generatedImage ? (
           <div className="relative w-full h-full p-2 animate-in zoom-in duration-500">
             <div className="w-full h-full rounded-[1.5rem] overflow-hidden relative shadow-2xl">
                <img 
                  src={generatedImage} 
                  alt="Generated Concept" 
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" 
                />
                {/* Overlay UI */}
                <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div>
                      <p className={`text-[10px] uppercase tracking-widest font-bold ${goldText}`}>AI Generated</p>
                      <p className="text-white/60 text-xs mt-1 truncate max-w-[200px]">{prompt}</p>
                   </div>
                   <button className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-md transition-colors">
                      <Download size={16} />
                   </button>
                </div>
             </div>
           </div>
         ) : (
           <div className="text-center p-12 opacity-30 select-none">
             <div className="w-24 h-24 rounded-full border-2 border-dashed border-slate-300 dark:border-white/20 flex items-center justify-center mx-auto mb-6 text-slate-600 dark:text-white">
                <ImageIcon size={32} />
             </div>
             <p className="text-sm tracking-widest uppercase text-slate-800 dark:text-white font-bold">Canvas Empty</p>
             <p className="text-xs mt-2 text-slate-500 dark:text-gray-450">Your vision awaits visualization</p>
           </div>
         )}
         
         {/* Loading Overlay */}
         {isGenerating && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-20">
               <div className="relative">
                  <div className="w-16 h-16 rounded-full border-2 border-[#10B981]/20 border-t-[#10B981] animate-spin"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                     <Sparkles size={16} className="text-[#10B981] animate-pulse" />
                  </div>
               </div>
               <p className={`mt-6 text-xs uppercase tracking-[0.3em] ${goldText} font-bold animate-pulse`}>Rendering Luxury</p>
            </div>
         )}
      </div>
    </div>
  );
};