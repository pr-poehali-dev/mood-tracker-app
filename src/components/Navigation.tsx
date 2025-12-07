import { Link, useLocation } from 'react-router-dom';
import Icon from '@/components/ui/icon';

const Navigation = () => {
  const location = useLocation();

  const links = [
    { path: '/', label: 'Главная', icon: 'Home' },
    { path: '/calendar', label: 'Календарь', icon: 'Calendar' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-200 z-50">
      <div className="max-w-md mx-auto px-6 py-3">
        <div className="flex justify-around items-center gap-4">
          {links.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex flex-col items-center gap-1 px-6 py-2 rounded-2xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-600'
                    : 'text-gray-600 hover:text-purple-500 hover:bg-gray-50'
                }`}
              >
                <Icon name={link.icon as any} size={24} />
                <span className="text-xs font-medium">{link.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
