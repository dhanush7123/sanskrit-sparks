import { useState } from 'react';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { FloatingSanskrit } from '@/components/ui/FloatingSanskrit';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Search, Volume2, Loader2, Sparkles } from 'lucide-react';

const ExplorePage = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleExplore = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);

    const geminiKey = import.meta.env.VITE_GEMINI_API_KEY;

    if (!geminiKey || geminiKey.trim() === '') {
      toast({
        title: 'Configuration Error',
        description: 'Gemini API key is missing. Please check your .env file.',
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    try {
      // Using gemini-flash-latest (stable alias) to avoid rate limits on experimental models
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${geminiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Provide the following for the word or concept: "${query.trim()}".
              
              Format the output exactly as follows:
              
              # ${query.trim()} (Transliteration)
              
              1. **Devanagari:** [The Sanskrit script]
              2. **Etymology:** [Root and basic meaning]
              3. **Cultural Significance:** [Brief explanation of its importance]
              4. **Usage:** [A simple Sanskrit sentence using the word, followed by its English translation]
              
              Keep it concise and follow this structure strictly.`
            }]
          }]
        }),
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error('No result generated');
      }

      setResult(generatedText);
    } catch (error: any) {
      console.error('Saraswati exploration error:', error);
      toast({
        title: "Saraswati is meditating...",
        description: "Could not connect to the wisdom source. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const speakResult = () => {
    if (!result) return;
    // Clean up markdown/formatting for speech
    const textToSpeak = result.replace(/[*#_`]/g, '');
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.9;

    // Try to set a Hindi/Indian voice if available for better Sanskrit pronunciation
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.includes('hi') || v.lang.includes('IN'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen vedic-gradient relative">
      <FloatingSanskrit count={10} />
      <Navbar />

      <div className="pt-32 pb-16 px-4">
        <div className="container mx-auto max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-12">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4" />
            <h1 className="text-4xl md:text-5xl font-cinzel font-bold text-foreground mb-4">Saraswati</h1>
            <p className="font-mukta text-muted-foreground">Enter any word to discover its Sanskrit essence</p>
          </motion.div>

          <div className="talapatra-card p-8 mb-8">
            <div className="relative z-10 flex gap-4">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleExplore()}
                placeholder="Enter a word (e.g., Peace, Knowledge, Love)"
                className="flex-1 bg-background/50"
              />
              <Button onClick={handleExplore} disabled={loading} className="saffron-glow">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              </Button>
            </div>
          </div>

          {result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="talapatra-card p-8">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="font-cinzel text-xl text-secondary">Saraswati's Wisdom</h3>
                  <Button variant="ghost" size="icon" onClick={speakResult}>
                    <Volume2 className="w-5 h-5" />
                  </Button>
                </div>
                <div className="prose prose-stone font-mukta text-foreground whitespace-pre-wrap">{result}</div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
      <Footer variant="simple" />
    </div>
  );
};

export default ExplorePage;
