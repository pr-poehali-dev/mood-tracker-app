import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';

interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  emotions: string;
  memory: string;
}

const Home = () => {
  const [isFormAvailable, setIsFormAvailable] = useState(false);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [mood, setMood] = useState('');
  const [emotions, setEmotions] = useState('');
  const [memory, setMemory] = useState('');

  const moods = [
    { emoji: '😊', label: 'Радостное', value: 'happy' },
    { emoji: '😌', label: 'Спокойное', value: 'calm' },
    { emoji: '😔', label: 'Грустное', value: 'sad' },
    { emoji: '😰', label: 'Тревожное', value: 'anxious' },
    { emoji: '😤', label: 'Раздражённое', value: 'angry' },
  ];

  useEffect(() => {
    checkTimeAndSubmission();
    const interval = setInterval(checkTimeAndSubmission, 60000);
    return () => clearInterval(interval);
  }, []);

  const checkTimeAndSubmission = () => {
    const now = new Date();
    const hours = now.getHours();
    const isAvailable = hours >= 18 && hours <= 23;
    setIsFormAvailable(isAvailable);

    const today = now.toISOString().split('T')[0];
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    const todayEntry = entries.find((entry: MoodEntry) => entry.date === today);
    setHasSubmittedToday(!!todayEntry);
  };

  const handleSubmit = () => {
    if (!mood || !emotions.trim() || !memory.trim()) {
      alert('Пожалуйста, заполни все поля');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    
    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      date: today,
      mood,
      emotions,
      memory,
    };

    const updatedEntries = [...entries, newEntry];
    localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));

    setHasSubmittedToday(true);
    setMood('');
    setEmotions('');
    setMemory('');
  };

  if (!isFormAvailable) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6 pb-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <Card className="max-w-md w-full p-8 text-center animate-fade-in">
            <Icon name="Clock" size={48} className="mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-medium mb-3 text-gray-800">Форма пока недоступна</h2>
            <p className="text-gray-600 leading-relaxed">
              Возвращайся с 18:00 до 23:59, чтобы записать свои эмоции за день
            </p>
          </Card>
        </div>
        <Navigation />
      </>
    );
  }

  if (hasSubmittedToday) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6 pb-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <Card className="max-w-md w-full p-8 text-center animate-fade-in">
            <Icon name="CheckCircle2" size={48} className="mx-auto mb-4 text-green-400" />
            <h2 className="text-2xl font-medium mb-3 text-gray-800">Запись сохранена</h2>
            <p className="text-gray-600 leading-relaxed">
              Спасибо! Ты уже заполнила форму сегодня. Возвращайся завтра, чтобы записать новые эмоции
            </p>
          </Card>
        </div>
        <Navigation />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen p-6 pb-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-medium mb-3 text-gray-800">Как прошёл твой день?</h1>
          <p className="text-gray-600">Поделись своими эмоциями и воспоминаниями</p>
        </div>

        <Card className="p-8 space-y-8">
          <div>
            <label className="block text-lg font-medium mb-4 text-gray-800">
              Какое сегодня настроение?
            </label>
            <div className="grid grid-cols-5 gap-3">
              {moods.map((item) => (
                <button
                  key={item.value}
                  onClick={() => setMood(item.value)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-200 hover:scale-105 ${
                    mood === item.value
                      ? 'border-purple-400 bg-purple-50 shadow-md'
                      : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                >
                  <div className="text-3xl mb-2">{item.emoji}</div>
                  <div className="text-xs text-gray-600">{item.label}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-lg font-medium mb-4 text-gray-800">
              Какие эмоции отслеживались в течение дня?
            </label>
            <Textarea
              value={emotions}
              onChange={(e) => setEmotions(e.target.value)}
              placeholder="Радость, спокойствие, волнение, грусть..."
              className="min-h-[120px] text-base resize-none border-gray-200 focus:border-purple-300 rounded-2xl"
            />
          </div>

          <div>
            <label className="block text-lg font-medium mb-4 text-gray-800">
              Что бы ты сегодня хотела запомнить?
            </label>
            <Textarea
              value={memory}
              onChange={(e) => setMemory(e.target.value)}
              placeholder="Запиши момент, который хочешь сохранить..."
              className="min-h-[120px] text-base resize-none border-gray-200 focus:border-purple-300 rounded-2xl"
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full h-12 text-base rounded-2xl bg-gradient-to-r from-purple-400 to-pink-400 hover:from-purple-500 hover:to-pink-500 transition-all duration-200 hover-scale"
          >
            Сохранить запись
          </Button>
        </Card>
        </div>
      </div>
      <Navigation />
    </>
  );
};

export default Home;