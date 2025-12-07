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

interface CalendarGridProps {
  currentMonth: Date;
  entries: MoodEntry[];
  moodEmojis: Record<string, string>;
  onMonthChange: (direction: number) => void;
  onSelectEntry: (entry: MoodEntry) => void;
}

const CalendarGrid = ({
  currentMonth,
  entries,
  moodEmojis,
  onMonthChange,
  onSelectEntry,
}: CalendarGridProps) => {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEntryForDate = (dateString: string) => {
    return entries.find((entry) => entry.date === dateString);
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const renderCalendar = () => {
    const days = [];
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    weekDays.forEach((day, idx) => {
      const isWeekend = idx === 5 || idx === 6;
      days.push(
        <div key={`header-${day}`} className={`text-center text-sm font-medium py-2 ${
          isWeekend ? 'text-red-500' : 'text-gray-500'
        }`}>
          {day}
        </div>
      );
    });

    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = getEntryForDate(dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];

      days.push(
        <button
          key={day}
          onClick={() => entry && onSelectEntry(entry)}
          className={`aspect-square p-2 border rounded-lg transition-all relative flex items-center justify-center ${
            entry
              ? 'border-gray-900 bg-gray-100 cursor-pointer'
              : 'border-gray-100 hover:border-gray-300'
          } ${isToday ? 'ring-1 ring-gray-400' : ''}`}
        >
          <div className="text-center">
            <div className={`text-xs ${
              entry 
                ? 'font-medium text-gray-900' 
                : 'text-gray-400'
            }`}>
              {day}
            </div>
            {entry && (
              <div className="text-xl mt-1">{moodEmojis[entry.mood]}</div>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  const monthEntries = entries.filter((e) => 
    e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
  );

  return (
    <Card className="p-6 animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(-1)}
          className="hover:bg-gray-100"
        >
          <Icon name="ChevronLeft" size={20} />
        </Button>
        <h2 className="text-lg font-normal text-gray-900 capitalize">{monthName}</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => onMonthChange(1)}
          className="hover:bg-gray-100"
        >
          <Icon name="ChevronRight" size={20} />
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

      <div className="mt-6 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          Записей: <span className="text-gray-900">{monthEntries.length}</span>
        </p>
      </div>
    </Card>
  );
};

export default CalendarGrid;
