import React, { useState } from 'react';
import { Phone, Plus, Trash2, ShieldCheck, ArrowLeft, ArrowUp, ArrowDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ContactsManager({ onBack }) {
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
    <div className="max-w-xl mx-auto py-6 px-4 space-y-6">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <button
            onClick={onBack}
            className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h2 className="text-2xl font-serif text-slate-900">Manage Emergency Contacts</h2>
            <p className="text-xs text-slate-500">Configure notification sequence and contact details.</p>
          </div>
        </div>
      </div>

      {/* Priority Contacts Roster */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
            Priority Alert Order
          </span>
          <span className="text-[11px] text-slate-400">1 = First SMS Recipient</span>
        </div>

        <div className="space-y-3">
          {contacts.map((c, idx) => (
            <div key={c.contactId || idx} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <span className="w-7 h-7 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="text-xs font-bold text-slate-900">{c.name}</p>
                    <span className="text-[10px] text-indigo-900 bg-indigo-50 px-1.5 py-0.2 rounded font-medium">
                      {c.relationship}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{c.phone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-1">
                <button
                  onClick={() => movePriority(idx, -1)}
                  disabled={idx === 0}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => movePriority(idx, 1)}
                  disabled={idx === contacts.length - 1}
                  className="p-1 rounded bg-white border border-slate-200 text-slate-600 disabled:opacity-30 hover:bg-slate-100"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => removeContact(c.contactId)}
                  disabled={contacts.length <= 1}
                  className="p-1.5 text-slate-400 hover:text-alert disabled:opacity-30 ml-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Add Contact Form */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
        <h3 className="font-serif text-lg font-medium text-slate-900">Add New Contact</h3>
        
        <form onSubmit={handleAdd} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Contact Name</label>
            <input
              type="text"
              required
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. Vikram Sharma"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +91 98765 00000"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Relationship</label>
            <input
              type="text"
              value={newRelationship}
              onChange={(e) => setNewRelationship(e.target.value)}
              placeholder="e.g. Parent, Warden, Sibling"
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-slate-900"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-primary hover:bg-primary-light text-white font-medium text-xs rounded-lg transition-colors flex items-center justify-center space-x-1.5"
          >
            <Plus className="w-4 h-4 text-indigo-300" />
            <span>Add Emergency Contact</span>
          </button>
        </form>
      </div>

    </div>
  );
}
