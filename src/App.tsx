import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Loader2, Video, FileText, CheckCircle2, ArrowLeft, Sparkles, X, Settings } from 'lucide-react';
import { generateHooks, generateScript } from './services/gemini';
import Markdown from 'react-markdown';

const CATEGORIES = [
  "Trái cây", "Rau củ quả", "Thực phẩm tươi sống", "Nội tạng & cơ thể",
  "Gia đình", "Con vật", "Đồ vật", "Màu sắc", "Ngày tháng", "Số đếm"
];

export default function App() {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [hooks, setHooks] = useState<string[]>([]);
  const [hook, setHook] = useState('');
  const [scriptData, setScriptData] = useState<any>(null);
  const [scenesCount, setScenesCount] = useState<number>(3);
  const [gender, setGender] = useState<'boy' | 'girl'>('boy');
  
  const [image, setImage] = useState<{ base64: string; mimeType: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({
          base64: reader.result as string,
          mimeType: file.type
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCategorySelect = async (cat: string) => {
    setCategory(cat);
    setIsLoading(true);
    setError('');
    try {
      const result = await generateHooks(cat);
      setHooks(result);
      setStep(2);
    } catch (err: any) {
      setError(err.message || 'Failed to generate hooks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleHookSelect = async (h: string) => {
    setHook(h);
    setIsLoading(true);
    setError('');
    try {
      const result = await generateScript(category, h, scenesCount, gender, image?.base64, image?.mimeType);
      setScriptData(result);
      setStep(3);
    } catch (err: any) {
      setError(err.message || 'Failed to generate script');
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setStep(1);
    setCategory('');
    setHooks([]);
    setHook('');
    setScriptData(null);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6 flex flex-col shrink-0">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg leading-tight">AI Kids Studio</h1>
            <p className="text-xs text-slate-500 font-medium">Content Generator</p>
          </div>
        </div>

        <div className="space-y-6 flex-1">
          <StepIndicator currentStep={step} stepNum={1} title="Category" desc={category || "Select main topic"} />
          <StepIndicator currentStep={step} stepNum={2} title="Hook" desc={hook ? "Hook selected" : "Pick a viral hook"} />
          <StepIndicator currentStep={step} stepNum={3} title="Script" desc={scriptData ? "Ready to produce" : "Generate script"} />
        </div>

        {/* Settings Area */}
        <div className="mt-8 pt-6 border-t border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <Settings size={14} className="text-slate-400" />
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Settings</h3>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Number of Scenes</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setScenesCount(3)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${scenesCount === 3 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                3 Scenes
              </button>
              <button 
                onClick={() => setScenesCount(4)}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${scenesCount === 4 ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                4 Scenes
              </button>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-slate-700 mb-2">Child's Gender</label>
            <div className="flex bg-slate-100 p-1 rounded-lg">
              <button 
                onClick={() => setGender('boy')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${gender === 'boy' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Bé trai
              </button>
              <button 
                onClick={() => setGender('girl')}
                className={`flex-1 py-1.5 text-sm font-medium rounded-md transition-colors ${gender === 'girl' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Bé gái
              </button>
            </div>
          </div>
        </div>

        {/* Image Upload Area */}
        <div className="mt-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">Reference Image (Optional)</h3>
          {image ? (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 group">
              <img src={image.base64} alt="Reference" className="w-full h-32 object-cover" referrerPolicy="no-referrer" />
              <button 
                onClick={() => setImage(null)}
                className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-6 h-6 text-slate-400 mb-2" />
                <p className="text-xs text-slate-500"><span className="font-semibold">Click to upload</span></p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-slate-50 h-screen overflow-y-auto relative">
        <div className="max-w-4xl mx-auto p-8 md:p-12">
          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
              {error}
            </div>
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-[60vh]"
              >
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                <h2 className="text-xl font-display font-semibold text-slate-800">Generating AI Magic...</h2>
                <p className="text-slate-500 mt-2">This might take a few seconds.</p>
              </motion.div>
            ) : (
              <motion.div
                key={`step-${step}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {step === 1 && (
                  <div>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Select Main Category</h2>
                    <p className="text-slate-500 mb-8">Choose a broad topic to start generating content ideas.</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat}
                          onClick={() => handleCategorySelect(cat)}
                          className="p-6 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 hover:ring-1 hover:ring-indigo-300 transition-all text-left flex flex-col items-start group"
                        >
                          <span className="font-semibold text-slate-800 group-hover:text-indigo-700">{cat}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 2 && (
                  <div>
                    <button onClick={() => setStep(1)} className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-6 transition-colors">
                      <ArrowLeft size={16} className="mr-1" /> Back to Categories
                    </button>
                    <h2 className="text-3xl font-display font-bold text-slate-900 mb-2">Select a Viral Hook</h2>
                    <p className="text-slate-500 mb-8">Choose one of these 50 hooks for "{category}".</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {hooks.map((h, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleHookSelect(h)}
                          className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all text-left flex gap-4 group"
                        >
                          <span className="text-indigo-300 font-mono font-bold text-lg group-hover:text-indigo-500">{(idx + 1).toString().padStart(2, '0')}</span>
                          <span className="text-slate-700 font-medium leading-snug group-hover:text-slate-900">{h}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {step === 3 && scriptData && (
                  <div>
                    <div className="flex items-center justify-between mb-8">
                      <div>
                        <button onClick={() => setStep(2)} className="flex items-center text-sm text-slate-500 hover:text-slate-800 mb-2 transition-colors">
                          <ArrowLeft size={16} className="mr-1" /> Back to Hooks
                        </button>
                        <h2 className="text-3xl font-display font-bold text-slate-900">Final Script & Assets</h2>
                      </div>
                      <button onClick={reset} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                        Start Over
                      </button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Human Readable */}
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:p-8">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                          <FileText className="text-indigo-600" size={24} />
                          <h3 className="text-xl font-display font-semibold">Director's Script</h3>
                        </div>
                        <div className="markdown-body text-sm text-slate-700">
                          <Markdown>{scriptData.human_readable}</Markdown>
                        </div>
                      </div>

                      {/* JSON Data */}
                      <div className="bg-slate-900 rounded-2xl shadow-xl p-6 lg:p-8 overflow-hidden flex flex-col">
                        <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
                          <Video className="text-emerald-400" size={24} />
                          <h3 className="text-xl font-display font-semibold text-white">Production JSON</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto custom-scrollbar">
                          <pre className="text-xs font-mono text-emerald-300 whitespace-pre-wrap">
                            {JSON.stringify(scriptData.json_data, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function StepIndicator({ currentStep, stepNum, title, desc }: { currentStep: number, stepNum: number, title: string, desc: string }) {
  const isActive = currentStep === stepNum;
  const isPast = currentStep > stepNum;
  
  return (
    <div className="flex gap-4">
      <div className="relative flex flex-col items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold z-10 transition-colors ${
          isActive ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' : 
          isPast ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
        }`}>
          {isPast ? <CheckCircle2 size={16} /> : stepNum}
        </div>
        {stepNum < 3 && (
          <div className={`w-0.5 h-full absolute top-8 ${isPast ? 'bg-emerald-500' : 'bg-slate-100'}`} />
        )}
      </div>
      <div className="pb-8">
        <h3 className={`font-semibold ${isActive ? 'text-indigo-900' : isPast ? 'text-slate-900' : 'text-slate-400'}`}>{title}</h3>
        <p className={`text-sm ${isActive ? 'text-indigo-600' : 'text-slate-500'} line-clamp-1`}>{desc}</p>
      </div>
    </div>
  );
}
