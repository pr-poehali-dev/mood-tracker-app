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
  const [isEditing, setIsEditing] = useState(false);
  const [todayEntryId, setTodayEntryId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  const moods = [
    { emoji: '😊', label: 'Радостное', value: 'happy' },
    { emoji: '😌', label: 'Спокойное', value: 'calm' },
    { emoji: '😔', label: 'Грустное', value: 'sad' },
    { emoji: '😰', label: 'Тревожное', value: 'anxious' },
    { emoji: '😤', label: 'Раздражённое', value: 'angry' },
  ];

  useEffect(() => {
    initializeTestData();
    checkTimeAndSubmission();
    checkNotificationPermission();
    const interval = setInterval(checkTimeAndSubmission, 60000);
    return () => clearInterval(interval);
  }, []);

  const initializeTestData = () => {
    const existingEntries = localStorage.getItem('moodEntries');
    if (!existingEntries || JSON.parse(existingEntries).length === 0) {
      const testEntries: MoodEntry[] = [
        {
          id: '1',
          date: '2024-12-01',
          mood: 'happy',
          emotions: 'Радость, вдохновение, энтузиазм',
          memory: 'Начала новый проект, который долго планировала. Чувствую огромное волнение и предвкушение!',
        },
        {
          id: '2',
          date: '2024-12-02',
          mood: 'calm',
          emotions: 'Спокойствие, удовлетворённость, гармония',
          memory: 'Провела весь вечер за книгой с чаем. Такое умиротворённое состояние.',
        },
        {
          id: '3',
          date: '2024-12-03',
          mood: 'anxious',
          emotions: 'Тревога, беспокойство, напряжение',
          memory: 'Предстоит важная встреча завтра. Немного волнуюсь, но готовлюсь как могу.',
        },
        {
          id: '4',
          date: '2024-12-04',
          mood: 'happy',
          emotions: 'Воодушевление, радость, благодарность',
          memory: 'Встреча прошла отлично! Получила много позитивной обратной связи.',
        },
        {
          id: '5',
          date: '2024-12-05',
          mood: 'calm',
          emotions: 'Умиротворённость, блаженство, лёгкость',
          memory: 'Долгая прогулка по парку. Зимний воздух так освежает!',
        },
        {
          id: '6',
          date: '2024-12-06',
          mood: 'sad',
          emotions: 'Грусть, задумчивость, ностальгия',
          memory: 'Вспоминала старые фотографии. Немного грустно, но тепло на душе от воспоминаний.',
        },
      ];
      localStorage.setItem('moodEntries', JSON.stringify(testEntries));
    }
  };

  useEffect(() => {
    if (notificationsEnabled) {
      scheduleNotification();
    }
  }, [notificationsEnabled]);

  const checkNotificationPermission = () => {
    if ('Notification' in window) {
      setNotificationsEnabled(Notification.permission === 'granted');
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      if (permission === 'granted') {
        scheduleNotification();
      }
    }
  };

  const scheduleNotification = () => {
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(18, 0, 0, 0);

    if (now > notificationTime) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    const timeUntilNotification = notificationTime.getTime() - now.getTime();

    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('📝 Время записи эмоций!', {
          body: 'Как прошёл твой день? Поделись своими эмоциями',
          icon: '/favicon.svg',
        });
      }
      scheduleNotification();
    }, timeUntilNotification);
  };

  const checkTimeAndSubmission = () => {
    const now = new Date();
    const hours = now.getHours();
    const isAvailable = hours >= 18 && hours <= 23;
    setIsFormAvailable(isAvailable);

    const today = now.toISOString().split('T')[0];
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    const todayEntry = entries.find((entry: MoodEntry) => entry.date === today);
    setHasSubmittedToday(!!todayEntry);
    
    if (todayEntry) {
      setTodayEntryId(todayEntry.id);
      setMood(todayEntry.mood);
      setEmotions(todayEntry.emotions);
      setMemory(todayEntry.memory);
    }
  };

  const handleSubmit = () => {
    if (!mood || !emotions.trim() || !memory.trim()) {
      alert('Пожалуйста, заполни все поля');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const entries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    
    if (isEditing && todayEntryId) {
      const updatedEntries = entries.map((entry: MoodEntry) => 
        entry.id === todayEntryId
          ? { ...entry, mood, emotions, memory }
          : entry
      );
      localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
      setIsEditing(false);
    } else {
      const newEntry: MoodEntry = {
        id: Date.now().toString(),
        date: today,
        mood,
        emotions,
        memory,
      };
      const updatedEntries = [...entries, newEntry];
      localStorage.setItem('moodEntries', JSON.stringify(updatedEntries));
    }

    setHasSubmittedToday(true);
    setMood('');
    setEmotions('');
    setMemory('');
  };

  const handleEdit = () => {
    setIsEditing(true);
    setHasSubmittedToday(false);
  };

  if (!isFormAvailable) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6 pb-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <Card className="max-w-md w-full p-8 text-center animate-fade-in">
            <Icon name="Clock" size={48} className="mx-auto mb-4 text-purple-400" />
            <h2 className="text-2xl font-medium mb-3 text-gray-800">Форма пока недоступна</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Возвращайся с 18:00 до 23:59, чтобы записать свои эмоции за день
            </p>
            {!notificationsEnabled && (
              <Button
                onClick={requestNotificationPermission}
                variant="outline"
                className="rounded-xl hover:bg-purple-50 hover:border-purple-300"
              >
                <Icon name="Bell" size={18} className="mr-2" />
                Включить уведомления
              </Button>
            )}
            {notificationsEnabled && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600">
                <Icon name="Check" size={16} />
                Уведомления включены
              </div>
            )}
          </Card>
        </div>
        <Navigation />
      </>
    );
  }

  if (hasSubmittedToday && !isEditing) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6 pb-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
          <Card className="max-w-md w-full p-8 text-center animate-fade-in">
            <Icon name="CheckCircle2" size={48} className="mx-auto mb-4 text-green-400" />
            <h2 className="text-2xl font-medium mb-3 text-gray-800">Запись сохранена</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Спасибо! Ты уже заполнила форму сегодня.
            </p>
            <Button
              onClick={handleEdit}
              variant="outline"
              className="rounded-xl hover:bg-purple-50 hover:border-purple-300"
            >
              <Icon name="Edit" size={18} className="mr-2" />
              Редактировать запись
            </Button>
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
            {isEditing ? 'Обновить запись' : 'Сохранить запись'}
          </Button>
        </Card>
        </div>
      </div>
      <Navigation />
    </>
  );
};

export default Home;