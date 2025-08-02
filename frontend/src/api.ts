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
    const res = await fetch(`${API_BASE}/machines/${id}`, {
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
    const res = await fetch(`${API_BASE}/auth/login`, {
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
    const res = await fetch(`${API_BASE}/auth/logout`, {
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
    console.log('Checking current user session');
    const res = await fetch(`${API_BASE}/auth/me`, {
      credentials: 'include',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
    console.log('getCurrentUser response status:', res.status, res.statusText);
    
    if (!res.ok) {
      if (res.status === 401) {
        console.log('No active session');
        return null; // Not authenticated
      }
      const error = await res.json();
      console.error('getCurrentUser failed:', error);
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
  const res = await fetch(`${API_BASE}/admin/machines`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to fetch machines');
  }
  
  return res.json();
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
  const res = await fetch(`${API_BASE}/machines/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update machine');
  }
  
  return res.json();
}

export async function deleteVendingMachine(id: string) {
  const res = await fetch(`${API_BASE}/machines/${id}`, {
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

// File Upload API
export async function uploadSingleFile(file: File): Promise<any> {
  try {
    console.log('Uploading single file:', file.name);
    
    // Convert file to base64
    const base64 = await fileToBase64(file);
    
    const res = await fetch(`${API_BASE}/upload/single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        file: base64,
        filename: file.name,
        contentType: file.type
      })
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
    console.log('Uploading gallery files for machine:', machineId, files.length, 'files');
    
    // Validate files before upload
    if (files.length === 0) {
      throw new Error('No files to upload');
    }
    
    if (files.length > 10) {
      throw new Error('Maximum 10 files allowed per upload');
    }
    
    // Check file sizes
    const oversizedFiles = files.filter(file => file.size > 4 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      throw new Error(`Files too large: ${oversizedFiles.map(f => f.name).join(', ')}. Maximum 4MB per file.`);
    }
    
    // Upload files one by one to avoid payload size limits
    const uploadedFiles = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const caption = captions?.[i] || '';
      
      try {
        console.log(`Uploading file ${i + 1}/${files.length}: ${file.name}`);
        
        // Convert single file to base64
        const fileData = {
          file: await fileToBase64(file),
          filename: file.name,
          contentType: file.type
        };

        const res = await fetch(`${API_BASE}/upload/gallery/${machineId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            files: [fileData],
            captions: [caption]
          })
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

// Helper function to convert file to base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
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