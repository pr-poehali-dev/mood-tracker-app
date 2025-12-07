import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  emotions: string;
  memory: string;
}

interface EntryDetailsProps {
  selectedEntry: MoodEntry | null;
  moodEmojis: Record<string, string>;
  onClose: () => void;
  onDelete: () => void;
}

const EntryDetails = ({
  selectedEntry,
  moodEmojis,
  onClose,
  onDelete,
}: EntryDetailsProps) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <Card className="p-6 animate-fade-in border-gray-200">
      {selectedEntry ? (
        <div className="space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-4xl mb-2">{moodEmojis[selectedEntry.mood]}</div>
              <p className="text-xs text-gray-500">{formatDate(selectedEntry.date)}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <Icon name="X" size={18} />
            </Button>
          </div>

          <div>
            <h3 className="text-xs font-normal text-gray-500 mb-2">Эмоции дня</h3>
            <p className="text-sm text-gray-900 leading-relaxed">{selectedEntry.emotions}</p>
          </div>

          <div>
            <h3 className="text-xs font-normal text-gray-500 mb-2">Что запомнилось</h3>
            <p className="text-sm text-gray-900 leading-relaxed">{selectedEntry.memory}</p>
          </div>

          <Button
            onClick={onDelete}
            variant="outline"
            className="w-full text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
          >
            <Icon name="Trash2" size={16} className="mr-2" />
            Удалить запись
          </Button>
        </div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center py-12">
          <Icon name="Calendar" size={40} className="text-gray-300 mb-4" />
          <p className="text-sm text-gray-500">Выбери день</p>
        </div>
      )}
    </Card>
  );
};

export default EntryDetails;
