import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface MoodFormProps {
  mood: string;
  emotions: string;
  memory: string;
  isEditing: boolean;
  currentQuestions: {
    question1: string;
    question2: string;
  };
  onMoodChange: (mood: string) => void;
  onEmotionsChange: (emotions: string) => void;
  onMemoryChange: (memory: string) => void;
  onSubmit: () => void;
  onOpenTimeSettings: () => void;
  onOpenQuestionSettings: () => void;
}

const moods = [
  { emoji: '😊', label: 'Радостное', value: 'happy' },
  { emoji: '😌', label: 'Спокойное', value: 'calm' },
  { emoji: '😔', label: 'Грустное', value: 'sad' },
  { emoji: '😰', label: 'Тревожное', value: 'anxious' },
  { emoji: '😤', label: 'Раздражённое', value: 'angry' },
];

const MoodForm = ({
  mood,
  emotions,
  memory,
  isEditing,
  currentQuestions,
  onMoodChange,
  onEmotionsChange,
  onMemoryChange,
  onSubmit,
  onOpenTimeSettings,
  onOpenQuestionSettings,
}: MoodFormProps) => {
  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="text-center mb-10 relative">
        <div className="absolute right-0 top-0 flex gap-2">
          <button
            onClick={onOpenTimeSettings}
            className="p-2 hover:bg-gray-100 border border-gray-200 transition-all"
          >
            <Icon name="Clock" size={20} className="text-gray-600" />
          </button>
          <button
            onClick={onOpenQuestionSettings}
            className="p-2 hover:bg-gray-100 border border-gray-200 transition-all"
          >
            <Icon name="Settings" size={20} className="text-gray-600" />
          </button>
        </div>
        <h1 className="text-2xl font-normal mb-2 text-gray-900">Как прошёл день?</h1>
        <p className="text-gray-500 text-sm">Поделитесь своими эмоциями</p>
      </div>

      <Card className="p-8 space-y-8 border-gray-200">
        <div>
          <label className="block text-sm font-normal mb-4 text-gray-600">
            Какое сегодня настроение?
          </label>
          <div className="grid grid-cols-5 gap-2">
            {moods.map((item) => (
              <button
                key={item.value}
                onClick={() => onMoodChange(item.value)}
                className={`p-3 border transition-all ${
                  mood === item.value
                    ? 'border-gray-900 bg-gray-50'
                    : 'border-gray-200 bg-white hover:border-gray-400'
                }`}
              >
                <div className="text-2xl mb-1">{item.emoji}</div>
                <div className="text-xs text-gray-500">{item.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-normal mb-4 text-gray-600">
            {currentQuestions.question1}
          </label>
          <Textarea
            value={emotions}
            onChange={(e) => onEmotionsChange(e.target.value)}
            placeholder="Радость, спокойствие, волнение..."
            className="min-h-[100px] text-sm resize-none border-gray-200 focus:border-gray-400"
          />
        </div>

        <div>
          <label className="block text-sm font-normal mb-4 text-gray-600">
            {currentQuestions.question2}
          </label>
          <Textarea
            value={memory}
            onChange={(e) => onMemoryChange(e.target.value)}
            placeholder="Запиши момент, который хочешь сохранить..."
            className="min-h-[100px] text-sm resize-none border-gray-200 focus:border-gray-400"
          />
        </div>

        <Button
          onClick={onSubmit}
          className="w-full h-11 text-sm bg-gray-900 hover:bg-gray-800 text-white"
        >
          {isEditing ? 'Обновить' : 'Сохранить'}
        </Button>
      </Card>
    </div>
  );
};

export default MoodForm;