import { useNavigate } from 'react-router-dom'
import { Bell, LifeBuoy, LogOut, Shield, ChevronRight, User } from 'lucide-react'
import { getAuthenticatedUser, logout } from '../services/auth'

export default function ProfilePage() {
  const navigate = useNavigate()
  const user = getAuthenticatedUser()
  const fullName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Livreur'
  const phoneNumber = user?.phoneNumber || '-'
  const roles = Array.isArray(user?.roles) ? user.roles : []

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  const MenuItem = ({ icon: Icon, label, onClick, danger = false }) => (
    <button 
      onClick={onClick}
      className="w-full flex items-center justify-between p-4 bg-white border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors"
    >
      <div className="flex items-center gap-4">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${danger ? 'bg-red-50 text-red-600' : 'bg-neutral-100 text-neutral-600'}`}>
          <Icon size={20} />
        </div>
        <span className={`font-bold ${danger ? 'text-red-600' : 'text-neutral-900'}`}>{label}</span>
      </div>
      <ChevronRight size={20} className="text-neutral-300" />
    </button>
  )

  return (
    <div className="space-y-6 pb-24">
      {/* Profile Header */}
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-neutral-100 flex items-center gap-4">
        <div className="w-16 h-16 bg-[#6aa200] rounded-full flex items-center justify-center text-white shadow-lg shadow-[#6aa200]/20">
          <User size={32} />
        </div>
        <div>
          <h1 className="text-xl font-black text-neutral-900">{fullName}</h1>
          <p className="text-neutral-500 font-medium text-sm">{phoneNumber}</p>
          <div className="flex gap-2 mt-2">
            {roles.map(role => (
              <span key={role} className="bg-neutral-100 text-neutral-600 text-[10px] font-bold px-2 py-1 rounded-full uppercase">
                {role}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
        <MenuItem 
          icon={Bell} 
          label="Notifications" 
          onClick={() => navigate('/notifications')} 
        />
        <MenuItem 
          icon={LifeBuoy} 
          label="Support & Aide" 
          onClick={() => navigate('/support')} 
        />
        <MenuItem 
          icon={Shield} 
          label="Sécurité" 
          onClick={() => {}} 
        />
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-neutral-100 overflow-hidden">
        <MenuItem 
          icon={LogOut} 
          label="Se déconnecter" 
          onClick={handleLogout} 
          danger
        />
      </div>

      <p className="text-center text-xs text-neutral-400 font-medium">
        Version 1.0.0 • LID Delivery
      </p>
    </div>
  )
}
