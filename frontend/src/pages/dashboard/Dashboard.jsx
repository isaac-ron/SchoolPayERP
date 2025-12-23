import React from 'react';
import Sidebar from '../../components/layout/Sidebar';

const Dashboard = () => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-white">
        {/* Header */}
        <header className="flex items-center justify-between px-8 py-5 border-b border-surface-border bg-white/90 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center gap-8">
          <button className="lg:hidden text-text-main">
            <span className="material-symbols-outlined">menu</span>
          </button>
          <h2 className="text-text-main text-2xl font-bold leading-tight tracking-tight font-display">Overview</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative hidden md:flex items-center w-72 h-11 bg-slate-50 border border-surface-border rounded-full overflow-hidden group focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            <div className="pl-4 pr-2 text-text-muted flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input 
              className="w-full bg-transparent border-none text-text-main text-sm placeholder:text-text-muted focus:ring-0 focus:outline-none h-full" 
              placeholder="Search student or adm no..."
            />
          </div>
          <button className="flex items-center justify-center gap-2 h-11 px-6 bg-primary hover:bg-blue-900 text-white text-sm font-bold rounded-full transition-colors shadow-lg shadow-blue-900/10">
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span className="hidden sm:inline">Record Payment</span>
          </button>
          <button className="size-11 flex items-center justify-center rounded-full bg-white border border-surface-border text-text-muted hover:text-primary hover:bg-slate-50 transition-all relative shadow-sm">
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            <span className="absolute top-2.5 right-3 size-2 bg-red-500 rounded-full border border-white"></span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 bg-slate-50/50">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
          {/* Total Collected Today */}
          <div className="flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-white shadow-sm relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute -top-2 -right-2 p-4 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
              <span className="material-symbols-outlined text-8xl text-primary">payments</span>
            </div>
            <div className="flex flex-col gap-2 z-10">
              <p className="text-text-muted text-sm font-semibold uppercase tracking-wide">Total Collected Today</p>
              <p className="text-text-main text-3xl font-extrabold tracking-tight font-display">KES 145,000</p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 z-10">
              <div className="bg-success/10 rounded-full px-2 py-0.5 flex items-center gap-1">
                <span className="material-symbols-outlined text-success text-sm">trending_up</span>
                <p className="text-success text-sm font-bold">+12%</p>
              </div>
              <p className="text-text-muted text-xs font-medium">vs yesterday</p>
            </div>
          </div>

          {/* Outstanding Balance */}
          <div className="flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-white shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute -top-2 -right-2 p-4 opacity-[0.03]">
              <span className="material-symbols-outlined text-8xl text-primary">account_balance_wallet</span>
            </div>
            <div className="flex flex-col gap-2 z-10">
              <p className="text-text-muted text-sm font-semibold uppercase tracking-wide">Outstanding Balance</p>
              <p className="text-text-main text-3xl font-extrabold tracking-tight font-display">KES 3.2M</p>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-6">
              <div className="bg-orange-500 h-2 rounded-full shadow-sm" style={{width: '35%'}}></div>
            </div>
            <p className="text-text-muted text-xs mt-2 font-medium">35% pending collection</p>
          </div>

          {/* Active Students */}
          <div className="flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-white shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute -top-2 -right-2 p-4 opacity-[0.03]">
              <span className="material-symbols-outlined text-8xl text-primary">groups</span>
            </div>
            <div className="flex flex-col gap-2 z-10">
              <p className="text-text-muted text-sm font-semibold uppercase tracking-wide">Active Students</p>
              <p className="text-text-main text-3xl font-extrabold tracking-tight font-display">842</p>
            </div>
            <div className="mt-5 flex -space-x-3">
              <div 
                className="size-9 rounded-full bg-slate-200 border-2 border-white shadow-sm bg-cover bg-center" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC8Ry5tBN6w6U-cd6_sWJYT8Z5Jcmosjh23Vi1pn9G-uO07IWU_ESJLPP1hKWDaBPqE2rUuwcclR6na9RcPMxhONZpK_cPuuxz68Ud7hSM3zEp0XRwiDibtJpy6V6ZNIk6Zn4WZ6HCAMcCSv-kCZa4WnhRFRaH9Tm2oAqfl4uhbiUhYEeul29M4cbw1RlrqCrLg-ytoMs0ofXaCHIxR2gtrR8LhWg5AXj8aZKGFtl6AfpUzn1_d-i7trjjeVzVLqb4o1IPRc2X4eYA")'}}
              ></div>
              <div 
                className="size-9 rounded-full bg-slate-200 border-2 border-white shadow-sm bg-cover bg-center" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCdVXIFXdomV4OS9LsSWB1gu5_-5daCA296-hI7__yKXBQYjt26v5pYjUgl0c5r-wdHO8nT5Za6Weqr8kCqBs0HsjDcmsAZWa2pb1jK7qw4Qw6MMhrU3M6-FmW2HIklyIOtG6tM3E5_qYB11XDQZucOmwfA149LuVIDyRarK-lyNXGVuu0wKtfF6_nT8tIFs5Zig8CX0fnK3oENs3KSLSVsfiU34Przj0BJnjx9wNJOZPdYVTZU4IylR--6d4aQ1uA6nDPszwHPm1Q")'}}
              ></div>
              <div 
                className="size-9 rounded-full bg-slate-200 border-2 border-white shadow-sm bg-cover bg-center" 
                style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCuWp_GHVYbqEfkQfQZJTrFsYHaKGLykI6E_01fa48VT0nEJDSEfSvngn-zthc_M6TfD67R8wBuRAF-w_JZpBxaLi7b_HsYlsu2uGBNKds33NkYxMc28sSlwINkmI7VTS8Of609UOLciR4EbnsHjtZ_G8jHSv8fjWrqmVpPsCWlVdL0Nj3Ecjdxbz-saqIM-G568YmjvqVY8VcjVHYjnDS8WINM3dozRR8VMtIFdaV0J1mCSGku3DzW2QnU1VNOebL5jgdietEplq4")'}}
              ></div>
              <div className="size-9 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-text-muted font-bold shadow-sm">+839</div>
            </div>
          </div>

          {/* SMS Sent */}
          <div className="flex flex-col justify-between p-6 rounded-2xl border border-surface-border bg-white shadow-sm relative overflow-hidden hover:shadow-md transition-shadow">
            <div className="absolute -top-2 -right-2 p-4 opacity-[0.03]">
              <span className="material-symbols-outlined text-8xl text-primary">sms</span>
            </div>
            <div className="flex flex-col gap-2 z-10">
              <p className="text-text-muted text-sm font-semibold uppercase tracking-wide">SMS Sent</p>
              <p className="text-text-main text-3xl font-extrabold tracking-tight font-display">1,204</p>
            </div>
            <div className="flex items-center gap-1.5 mt-5 z-10">
              <span className="material-symbols-outlined text-primary text-lg">check_circle</span>
              <p className="text-text-muted text-xs font-medium">All systems operational</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Fee Collection Trends Chart */}
          <div className="lg:col-span-2 rounded-2xl border border-surface-border bg-white p-6 flex flex-col shadow-sm">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-text-main text-xl font-bold font-display">Fee Collection Trends</h3>
                <p className="text-text-muted text-sm mt-1">Last 30 Days</p>
              </div>
              <div className="text-right">
                <p className="text-primary text-2xl font-bold tracking-tight font-display">KES 4.5M</p>
                <p className="text-text-muted text-xs uppercase tracking-wider font-bold">Revenue</p>
              </div>
            </div>
            <div className="flex-1 w-full min-h-[250px] relative">
              <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 800 200">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{stopColor:'#1e3a8a', stopOpacity:0.1}} />
                    <stop offset="100%" style={{stopColor:'#1e3a8a', stopOpacity:0}} />
                  </linearGradient>
                </defs>
                <line stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" x1="0" y1="150" x2="800" y2="150" />
                <line stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" x1="0" y1="100" x2="800" y2="100" />
                <line stroke="#e2e8f0" strokeDasharray="4" strokeWidth="1" x1="0" y1="50" x2="800" y2="50" />
                <path d="M0,150 C100,150 150,80 200,80 C250,80 300,120 400,100 C500,80 550,20 650,40 C720,54 750,10 800,30 V200 H0 Z" fill="url(#gradient)" />
                <path d="M0,150 C100,150 150,80 200,80 C250,80 300,120 400,100 C500,80 550,20 650,40 C720,54 750,10 800,30" fill="none" stroke="#1e3a8a" strokeLinecap="round" strokeWidth="3" />
                <circle cx="200" cy="80" r="5" fill="white" stroke="#1e3a8a" strokeWidth="2" />
                <circle cx="400" cy="100" r="5" fill="white" stroke="#1e3a8a" strokeWidth="2" />
                <circle className="animate-pulse" cx="650" cy="40" r="6" fill="#1e3a8a" stroke="white" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex justify-between text-text-muted text-xs font-bold mt-4 uppercase tracking-wide border-t border-slate-100 pt-4">
              <span>Week 1</span>
              <span>Week 2</span>
              <span>Week 3</span>
              <span>Week 4</span>
            </div>
          </div>

          {/* Payment Methods Chart */}
          <div className="rounded-2xl border border-surface-border bg-white p-6 flex flex-col shadow-sm">
            <h3 className="text-text-main text-xl font-bold font-display mb-1">Payment Methods</h3>
            <p className="text-text-muted text-sm mb-6">MPESA vs Bank</p>
            <div className="flex-1 flex items-center justify-center relative my-4">
              <div className="size-56 rounded-full relative" style={{background: 'conic-gradient(#1e3a8a 0% 75%, #94a3b8 75% 100%)'}}>
                <div className="absolute inset-8 bg-white rounded-full flex flex-col items-center justify-center z-10 shadow-inner">
                  <span className="text-4xl font-extrabold text-text-main font-display">75%</span>
                  <span className="text-xs text-text-muted font-bold tracking-wider uppercase mt-1">MPESA</span>
                </div>
              </div>
            </div>
            <div className="flex justify-center gap-8 mt-6 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-primary"></span>
                <span className="text-sm text-text-main font-semibold">MPESA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-slate-400"></span>
                <span className="text-sm text-text-main font-semibold">Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Transactions Feed */}
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-text-main text-xl font-bold tracking-tight font-display">Live Transactions Feed</h3>
            <button className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              View All
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
          <div className="rounded-2xl border border-surface-border bg-white overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-surface-border text-text-muted text-xs uppercase tracking-wider font-bold">
                    <th className="p-5 pl-8 font-semibold">Transaction ID</th>
                    <th className="p-5 font-semibold">Student Name</th>
                    <th className="p-5 font-semibold">Amount</th>
                    <th className="p-5 font-semibold">Source</th>
                    <th className="p-5 pr-8 font-semibold text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-surface-border">
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-5 pl-8 text-text-main font-mono text-xs font-medium">#TXN-8842</td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-text-main font-bold">Alice Wanjiku</span>
                        <span className="text-text-muted text-xs">Adm: 4022</span>
                      </div>
                    </td>
                    <td className="p-5 text-success font-extrabold text-base">KES 12,000</td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                        MPESA
                      </span>
                    </td>
                    <td className="p-5 pr-8 text-text-muted text-right font-medium">10:42 AM</td>
                  </tr>
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-5 pl-8 text-text-main font-mono text-xs font-medium">#TXN-8841</td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-text-main font-bold">Brian Ochieng</span>
                        <span className="text-text-muted text-xs">Adm: 3910</span>
                      </div>
                    </td>
                    <td className="p-5 text-success font-extrabold text-base">KES 45,000</td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        BANK
                      </span>
                    </td>
                    <td className="p-5 pr-8 text-text-muted text-right font-medium">10:38 AM</td>
                  </tr>
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-5 pl-8 text-text-main font-mono text-xs font-medium">#TXN-8840</td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-text-main font-bold">Grace Kamau</span>
                        <span className="text-text-muted text-xs">Adm: 4105</span>
                      </div>
                    </td>
                    <td className="p-5 text-success font-extrabold text-base">KES 8,500</td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                        MPESA
                      </span>
                    </td>
                    <td className="p-5 pr-8 text-text-muted text-right font-medium">10:15 AM</td>
                  </tr>
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-5 pl-8 text-text-main font-mono text-xs font-medium">#TXN-8839</td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-text-main font-bold">Daniel Kiprop</span>
                        <span className="text-text-muted text-xs">Adm: 4055</span>
                      </div>
                    </td>
                    <td className="p-5 text-success font-extrabold text-base">KES 2,000</td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-green-50 text-green-700 border border-green-100">
                        MPESA
                      </span>
                    </td>
                    <td className="p-5 pr-8 text-text-muted text-right font-medium">09:55 AM</td>
                  </tr>
                  <tr className="group hover:bg-slate-50 transition-colors">
                    <td className="p-5 pl-8 text-text-main font-mono text-xs font-medium">#TXN-8838</td>
                    <td className="p-5">
                      <div className="flex flex-col">
                        <span className="text-text-main font-bold">Sarah Njoroge</span>
                        <span className="text-text-muted text-xs">Adm: 3882</span>
                      </div>
                    </td>
                    <td className="p-5 text-success font-extrabold text-base">KES 24,000</td>
                    <td className="p-5">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                        BANK
                      </span>
                    </td>
                    <td className="p-5 pr-8 text-text-muted text-right font-medium">09:12 AM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="h-8"></div>
      </div>
      </div>
    </div>
  );
};

export default Dashboard;

