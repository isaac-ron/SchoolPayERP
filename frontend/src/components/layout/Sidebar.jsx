import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  return (
    <aside className="w-64 bg-white border-r border-surface-border flex-shrink-0 flex flex-col h-full z-20 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div 
            className="bg-center bg-no-repeat aspect-square bg-cover rounded-xl size-10 shadow-lg shadow-primary/10" 
            style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDAiWtLY_RWAMumUkoQlWxSRQtbFEe5PHF-iW50d_8zybgs3zMoSCdNqTD3f9dnSy9ZqNlHuPgyJWJ37iP1GX6cz-ppgG-aUIn29Wrl0yu5NMvLB1AvlXcQTrNgxCMvpXfaqURKTFvr75UgZCLPXufeHXluWjlM9u01A2hfaORsThACTk-CJEJ7b2-mYJdGDQ4GeLZUfhJhzjd9W6vJGWhkgFhoskiuTF5IzSnkShY4bmq8JEevNP5xaMW2TF7deAiGyMDFaR5gum0")'}}
          ></div>
          <div className="flex flex-col">
            <h1 className="text-primary text-xl font-extrabold leading-tight tracking-tight font-display">SchoolPay</h1>
            <p className="text-text-muted text-xs font-medium">Admin Console</p>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <NavLink 
            to="/dashboard"
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:bg-slate-50 hover:text-primary'} group`}
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-semibold">Dashboard</span>
          </NavLink>
          <NavLink 
            to="/students"
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:bg-slate-50 hover:text-primary'} group`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">school</span>
            <span className="text-sm font-medium">Students</span>
          </NavLink>
          <NavLink 
            to="/finance"
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:bg-slate-50 hover:text-primary'} group`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">payments</span>
            <span className="text-sm font-medium">Finance</span>
          </NavLink>
          <button 
            onClick={() => navigate('/staff')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-slate-50 hover:text-primary transition-all group text-left"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">group</span>
            <span className="text-sm font-medium">Staff</span>
          </button>
          <NavLink 
            to="/reports"
            className={({isActive}) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${isActive ? 'bg-primary text-white shadow-md shadow-primary/20' : 'text-text-muted hover:bg-slate-50 hover:text-primary'} group`}
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">analytics</span>
            <span className="text-sm font-medium">Reports</span>
          </NavLink>
          <button 
            onClick={() => navigate('/settings')}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-text-muted hover:bg-slate-50 hover:text-primary transition-all group text-left"
          >
            <span className="material-symbols-outlined group-hover:scale-110 transition-transform">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </button>
        </nav>
      </div>
      <div className="mt-auto p-6 border-t border-surface-border">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer">
          <div className="size-10 rounded-full bg-slate-100 flex items-center justify-center text-primary font-bold border border-slate-200">JM</div>
          <div className="flex flex-col">
            <p className="text-text-main text-sm font-bold font-display">James Mwangi</p>
            <p className="text-text-muted text-xs">Bursar</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
