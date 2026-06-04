// Recharts class components vs React 18 JSX types (see recharts#3590)
// @ts-nocheck
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ReadingTimeChartProps {
  data: { date: string; pagesRead: number }[];
}

export function ReadingTimeChart({ data }: ReadingTimeChartProps) {
  // Format the last 7 days nicely
  const formattedData = data.map((item) => {
    let dayLabel = '';
    try {
      dayLabel = format(new Date(item.date), 'EEE d', { locale: es });
    } catch {
      dayLabel = item.date;
    }
    return {
      ...item,
      dayLabel,
      pages: item.pagesRead,
    };
  });

  return (
    <div className="rounded-2xl glass-card p-6 border border-[var(--color-cardBorder)] shadow-md">
      <div className="mb-6">
        <h3 className="text-base font-bold text-[var(--color-text)] font-display">
          Actividad Reciente de Lectura
        </h3>
        <p className="text-[11px] text-[var(--color-textSecondary)] mt-0.5 font-light">
          Páginas leídas por día
        </p>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={formattedData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
          <defs>
            <linearGradient id="pagesGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.6} />
          <XAxis 
            dataKey="dayLabel" 
            stroke="var(--color-textSecondary)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dy={8}
            fontFamily="Outfit, Inter, sans-serif"
          />
          <YAxis 
            stroke="var(--color-textSecondary)"
            fontSize={10}
            tickLine={false}
            axisLine={false}
            dx={-8}
            allowDecimals={false}
            fontFamily="Outfit, Inter, sans-serif"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-cardBorder)',
              borderRadius: '16px',
              fontFamily: 'Outfit, Inter, sans-serif',
              fontSize: '11px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.06)',
            }}
            labelClassName="font-bold text-[var(--color-text)]"
            itemStyle={{ color: 'var(--color-primary)' }}
            formatter={(value: number) => [`${value} páginas`, 'Leído']}
          />
          <Area
            type="monotone"
            dataKey="pages"
            stroke="var(--color-primary)"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#pagesGradient)"
            dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-accent)' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
