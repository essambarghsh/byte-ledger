'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { OperationType } from '@/lib/types';

interface OperationTypeData {
  id: string;
  name: string; // Arabic name only
}

interface SettingsData {
  operationTypes: OperationTypeData[];
}

export default function SettingsPage() {
  const t = useTranslations();
  const [settings, setSettings] = useState<SettingsData>({ operationTypes: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [newOperationType, setNewOperationType] = useState({ name: '' });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      alert(t('common.error'));
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (updatedSettings: SettingsData) => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedSettings),
      });

      if (response.ok) {
        setSettings(updatedSettings);
        alert(t('messages.settingsSaved'));
      } else {
        alert(t('common.error'));
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert(t('common.error'));
    } finally {
      setIsSaving(false);
    }
  };

  const addOperationType = () => {
    if (!newOperationType.name.trim()) {
      alert(t('settings.operationTypeRequired'));
      return;
    }

    const id = crypto.randomUUID(); // Generate UUID
    const newType: OperationTypeData = {
      id,
      name: newOperationType.name.trim(),
    };

    const updatedSettings = {
      ...settings,
      operationTypes: [...settings.operationTypes, newType],
    };

    saveSettings(updatedSettings);
    setNewOperationType({ name: '' });
  };

  const deleteOperationType = (id: string) => {
    if (!confirm(t('settings.confirmDeleteOperationType'))) return;

    const updatedSettings = {
      ...settings,
      operationTypes: settings.operationTypes.filter(type => type.id !== id),
    };

    saveSettings(updatedSettings);
  };

  const updateOperationType = (id: string, name: string) => {
    if (!name.trim()) {
      alert(t('settings.operationTypeRequired'));
      return;
    }

    const updatedSettings = {
      ...settings,
      operationTypes: settings.operationTypes.map(type =>
        type.id === id ? { ...type, name: name.trim() } : type
      ),
    };

    saveSettings(updatedSettings);
    setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400 mx-auto mb-4 shadow-[0_0_20px_#00ff00]"></div>
          <p className="text-green-300 font-mono text-glow">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black min-h-screen">
      {/* Header */}
      <div className="terminal-window !border-x-0 border-b !border-green-900 shadow-[0_2px_10px_rgba(0,255,0,0.3)]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <h1 className="text-xl font-bold text-green-400 font-mono text-glow">
              {t('settings.title')}
            </h1>
            <Link
              href="/"
              className="px-4 py-2 text-green-400 hover:text-green-200 border border-green-600 hover:border-green-400 rounded-md transition-all hover:shadow-[0_0_10px_#00ff00] font-mono"
            >
              {t('common.back')}
            </Link>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Operation Types Section */}
        <div className="terminal-window rounded-lg shadow-[0_0_20px_rgba(0,255,0,0.2)] mb-8">
          <div className="p-6 border-b border-green-600">
            <h2 className="text-xl font-bold text-green-400 font-mono text-glow">
              {t('settings.operationTypes')}
            </h2>
          </div>
          
          <div className="p-6">
            {/* Add New Operation Type */}
            <div className="mb-6 p-4 border border-green-600 rounded-lg">
              <h3 className="text-lg font-medium text-green-300 mb-4 font-mono">
                {t('settings.addOperationType')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  value={newOperationType.name}
                  onChange={(e) => setNewOperationType({ ...newOperationType, name: e.target.value })}
                  placeholder={t('settings.operationTypeName')}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  dir="rtl"
                />
                <button
                  onClick={addOperationType}
                  disabled={isSaving}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-all font-mono"
                >
                  {t('common.add')}
                </button>
              </div>
            </div>

            {/* Operation Types List */}
            <div className="space-y-4">
              {settings.operationTypes.map((type) => (
                <div key={type.id} className="flex items-center justify-between p-4 border border-green-600 rounded-lg">
                  {editingId === type.id ? (
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 mr-4">
                      <input
                        type="text"
                        defaultValue={type.name}
                        id={`edit-name-${type.id}`}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        dir="rtl"
                      />
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            const nameInput = document.getElementById(`edit-name-${type.id}`) as HTMLInputElement;
                            updateOperationType(type.id, nameInput.value);
                          }}
                          className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 font-mono"
                        >
                          {t('common.save')}
                        </button>
                        <button
                          onClick={() => setEditingId(null)}
                          className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 font-mono"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex-1">
                        <div className="text-white font-mono text-lg">
                          {type.name}
                        </div>
                        <div className="sr-only">
                          <span className="text-green-400">ID:</span> {type.id}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setEditingId(type.id)}
                          className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 font-mono"
                        >
                          {t('common.edit')}
                        </button>
                        <button
                          onClick={() => deleteOperationType(type.id)}
                          className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 font-mono"
                        >
                          {t('common.delete')}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

            {settings.operationTypes.length === 0 && (
              <p className="text-gray-400 text-center py-8 font-mono">
                {t('settings.noOperationTypes')}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
