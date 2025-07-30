const API_BASE = 'http://localhost:4000/api';

export async function fetchVendingMachines() {
  try {
    console.log('Fetching vending machines from:', `${API_BASE}/machines`);
    const res = await fetch(`${API_BASE}/machines`);
    console.log('Response status:', res.status, res.statusText);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch vending machines`);
    const data = await res.json();
    console.log('Fetched machines:', data.length, 'machines');
    return data;
  } catch (error) {
    console.error('fetchVendingMachines error:', error);
    throw error;
  }
}

export async function fetchVendingMachine(id: string) {
  try {
    console.log('Fetching vending machine:', id);
    const res = await fetch(`${API_BASE}/machines/${id}`);
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
    });
    
    console.log('getCurrentUser response status:', res.status, res.statusText);
    
    if (!res.ok) {
      if (res.status === 401) {
        console.log('No active session');
        return null; // Not authenticated
      }
      const error = await res.json();
      console.error('getCurrentUser failed:', error);
      throw new Error(error.error || 'Failed to get user');
    }
    
    const data = await res.json();
    console.log('Current user:', data.user.name, data.user.role);
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
    
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${API_BASE}/upload/single`, {
      method: 'POST',
      credentials: 'include',
      body: formData
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
    
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('gallery', file);
      if (captions && captions[index]) {
        formData.append(`caption_${index}`, captions[index]);
      }
    });

    const res = await fetch(`${API_BASE}/upload/gallery/${machineId}`, {
      method: 'POST',
      credentials: 'include',
      body: formData
    });

    console.log('Gallery upload response status:', res.status, res.statusText);
    
    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || 'Gallery upload failed');
    }

    const data = await res.json();
    console.log('Gallery uploaded successfully:', data.photos.length, 'items');
    return data;
  } catch (error) {
    console.error('uploadGalleryFiles error:', error);
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