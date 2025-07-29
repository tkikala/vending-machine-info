export async function fetchVendingMachines() {
  const res = await fetch('http://localhost:4000/api/machines');
  if (!res.ok) throw new Error('Failed to fetch vending machines');
  return res.json();
}

export async function fetchVendingMachine(id: string) {
  const res = await fetch(`http://localhost:4000/api/machines/${id}`);
  if (!res.ok) throw new Error('Failed to fetch vending machine');
  return res.json();
} 