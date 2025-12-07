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
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between">
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
              
              <div className="flex gap-2 justify-center flex-wrap">
                {[2024, 2025].map((yearOption) => (
                  <Button
                    key={yearOption}
                    variant={year === yearOption ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(yearOption, month, 1))}
                    className="rounded-xl"
                  >
                    {yearOption}
                  </Button>
                ))}
              </div>
              
              <div className="grid grid-cols-6 gap-2">
                {['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'].map((monthLabel, idx) => (
                  <Button
                    key={idx}
                    variant={month === idx ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setCurrentMonth(new Date(year, idx, 1))}
                    className={`rounded-xl text-xs ${month === idx ? 'bg-gradient-to-r from-purple-400 to-pink-400' : 'hover:bg-purple-50'}`}
                  >
                    {monthLabel}
                  </Button>
                ))}
              </div>
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

        {/* Statistics */}
        {stats.total > 0 && (
          <Card className="mt-6 p-6 animate-fade-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium text-gray-800">Статистика за месяц</h2>
              <Button
                onClick={exportToPDF}
                variant="outline"
                className="rounded-xl hover:bg-purple-50 hover:border-purple-300"
              >
                <Icon name="Download" size={18} className="mr-2" />
                Экспорт
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
              {/* Most Common Mood */}
              <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl">
                <p className="text-sm text-gray-600 mb-2">Самое частое настроение</p>
                <div className="text-6xl mb-2">{stats.mostCommonMood && moodEmojis[stats.mostCommonMood]}</div>
                <p className="text-lg font-medium text-gray-800">
                  {stats.mostCommonMood && moodLabels[stats.mostCommonMood]}
                </p>
              </div>

              {/* Mood Distribution */}
              <div>
                <p className="text-sm text-gray-600 mb-4">Распределение настроений</p>
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
                              <span className="text-xl">{moodEmojis[mood]}</span>
                              <span className="text-sm text-gray-700">{moodLabels[mood]}</span>
                            </div>
                            <span className="text-sm font-medium text-gray-600">{percentage}%</span>
                          </div>
                          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${moodColors[mood].split(' ')[0]}`}
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
            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
              <p className="text-gray-600">
                Всего записей: <span className="font-medium text-gray-800">{stats.total}</span> из {daysInMonth} дней
              </p>
            </div>
          </Card>
        )}

        {/* Weekly Trends */}
        {weeklyTrends.length > 0 && (
          <Card className="mt-6 p-6 animate-fade-in">
            <h2 className="text-2xl font-medium mb-6 text-gray-800">Тренды по неделям</h2>
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
                  <div key={week.weekNum} className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{moodEmojis[dominantMood]}</div>
                        <div>
                          <p className="font-medium text-gray-800">Неделя {week.weekNum}</p>
                          <p className="text-sm text-gray-600">Доминирующее: {moodLabels[dominantMood]}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-medium text-gray-800">{week.entries.length}</p>
                        <p className="text-xs text-gray-500">записей</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {Object.entries(weekMoodCounts)
                        .filter(([_, count]) => count > 0)
                        .map(([mood, count]) => {
                          const width = (count / week.entries.length) * 100;
                          return (
                            <div
                              key={mood}
                              className={`h-2 rounded-full ${moodColors[mood].split(' ')[0]} transition-all duration-500`}
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