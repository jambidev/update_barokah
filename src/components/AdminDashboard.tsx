import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  Settings, 
  BarChart3, 
  Calendar,
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  LogOut,
  Printer,
  Wrench,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { getAllBookings, getBookingById } from '../utils/bookingSupabase';
import { 
  fetchPrinterBrands, 
  fetchProblemCategories, 
  fetchTechnicians,
  addPrinterBrand,
  addPrinterModel,
  updatePrinterBrand,
  updatePrinterModel,
  deletePrinterBrand,
  deletePrinterModel,
  addProblemCategory,
  addProblem,
  updateProblemCategory,
  updateProblem,
  deleteProblemCategory,
  deleteProblem,
  fetchGalleryImages,
  addGalleryImage,
  updateGalleryImage,
  deleteGalleryImage,
  addTechnician,
  updateTechnician,
  deleteTechnician,
  updateBookingStatus,
  assignTechnician,
  updateActualCost
} from '../utils/supabaseData';
import { supabase } from '../utils/supabase';
import { SweetAlertConfig, showSuccessAlert, showErrorAlert, showDeleteConfirm } from '../utils/sweetAlert';
import Swal from 'sweetalert2';

interface AdminDashboardProps {
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate, onLogout }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [bookings, setBookings] = useState<any[]>([]);
  const [printerBrands, setPrinterBrands] = useState<any[]>([]);
  const [problemCategories, setProblemCategories] = useState<any[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showBookingDetail, setShowBookingDetail] = useState(false);

  // Load all data
  useEffect(() => {
    loadAllData();
    
    // Setup realtime subscriptions
    const bookingsChannel = supabase
      .channel('admin-bookings-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'service_bookings'
      }, () => {
        loadBookings();
      })
      .subscribe();

    const brandsChannel = supabase
      .channel('admin-brands-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'printer_brands'
      }, () => {
        loadPrinterBrands();
      })
      .subscribe();

    const modelsChannel = supabase
      .channel('admin-models-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'printer_models'
      }, () => {
        loadPrinterBrands();
      })
      .subscribe();

    const categoriesChannel = supabase
      .channel('admin-categories-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'problem_categories'
      }, () => {
        loadProblemCategories();
      })
      .subscribe();

    const problemsChannel = supabase
      .channel('admin-problems-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'problems'
      }, () => {
        loadProblemCategories();
      })
      .subscribe();

    const techniciansChannel = supabase
      .channel('admin-technicians-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'technicians'
      }, () => {
        loadTechnicians();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(brandsChannel);
      supabase.removeChannel(modelsChannel);
      supabase.removeChannel(categoriesChannel);
      supabase.removeChannel(problemsChannel);
      supabase.removeChannel(techniciansChannel);
    };
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([
        loadBookings(),
        loadPrinterBrands(),
        loadProblemCategories(),
        loadTechnicians(),
        loadGalleryImages()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      showErrorAlert('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadBookings = async () => {
    try {
      const data = await getAllBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error loading bookings:', error);
    }
  };

  const loadPrinterBrands = async () => {
    try {
      const data = await fetchPrinterBrands();
      setPrinterBrands(data);
    } catch (error) {
      console.error('Error loading printer brands:', error);
    }
  };

  const loadProblemCategories = async () => {
    try {
      const data = await fetchProblemCategories();
      setProblemCategories(data);
    } catch (error) {
      console.error('Error loading problem categories:', error);
    }
  };

  const loadTechnicians = async () => {
    try {
      const data = await fetchTechnicians();
      setTechnicians(data);
    } catch (error) {
      console.error('Error loading technicians:', error);
    }
  };

  const loadGalleryImages = async () => {
    try {
      const data = await fetchGalleryImages();
      setGalleryImages(data);
    } catch (error) {
      console.error('Error loading gallery images:', error);
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.customer.phone.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Statistics
  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalTechnicians: technicians.filter(t => t.is_active).length
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Menunggu';
      case 'confirmed': return 'Dikonfirmasi';
      case 'in-progress': return 'Dalam Proses';
      case 'completed': return 'Selesai';
      case 'cancelled': return 'Dibatalkan';
      default: return status;
    }
  };

  const handleStatusUpdate = async (bookingId: string, newStatus: string) => {
    try {
      const result = await SweetAlertConfig.confirm(
        'Ubah Status Booking?',
        `Status akan diubah menjadi "${getStatusLabel(newStatus)}"`
      );

      if (result.isConfirmed) {
        const success = await updateBookingStatus(bookingId, newStatus);
        if (success) {
          showSuccessAlert('Status booking berhasil diubah');
          loadBookings();
        } else {
          showErrorAlert('Gagal mengubah status booking');
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      showErrorAlert('Terjadi kesalahan saat mengubah status');
    }
  };

  const handleTechnicianAssign = async (bookingId: string) => {
    try {
      const { value: technicianId } = await Swal.fire({
        title: 'Pilih Teknisi',
        input: 'select',
        inputOptions: technicians.reduce((options, tech) => {
          options[tech.id] = `${tech.name} (${tech.specialization.join(', ')})`;
          return options;
        }, {} as any),
        inputPlaceholder: 'Pilih teknisi...',
        showCancelButton: true,
        confirmButtonText: 'Tugaskan',
        cancelButtonText: 'Batal'
      });

      if (technicianId) {
        const success = await assignTechnician(bookingId, technicianId);
        if (success) {
          showSuccessAlert('Teknisi berhasil ditugaskan');
          loadBookings();
        } else {
          showErrorAlert('Gagal menugaskan teknisi');
        }
      }
    } catch (error) {
      console.error('Error assigning technician:', error);
      showErrorAlert('Terjadi kesalahan saat menugaskan teknisi');
    }
  };

  const handleActualCostUpdate = async (bookingId: string) => {
    try {
      const { value: actualCost } = await Swal.fire({
        title: 'Update Biaya Aktual',
        input: 'text',
        inputLabel: 'Biaya Aktual',
        inputPlaceholder: 'Contoh: Rp 150.000',
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
          if (!value) return 'Biaya tidak boleh kosong!';
        }
      });

      if (actualCost) {
        const success = await updateActualCost(bookingId, actualCost);
        if (success) {
          showSuccessAlert('Biaya aktual berhasil diupdate');
          loadBookings();
        } else {
          showErrorAlert('Gagal mengupdate biaya aktual');
        }
      }
    } catch (error) {
      console.error('Error updating actual cost:', error);
      showErrorAlert('Terjadi kesalahan saat mengupdate biaya');
    }
  };

  const handleAddBrand = async () => {
    try {
      const { value: brandName } = await Swal.fire({
        title: 'Tambah Merk Printer',
        input: 'text',
        inputLabel: 'Nama Merk',
        inputPlaceholder: 'Contoh: Canon',
        showCancelButton: true,
        confirmButtonText: 'Tambah',
        cancelButtonText: 'Batal',
        inputValidator: (value) => {
          if (!value) return 'Nama merk tidak boleh kosong!';
        }
      });

      if (brandName) {
        await addPrinterBrand(brandName);
        showSuccessAlert('Merk printer berhasil ditambahkan');
        loadPrinterBrands();
      }
    } catch (error) {
      console.error('Error adding brand:', error);
      showErrorAlert('Gagal menambahkan merk printer');
    }
  };

  const handleAddModel = async (brandId: string) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Tambah Model Printer',
        html: `
          <input id="model-name" class="swal2-input" placeholder="Nama Model" />
          <select id="model-type" class="swal2-input">
            <option value="">Pilih Tipe</option>
            <option value="inkjet">Inkjet</option>
            <option value="laser">Laser</option>
            <option value="multifunction">Multifunction</option>
          </select>
        `,
        showCancelButton: true,
        confirmButtonText: 'Tambah',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const name = (document.getElementById('model-name') as HTMLInputElement).value;
          const type = (document.getElementById('model-type') as HTMLSelectElement).value;
          if (!name || !type) {
            Swal.showValidationMessage('Semua field harus diisi!');
            return false;
          }
          return { name, type };
        }
      });

      if (formValues) {
        await addPrinterModel(brandId, formValues.name, formValues.type);
        showSuccessAlert('Model printer berhasil ditambahkan');
        loadPrinterBrands();
      }
    } catch (error) {
      console.error('Error adding model:', error);
      showErrorAlert('Gagal menambahkan model printer');
    }
  };

  const handleAddTechnician = async () => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Tambah Teknisi',
        html: `
          <input id="tech-name" class="swal2-input" placeholder="Nama Lengkap" />
          <input id="tech-phone" class="swal2-input" placeholder="Nomor HP" />
          <input id="tech-email" class="swal2-input" placeholder="Email" />
          <input id="tech-specialization" class="swal2-input" placeholder="Spesialisasi (pisahkan dengan koma)" />
          <input id="tech-experience" class="swal2-input" type="number" placeholder="Pengalaman (tahun)" />
        `,
        showCancelButton: true,
        confirmButtonText: 'Tambah',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const name = (document.getElementById('tech-name') as HTMLInputElement).value;
          const phone = (document.getElementById('tech-phone') as HTMLInputElement).value;
          const email = (document.getElementById('tech-email') as HTMLInputElement).value;
          const specialization = (document.getElementById('tech-specialization') as HTMLInputElement).value;
          const experience = parseInt((document.getElementById('tech-experience') as HTMLInputElement).value);
          
          if (!name || !phone) {
            Swal.showValidationMessage('Nama dan nomor HP harus diisi!');
            return false;
          }
          
          return {
            name,
            phone,
            email,
            specialization: specialization.split(',').map(s => s.trim()),
            experience: experience || 0,
            rating: 0
          };
        }
      });

      if (formValues) {
        await addTechnician(formValues);
        showSuccessAlert('Teknisi berhasil ditambahkan');
        loadTechnicians();
      }
    } catch (error) {
      console.error('Error adding technician:', error);
      showErrorAlert('Gagal menambahkan teknisi');
    }
  };

  const handleAddProblemCategory = async () => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Tambah Kategori Masalah',
        html: `
          <input id="category-name" class="swal2-input" placeholder="Nama Kategori" />
          <input id="category-icon" class="swal2-input" placeholder="Icon (contoh: Printer)" />
        `,
        showCancelButton: true,
        confirmButtonText: 'Tambah',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const name = (document.getElementById('category-name') as HTMLInputElement).value;
          const icon = (document.getElementById('category-icon') as HTMLInputElement).value;
          if (!name || !icon) {
            Swal.showValidationMessage('Semua field harus diisi!');
            return false;
          }
          return { name, icon };
        }
      });

      if (formValues) {
        await addProblemCategory(formValues.name, formValues.icon);
        showSuccessAlert('Kategori masalah berhasil ditambahkan');
        loadProblemCategories();
      }
    } catch (error) {
      console.error('Error adding problem category:', error);
      showErrorAlert('Gagal menambahkan kategori masalah');
    }
  };

  const handleEditProblemCategory = async (category: any) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Edit Kategori Masalah',
        html: `
          <input id="category-name" class="swal2-input" placeholder="Nama Kategori" value="${category.name}" />
          <input id="category-icon" class="swal2-input" placeholder="Icon" value="${category.icon}" />
        `,
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const name = (document.getElementById('category-name') as HTMLInputElement).value;
          const icon = (document.getElementById('category-icon') as HTMLInputElement).value;
          if (!name || !icon) {
            Swal.showValidationMessage('Semua field harus diisi!');
            return false;
          }
          return { name, icon };
        }
      });

      if (formValues) {
        await updateProblemCategory(category.id, formValues.name, formValues.icon);
        showSuccessAlert('Kategori masalah berhasil diupdate');
        loadProblemCategories();
      }
    } catch (error) {
      console.error('Error updating problem category:', error);
      showErrorAlert('Gagal mengupdate kategori masalah');
    }
  };

  const handleDeleteProblemCategory = async (id: string, name: string) => {
    try {
      const result = await showDeleteConfirm(`kategori "${name}"`);
      if (result.isConfirmed) {
        await deleteProblemCategory(id);
        showSuccessAlert('Kategori masalah berhasil dihapus');
        loadProblemCategories();
      }
    } catch (error) {
      console.error('Error deleting problem category:', error);
      showErrorAlert('Gagal menghapus kategori masalah');
    }
  };

  const handleAddProblem = async (categoryId: string) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Tambah Masalah',
        html: `
          <input id="problem-name" class="swal2-input" placeholder="Nama Masalah" />
          <textarea id="problem-description" class="swal2-textarea" placeholder="Deskripsi Masalah"></textarea>
          <select id="problem-severity" class="swal2-input">
            <option value="">Pilih Tingkat Kesulitan</option>
            <option value="low">Ringan</option>
            <option value="medium">Sedang</option>
            <option value="high">Berat</option>
          </select>
          <input id="problem-time" class="swal2-input" placeholder="Estimasi Waktu (contoh: 1-2 jam)" />
          <input id="problem-cost" class="swal2-input" placeholder="Estimasi Biaya (contoh: Rp 50.000 - 100.000)" />
        `,
        showCancelButton: true,
        confirmButtonText: 'Tambah',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const name = (document.getElementById('problem-name') as HTMLInputElement).value;
          const description = (document.getElementById('problem-description') as HTMLTextAreaElement).value;
          const severity = (document.getElementById('problem-severity') as HTMLSelectElement).value;
          const estimatedTime = (document.getElementById('problem-time') as HTMLInputElement).value;
          const estimatedCost = (document.getElementById('problem-cost') as HTMLInputElement).value;
          
          if (!name || !description || !severity || !estimatedTime || !estimatedCost) {
            Swal.showValidationMessage('Semua field harus diisi!');
            return false;
          }
          return { name, description, severity, estimatedTime, estimatedCost };
        }
      });

      if (formValues) {
        await addProblem(categoryId, formValues.name, formValues.description, formValues.severity, formValues.estimatedTime, formValues.estimatedCost);
        showSuccessAlert('Masalah berhasil ditambahkan');
        loadProblemCategories();
      }
    } catch (error) {
      console.error('Error adding problem:', error);
      showErrorAlert('Gagal menambahkan masalah');
    }
  };

  const handleEditProblem = async (problem: any) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Edit Masalah',
        html: `
          <input id="problem-name" class="swal2-input" placeholder="Nama Masalah" value="${problem.name}" />
          <textarea id="problem-description" class="swal2-textarea" placeholder="Deskripsi Masalah">${problem.description}</textarea>
          <select id="problem-severity" class="swal2-input">
            <option value="low" ${problem.severity === 'low' ? 'selected' : ''}>Ringan</option>
            <option value="medium" ${problem.severity === 'medium' ? 'selected' : ''}>Sedang</option>
            <option value="high" ${problem.severity === 'high' ? 'selected' : ''}>Berat</option>
          </select>
          <input id="problem-time" class="swal2-input" placeholder="Estimasi Waktu" value="${problem.estimatedTime}" />
          <input id="problem-cost" class="swal2-input" placeholder="Estimasi Biaya" value="${problem.estimatedCost}" />
        `,
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const name = (document.getElementById('problem-name') as HTMLInputElement).value;
          const description = (document.getElementById('problem-description') as HTMLTextAreaElement).value;
          const severity = (document.getElementById('problem-severity') as HTMLSelectElement).value;
          const estimatedTime = (document.getElementById('problem-time') as HTMLInputElement).value;
          const estimatedCost = (document.getElementById('problem-cost') as HTMLInputElement).value;
          
          if (!name || !description || !severity || !estimatedTime || !estimatedCost) {
            Swal.showValidationMessage('Semua field harus diisi!');
            return false;
          }
          return { name, description, severity, estimatedTime, estimatedCost };
        }
      });

      if (formValues) {
        await updateProblem(problem.id, formValues.name, formValues.description, formValues.severity, formValues.estimatedTime, formValues.estimatedCost);
        showSuccessAlert('Masalah berhasil diupdate');
        loadProblemCategories();
      }
    } catch (error) {
      console.error('Error updating problem:', error);
      showErrorAlert('Gagal mengupdate masalah');
    }
  };

  const handleDeleteProblem = async (id: string, name: string) => {
    try {
      const result = await showDeleteConfirm(`masalah "${name}"`);
      if (result.isConfirmed) {
        await deleteProblem(id);
        showSuccessAlert('Masalah berhasil dihapus');
        loadProblemCategories();
      }
    } catch (error) {
      console.error('Error deleting problem:', error);
      showErrorAlert('Gagal menghapus masalah');
    }
  };

  const handleAddGalleryImage = async () => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Tambah Gambar Gallery',
        html: `
          <input id="image-title" class="swal2-input" placeholder="Judul Gambar" />
          <input id="image-alt" class="swal2-input" placeholder="Alt Text" />
          <input id="image-url" class="swal2-input" placeholder="URL Gambar" />
          <select id="image-category" class="swal2-input">
            <option value="">Pilih Kategori</option>
            <option value="service">Service</option>
            <option value="workshop">Workshop</option>
            <option value="team">Team</option>
            <option value="products">Products</option>
            <option value="store">Store</option>
            <option value="equipment">Equipment</option>
            <option value="parts">Parts</option>
          </select>
          <input id="image-order" class="swal2-input" type="number" placeholder="Urutan (opsional)" />
        `,
        showCancelButton: true,
        confirmButtonText: 'Tambah',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const title = (document.getElementById('image-title') as HTMLInputElement).value;
          const alt_text = (document.getElementById('image-alt') as HTMLInputElement).value;
          const image_url = (document.getElementById('image-url') as HTMLInputElement).value;
          const category = (document.getElementById('image-category') as HTMLSelectElement).value;
          const sort_order = parseInt((document.getElementById('image-order') as HTMLInputElement).value) || 0;
          
          if (!title || !alt_text || !image_url || !category) {
            Swal.showValidationMessage('Semua field kecuali urutan harus diisi!');
            return false;
          }
          return { title, alt_text, image_url, category, sort_order };
        }
      });

      if (formValues) {
        await addGalleryImage(formValues);
        showSuccessAlert('Gambar berhasil ditambahkan ke gallery');
        loadGalleryImages();
      }
    } catch (error) {
      console.error('Error adding gallery image:', error);
      showErrorAlert('Gagal menambahkan gambar');
    }
  };

  const handleEditGalleryImage = async (image: any) => {
    try {
      const { value: formValues } = await Swal.fire({
        title: 'Edit Gambar Gallery',
        html: `
          <input id="image-title" class="swal2-input" placeholder="Judul Gambar" value="${image.title}" />
          <input id="image-alt" class="swal2-input" placeholder="Alt Text" value="${image.alt_text}" />
          <input id="image-url" class="swal2-input" placeholder="URL Gambar" value="${image.image_url}" />
          <select id="image-category" class="swal2-input">
            <option value="service" ${image.category === 'service' ? 'selected' : ''}>Service</option>
            <option value="workshop" ${image.category === 'workshop' ? 'selected' : ''}>Workshop</option>
            <option value="team" ${image.category === 'team' ? 'selected' : ''}>Team</option>
            <option value="products" ${image.category === 'products' ? 'selected' : ''}>Products</option>
            <option value="store" ${image.category === 'store' ? 'selected' : ''}>Store</option>
            <option value="equipment" ${image.category === 'equipment' ? 'selected' : ''}>Equipment</option>
            <option value="parts" ${image.category === 'parts' ? 'selected' : ''}>Parts</option>
          </select>
          <input id="image-order" class="swal2-input" type="number" placeholder="Urutan" value="${image.sort_order}" />
        `,
        showCancelButton: true,
        confirmButtonText: 'Update',
        cancelButtonText: 'Batal',
        preConfirm: () => {
          const title = (document.getElementById('image-title') as HTMLInputElement).value;
          const alt_text = (document.getElementById('image-alt') as HTMLInputElement).value;
          const image_url = (document.getElementById('image-url') as HTMLInputElement).value;
          const category = (document.getElementById('image-category') as HTMLSelectElement).value;
          const sort_order = parseInt((document.getElementById('image-order') as HTMLInputElement).value) || 0;
          
          if (!title || !alt_text || !image_url || !category) {
            Swal.showValidationMessage('Semua field harus diisi!');
            return false;
          }
          return { title, alt_text, image_url, category, sort_order };
        }
      });

      if (formValues) {
        await updateGalleryImage(image.id, formValues);
        showSuccessAlert('Gambar berhasil diupdate');
        loadGalleryImages();
      }
    } catch (error) {
      console.error('Error updating gallery image:', error);
      showErrorAlert('Gagal mengupdate gambar');
    }
  };

  const handleDeleteGalleryImage = async (id: string, title: string) => {
    try {
      const result = await showDeleteConfirm(`gambar "${title}"`);
      if (result.isConfirmed) {
        await deleteGalleryImage(id);
        showSuccessAlert('Gambar berhasil dihapus');
        loadGalleryImages();
      }
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      showErrorAlert('Gagal menghapus gambar');
    }
  };

  const handleViewBookingDetail = async (bookingId: string) => {
    try {
      const booking = await getBookingById(bookingId);
      if (booking) {
        setSelectedBooking(booking);
        setShowBookingDetail(true);
      }
    } catch (error) {
      console.error('Error loading booking detail:', error);
      showErrorAlert('Gagal memuat detail booking');
    }
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
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <img 
                src="/img/logo.jpeg" 
                alt="Barokah Printer" 
                className="h-10 w-10 rounded-full"
              />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Barokah Printer Management</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onNavigate('home')}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Lihat Website
              </button>
              <button
                onClick={onLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {[
              { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
              { id: 'bookings', name: 'Booking Management', icon: Calendar },
              { id: 'brands', name: 'Printer Brands', icon: Printer },
              { id: 'problems', name: 'Problem Categories', icon: Wrench },
              { id: 'technicians', name: 'Technicians', icon: Users },
              { id: 'gallery', name: 'Gallery Management', icon: Settings }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Total Booking', value: stats.totalBookings, icon: Package, color: 'bg-blue-500' },
                { title: 'Menunggu Konfirmasi', value: stats.pendingBookings, icon: Clock, color: 'bg-yellow-500' },
                { title: 'Selesai', value: stats.completedBookings, icon: CheckCircle, color: 'bg-green-500' },
                { title: 'Total Teknisi', value: stats.totalTechnicians, icon: Users, color: 'bg-purple-500' }
              ].map((stat, index) => (
                <div key={index} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-center">
                    <div className={`${stat.color} rounded-md p-3`}>
                      <stat.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                      <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Booking Terbaru</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID & Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Printer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {bookings.slice(0, 5).map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                            <div className="text-sm text-gray-500">{booking.customer.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.printer.brand} {booking.printer.model}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                            {getStatusLabel(booking.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleViewBookingDetail(booking.id)}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
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
            {/* Filters */}
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Cari berdasarkan ID, nama, atau nomor HP..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-48">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">Semua Status</option>
                    <option value="pending">Menunggu</option>
                    <option value="confirmed">Dikonfirmasi</option>
                    <option value="in-progress">Dalam Proses</option>
                    <option value="completed">Selesai</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>
                <button
                  onClick={loadBookings}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID & Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Printer & Masalah</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Teknisi</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">#{booking.id}</div>
                            <div className="text-sm text-gray-500">{booking.customer.name}</div>
                            <div className="text-sm text-gray-500">{booking.customer.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.printer.brand} {booking.printer.model}</div>
                            <div className="text-sm text-gray-500">{booking.problem.category}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{booking.technician}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={booking.status}
                            onChange={(e) => handleStatusUpdate(booking.id, e.target.value)}
                            className={`text-xs font-semibold rounded-full px-2 py-1 border-0 ${getStatusColor(booking.status)}`}
                          >
                            <option value="pending">Menunggu</option>
                            <option value="confirmed">Dikonfirmasi</option>
                            <option value="in-progress">Dalam Proses</option>
                            <option value="completed">Selesai</option>
                            <option value="cancelled">Dibatalkan</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(booking.createdAt).toLocaleDateString('id-ID')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewBookingDetail(booking.id)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Lihat Detail"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleTechnicianAssign(booking.id)}
                              className="text-green-600 hover:text-green-900"
                              title="Tugaskan Teknisi"
                            >
                              <Users className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleActualCostUpdate(booking.id)}
                              className="text-purple-600 hover:text-purple-900"
                              title="Update Biaya"
                            >
                              <Edit className="h-4 w-4" />
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

        {/* Printer Brands Tab */}
        {activeTab === 'brands' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Manajemen Merk Printer</h2>
              <button
                onClick={handleAddBrand}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Merk</span>
              </button>
            </div>

            <div className="grid gap-6">
              {printerBrands.map((brand) => (
                <div key={brand.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{brand.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleAddModel(brand.id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Tambah Model"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {brand.models.map((model: any) => (
                      <div key={model.id} className="border rounded-lg p-3">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-medium text-gray-900">{model.name}</div>
                            <div className="text-sm text-gray-500 capitalize">{model.type}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Problem Categories Tab */}
        {activeTab === 'problems' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Manajemen Kategori Masalah</h2>
            </div>

            <div className="grid gap-6">
              {problemCategories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{category.name}</h3>
                  <div className="grid gap-4">
                    {category.problems.map((problem: any) => (
                      <div key={problem.id} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{problem.name}</div>
                            <div className="text-sm text-gray-600 mt-1">{problem.description}</div>
                            <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                              <span>Waktu: {problem.estimatedTime}</span>
                              <span>Biaya: {problem.estimatedCost}</span>
                              <span className="capitalize">Tingkat: {problem.severity}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Technicians Tab */}
        {activeTab === 'technicians' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Manajemen Teknisi</h2>
              <button
                onClick={handleAddTechnician}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Teknisi</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {technicians.map((technician) => (
                <div key={technician.id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{technician.name}</h3>
                      <p className="text-sm text-gray-600">{technician.phone}</p>
                      {technician.email && (
                        <p className="text-sm text-gray-600">{technician.email}</p>
                      )}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      technician.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {technician.is_available ? 'Tersedia' : 'Sibuk'}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Spesialisasi:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {technician.specialization.map((spec: string, index: number) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Pengalaman:</span>
                      <span className="font-medium">{technician.experience} tahun</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">{technician.rating}/5.0</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Gallery Tab */}
        {activeTab === 'gallery' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Manajemen Gallery</h2>
              <button
                onClick={handleAddGalleryImage}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <Plus className="h-4 w-4" />
                <span>Tambah Gambar</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {galleryImages.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={image.image_url}
                      alt={image.alt_text}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900 mb-1 truncate">{image.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 truncate">{image.alt_text}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full capitalize">
                        {image.category}
                      </span>
                      <span className="text-xs text-gray-500">#{image.sort_order}</span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditGalleryImage(image)}
                        className="flex-1 bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Edit className="h-3 w-3" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGalleryImage(image.id, image.title)}
                        className="flex-1 bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors flex items-center justify-center space-x-1"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {galleryImages.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Belum ada gambar di gallery</p>
                <button
                  onClick={handleAddGalleryImage}
                  className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Tambah Gambar Pertama
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Booking Detail Modal */}
      {showBookingDetail && selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Detail Booking #{selectedBooking.id}</h2>
                <button
                  onClick={() => setShowBookingDetail(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Customer Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informasi Customer</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Nama:</span> {selectedBooking.customer.name}</div>
                    <div><span className="font-medium">HP:</span> {selectedBooking.customer.phone}</div>
                    <div><span className="font-medium">Email:</span> {selectedBooking.customer.email}</div>
                    <div><span className="font-medium">Alamat:</span> {selectedBooking.customer.address}</div>
                  </div>
                </div>

                {/* Service Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Informasi Service</h3>
                  <div className="space-y-2">
                    <div><span className="font-medium">Printer:</span> {selectedBooking.printer.brand} {selectedBooking.printer.model}</div>
                    <div><span className="font-medium">Kategori Masalah:</span> {selectedBooking.problem.category}</div>
                    <div><span className="font-medium">Deskripsi:</span> {selectedBooking.problem.description}</div>
                    <div><span className="font-medium">Jenis Service:</span> {selectedBooking.service.type}</div>
                    <div><span className="font-medium">Tanggal:</span> {selectedBooking.service.date}</div>
                    <div><span className="font-medium">Waktu:</span> {selectedBooking.service.time}</div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Timeline Progress</h3>
                <div className="space-y-4">
                  {selectedBooking.timeline.map((step: any, index: number) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        step.completed ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {step.completed ? <CheckCircle className="h-5 w-5" /> : <Clock className="h-5 w-5" />}
                      </div>
                      <div className="flex-1">
                        <h4 className={`font-semibold ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                          {step.title}
                        </h4>
                        <p className={`text-sm ${step.completed ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.description}
                        </p>
                        {step.timestamp && (
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(step.timestamp).toLocaleString('id-ID')}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;