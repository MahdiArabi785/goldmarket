'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function GoldPriceChart({ data }: { data: { date: string; price: number }[] }) {
  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>📈 روند قیمت طلا (۳۰ روز اخیر)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`${value.toLocaleString()} تومان`, 'قیمت']}
            />
            <Line type="monotone" dataKey="price" stroke="#f59e0b" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}