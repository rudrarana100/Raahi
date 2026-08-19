import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Trash2, ArrowRight, UserCheck, PhoneCall } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function Onboarding() {
  const navigate = useNavigate();
  const { saveUser, saveContacts } = useApp();

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [emergencyPin, setEmergencyPin] = useState('1234');

  const [contacts, setContacts] = useState([
    { name: '', phone: '', relationship: 'Parent / Guardian', priority: 1 },
    { name: '', phone: '', relationship: 'Hostel Warden', priority: 2 }
  ]);

  const handleAddContact = () => {
    if (contacts.length >= 4) return;
    setContacts(prev => [
      ...prev,
      { name: '', phone: '', relationship: 'Emergency Contact', priority: prev.length + 1 }
    ]);
  };

  const handleRemoveContact = (index) => {
    if (contacts.length <= 1) return;
    const updated = contacts.filter((_, i) => i !== index).map((c, idx) => ({ ...c, priority: idx + 1 }));
    setContacts(updated);
  };

  const handleContactChange = (index, field, value) => {
    const updated = [...contacts];
    updated[index][field] = value;
    setContacts(updated);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    // Filter valid contacts
    const validContacts = contacts.filter(c => c.name.trim() && c.phone.trim());
    if (validContacts.length === 0) {
      alert('Please provide at least one emergency contact.');
      return;
    }

    saveUser({ name, phone, emergencyPin });
    saveContacts(validContacts);

    navigate('/');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-[9px] border border-forest/10 shadow-xl overflow-hidden">
        
        {/* Header */}
        <div className="bg-parchment text-forest p-6 text-center border-b border-forest/10">
          <div className="w-12 h-12 rounded-[6px] bg-vivid border border-forest/10 flex items-center justify-center mx-auto mb-3">
            <Shield className="w-6 h-6 text-forest stroke-[2.5]" />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-forest">Setup Raahi</h2>
          <p className="text-xs font-mono text-moss tracking-mono mt-1">Your AI safety companion. Setup takes less than a minute.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Section 1: User Profile */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-mono text-moss border-b border-forest/10 pb-1.5">
              <UserCheck className="w-4 h-4 text-forest" />
              <span>Personal Info</span>
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-forest mb-1">Your Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya Roy"
                className="w-full px-3.5 py-2.5 rounded-[6px] border border-forest/10 text-sm focus:outline-none focus:ring-1 focus:ring-botanical text-forest bg-white font-sans"
              />
            </div>

            <div>
              <label className="block text-xs font-mono font-medium text-forest mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +91 98765 43210"
                className="w-full px-3.5 py-2.5 rounded-[6px] border border-forest/10 text-sm focus:outline-none focus:ring-1 focus:ring-botanical text-forest bg-white font-sans"
              />
            </div>
          </div>

          {/* Section 2: Emergency Contacts */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-forest/10 pb-1.5">
              <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-mono text-moss">
                <PhoneCall className="w-4 h-4 text-forest" />
                <span>Emergency Contacts</span>
              </div>
              <span className="text-[10px] font-mono text-moss">Priority order (1 = first alerted)</span>
            </div>

            {contacts.map((contact, idx) => (
              <div key={idx} className="p-3.5 rounded-[6px] border border-forest/10 bg-card space-y-2.5">
                <div className="flex items-center justify-between text-xs font-mono font-medium text-forest">
                  <span className="flex items-center space-x-1.5">
                    <span className="w-5 h-5 rounded-full bg-forest text-parchment text-[10px] flex items-center justify-center font-bold">
                      {idx + 1}
                    </span>
                    <span>Priority Contact {idx + 1}</span>
                  </span>
                  {contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveContact(idx)}
                      className="text-moss hover:text-alert text-xs"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    value={contact.name}
                    onChange={(e) => handleContactChange(idx, 'name', e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-3 py-2 rounded-[6px] border border-forest/10 text-xs focus:outline-none focus:ring-1 focus:ring-botanical bg-white text-forest font-sans"
                  />
                  <input
                    type="tel"
                    required
                    value={contact.phone}
                    onChange={(e) => handleContactChange(idx, 'phone', e.target.value)}
                    placeholder="Phone (+91...)"
                    className="w-full px-3 py-2 rounded-[6px] border border-forest/10 text-xs focus:outline-none focus:ring-1 focus:ring-botanical bg-white text-forest font-mono"
                  />
                </div>

                <input
                  type="text"
                  value={contact.relationship}
                  onChange={(e) => handleContactChange(idx, 'relationship', e.target.value)}
                  placeholder="Relationship (e.g. Parent, Warden, Friend)"
                  className="w-full px-3 py-1.5 rounded-[6px] border border-forest/10 text-[11px] focus:outline-none focus:ring-1 focus:ring-botanical bg-white text-forest font-sans"
                />
              </div>
            ))}

            {contacts.length < 4 && (
              <button
                type="button"
                onClick={handleAddContact}
                className="w-full py-2 bg-parchment hover:bg-card border border-forest/10 rounded-[6px] text-xs font-mono font-medium text-forest flex items-center justify-center space-x-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 text-forest" />
                <span>Add Another Contact</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-vivid hover:bg-botanical text-forest font-semibold text-sm rounded-[6px] transition-colors shadow-sm flex items-center justify-center space-x-2"
          >
            <span>Complete Setup</span>
            <ArrowRight className="w-4 h-4 text-forest stroke-[2.5]" />
          </button>

        </form>
      </div>
    </div>
  );
}
