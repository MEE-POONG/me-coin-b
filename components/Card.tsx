interface CardProps {
  title: string
  value: string | number
  icon: string
  color?: string
}

export default function Card({ title, value, icon, color = 'primary' }: CardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm mb-1">{title}</p>
          <p className={`text-3xl font-bold text-${color}-600`}>{value}</p>
        </div>
        <div className="text-5xl">{icon}</div>
      </div>
    </div>
  )
}

