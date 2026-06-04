// @ts-nocheck
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface DistributionChartProps {
  data: { key: string; count: number }[];
  title: string;
}

const COLORS = [
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#ec4899', // pink
  '#8b5cf6', // purple
  '#ef4444', // red
  '#06b6d4', // cyan
  '#64748b', // slate
];

export function GenreDistributionChart({ data, title }: DistributionChartProps) {
  const total = data.reduce((sum, item) => sum + item.count, 0);

  // Format data for chart
  const chartData = data.slice(0, 7).map((item) => ({
    name: item.key,
    value: item.count,
  }));

  // Add an "Others" item if categories count exceeds 7
  if (data.length > 7) {
    const othersCount = data.slice(7).reduce((sum, item) => sum + item.count, 0);
    chartData.push({
      name: 'Otros',
      value: othersCount,
    });
  }

  return (
    <div className="rounded-2xl glass-card p-6 border border-[var(--color-cardBorder)] shadow-md flex flex-col justify-between">
      <div>
        <h3 className="text-base font-bold text-[var(--color-text)] font-display">
          {title}
        </h3>
        <p className="text-[11px] text-[var(--color-textSecondary)] mt-0.5 font-light">
          Distribución por cantidad de ejemplares
        </p>
      </div>

      {chartData.length === 0 ? (
        <div className="py-12 text-center text-xs text-[var(--color-textSecondary)]">
          No hay datos suficientes
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mt-4">
          <div className="relative h-44 w-44 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="var(--color-surface)" strokeWidth={1} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-surface)',
                    border: '1px solid var(--color-cardBorder)',
                    borderRadius: '12px',
                    fontFamily: 'Outfit, Inter, sans-serif',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center Stat */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <span className="text-xs font-bold text-[var(--color-textSecondary)] uppercase tracking-wider">Total</span>
              <span className="text-2xl font-bold font-display text-[var(--color-text)]">{total}</span>
            </div>
          </div>

          {/* Legend Items */}
          <div className="flex-1 w-full space-y-2 max-h-40 overflow-y-auto pr-1">
            {chartData.map((item, index) => {
              const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <span 
                      className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-[var(--color-text)] font-semibold truncate font-display">{item.name}</span>
                  </div>
                  <div className="flex gap-2 text-[var(--color-textSecondary)] font-light">
                    <span>{item.value}</span>
                    <span className="font-semibold text-[var(--color-textSecondary)]/80">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
