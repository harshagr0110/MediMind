import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { DoctorContext } from '../../context/Doctorcontext';

const Availability = () => {
  const { dToken } = useContext(DoctorContext);
  const [available, setAvailable] = useState(true);
  const [slots, setSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      setError('');
      try {
        const { data } = await axios.get('/api/doctor/availability', {
          headers: { Authorization: `Bearer ${dToken}` },
        });
        setAvailable(data.available);
        setSlots(data.slots || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch availability');
      } finally {
        setLoading(false);
      }
    };
    fetchAvailability();
  }, [dToken]);

  const handleToggle = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.post('/api/doctor/availability', { available: !available, slots }, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setAvailable(data.available);
      setSuccess('Availability updated!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update availability');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleAddSlot = async () => {
    if (!newSlot || slots.includes(newSlot)) return;
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const { data } = await axios.post('/api/doctor/availability', { available, slots: [...slots, newSlot] }, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setSlots(data.slots);
      setNewSlot('');
      setSuccess('Slot added!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add slot');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  const handleRemoveSlot = async (slot) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const updatedSlots = slots.filter(s => s !== slot);
      const { data } = await axios.post('/api/doctor/availability', { available, slots: updatedSlots }, {
        headers: { Authorization: `Bearer ${dToken}` },
      });
      setSlots(data.slots);
      setSuccess('Slot removed!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove slot');
    } finally {
      setLoading(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-blue-700 mb-6">Availability</h1>
      <div className="bg-white rounded-xl shadow p-8 flex flex-col gap-6">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-blue-700">Currently:</span>
          <button onClick={handleToggle} className={`px-6 py-2 rounded-lg font-bold ${available ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>{available ? 'Available' : 'Unavailable'}</button>
        </div>
        <div>
          <h2 className="text-lg font-bold text-blue-700 mb-2">Available Slots</h2>
          <div className="flex gap-2 mb-4">
            <input value={newSlot} onChange={e => setNewSlot(e.target.value)} placeholder="e.g. 02:00 PM" className="p-2 rounded-lg border border-blue-200" />
            <button onClick={handleAddSlot} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Add</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {slots.map(slot => (
              <span key={slot} className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-semibold flex items-center gap-2">
                {slot}
                <button onClick={() => handleRemoveSlot(slot)} className="ml-2 text-red-500 font-bold">×</button>
              </span>
            ))}
          </div>
        </div>
        {success && <div className="text-green-600 font-semibold text-center">{success}</div>}
        {error && <div className="text-red-600 font-semibold text-center">{error}</div>}
      </div>
    </div>
  );
};

export default Availability; 