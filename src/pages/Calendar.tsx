import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import Navigation from '@/components/Navigation';

interface MoodEntry {
  id: string;
  date: string;
  mood: string;
  emotions: string;
  memory: string;
}

const Calendar = () => {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<MoodEntry | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const moodEmojis: Record<string, string> = {
    happy: '😊',
    calm: '😌',
    sad: '😔',
    anxious: '😰',
    angry: '😤',
  };

  useEffect(() => {
    loadEntries();
  }, []);

  const loadEntries = () => {
    const storedEntries = JSON.parse(localStorage.getItem('moodEntries') || '[]');
    setEntries(storedEntries);
  };

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const { daysInMonth, startingDayOfWeek, year, month } = getDaysInMonth(currentMonth);
  const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
    setSelectedEntry(null);
  };

  const renderCalendar = () => {
    const days = [];
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    // Week day headers
    weekDays.forEach((day) => {
      days.push(
        <div key={`header-${day}`} className="text-center text-sm font-medium text-gray-500 py-2">
          {day}
        </div>
      );
    });

    // Empty cells before first day (adjust for Monday start)
    const adjustedStartDay = startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1;
    for (let i = 0; i < adjustedStartDay; i++) {
      days.push(<div key={`empty-${i}`} className="p-2" />);
    }

    // Calendar days
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const entry = getEntryForDate(dateString);
      const isToday = dateString === new Date().toISOString().split('T')[0];

      days.push(
        <button
          key={day}
          onClick={() => entry && setSelectedEntry(entry)}
          className={`p-2 rounded-2xl transition-all duration-200 relative ${
            entry
              ? 'bg-gradient-to-br from-purple-100 to-pink-100 hover:from-purple-200 hover:to-pink-200 hover-scale cursor-pointer'
              : 'hover:bg-gray-50'
          } ${isToday ? 'ring-2 ring-purple-400' : ''}`}
        >
          <div className="text-center">
            <div className={`text-sm ${entry ? 'font-medium text-gray-800' : 'text-gray-600'}`}>
              {day}
            </div>
            {entry && (
              <div className="text-2xl mt-1 animate-scale-in">{moodEmojis[entry.mood]}</div>
            )}
          </div>
        </button>
      );
    }

    return days;
  };

  return (
    <>
      <div className="min-h-screen p-6 pb-24 bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-4xl font-medium mb-3 text-gray-800">Твой календарь эмоций</h1>
          <p className="text-gray-600">История твоих записей и воспоминаний</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(-1)}
                className="rounded-full hover:bg-purple-100"
              >
                <Icon name="ChevronLeft" size={20} />
              </Button>
              <h2 className="text-xl font-medium text-gray-800 capitalize">{monthName}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(1)}
                className="rounded-full hover:bg-purple-100"
              >
                <Icon name="ChevronRight" size={20} />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-2">{renderCalendar()}</div>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-500 text-center">
                Записей в этом месяце:{' '}
                <span className="font-medium text-gray-700">
                  {entries.filter((e) => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}
                </span>
              </p>
            </div>
          </Card>

          {/* Entry Details */}
          <Card className="p-6 animate-fade-in">
            {selectedEntry ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-5xl mb-2">{moodEmojis[selectedEntry.mood]}</div>
                    <p className="text-sm text-gray-500">{formatDate(selectedEntry.date)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedEntry(null)}
                    className="rounded-full hover:bg-gray-100"
                  >
                    <Icon name="X" size={20} />
                  </Button>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Эмоции дня</h3>
                  <p className="text-gray-800 leading-relaxed">{selectedEntry.emotions}</p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Что запомнилось</h3>
                  <p className="text-gray-800 leading-relaxed">{selectedEntry.memory}</p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Icon name="Calendar" size={48} className="text-gray-300 mb-4" />
                <p className="text-gray-500">Выбери день в календаре, чтобы увидеть запись</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <h2 className="text-2xl font-medium mb-4 text-gray-800">Последние записи</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries
                .slice()
                .reverse()
                .slice(0, 6)
                .map((entry) => (
                  <Card
                    key={entry.id}
                    className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 hover-scale"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{moodEmojis[entry.mood]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-500 mb-1">{formatDate(entry.date)}</p>
                        <p className="text-sm text-gray-700 line-clamp-2">{entry.memory}</p>
                      </div>
                    </div>
                  </Card>
                ))}
            </div>
          </div>
        )}
        </div>
      </div>
      <Navigation />
    </>
  );
};

export default Calendar;