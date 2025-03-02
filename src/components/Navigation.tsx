import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useStore } from '../store';
import {
  LayoutDashboard,
  Users,
  Gamepad2,
  Wallet,
  Receipt,
  Wrench,
  Map,
  Settings
} from 'lucide-react';

const navigation = [
  { name: 'Panel', icon: LayoutDashboard, path: '/panel' },
  { name: 'Clientes', icon: Users, path: '/clientes' },
  { name: 'Máquinas', icon: Gamepad2, path: '/maquinas' },
  { name: 'Recaudaciones', icon: Wallet, path: '/ingresos' },
  { name: 'Gastos', icon: Receipt, path: '/gastos' },
  { name: 'Mantenimiento', icon: Wrench, path: '/mantenimiento' },
  { name: 'Ubicaciones', icon: Map, path: '/ubicaciones' },
  { name: 'Ajustes', icon: Settings, path: '/ajustes' },
];

export function Navigation() {
  const location = useLocation();
  const { companyProfile } = useStore();

  const defaultCompanyProfile = {
    logo: '',
    name: 'Rekreativ@'
  };

  const profile = companyProfile || defaultCompanyProfile;

  return (
    <nav className="fixed left-0 top-0 h-full w-64 bg-gray-900/50 backdrop-blur-sm border-r border-gray-800">
      <div className="flex h-16 items-center px-6">
        {profile.logo ? (
          <img
            src={profile.logo}
            alt={profile.name}
            className="h-8 w-auto"
          />
        ) : (
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-transparent bg-clip-text">
            {profile.name}
          </h1>
        )}
      </div>
      <div className="px-3 py-4">
        {navigation.map((item) => (
          <Link
            key={item.name}
            to={item.path}
            className={`w-full flex items-center px-4 py-3 mb-2 rounded-lg transition-all duration-200 ${
              location.pathname === item.path
                ? 'bg-gray-800/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                : 'text-gray-400 hover:bg-gray-800/30 hover:text-white'
            }`}
          >
            <item.icon className="h-5 w-5 mr-3" />
            {item.name}
          </Link>
        ))}
      </div>

      {/* Company Logo and Name */}
      {companyProfile && (
        <div className="px-6 py-4 border-t border-gray-700 mt-4">
          {companyProfile.logo && (
            <img
              src={companyProfile.logo}
              alt="Company Logo"
              className="h-12 w-12 rounded-lg border border-gray-600 mb-2"
            />
          )}
          <h2 className="text-lg font-bold text-gray-200">{companyProfile.name}</h2>
        </div>
      )}
    </nav>
  );
}
