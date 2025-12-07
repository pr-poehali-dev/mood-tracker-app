import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';
import TimeSettingsModal from '@/components/TimeSettingsModal';
import QuestionSettingsModal from '@/components/QuestionSettingsModal';
import MoodForm from '@/components/MoodForm';

interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  emotions: string;
  memory: string;
}

interface TimeSettings {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

interface QuestionSettings {
  useRandom: boolean;
  question1: string;
  question2: string;
}

const Home = () => {
  const [isFormAvailable, setIsFormAvailable] = useState(true);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [mood, setMood] = useState('');
  const [emotions, setEmotions] = useState('');
  const [memory, setMemory] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [todayEntryId, setTodayEntryId] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showTimeSettings, setShowTimeSettings] = useState(false);
  const [showQuestionSettings, setShowQuestionSettings] = useState(false);
  const [timeSettings, setTimeSettings] = useState<TimeSettings>({
    enabled: false,
    startHour: 18,
    endHour: 23,
  });
  const [questionSettings, setQuestionSettings] = useState<QuestionSettings>({
    useRandom: false,
    question1: 'Какие эмоции отслеживались в течение дня?',
    question2: 'Что бы ты сегодня хотела запомнить?',
  });
  const [currentQuestions, setCurrentQuestions] = useState({
    question1: 'Какие эмоции отслеживались в течение дня?',
    question2: 'Что бы ты сегодня хотела запомнить?',
  });

  useEffect(() => {
    initializeTestData();
    loadSettings();
    checkSubmission();
    checkNotificationPermission();
    checkTimeAvailability();
    const interval = setInterval(checkTimeAvailability, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadSettings = () => {
    const savedTimeSettings = localStorage.getItem('timeSettings');
    const savedQuestionSettings = localStorage.getItem('questionSettings');
    
    if (savedTimeSettings) {
      const parsed = JSON.parse(savedTimeSettings);
      setTimeSettings(parsed);
    }
    
    if (savedQuestionSettings) {
      const parsed = JSON.parse(savedQuestionSettings);
      setQuestionSettings(parsed);
      if (parsed.useRandom) {
        generateRandomQuestions();
      } else {
        setCurrentQuestions({
          question1: parsed.question1,
          question2: parsed.question2,
        });
      }
    }
  };

  const checkTimeAvailability = () => {
    const savedTimeSettings = localStorage.getItem('timeSettings');
    if (!savedTimeSettings) {
      setIsFormAvailable(true);
      return;
    }
    
    const settings: TimeSettings = JSON.parse(savedTimeSettings);
    if (!settings.enabled) {
      setIsFormAvailable(true);
      return;
    }
    
    const now = new Date();
    const hours = now.getHours();
    const isAvailable = hours >= settings.startHour && hours <= settings.endHour;
    setIsFormAvailable(isAvailable);
  };

  const randomQuestions = [
    ['Какие эмоции были с тобой сегодня?', 'Что запомнилось больше всего?'],
    ['Что ты чувствовала в течение дня?', 'Какой момент хочешь сохранить?'],
    ['Какое настроение преобладало?', 'За что ты благодарна сегодня?'],
    ['Что происходило в твоём внутреннем мире?', 'Чему ты научилась сегодня?'],
    ['Какие чувства ты испытывала?', 'Что принесло тебе радость?'],
    ['Как ты себя ощущала сегодня?', 'Что важного произошло?'],
  ];

  const generateRandomQuestions = () => {
    const randomIndex = Math.floor(Math.random() * randomQuestions.length);
    const [q1, q2] = randomQuestions[randomIndex];
    setCurrentQuestions({ question1: q1, question2: q2 });
  };

  const saveTimeSettings = () => {
    localStorage.setItem('timeSettings', JSON.stringify(timeSettings));
    checkTimeAvailability();
    setShowTimeSettings(false);
  };

  const saveQuestionSettings = () => {
    localStorage.setItem('questionSettings', JSON.stringify(questionSettings));
    if (questionSettings.useRandom) {
      generateRandomQuestions();
    } else {
      setCurrentQuestions({
        question1: questionSettings.question1,
        question2: questionSettings.question2,
      });
    }
    setShowQuestionSettings(false);
  };

  const initializeTestData = () => {
    const testEntries: MoodEntry[] = [
      {
        id: '1',
        date: '2025-12-01',
        mood: 'happy',
        emotions: 'Радость, вдохновение, энтузиазм',
        memory: 'Начала новый проект, который долго планировала. Чувствую огромное волнение и предвкушение!',
      },
      {
        id: '2',
        date: '2025-12-02',
        mood: 'calm',
        emotions: 'Спокойствие, удовлетворённость, гармония',
        memory: 'Провела весь вечер за книгой с чаем. Такое умиротворённое состояние.',
      },
      {
        id: '3',
        date: '2025-12-03',
        mood: 'anxious',
        emotions: 'Тревога, беспокойство, напряжение',
        memory: 'Предстоит важная встреча завтра. Немного волнуюсь, но готовлюсь как могу.',
      },
      {
        id: '4',
        date: '2025-12-04',
        mood: 'happy',
        emotions: 'Воодушевление, радость, благодарность',
        memory: 'Встреча прошла отлично! Получила много позитивной обратной связи.',
      },
      {
        id: '5',
        date: '2025-12-05',
        mood: 'calm',
        emotions: 'Умиротворённость, блаженство, лёгкость',
        memory: 'Долгая прогулка по парку. Зимний воздух так освежает!',
      },
      {
        id: '6',
        date: '2025-12-06',
        mood: 'sad',
        emotions: 'Грусть, задумчивость, ностальгия',
        memory: 'Вспоминала старые фотографии. Немного грустно, но тепло на душе от воспоминаний.',
      },
    ];
    localStorage.setItem('moodEntries', JSON.stringify(testEntries));
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

  const checkSubmission = () => {
    const today = new Date().toISOString().split('T')[0];
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
        <div className="min-h-screen flex items-center justify-center p-6 pb-24 bg-white">
          <Card className="max-w-md w-full p-8 text-center animate-fade-in border-gray-200">
            <Icon name="Clock" size={40} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-normal mb-3 text-gray-900">Форма пока недоступна</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              Доступна с {timeSettings.startHour}:00 до {timeSettings.endHour}:59
            </p>
          </Card>
        </div>
        <Navigation />
      </>
    );
  }

  if (hasSubmittedToday && !isEditing) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center p-6 pb-24 bg-white">
          <Card className="max-w-md w-full p-8 text-center animate-fade-in border-gray-200">
            <Icon name="CheckCircle2" size={40} className="mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-normal mb-3 text-gray-900">Запись сохранена</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-6">
              Спасибо! Ты уже заполнила форму сегодня.
            </p>
            <Button
              onClick={handleEdit}
              variant="outline"
              className="text-sm border-gray-300 hover:bg-gray-50"
            >
              <Icon name="Edit" size={16} className="mr-2" />
              Редактировать
            </Button>
          </Card>
        </div>
        <Navigation />
      </>
    );
  }

  return (
    <>
      <div className="min-h-screen p-6 pb-24 bg-white">
        <MoodForm
          mood={mood}
          emotions={emotions}
          memory={memory}
          isEditing={isEditing}
          currentQuestions={currentQuestions}
          onMoodChange={setMood}
          onEmotionsChange={setEmotions}
          onMemoryChange={setMemory}
          onSubmit={handleSubmit}
          onOpenTimeSettings={() => setShowTimeSettings(true)}
          onOpenQuestionSettings={() => setShowQuestionSettings(true)}
        />

        <TimeSettingsModal
          show={showTimeSettings}
          timeSettings={timeSettings}
          onClose={() => setShowTimeSettings(false)}
          onSave={saveTimeSettings}
          onUpdate={setTimeSettings}
        />

        <QuestionSettingsModal
          show={showQuestionSettings}
          questionSettings={questionSettings}
          onClose={() => setShowQuestionSettings(false)}
          onSave={saveQuestionSettings}
          onUpdate={setQuestionSettings}
        />
      </div>
      <Navigation />
    </>
  );
};

export default Home;
