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

interface MonthlyStatsProps {
  entries: MoodEntry[];
  currentMonth: Date;
  moodEmojis: Record<string, string>;
  moodLabels: Record<string, string>;
  onSelectEntry: (entry: MoodEntry) => void;
}

const MonthlyStats = ({
  entries,
  currentMonth,
  moodEmojis,
  moodLabels,
  onSelectEntry,
}: MonthlyStatsProps) => {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const monthName = currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });

  const getDaysInMonth = () => {
    const lastDay = new Date(year, month + 1, 0);
    return lastDay.getDate();
  };

  const daysInMonth = getDaysInMonth();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

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

  return (
    <>
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
            <div className="text-center p-6 bg-gray-50 border border-gray-200 rounded-lg">
              <p className="text-xs text-gray-500 mb-2">Самое частое</p>
              <div className="text-5xl mb-2">{stats.mostCommonMood && moodEmojis[stats.mostCommonMood]}</div>
              <p className="text-sm font-normal text-gray-900">
                {stats.mostCommonMood && moodLabels[stats.mostCommonMood]}
              </p>
            </div>

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
                        <div className="h-1.5 bg-gray-100 rounded-lg overflow-hidden">
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

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <p className="text-xs text-gray-500">
              Всего: <span className="text-gray-900">{stats.total}</span> из {daysInMonth}
            </p>
          </div>
        </Card>
      )}

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
                <div key={week.weekNum} className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
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
                  onClick={() => onSelectEntry(entry)}
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
    </>
  );
};

export default MonthlyStats;
