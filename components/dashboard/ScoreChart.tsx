'use client'
// components/dashboard/ScoreChart.tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart
} from 'recharts'

interface ChartPoint { name: string; score: number; date: string }

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  const score = payload[0].value
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-xl">
      <p className="text-xs text-muted-foreground mb-0.5">{payload[0]?.payload?.date ?? label}</p>
      <p className="text-base font-display" style={{ color }}>{score}<span className="text-xs text-muted-foreground">/100</span></p>
    </div>
  )
}

export function ScoreChart({ data }: { data: ChartPoint[] }) {
  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 16% 14%)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fill: 'hsl(215 14% 48%)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[0, 100]}
          tick={{ fill: 'hsl(215 14% 48%)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          ticks={[0, 25, 50, 75, 100]}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={60} stroke="hsl(222 16% 20%)" strokeDasharray="4 4" />
        <ReferenceLine y={80} stroke="hsl(222 16% 20%)" strokeDasharray="4 4" />
        <Area
          type="monotone"
          dataKey="score"
          stroke="#10b981"
          strokeWidth={2}
          fill="url(#scoreGradient)"
          dot={{ fill: '#10b981', r: 3, strokeWidth: 0 }}
          activeDot={{ fill: '#10b981', r: 5, strokeWidth: 2, stroke: 'hsl(222 20% 6%)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
