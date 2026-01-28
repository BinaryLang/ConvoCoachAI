import React from 'react';
import { ROLES } from '../constants';
import { Role } from '../types';

interface RoleSelectorProps {
  onSelectRole: (role: Role) => void;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({ onSelectRole }) => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 mb-4">
          Choose Your Practice Partner
        </h1>
        <p className="text-lg text-slate-600">
          Select a persona to start a realistic roleplay conversation. 
          Get instant AI feedback on your performance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ROLES.map((role) => (
          <button
            key={role.id}
            onClick={() => onSelectRole(role)}
            className="group relative flex flex-col items-start p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 text-left w-full"
          >
            <div className={`w-12 h-12 rounded-lg ${role.color} bg-opacity-10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform`}>
              {role.emoji}
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              {role.title}
            </h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              {role.description}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
};