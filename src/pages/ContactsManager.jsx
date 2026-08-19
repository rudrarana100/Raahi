import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, Plus, Trash2, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ContactsManager() {
  const navigate = useNavigate();
  const { contacts, saveContacts, addContact, removeContact } = useApp();

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRelationship, setNewRelationship] = useState('Parent / Guardian');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;

    addContact({
      name: newName,
      phone: newPhone,
      relationship: newRelationship
    });

    setNewName('');
    setNewPhone('');
    setNewRelationship('Emergency Contact');
  };

  const movePriority = (index, direction) => {
    const updated = [...contacts];
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((c, idx) => ({ ...c, priority: idx + 1 }));
    saveContacts(reordered);
  };

  return (
    <div className="max-w-xl mx-auto py-8 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-forest/10 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigate('/')}
            className="p-1.5 rounded-[6px] border border-forest/10 hover:bg-parchment text-forest"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-forest">Manage Emergency Contacts</h2>
            <p className="text-xs font-mono text-moss tracking-mono">Configure notification sequence and contact details.</p>
          </div>
        </div>
      </div>

      {/* Priority Contacts Roster */}
      <div className="bg-card rounded-[9px] border border-forest/10 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-forest/10 pb-2">
          <span className="text-xs font-mono font-bold uppercase tracking-mono text-forest">
            Priority Notification Roster
          </span>
          <span className="text-[11px] font-mono text-moss">1 = First SMS Recipient</span>
        </div>

        <div className="space-y-3">
          {contacts.map((c, idx) => (
            <div key={c.contactId || idx} className="p-3.5 bg-white border border-forest/10 rounded-[6px] flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-full bg-forest text-parchment font-mono text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-forest">{c.name}</p>
                    <span className="text-[10px] font-mono text-forest bg-parchment px-1.5 py-0.5 rounded-[6px]">
                      {c.relationship}
                    </span>
                  </div>
                  <p className="text-[11px] text-moss font-mono mt-0.5">{c.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => movePriority(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded-[6px] bg-white border border-forest/10 text-forest disabled:opacity-30 hover:bg-parchment"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => movePriority(idx, 1)}
                  disabled={idx === contacts.length - 1}
                  className="p-1 rounded-[6px] bg-white border border-forest/10 text-forest disabled:opacity-30 hover:bg-parchment"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => removeContact(c.contactId)}
                  disabled={contacts.length <= 1}
                  className="p-1.5 text-moss hover:text-alert disabled:opacity-30 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Contact Form */}
      <div className="bg-white rounded-[9px] border border-forest/10 p-5 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-forest">Add Emergency Contact</h3>
        
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-xs font-mono font-medium text-forest mb-1">Contact Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Vikram Sharma"
              className="w-full px-3 py-2 rounded-[6px] border border-forest/10 text-xs focus:outline-none focus:ring-1 focus:ring-botanical text-forest bg-white font-sans"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-forest mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +91 98765 00000"
              className="w-full px-3 py-2 rounded-[6px] border border-forest/10 text-xs focus:outline-none focus:ring-1 focus:ring-botanical text-forest bg-white font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-medium text-forest mb-1">Relationship</label>
            <input
              type="text"
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              placeholder="e.g. Parent, Warden, Sibling"
              className="w-full px-3 py-2 rounded-[6px] border border-forest/10 text-xs focus:outline-none focus:ring-1 focus:ring-botanical text-forest bg-white font-sans"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-vivid hover:bg-botanical text-forest font-semibold text-xs rounded-[6px] transition-colors flex items-center justify-center space-x-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4 text-forest stroke-[2.5]" />
            <span>Add Emergency Contact</span>
          </button>
        </form>
      </div>

    </div>
  );
}
