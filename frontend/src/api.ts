import type { VendingMachine, Product } from './types';

const API_BASE = import.meta.env.PROD 
  ? '/api' // Production: relative URLs (same domain)
  : 'http://localhost:4000/api'; // Development: absolute URL

export async function fetchVendingMachines() {
  try {
    const timestamp = Date.now();
    const url = `${API_BASE}/machines?t=${timestamp}`;
    console.log('🌐 Fetching vending machines from:', url);
    console.log('🌐 API_BASE:', API_BASE);
    console.log('🌐 import.meta.env.PROD:', import.meta.env.PROD);
    
    const res = await fetch(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    console.log('📡 Response status:', res.status, res.statusText);
    console.log('📡 Response headers:', Object.fromEntries(res.headers.entries()));
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('❌ Response not ok:', errorText);
      throw new Error(`HTTP ${res.status}: Failed to fetch vending machines - ${errorText}`);
    }
    
    const data = await res.json();
    console.log('✅ Fetched machines:', data.length, 'machines');
    console.log('✅ First machine:', data[0]);
    return data;
  } catch (error) {
    console.error('❌ fetchVendingMachines error:', error);
    throw error;
  }
}

export async function fetchVendingMachine(id: string) {
  try {
    console.log('Fetching vending machine:', id);
    const res = await fetch(`${API_BASE}/machines?id=${id}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    console.log('Response status:', res.status, res.statusText);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch vending machine`);
    const data = await res.json();
    console.log('Fetched machine:', data.name);
    return data;
  } catch (error) {
    console.error('fetchVendingMachine error:', error);
    throw error;
  }
}

// Authentication API
export async function login(email: string, password: string) {
  try {
    console.log('Attempting login for:', email);
    const res = await fetch(`${API_BASE}/auth?action=login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });
    
    console.log('Login response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const error = await res.json();
      console.error('Login failed:', error);
      throw new Error(error.error || 'Login failed');
    }
    
    const data = await res.json();
    console.log('Login successful for user:', data.user.name, data.user.role);
    return data;
  } catch (error) {
    console.error('login error:', error);
    throw error;
  }
}

export async function logout() {
  try {
    console.log('Attempting logout');
    const res = await fetch(`${API_BASE}/auth?action=logout`, {
      method: 'POST',
      credentials: 'include',
    });
    
    console.log('Logout response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const error = await res.json();
      console.error('Logout failed:', error);
      throw new Error(error.error || 'Logout failed');
    }
    
    const data = await res.json();
    console.log('Logout successful');
    return data;
  } catch (error) {
    console.error('logout error:', error);
    throw error;
  }
}

export async function getCurrentUser() {
  try {
    console.log('Getting current user');
    const res = await fetch(`${API_BASE}/auth?action=me`, {
      credentials: 'include',
    });
    
    console.log('Get current user response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const error = await res.json();
      console.error('Get current user failed:', error);
      throw new Error(error.error || 'Failed to get current user');
    }
    
    const data = await res.json();
    console.log('Current user:', data.user?.name, data.user?.role);
    return data;
  } catch (error) {
    console.error('getCurrentUser error:', error);
    throw error;
  }
}

// Admin API
export async function fetchAllMachines() {
  try {
    console.log('Fetching all machines for admin...');
    const res = await fetch(`${API_BASE}/machines?admin=true`, {
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch all machines`);
    const data = await res.json();
    console.log('Fetched all machines:', data.length);
    return data;
  } catch (error) {
    console.error('fetchAllMachines error:', error);
    throw error;
  }
}

export async function createVendingMachine(data: any) {
  const res = await fetch(`${API_BASE}/machines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create machine');
  }
  
  return res.json();
}

export async function updateVendingMachine(id: string, data: any) {
  try {
    console.log('Updating vending machine:', id);
    const res = await fetch(`${API_BASE}/machines?id=${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to update vending machine`);
    const result = await res.json();
    console.log('Updated machine:', result.name);
    return result;
  } catch (error) {
    console.error('updateVendingMachine error:', error);
    throw error;
  }
}

export async function deleteVendingMachine(id: string) {
  const res = await fetch(`${API_BASE}/machines?id=${id}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to delete machine');
  }
  
  return res.json();
}

export async function fetchMyMachines() {
  const res = await fetch(`${API_BASE}/my-machines`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch your machines');
  }
  
  return res.json();
} 

// File Upload API - Direct upload to bypass Base64 size limitations
export async function uploadSingleFile(file: File): Promise<any> {
  try {
    console.log('Uploading single file directly:', file.name, 'Size:', file.size);
    
    // Create FormData for direct file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('contentType', file.type);
    
    const res = await fetch(`${API_BASE}/upload?type=logo`, {
      method: 'POST',
      credentials: 'include',
      body: formData // Send as FormData instead of JSON
    });

    console.log('Upload response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'File upload failed');
    }

    const data = await res.json();
    console.log('File uploaded successfully:', data.file.filename);
    return data;
  } catch (error) {
    console.error('uploadSingleFile error:', error);
    throw error;
  }
}

export async function uploadGalleryFiles(machineId: string, files: File[], captions?: string[]): Promise<any> {
  try {
    console.log('Uploading gallery files directly for machine:', machineId, files.length, 'files');
    
    // Validate files before upload
    if (files.length === 0) {
      throw new Error('No files to upload');
    }
    
    if (files.length > 10) {
      throw new Error('Maximum 10 files allowed per upload');
    }
    
    // Check file sizes - now we can handle much larger files
    const oversizedFiles = files.filter(file => file.size > 50 * 1024 * 1024); // 50MB limit
    if (oversizedFiles.length > 0) {
      throw new Error(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum 50MB per file.`);
    }
    
    // Upload files one by one using FormData
    const uploadedFiles = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions?.[i] || '';
      
      try {
        console.log(`Uploading file ${i + 1}/${files.length}: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        
        // Create FormData for direct file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('filename', file.name);
        formData.append('contentType', file.type);
        formData.append('caption', caption);

        const res = await fetch(`${API_BASE}/upload?type=gallery&machineId=${machineId}`, {
          method: 'POST',
          credentials: 'include',
          body: formData
        });

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || `Failed to upload ${file.name}`);
        }

        const data = await res.json();
        if (data.photos && data.photos.length > 0) {
          uploadedFiles.push(data.photos[0]);
          console.log(`✅ Uploaded: ${file.name}`);
        }
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error);
        errors.push(`${file.name}: ${error instanceof Error ? error.message : 'Upload failed'}`);
      }
    }
    
    console.log(`✅ Gallery upload completed. ${uploadedFiles.length} files uploaded successfully.`);
    
    if (errors.length > 0) {
      console.warn('Gallery upload completed with errors:', errors);
    }
    
    return {
      photos: uploadedFiles,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('uploadGalleryFiles error:', error);
    throw error;
  }
}

// New function for uploading product photos
export async function uploadProductPhoto(file: File): Promise<any> {
  try {
    console.log('Uploading product photo directly:', file.name, 'Size:', file.size);
    
    // Create FormData for direct file upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('contentType', file.type);
    
    const res = await fetch(`${API_BASE}/upload?type=product`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    console.log('Product photo upload response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Product photo upload failed');
    }

    const data = await res.json();
    console.log('Product photo uploaded successfully:', data.file.filename);
    return data;
  } catch (error) {
    console.error('uploadProductPhoto error:', error);
    throw error;
  }
}

export async function deleteGalleryItem(photoId: number): Promise<any> {
  try {
    console.log('Deleting gallery item:', photoId);
    
    const res = await fetch(`${API_BASE}/upload/gallery/${photoId}`, {
      method: 'DELETE',
      credentials: 'include'
    });

    console.log('Delete gallery item response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to delete gallery item');
    }

    const data = await res.json();
    console.log('Gallery item deleted successfully');
    return data;
  } catch (error) {
    console.error('deleteGalleryItem error:', error);
    throw error;
  }
} 

// Product management API
export async function searchProducts(query: string): Promise<Product[]> {
  try {
    console.log('Searching products:', query);
    const res = await fetch(`${API_BASE}/products?search=${encodeURIComponent(query)}`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to search products');
    }
    
    const data = await res.json();
    console.log('Found products:', data.length);
    return data;
  } catch (error) {
    console.error('searchProducts error:', error);
    throw error;
  }
}

export async function createProduct(productData: {
  name: string;
  description?: string;
  photo?: string;
  price?: number;
}): Promise<Product> {
  try {
    console.log('Creating product:', productData.name);
    const res = await fetch(`${API_BASE}/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(productData)
    });
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Failed to create product');
    }
    
    const data = await res.json();
    console.log('Created product:', data.name);
    return data;
  } catch (error) {
    console.error('createProduct error:', error);
    throw error;
  }
} 