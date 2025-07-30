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