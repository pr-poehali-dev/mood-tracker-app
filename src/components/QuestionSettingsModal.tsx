import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface QuestionSettings {
  useRandom: boolean;
  question1: string;
  question2: string;
}

interface QuestionSettingsModalProps {
  show: boolean;
  questionSettings: QuestionSettings;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (settings: QuestionSettings) => void;
}

const QuestionSettingsModal = ({
  show,
  questionSettings,
  onClose,
  onSave,
  onUpdate,
}: QuestionSettingsModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <Card className="max-w-md w-full p-6 border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-normal text-gray-900">Настройки вопросов</h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1">
            <Icon name="X" size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Случайные вопросы</label>
            <button
              onClick={() => onUpdate({ ...questionSettings, useRandom: !questionSettings.useRandom })}
              className={`w-12 h-6 border transition-all relative ${
                questionSettings.useRandom ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white absolute top-0.5 transition-all ${
                questionSettings.useRandom ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {!questionSettings.useRandom && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">Вопрос 1</label>
                <Textarea
                  value={questionSettings.question1}
                  onChange={(e) => onUpdate({ ...questionSettings, question1: e.target.value })}
                  className="min-h-[60px] text-sm resize-none border-gray-200 focus:border-gray-400"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">Вопрос 2</label>
                <Textarea
                  value={questionSettings.question2}
                  onChange={(e) => onUpdate({ ...questionSettings, question2: e.target.value })}
                  className="min-h-[60px] text-sm resize-none border-gray-200 focus:border-gray-400"
                />
              </div>
            </div>
          )}

          {questionSettings.useRandom && (
            <p className="text-xs text-gray-500">Вопросы будут меняться каждый раз случайным образом</p>
          )}

          <Button onClick={onSave} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            Сохранить
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default QuestionSettingsModal;
