import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Code, Zap, Award } from 'lucide-react';

const performanceData = [
  { month: '1월', value: 4000, revenue: 2400 },
  { month: '2월', value: 3000, revenue: 1398 },
  { month: '3월', value: 5000, revenue: 3800 },
  { month: '4월', value: 4500, revenue: 3908 },
  { month: '5월', value: 6000, revenue: 4800 },
  { month: '6월', value: 7500, revenue: 6200 },
];

export default function HeroPanel() {
  return (
    <div className="bg-gradient-to-br from-blue-600 to-purple-700 rounded-xl p-6 text-white shadow-lg">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side - Quick Stats */}
        <div className="space-y-4">
          <div>
            <h1 className="text-2xl font-bold mb-1">대시보드 개요</h1>
            <p className="text-blue-100 text-sm">나의 프로젝트 현황</p>
          </div>

          <div className="space-y-3">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Code className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-100">이번 주 작업</p>
                  <p className="text-2xl font-bold">24시간</p>
                  <p className="text-xs text-blue-200">지난주 +12%</p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-blue-100">생산성 지수</p>
                  <p className="text-2xl font-bold">87%</p>
                  <p className="text-xs text-green-200">↑ 5% 증가</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle - Chart */}
        <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm rounded-lg p-5 border border-white/20">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">활동 추이</h3>
              <p className="text-xs text-blue-100 mt-1">최근 6개월 작업 시간</p>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="w-4 h-4 text-green-300" />
              <span className="text-green-300">+23%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ffffff" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ffffff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="month" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(255,255,255,0.95)', 
                  border: 'none', 
                  borderRadius: '8px',
                  color: '#1f2937',
                  fontSize: '12px'
                }} 
              />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#ffffff" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorValue)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}