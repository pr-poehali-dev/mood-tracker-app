import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface TimeSettings {
  enabled: boolean;
  startHour: number;
  endHour: number;
}

interface TimeSettingsModalProps {
  show: boolean;
  timeSettings: TimeSettings;
  onClose: () => void;
  onSave: () => void;
  onUpdate: (settings: TimeSettings) => void;
}

const TimeSettingsModal = ({
  show,
  timeSettings,
  onClose,
  onSave,
  onUpdate,
}: TimeSettingsModalProps) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6" onClick={onClose}>
      <Card className="max-w-md w-full p-6 border-gray-200" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-normal text-gray-900">Настройки времени</h2>
          <button onClick={onClose} className="hover:bg-gray-100 p-1">
            <Icon name="X" size={20} className="text-gray-600" />
          </button>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <label className="text-sm text-gray-600">Ограничить время заполнения</label>
            <button
              onClick={() => onUpdate({ ...timeSettings, enabled: !timeSettings.enabled })}
              className={`w-12 h-6 border transition-all relative ${
                timeSettings.enabled ? 'bg-gray-900 border-gray-900' : 'bg-white border-gray-300'
              }`}
            >
              <div className={`w-4 h-4 bg-white absolute top-0.5 transition-all ${
                timeSettings.enabled ? 'right-0.5' : 'left-0.5'
              }`} />
            </button>
          </div>

          {timeSettings.enabled && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-2">С (час)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={timeSettings.startHour}
                  onChange={(e) => onUpdate({ ...timeSettings, startHour: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-200 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-2">До (час)</label>
                <input
                  type="number"
                  min="0"
                  max="23"
                  value={timeSettings.endHour}
                  onChange={(e) => onUpdate({ ...timeSettings, endHour: parseInt(e.target.value) || 23 })}
                  className="w-full px-3 py-2 border border-gray-200 text-sm focus:border-gray-400 focus:outline-none"
                />
              </div>
            </div>
          )}

          <Button onClick={onSave} className="w-full bg-gray-900 hover:bg-gray-800 text-white">
            Сохранить
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default TimeSettingsModal;
