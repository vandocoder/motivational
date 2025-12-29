import { useState, useEffect } from 'react';
import { Sparkles, Key, Zap, Clock } from 'lucide-react';
import { supabase } from './lib/supabase';

interface HistoryItem {
  id: string;
  word: string;
  phrases: string;
  created_at: string;
}

function App() {
  const [apiKey, setApiKey] = useState('');
  const [word, setWord] = useState('');
  const [generatedPhrases, setGeneratedPhrases] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    const { data, error } = await supabase
      .from('motivational_phrases')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (data) {
      setHistory(data);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setGeneratedPhrases('');
    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-motivation`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ word, apiKey }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate phrases');
      }

      setGeneratedPhrases(data.phrases);

      await supabase
        .from('motivational_phrases')
        .insert([{ word, phrases: data.phrases }]);

      loadHistory();
      setWord('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Sparkles className="w-12 h-12 text-blue-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Motivational Phrase Generator
          </h1>
          <p className="text-lg text-gray-600">
            Transform any word into inspiring motivation powered by AI
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <form onSubmit={handleGenerate} className="space-y-6">
            <div>
              <label htmlFor="apiKey" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Key className="w-4 h-4 mr-2" />
                Gemini API Key
              </label>
              <input
                type="password"
                id="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your Gemini API key"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
              <p className="mt-2 text-xs text-gray-500">
                Get your API key from{' '}
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  Google AI Studio
                </a>
              </p>
            </div>

            <div>
              <label htmlFor="word" className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Zap className="w-4 h-4 mr-2" />
                Your Word
              </label>
              <input
                type="text"
                id="word"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="e.g., success, happiness, courage"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Generating...
                </span>
              ) : (
                'Generate Motivation'
              )}
            </button>
          </form>

          {generatedPhrases && (
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Sparkles className="w-5 h-5 mr-2 text-blue-600" />
                Your Motivational Phrases
              </h3>
              <div className="space-y-3">
                {generatedPhrases.split('\n').filter(phrase => phrase.trim()).map((phrase, index) => (
                  <p key={index} className="text-gray-800 leading-relaxed pl-4 border-l-4 border-blue-500">
                    {phrase.trim()}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <Clock className="w-6 h-6 mr-2 text-gray-600" />
              Recent History
            </h2>
            <div className="space-y-4">
              {history.map((item) => (
                <div key={item.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-blue-600 text-lg">
                      {item.word}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm text-gray-700">
                    {item.phrases.split('\n').filter(phrase => phrase.trim()).map((phrase, index) => (
                      <p key={index} className="pl-3 border-l-2 border-gray-300">
                        {phrase.trim()}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
