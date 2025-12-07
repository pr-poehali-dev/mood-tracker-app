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

  const moodLabels: Record<string, string> = {
    happy: 'Радостное',
    calm: 'Спокойное',
    sad: 'Грустное',
    anxious: 'Тревожное',
    angry: 'Раздражённое',
  };

  const moodColors: Record<string, string> = {
    happy: 'bg-green-100 text-green-700',
    calm: 'bg-blue-100 text-blue-700',
    sad: 'bg-gray-100 text-gray-700',
    anxious: 'bg-yellow-100 text-yellow-700',
    angry: 'bg-red-100 text-red-700',
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

  const getMonthStats = () => {
    const monthEntries = entries.filter((e) => 
      e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
    );

    const moodCounts: Record<string, number> = {
      happy: 0,
      calm: 0,
      sad: 0,
      anxious: 0,
      angry: 0,
    };

    monthEntries.forEach((entry) => {
      if (entry.mood in moodCounts) {
        moodCounts[entry.mood]++;
      }
    });

    const total = monthEntries.length;
    const mostCommonMood = total > 0 
      ? Object.entries(moodCounts).reduce((a, b) => (b[1] > a[1] ? b : a))[0]
      : null;

    return { moodCounts, total, mostCommonMood };
  };

  const stats = getMonthStats();

  const getWeeklyTrends = () => {
    const monthEntries = entries.filter((e) => 
      e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
    );

    const weeks: { weekNum: number; entries: MoodEntry[] }[] = [];
    const weekMap = new Map<number, MoodEntry[]>();

    monthEntries.forEach((entry) => {
      const date = new Date(entry.date);
      const weekNum = Math.ceil(date.getDate() / 7);
      if (!weekMap.has(weekNum)) {
        weekMap.set(weekNum, []);
      }
      weekMap.get(weekNum)?.push(entry);
    });

    weekMap.forEach((entries, weekNum) => {
      weeks.push({ weekNum, entries });
    });

    return weeks.sort((a, b) => a.weekNum - b.weekNum);
  };

  const weeklyTrends = getWeeklyTrends();

  const exportToPDF = () => {
    const monthEntries = entries.filter((e) => 
      e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)
    );

    let content = `Дневник эмоций - ${monthName}\n\n`;
    content += `Статистика:\n`;
    content += `Всего записей: ${stats.total}\n`;
    if (stats.mostCommonMood) {
      content += `Самое частое настроение: ${moodLabels[stats.mostCommonMood]}\n`;
    }
    content += `\nРаспределение настроений:\n`;
    Object.entries(stats.moodCounts)
      .filter(([_, count]) => count > 0)
      .forEach(([mood, count]) => {
        const percentage = Math.round((count / stats.total) * 100);
        content += `${moodLabels[mood]}: ${count} (${percentage}%)\n`;
      });

    content += `\n\nЗаписи по дням:\n\n`;
    monthEntries.forEach((entry) => {
      content += `${formatDate(entry.date)}\n`;
      content += `Настроение: ${moodLabels[entry.mood]}\n`;
      content += `Эмоции: ${entry.emotions}\n`;
      content += `Запомнилось: ${entry.memory}\n\n`;
    });

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `дневник-эмоций-${year}-${String(month + 1).padStart(2, '0')}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const changeMonth = (direction: number) => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + direction, 1));
    setSelectedEntry(null);
  };

  const renderCalendar = () => {
    const days = [];
    const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];

    // Week day headers
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
          className={`p-2 border transition-all relative ${
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

  return (
    <>
      <div className="min-h-screen p-6 pb-24 bg-white">
        <div className="max-w-6xl mx-auto">
        <div className="text-center mb-10 animate-fade-in">
          <h1 className="text-2xl font-normal mb-2 text-gray-900">Календарь</h1>
          <p className="text-gray-500 text-sm">История твоих записей</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar */}
          <Card className="p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(-1)}
                className="hover:bg-gray-100"
              >
                <Icon name="ChevronLeft" size={20} />
              </Button>
              <h2 className="text-lg font-normal text-gray-900 capitalize">{monthName}</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => changeMonth(1)}
                className="hover:bg-gray-100"
              >
                <Icon name="ChevronRight" size={20} />
              </Button>
            </div>

            <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center">
                Записей: <span className="text-gray-900">{entries.filter((e) => e.date.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length}</span>
              </p>
            </div>
          </Card>

          {/* Entry Details */}
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
                    onClick={() => setSelectedEntry(null)}
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
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Icon name="Calendar" size={40} className="text-gray-300 mb-4" />
                <p className="text-sm text-gray-500">Выбери день</p>
              </div>
            )}
          </Card>
        </div>

        {/* Statistics */}
        {stats.total > 0 && (
          <Card className="mt-6 p-6 animate-fade-in border-gray-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-normal text-gray-900">Статистика</h2>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="text-sm border-gray-300 hover:bg-gray-50"
              >
                <Icon name="Download" size={16} className="mr-2" />
                Экспорт
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Most Common Mood */}
              <div className="text-center p-6 bg-gray-50 border border-gray-200">
                <p className="text-xs text-gray-500 mb-2">Самое частое</p>
                <div className="text-5xl mb-2">{stats.mostCommonMood && moodEmojis[stats.mostCommonMood]}</div>
                <p className="text-sm font-normal text-gray-900">
                  {stats.mostCommonMood && moodLabels[stats.mostCommonMood]}
                </p>
              </div>

              {/* Mood Distribution */}
              <div>
                <p className="text-xs text-gray-500 mb-4">Распределение</p>
                <div className="space-y-3">
                  {Object.entries(stats.moodCounts)
                    .filter(([_, count]) => count > 0)
                    .sort(([, a], [, b]) => b - a)
                    .map(([mood, count]) => {
                      const percentage = Math.round((count / stats.total) * 100);
                      return (
                        <div key={mood}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{moodEmojis[mood]}</span>
                              <span className="text-xs text-gray-700">{moodLabels[mood]}</span>
                            </div>
                            <span className="text-xs text-gray-500">{percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 overflow-hidden">
                            <div
                              className="h-full bg-gray-900 transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>

            {/* Total Count */}
            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-xs text-gray-500">
                Всего: <span className="text-gray-900">{stats.total}</span> из {daysInMonth}
              </p>
            </div>
          </Card>
        )}

        {/* Weekly Trends */}
        {weeklyTrends.length > 0 && (
          <Card className="mt-6 p-6 animate-fade-in border-gray-200">
            <h2 className="text-lg font-normal mb-6 text-gray-900">По неделям</h2>
            <div className="space-y-6">
              {weeklyTrends.map((week) => {
                const weekMoodCounts: Record<string, number> = {
                  happy: 0,
                  calm: 0,
                  sad: 0,
                  anxious: 0,
                  angry: 0,
                };
                week.entries.forEach((entry) => {
                  if (entry.mood in weekMoodCounts) {
                    weekMoodCounts[entry.mood]++;
                  }
                });
                const dominantMood = Object.entries(weekMoodCounts)
                  .filter(([_, count]) => count > 0)
                  .reduce((a, b) => (b[1] > a[1] ? b : a))[0];

                return (
                  <div key={week.weekNum} className="p-4 bg-gray-50 border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{moodEmojis[dominantMood]}</div>
                        <div>
                          <p className="text-sm font-normal text-gray-900">Неделя {week.weekNum}</p>
                          <p className="text-xs text-gray-500">{moodLabels[dominantMood]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-normal text-gray-900">{week.entries.length}</p>
                        <p className="text-xs text-gray-500">записей</p>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      {Object.entries(weekMoodCounts)
                        .filter(([_, count]) => count > 0)
                        .map(([mood, count]) => {
                          const width = (count / week.entries.length) * 100;
                          return (
                            <div
                              key={mood}
                              className="h-1.5 bg-gray-900 transition-all duration-500"
                              style={{ width: `${width}%` }}
                              title={`${moodLabels[mood]}: ${count}`}
                            />
                          );
                        })}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Recent Entries */}
        {entries.length > 0 && (
          <div className="mt-6 animate-fade-in">
            <h2 className="text-lg font-normal mb-4 text-gray-900">Последние записи</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {entries
                .slice()
                .reverse()
                .slice(0, 6)
                .map((entry) => (
                  <Card
                    key={entry.id}
                    className="p-4 cursor-pointer border-gray-200 hover:border-gray-400 transition-all"
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-2xl">{moodEmojis[entry.mood]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-gray-500 mb-1">{formatDate(entry.date)}</p>
                        <p className="text-sm text-gray-900 line-clamp-2">{entry.memory}</p>
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