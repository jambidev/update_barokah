import React, { useState } from 'react';
import { useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import { 
  BarChart3, 
  Users, 
  Calendar, 
  Settings, 
  Bell, 
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Monitor,
  Laptop,
  Printer,
  Wrench,
  Shield,
  Zap,
  LogOut,
  Plus,
  Save,
  X
} from 'lucide-react';
import { getAllBookings } from '../utils/bookingSupabase';
import { 
  fetchTechnicians, 
  updateBookingStatus, 
  assignTechnician,
  fetchPrinterBrands,
  fetchProblemCategories,
  addPrinterBrand,
  addPrinterModel,
  updatePrinterModel,
  deletePrinterModel,
  addProblemCategory,
  addProblem,
  updateProblem,
  deleteProblem,
  updatePrinterBrand,
  updateProblemCategory,
  deleteTechnician,
  deletePrinterBrand,
  deleteProblemCategory
} from '../utils/supabaseData';
import NotificationSystem from './NotificationSystem';
import { supabase } from '../utils/supabase';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

interface TechnicianFormModalProps {
  technician?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

interface ScheduleModalProps {
  technician: any;
  onClose: () => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({ technician, onClose }) => {
  const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];
  
  // Parse schedule string (e.g., "Senin-Jumat 08:00-17:00")
  const parseSchedule = (scheduleStr: string) => {
    if (!scheduleStr) return { days: [], time: '' };
    
    const parts = scheduleStr.split(' ');
    const dayRange = parts[0] || '';
    const timeRange = parts[1] || '';
    
    let workingDays: string[] = [];
    
    if (dayRange.includes('-')) {
      const [start, end] = dayRange.split('-');
      const startIndex = days.indexOf(start);
      const endIndex = days.indexOf(end);
      
      if (startIndex !== -1 && endIndex !== -1) {
        for (let i = startIndex; i <= endIndex; i++) {
          workingDays.push(days[i]);
        }
      }
    } else {
      workingDays = dayRange.split(',').map(d => d.trim());
    }
    
    return { days: workingDays, time: timeRange };
  };
  
  const schedule = parseSchedule(technician?.schedule || '');
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Jadwal Kerja - {technician?.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-2">Informasi Teknisi</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-blue-700">Nama:</span>
                  <span className="font-medium">{technician?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Telepon:</span>
                  <span className="font-medium">{technician?.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-700">Status:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    technician?.is_available 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {technician?.is_available ? 'Tersedia' : 'Sibuk'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Jadwal Kerja Mingguan</h4>
              <div className="grid grid-cols-7 gap-1 mb-4">
                {days.map((day) => (
                  <div
                    key={day}
                    className={`text-center p-2 rounded text-xs font-medium ${
                      schedule.days.includes(day)
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {day.substring(0, 3)}
                  </div>
                ))}
              </div>
              
              {schedule.time && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Jam Kerja:</span>
                    <span className="font-medium text-lg">{schedule.time} WIB</span>
                  </div>
                </div>
              )}
              
              <div className="mt-4 text-sm text-gray-600">
                <p><strong>Jadwal Lengkap:</strong> {technician?.schedule || 'Tidak ada jadwal'}</p>
              </div>
            </div>
            
            <div className="bg-yellow-50 p-3 rounded-lg">
              <h5 className="font-medium text-yellow-800 mb-1">Spesialisasi</h5>
              <div className="flex flex-wrap gap-1">
                {technician?.specialization?.map((spec: string, index: number) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                  >
                    {spec}
                  </span>
                )) || <span className="text-yellow-700 text-sm">Tidak ada spesialisasi</span>}
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={onClose}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const TechnicianFormModal: React.FC<TechnicianFormModalProps> = ({ technician, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: technician?.name || '',
    phone: technician?.phone || '',
    email: technician?.email || '',
    experience: technician?.experience || '',
    rating: technician?.rating || '',
    specialization: technician?.specialization || [],
    schedule: technician?.schedule || 'Senin-Jumat 08:00-17:00'
  });

  const [newSpecialization, setNewSpecialization] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specialization.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const removeSpecialization = (spec: string) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter(s => s !== spec)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {technician ? 'Edit Teknisi' : 'Tambah Teknisi'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nomor Telepon *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Pengalaman (tahun) *
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating (1-5)
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Spesialisasi
              </label>
              <div className="flex space-x-2 mb-2">
                <input
                  type="text"
                  value={newSpecialization}
                  onChange={(e) => setNewSpecialization(e.target.value)}
                  placeholder="Tambah spesialisasi"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecialization())}
                />
                <button
                  type="button"
                  onClick={addSpecialization}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.specialization.map((spec, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                  >
                    {spec}
                    <button
                      type="button"
                      onClick={() => removeSpecialization(spec)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Jadwal Kerja
              </label>
              <input
                type="text"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                placeholder="Contoh: Senin-Jumat 08:00-17:00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {technician ? 'Update' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface AddFormModalProps {
  type: 'brand' | 'category' | 'technician' | null;
  item?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

interface ModelFormModalProps {
  brand: any;
  model?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

const ModelFormModal: React.FC<ModelFormModalProps> = ({ brand, model, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: model?.name || '',
    type: model?.type || 'inkjet'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSave(formData);
  };

  const typeOptions = [
    { value: 'inkjet', label: 'Inkjet' },
    { value: 'laser', label: 'Laser' },
    { value: 'multifunction', label: 'Multifunction' },
    { value: 'dot_matrix', label: 'Dot Matrix' },
    { value: 'thermal', label: 'Thermal' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {model ? 'Edit' : 'Tambah'} Model - {brand?.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Model
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama model..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipe Printer
              </label>
              <select
                value={formData.type}
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {model ? 'Update' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

interface ProblemFormModalProps {
  category: any;
  problem?: any;
  onSave: (data: any) => void;
  onClose: () => void;
}

const ProblemFormModal: React.FC<ProblemFormModalProps> = ({ category, problem, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: problem?.name || '',
    description: problem?.description || '',
    severity: problem?.severity || 'medium',
    estimated_time: problem?.estimated_time || '',
    estimated_cost: problem?.estimated_cost || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.description.trim()) return;
    
    onSave(formData);
  };

  const severityOptions = [
    { value: 'low', label: 'Rendah', color: 'text-green-600' },
    { value: 'medium', label: 'Sedang', color: 'text-yellow-600' },
    { value: 'high', label: 'Tinggi', color: 'text-red-600' }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {problem ? 'Edit' : 'Tambah'} Masalah - {category?.name}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Masalah
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan nama masalah..."
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deskripsi
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Masukkan deskripsi masalah..."
                rows={3}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tingkat Keparahan
              </label>
              <select
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {severityOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Waktu
                </label>
                <input
                  type="text"
                  value={formData.estimated_time}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_time: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1-2 jam"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimasi Biaya
                </label>
                <input
                  type="text"
                  value={formData.estimated_cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimated_cost: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rp 50.000"
                />
              </div>
            </div>
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {problem ? 'Update' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AddFormModal: React.FC<AddFormModalProps> = ({ type, item, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: item?.name || '',
    icon: item?.icon || '🔧'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    
    onSave(formData);
  };

  const iconOptions = [
    '🔧', '⚙️', '🖨️', '💻', '📱', '🔌', '🔋', '💡', '🛠️', '⚡',
    '🖥️', '📟', '🔍', '📊', '📈', '🎯', '⭐', '🚀', '💎', '🔥'
  ];

  if (!type) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {item ? 'Edit' : 'Tambah'} {type === 'brand' ? 'Merk Printer' : 'Kategori Masalah'}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama {type === 'brand' ? 'Merk' : 'Kategori'}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder={`Masukkan nama ${type === 'brand' ? 'merk' : 'kategori'}...`}
                required
              />
            </div>
            
            {type === 'category' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Icon Kategori
                </label>
                <div className="grid grid-cols-10 gap-2 p-3 border border-gray-300 rounded-lg max-h-32 overflow-y-auto">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, icon }))}
                      className={`p-2 text-lg rounded hover:bg-gray-100 ${
                        formData.icon === icon ? 'bg-blue-100 ring-2 ring-blue-500' : ''
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Icon terpilih: <span className="text-lg">{formData.icon}</span>
                </p>
              </div>
            )}
            
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Batal
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {item ? 'Update' : 'Tambah'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [bookings, setBookings] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [printerBrands, setPrinterBrands] = useState<any[]>([]);
  const [problemCategories, setProblemCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editingType, setEditingType] = useState<'brand' | 'category' | 'technician' | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [editingTechnician, setEditingTechnician] = useState<any>(null);
  const [editingBrand, setEditingBrand] = useState<any>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [showTechnicianModal, setShowTechnicianModal] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedTechnician, setSelectedTechnician] = useState<any>(null);
  const [showModelModal, setShowModelModal] = useState(false);
  const [showProblemModal, setShowProblemModal] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [editingModel, setEditingModel] = useState<any>(null);
  const [editingProblem, setEditingProblem] = useState<any>(null);
  const [stats, setStats] = useState({
    totalBookings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    totalRevenue: 0,
    thisMonthRevenue: 0,
    activeTechnicians: 0
  });

  const prevBookingsLength = useRef(0);

  // Load data from Supabase with realtime subscriptions
  useEffect(() => {
    const loadData = async () => {
      try {
        const [bookingsData, techniciansData, brandsData, categoriesData] = await Promise.all([
          getAllBookings(),
          fetchTechnicians(),
          fetchPrinterBrands(),
          fetchProblemCategories()
        ]);
        
        setBookings(bookingsData);
        setTechnicians(techniciansData);
        setPrinterBrands(brandsData);
        setProblemCategories(categoriesData);
        
        // Calculate stats
        const totalBookings = bookingsData.length;
        const pendingBookings = bookingsData.filter(b => b.status === 'pending').length;
        const completedBookings = bookingsData.filter(b => b.status === 'completed').length;
        const activeTechnicians = techniciansData.filter(t => t.is_active).length;
        
        setStats({
          totalBookings,
          pendingBookings,
          completedBookings,
          totalRevenue: completedBookings * 100000, // Estimate
          thisMonthRevenue: completedBookings * 50000, // Estimate
          activeTechnicians
        });

        // Check for new bookings and send notifications
        if (prevBookingsLength.current > 0 && bookingsData.length > prevBookingsLength.current) {
          const newBookings = bookingsData.slice(0, bookingsData.length - prevBookingsLength.current);
          newBookings.forEach(booking => {
            // Add notification to dashboard
            setNotifications(prev => [...prev, {
              id: Date.now(),
              message: `Booking baru dari ${booking.customer.name} - ${booking.id}`,
              timestamp: new Date().toISOString()
            }]);
          });
        }
        prevBookingsLength.current = bookingsData.length;
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();

    // Setup realtime subscriptions
    const bookingsChannel = supabase
      .channel('bookings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'service_bookings'
      }, async (payload) => {
        console.log('Booking change detected:', payload);
        // Reload bookings data
        const updatedBookings = await getAllBookings();
        setBookings(updatedBookings);
        
        // Update stats
        const totalBookings = updatedBookings.length;
        const pendingBookings = updatedBookings.filter(b => b.status === 'pending').length;
        const completedBookings = updatedBookings.filter(b => b.status === 'completed').length;
        
        setStats(prev => ({
          ...prev,
          totalBookings,
          pendingBookings,
          completedBookings,
          totalRevenue: completedBookings * 100000,
          thisMonthRevenue: completedBookings * 50000
        }));
        
        // Show notification for new bookings
        if (payload.eventType === 'INSERT') {
          setNotifications(prev => [...prev, {
            id: Date.now(),
            message: `Booking baru diterima - ${payload.new.id}`,
            timestamp: new Date().toISOString()
          }]);
        }
      })
      .subscribe();

    const techniciansChannel = supabase
      .channel('technicians-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'technicians'
      }, async () => {
        console.log('Technician change detected');
        const updatedTechnicians = await fetchTechnicians();
        setTechnicians(updatedTechnicians);
        
        const activeTechnicians = updatedTechnicians.filter(t => t.is_active).length;
        setStats(prev => ({ ...prev, activeTechnicians }));
      })
      .subscribe();

    const brandsChannel = supabase
      .channel('brands-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'printer_brands'
      }, async () => {
        console.log('Printer brand change detected');
        const updatedBrands = await fetchPrinterBrands();
        setPrinterBrands(updatedBrands);
      })
      .subscribe();

    const modelsChannel = supabase
      .channel('models-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'printer_models'
      }, async () => {
        console.log('Printer model change detected');
        const updatedBrands = await fetchPrinterBrands();
        setPrinterBrands(updatedBrands);
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('categories-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'problem_categories'
      }, async () => {
        console.log('Problem category change detected');
        const updatedCategories = await fetchProblemCategories();
        setProblemCategories(updatedCategories);
      })
      .subscribe();

    const problemsChannel = supabase
      .channel('problems-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'problems'
      }, async () => {
        console.log('Problem change detected');
        const updatedCategories = await fetchProblemCategories();
        setProblemCategories(updatedCategories);
      })
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(techniciansChannel);
      supabase.removeChannel(brandsChannel);
      supabase.removeChannel(modelsChannel);
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(problemsChannel);
    };
  }, []);

  // Removed auto-refresh to prevent unwanted page reloads

  // Add new printer brand
  const handleAddPrinterBrand = async (name: string) => {
    try {
      if (editingBrand) {
        await updatePrinterBrand(editingBrand.id, name);
        setEditingBrand(null);
      } else {
        await addPrinterBrand(name);
      }
      const updatedBrands = await fetchPrinterBrands();
      setPrinterBrands(updatedBrands);
      setShowAddForm(false);
      setEditingType(null);
      setEditingBrand(null);
    } catch (error) {
      console.error('Error adding printer brand:', error);
    }
  };

  // Add new problem category
  const handleAddProblemCategory = async (name: string, icon: string) => {
    try {
      if (editingCategory) {
        await updateProblemCategory(editingCategory.id, name, icon);
        setEditingCategory(null);
      } else {
        await addProblemCategory(name, icon);
      }
      const updatedCategories = await fetchProblemCategories();
      setProblemCategories(updatedCategories);
      setShowAddForm(false);
      setEditingType(null);
      setEditingCategory(null);
    } catch (error) {
      console.error('Error adding problem category:', error);
    }
  };

  // Add new technician
  const handleAddTechnician = async (data: any) => {
    try {
      if (editingTechnician) {
        await supabase.from('technicians').update({
          name: data.name,
          phone: data.phone,
          email: data.email,
          specialization: data.specialization,
          experience: parseInt(data.experience),
          rating: parseFloat(data.rating) || 0,
          schedule: data.schedule
        }).eq('id', editingTechnician.id);
        setEditingTechnician(null);
      } else {
        await supabase.from('technicians').insert({
          name: data.name,
          phone: data.phone,
          email: data.email,
          specialization: data.specialization,
          experience: parseInt(data.experience),
          rating: parseFloat(data.rating) || 0,
          schedule: data.schedule
        });
      }
      const updatedTechnicians = await fetchTechnicians();
      setTechnicians(updatedTechnicians);
      setShowTechnicianModal(false);
    } catch (error) {
      console.error('Error adding technician:', error);
    }
  };

  const handleEditTechnician = (e: React.MouseEvent, technician: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setEditingTechnician(technician);
    setShowTechnicianModal(true);
  };

  const handleAddNewTechnician = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setEditingTechnician(null);
    setShowTechnicianModal(true);
  };

  const handleViewSchedule = (e: React.MouseEvent, technician: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedTechnician(technician);
    setShowScheduleModal(true);
  };

  const handleDeleteTechnician = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Hapus Teknisi?',
      text: 'Data teknisi akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteTechnician(id);
        const updatedTechnicians = await fetchTechnicians();
        setTechnicians(updatedTechnicians);
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Teknisi berhasil dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus teknisi',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const handleEditBrand = (e: React.MouseEvent, brand: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setEditingBrand(brand);
    setEditingType('brand');
    setShowAddForm(true);
  };

  const handleEditCategory = (e: React.MouseEvent, category: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setEditingCategory(category);
    setEditingType('category');
    setShowAddForm(true);
  };

  const handleDeleteBrand = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Hapus Merk Printer?',
      text: 'Data merk printer akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deletePrinterBrand(id);
        const updatedBrands = await fetchPrinterBrands();
        setPrinterBrands(updatedBrands);
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Merk printer berhasil dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus merk printer',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Hapus Kategori?',
      text: 'Data kategori akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteProblemCategory(id);
        const updatedCategories = await fetchProblemCategories();
        setProblemCategories(updatedCategories);
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Kategori berhasil dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus kategori',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  // Model management handlers
  const handleAddModel = (e: React.MouseEvent, brand: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedBrand(brand);
    setEditingModel(null);
    setShowModelModal(true);
  };

  const handleEditModel = (e: React.MouseEvent, brand: any, model: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedBrand(brand);
    setEditingModel(model);
    setShowModelModal(true);
  };

  const handleDeleteModel = async (e: React.MouseEvent, modelId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Hapus Model?',
      text: 'Data model akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deletePrinterModel(modelId);
        const updatedBrands = await fetchPrinterBrands();
        setPrinterBrands(updatedBrands);
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Model berhasil dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus model',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const handleSaveModel = async (data: any) => {
    try {
      if (editingModel) {
        await updatePrinterModel(editingModel.id, data.name, data.type);
      } else {
        await addPrinterModel(selectedBrand.id, data.name, data.type);
      }
      
      const updatedBrands = await fetchPrinterBrands();
      setPrinterBrands(updatedBrands);
      setShowModelModal(false);
      setSelectedBrand(null);
      setEditingModel(null);
      
      Swal.fire({
        title: 'Berhasil!',
        text: `Model ${editingModel ? 'diperbarui' : 'ditambahkan'} dengan sukses`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: `Gagal ${editingModel ? 'memperbarui' : 'menambahkan'} model`,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };

  // Problem management handlers
  const handleAddProblem = (e: React.MouseEvent, category: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedCategory(category);
    setEditingProblem(null);
    setShowProblemModal(true);
  };

  const handleEditProblem = (e: React.MouseEvent, category: any, problem: any) => {
    e.preventDefault();
    e.stopPropagation();
    
    setSelectedCategory(category);
    setEditingProblem(problem);
    setShowProblemModal(true);
  };

  const handleDeleteProblem = async (e: React.MouseEvent, problemId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const result = await Swal.fire({
      title: 'Hapus Masalah?',
      text: 'Data masalah akan dihapus secara permanen!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
      reverseButtons: true
    });

    if (result.isConfirmed) {
      try {
        await deleteProblem(problemId);
        const updatedCategories = await fetchProblemCategories();
        setProblemCategories(updatedCategories);
        
        Swal.fire({
          title: 'Berhasil!',
          text: 'Masalah berhasil dihapus',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        Swal.fire({
          title: 'Error!',
          text: 'Gagal menghapus masalah',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const handleSaveProblem = async (data: any) => {
    try {
      if (editingProblem) {
        await updateProblem(
          editingProblem.id, 
          data.name, 
          data.description, 
          data.severity, 
          data.estimated_time, 
          data.estimated_cost
        );
      } else {
        await addProblem(
          selectedCategory.id, 
          data.name, 
          data.description, 
          data.severity, 
          data.estimated_time, 
          data.estimated_cost
        );
      }
      
      const updatedCategories = await fetchProblemCategories();
      setProblemCategories(updatedCategories);
      setShowProblemModal(false);
      setSelectedCategory(null);
      setEditingProblem(null);
      
      Swal.fire({
        title: 'Berhasil!',
        text: `Masalah ${editingProblem ? 'diperbarui' : 'ditambahkan'} dengan sukses`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: `Gagal ${editingProblem ? 'memperbarui' : 'menambahkan'} masalah`,
        icon: 'error',
        confirmButtonColor: '#dc2626'
      });
    }
  };
  
  // Service data
  const serviceCategories = {
    komputer: {
      title: 'Layanan Komputer',
      icon: Monitor,
      services: [
        {
          name: 'Install Ulang Windows',
          description: 'Install ulang sistem operasi Windows dengan driver lengkap',
          price: 'Rp 150.000',
          duration: '2-3 jam',
          category: 'Software'
        },
        {
          name: 'Upgrade RAM & Storage',
          description: 'Upgrade memory RAM dan storage SSD/HDD',
          price: 'Rp 100.000',
          duration: '1-2 jam',
          category: 'Hardware'
        },
        {
          name: 'Cleaning & Maintenance',
          description: 'Pembersihan hardware dan maintenance rutin',
          price: 'Rp 75.000',
          duration: '1 jam',
          category: 'Maintenance'
        },
        {
          name: 'Virus Removal',
          description: 'Pembersihan virus dan malware lengkap',
          price: 'Rp 100.000',
          duration: '2-4 jam',
          category: 'Security'
        },
        {
          name: 'Data Recovery',
          description: 'Pemulihan data yang hilang atau terhapus',
          price: 'Rp 200.000',
          duration: '4-8 jam',
          category: 'Recovery'
        },
        {
          name: 'Network Setup',
          description: 'Konfigurasi jaringan dan internet',
          price: 'Rp 125.000',
          duration: '1-2 jam',
          category: 'Network'
        }
      ]
    },
    laptop: {
      title: 'Layanan Laptop',
      icon: Laptop,
      services: [
        {
          name: 'Ganti Keyboard',
          description: 'Penggantian keyboard laptop yang rusak',
          price: 'Rp 200.000',
          duration: '1-2 jam',
          category: 'Hardware'
        },
        {
          name: 'Ganti LCD/LED Screen',
          description: 'Penggantian layar laptop yang pecah atau bergaris',
          price: 'Rp 800.000',
          duration: '2-3 jam',
          category: 'Hardware'
        },
        {
          name: 'Ganti Baterai',
          description: 'Penggantian baterai laptop yang sudah drop',
          price: 'Rp 300.000',
          duration: '30 menit',
          category: 'Hardware'
        },
        {
          name: 'Repair Charging Port',
          description: 'Perbaikan port charger yang longgar atau rusak',
          price: 'Rp 150.000',
          duration: '1-2 jam',
          category: 'Hardware'
        },
        {
          name: 'Cooling System Repair',
          description: 'Perbaikan sistem pendingin dan ganti thermal paste',
          price: 'Rp 125.000',
          duration: '1-2 jam',
          category: 'Maintenance'
        },
        {
          name: 'Motherboard Repair',
          description: 'Perbaikan motherboard laptop',
          price: 'Rp 500.000',
          duration: '1-3 hari',
          category: 'Hardware'
        }
      ]
    },
    printer: {
      title: 'Layanan Printer',
      icon: Printer,
      services: [
        {
          name: 'Head Cleaning',
          description: 'Pembersihan head printer untuk hasil cetak optimal',
          price: 'Rp 50.000',
          duration: '30 menit',
          category: 'Maintenance'
        },
        {
          name: 'Refill Tinta',
          description: 'Isi ulang tinta printer dengan kualitas terbaik',
          price: 'Rp 25.000',
          duration: '15 menit',
          category: 'Consumable'
        },
        {
          name: 'Ganti Cartridge',
          description: 'Penggantian cartridge printer yang rusak',
          price: 'Rp 150.000',
          duration: '15 menit',
          category: 'Hardware'
        },
        {
          name: 'Paper Jam Repair',
          description: 'Perbaikan masalah paper jam dan feeding',
          price: 'Rp 75.000',
          duration: '30 menit',
          category: 'Repair'
        },
        {
          name: 'Roller Cleaning',
          description: 'Pembersihan roller untuk feeding yang lancar',
          price: 'Rp 40.000',
          duration: '30 menit',
          category: 'Maintenance'
        },
        {
          name: 'Driver Installation',
          description: 'Install driver printer dan konfigurasi',
          price: 'Rp 30.000',
          duration: '30 menit',
          category: 'Software'
        }
      ]
    }
  };

  const handleStatusUpdate = async (e: React.MouseEvent, bookingId: string, newStatus: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const statusText = {
      'confirmed': 'dikonfirmasi',
      'cancelled': 'dibatalkan',
      'in-progress': 'sedang dikerjakan',
      'completed': 'selesai'
    }[newStatus] || newStatus;

    const result = await Swal.fire({
      title: `Ubah Status Booking?`,
      text: `Booking akan ${statusText}`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'cancelled' ? '#dc2626' : '#3b82f6',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Ubah!',
      cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
      try {
        await updateBookingStatus(bookingId, newStatus);
        // Reload bookings
        const updatedBookings = await getAllBookings();
        setBookings(updatedBookings);
        
        Swal.fire({
          title: 'Berhasil!',
          text: `Status booking berhasil ${statusText}`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false
        });
      } catch (error) {
        console.error('Error updating status:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Gagal mengubah status booking',
          icon: 'error',
          confirmButtonColor: '#dc2626'
        });
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'in-progress':
        return <AlertCircle className="h-4 w-4" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR'
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Memuat dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NotificationSystem notifications={notifications} />
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm sm:text-base">Kelola service printer Barokah Printer</p>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Bell className="h-5 w-5 sm:h-6 sm:w-6" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
              <button onClick={() => setShowSettings(true)} className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button 
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <nav className="flex flex-wrap gap-2 sm:gap-0 sm:space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: BarChart3 },
              { id: 'bookings', name: 'Bookings', icon: Calendar },
              { id: 'technicians', name: 'Teknisi', icon: Users },
              { id: 'printer-brands', name: 'Merk Printer', icon: Printer },
              { id: 'problem-categories', name: 'Kategori Masalah', icon: Wrench },
              { id: 'settings', name: 'Pengaturan', icon: Settings },
              { id: 'reports', name: 'Laporan', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-1 sm:space-x-2 py-2 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden">{tab.name.split(' ')[0]}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mobile-fade-left">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Booking</p>
                    <p className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalBookings}</p>
                  </div>
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                    <Calendar className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-2xl sm:text-3xl font-bold text-yellow-600">{stats.pendingBookings}</p>
                  </div>
                  <div className="bg-yellow-100 p-2 sm:p-3 rounded-full">
                    <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-yellow-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Selesai</p>
                    <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.completedBookings}</p>
                  </div>
                  <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-600">Revenue Bulan Ini</p>
                    <p className="text-lg sm:text-2xl font-bold text-blue-600">
                      {formatCurrency(stats.thisMonthRevenue)}
                    </p>
                  </div>
                  <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                    <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow-md mobile-fade-left">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Booking Terbaru</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Printer
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Masalah
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teknisi
                      </th>
                      <th className="px-3 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {booking.customer.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">{booking.customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">
                            {booking.printer.brand} {booking.printer.model}
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">{booking.problem.description}</div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1">{booking.status}</span>
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                          {booking.technician}
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button 
                              onClick={(e) => handleStatusUpdate(e, booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md mobile-fade-left">
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />
                    <input
                      type="text"
                      placeholder="Cari customer, phone, atau ID booking..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="flex items-center px-3 sm:px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm sm:text-base">
                    <Filter className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Filter</span>
                  </button>
                  <button className="flex items-center px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm sm:text-base">
                    <Download className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    <span className="hidden sm:inline">Export</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mobile-fade-left">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        ID & Customer
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Printer & Masalah
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Service
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Jadwal
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-2 sm:px-6 py-2 sm:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-blue-600">
                              #{booking.id}
                            </div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {booking.customer.name}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">{booking.customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4">
                          <div>
                            <div className="text-xs sm:text-sm font-medium text-gray-900">
                              {booking.printer.brand} {booking.printer.model}
                            </div>
                            <div className="text-xs sm:text-sm text-gray-500">{booking.problem.category}</div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div className="text-xs sm:text-sm text-gray-900">{booking.service.type}</div>
                          <div className="text-xs sm:text-sm text-gray-500">{booking.technician}</div>
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <div>
                            <div className="text-xs sm:text-sm text-gray-900">{booking.service.date}</div>
                            <div className="text-xs sm:text-sm text-gray-500">{booking.service.time} WIB</div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                            {getStatusIcon(booking.status)}
                            <span className="ml-1 capitalize">{booking.status}</span>
                          </span>
                        </td>
                        <td className="px-2 sm:px-6 py-3 sm:py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button 
                              onClick={(e) => handleStatusUpdate(e, booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button 
                              onClick={(e) => handleStatusUpdate(e, booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Technicians Tab */}
        {activeTab === 'technicians' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md mobile-fade-left">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Manajemen Teknisi</h2>
                  <button
                    onClick={handleAddNewTechnician}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah</span>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
                {technicians.map((tech) => (
                  <div key={tech.id} className="border border-gray-200 rounded-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900">{tech.name}</h3>
                        <p className="text-xs sm:text-sm text-gray-600">{tech.phone}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        tech.is_available 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {tech.is_available ? 'Tersedia' : 'Sibuk'}
                      </span>
                    </div>
                    
                    <div className="space-y-2 text-xs sm:text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Pengalaman:</span>
                        <span className="font-medium">{tech.experience} tahun</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Rating:</span>
                        <span className="font-medium">{tech.rating}/5.0</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Jadwal:</span>
                        <button 
                          onClick={(e) => handleViewSchedule(e, tech)}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium underline"
                        >
                          Lihat Jadwal
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-xs sm:text-sm text-gray-600 mb-2">Spesialisasi:</p>
                      <div className="flex flex-wrap gap-1">
                        {tech.specialization.map((spec, index) => (
                          <span
                            key={index}
                            className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mt-4 flex space-x-2">
                      <button 
                        onClick={(e) => handleEditTechnician(e, tech)}
                        className="flex-1 bg-blue-600 text-white py-2 px-2 sm:px-3 rounded text-xs sm:text-sm hover:bg-blue-700"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={(e) => handleDeleteTechnician(e, tech.id)}
                        className="bg-red-600 text-white py-2 px-2 sm:px-3 rounded text-xs sm:text-sm hover:bg-red-700"
                      >
                        Hapus
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Printer Brands Tab */}
        {activeTab === 'printer-brands' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Manajemen Merk Printer</h2>
                    <p className="text-gray-600 mt-1">Kelola merk dan model printer yang didukung</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingType('brand');
                      setEditingBrand(null);
                      setShowAddForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Merk</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {printerBrands.map((brand) => (
                    <div key={brand.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold">{brand.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleEditBrand(e, brand)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteBrand(e, brand.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {brand.models?.length || 0} model tersedia
                      </p>
                      <div className="space-y-1 mb-3">
                        {brand.models?.slice(0, 3).map((model: any) => (
                          <div key={model.id} className="flex justify-between items-center text-xs bg-gray-100 px-2 py-1 rounded">
                            <span>{model.name} ({model.type})</span>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => handleEditModel(e, brand, model)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteModel(e, model.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {brand.models?.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{brand.models.length - 3} model lainnya
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddModel(e, brand)}
                        className="w-full bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 flex items-center justify-center space-x-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Tambah Model</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Problem Categories Tab */}
        {activeTab === 'problem-categories' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Manajemen Kategori Masalah</h2>
                    <p className="text-gray-600 mt-1">Kelola kategori dan jenis masalah printer</p>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      setEditingType('category');
                      setEditingCategory(null);
                      setShowAddForm(true);
                    }}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tambah Kategori</span>
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {problemCategories.map((category) => (
                    <div key={category.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-semibold">{category.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => handleEditCategory(e, category)}
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={(e) => handleDeleteCategory(e, category.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">
                        {category.problems?.length || 0} masalah terdaftar
                      </p>
                      <div className="space-y-1 mb-3">
                        {category.problems?.slice(0, 3).map((problem: any) => (
                          <div key={problem.id} className="flex justify-between items-center text-xs bg-gray-100 px-2 py-1 rounded">
                            <span>{problem.name}</span>
                            <div className="flex space-x-1">
                              <button
                                onClick={(e) => handleEditProblem(e, category, problem)}
                                className="text-blue-600 hover:text-blue-800"
                              >
                                <Edit className="h-3 w-3" />
                              </button>
                              <button
                                onClick={(e) => handleDeleteProblem(e, problem.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                <Trash2 className="h-3 w-3" />
                              </button>
                            </div>
                          </div>
                        ))}
                        {category.problems?.length > 3 && (
                          <div className="text-xs text-gray-500">
                            +{category.problems.length - 3} masalah lainnya
                          </div>
                        )}
                      </div>
                      <button
                        onClick={(e) => handleAddProblem(e, category)}
                        className="w-full bg-green-600 text-white py-1 px-2 rounded text-xs hover:bg-green-700 flex items-center justify-center space-x-1"
                      >
                        <Plus className="h-3 w-3" />
                        <span>Tambah Masalah</span>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-8">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Pengaturan Sistem</h2>
                <p className="text-gray-600 mt-1">Kelola pengaturan aplikasi dan notifikasi</p>
              </div>
              
              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Notifikasi WhatsApp</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Notifikasi booking baru</span>
                      </label>
                      <label className="flex items-center">
                        <input type="checkbox" className="mr-2" defaultChecked />
                        <span>Update status service</span>
                      </label>
                      <div className="mt-4">
                        <label className="block text-sm font-medium mb-2">Nomor WhatsApp Admin:</label>
                        <input 
                          type="text" 
                          defaultValue="+62853-6814-8449"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">Pengaturan Umum</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium mb-2">Nama Toko:</label>
                        <input 
                          type="text" 
                          defaultValue="Barokah Printer"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Email:</label>
                        <input 
                          type="email" 
                          defaultValue="barokahprint22@gmail.com"
                          className="w-full px-3 py-2 border rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Alamat:</label>
                        <textarea 
                          defaultValue="Jl. Depati Parbo No.rt 17, Pematang Sulur, Kec. Telanaipura, Kota Jambi"
                          className="w-full px-3 py-2 border rounded-lg"
                          rows={3}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">Backup & Restore</h3>
                  <div className="flex space-x-4">
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        Swal.fire({
                          title: 'Info',
                          text: 'Fitur backup data akan segera tersedia!',
                          icon: 'info',
                          confirmButtonColor: '#3b82f6'
                        });
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      Backup Data
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        Swal.fire({
                          title: 'Info',
                          text: 'Fitur export laporan akan segera tersedia!',
                          icon: 'info',
                          confirmButtonColor: '#059669'
                        });
                      }}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    >
                      Export Laporan
                    </button>
                    <button 
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        Swal.fire({
                          title: 'Info',
                          text: 'Fitur import data akan segera tersedia!',
                          icon: 'info',
                          confirmButtonColor: '#d97706'
                        });
                      }}
                      className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
                    >
                      Import Data
                    </button>
                  </div>
                </div>

                <button 
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    // Handle settings save logic here
                    Swal.fire({
                      title: 'Berhasil!',
                      text: 'Pengaturan berhasil disimpan!',
                      icon: 'success',
                      timer: 2000,
                      showConfirmButton: false
                    });
                  }}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
                >
                  Simpan Pengaturan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mobile-fade-left">
              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Revenue Analysis</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Total Revenue:</span>
                    <span className="text-lg sm:text-2xl font-bold text-green-600">
                      {formatCurrency(stats.totalRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Bulan Ini:</span>
                    <span className="text-base sm:text-xl font-semibold text-blue-600">
                      {formatCurrency(stats.thisMonthRevenue)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Rata-rata per Service:</span>
                    <span className="font-medium text-sm sm:text-base">
                      {formatCurrency(stats.completedBookings > 0 ? stats.totalRevenue / stats.completedBookings : 0)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">Service Statistics</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Completion Rate:</span>
                    <span className="text-base sm:text-xl font-semibold text-green-600">
                      {stats.totalBookings > 0 ? Math.round((stats.completedBookings / stats.totalBookings) * 100) : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Average Rating:</span>
                    <span className="font-medium text-sm sm:text-base">4.8/5.0</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 text-sm sm:text-base">Response Time:</span>
                    <span className="font-medium text-sm sm:text-base">&lt; 2 jam</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Real-time Transaction Report */}
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-900">Laporan Transaksi Real-time</h3>
                <p className="text-gray-600 mt-1">Data transaksi terbaru dan analisis periode</p>
              </div>
              
              <div className="p-4 sm:p-6">
                <div className="space-y-4">
                  <div className="text-center text-gray-500">
                    <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Laporan transaksi akan ditampilkan di sini</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add/Edit Technician Modal */}
        {showTechnicianModal && (
          <TechnicianFormModal
            technician={editingTechnician}
            onSave={handleAddTechnician}
            onClose={() => {
              setShowTechnicianModal(false);
              setEditingTechnician(null);
            }}
          />
        )}

        {/* Schedule View Modal */}
        {showScheduleModal && selectedTechnician && (
          <ScheduleModal
            technician={selectedTechnician}
            onClose={() => {
              setShowScheduleModal(false);
              setSelectedTechnician(null);
            }}
          />
        )}

        {/* Add/Edit Brand/Category Modal */}
        {showAddForm && (
          <AddFormModal
            type={editingType}
            item={editingBrand || editingCategory}
            onSave={(data) => {
              if (editingType === 'brand') {
                handleAddPrinterBrand(data.name);
              } else if (editingType === 'category') {
                handleAddProblemCategory(data.name, data.icon);
              }
            }}
            onClose={() => {
              setShowAddForm(false);
              setEditingType(null);
              setEditingBrand(null);
              setEditingCategory(null);
            }}
          />
        )}

        {/* Add/Edit Model Modal */}
        {showModelModal && (
          <ModelFormModal
            model={editingModel}
            brand={selectedBrand}
            onSave={handleSaveModel}
            onClose={() => {
              setShowModelModal(false);
              setEditingModel(null);
              setSelectedBrand(null);
            }}
          />
        )}

        {/* Add/Edit Problem Modal */}
        {showProblemModal && (
          <ProblemFormModal
            problem={editingProblem}
            category={selectedCategory}
            onSave={handleSaveProblem}
            onClose={() => {
              setShowProblemModal(false);
              setEditingProblem(null);
              setSelectedCategory(null);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;