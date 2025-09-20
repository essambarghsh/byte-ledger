'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Sale, Employee, OperationType, TransactionStatus, OperationTypeData } from '@/lib/types';
import { validateSalePricing, determineTransactionStatus } from '@/lib/client-utils';

interface SalesFormProps {
  employees: Employee[];
  currentEmployeeId: number;
  sale?: Sale | null;
  onSubmit: (saleData: Omit<Sale, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function SalesForm({ employees, currentEmployeeId, sale, onSubmit, onCancel }: SalesFormProps) {
  const t = useTranslations();
  const locale = useLocale();
  
  const [operationTypes, setOperationTypes] = useState<OperationTypeData[]>([]);
  const [isLoadingOperationTypes, setIsLoadingOperationTypes] = useState(true);
  
  const [formData, setFormData] = useState({
    operationType: sale?.operationType || '',
    customerName: sale?.customerName || '',
    transactionStatus: (sale?.transactionStatus || 'paid') as TransactionStatus,
    productPrice: sale?.productPrice?.toString() || '',
    unpaidAmount: sale?.unpaidAmount?.toString() || '0',
    employeeId: sale?.employeeId || currentEmployeeId,
  });

  // Load operation types from settings
  useEffect(() => {
    loadOperationTypes();
  }, []);

  // Set default operation type once operation types are loaded
  useEffect(() => {
    if (operationTypes.length > 0 && !sale && !formData.operationType) {
      setFormData(prev => ({ ...prev, operationType: operationTypes[0].id }));
    }
  }, [operationTypes, sale, formData.operationType]);

  const loadOperationTypes = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setOperationTypes(settings.operationTypes || []);
      }
    } catch (error) {
      console.error('Error loading operation types:', error);
    } finally {
      setIsLoadingOperationTypes(false);
    }
  };

  // Auto-update transaction status based on unpaid amount
  const updateTransactionStatus = (productPrice: string, unpaidAmount: string) => {
    const priceNum = Number(productPrice);
    const unpaidNum = Number(unpaidAmount);
    
    if (!isNaN(priceNum) && !isNaN(unpaidNum) && priceNum > 0 && unpaidNum >= 0) {
      const correctStatus = determineTransactionStatus(priceNum, unpaidNum);
      setFormData(prev => ({ ...prev, transactionStatus: correctStatus }));
    }
  };

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.customerName.trim()) {
      newErrors.customerName = t('forms.required');
    }

    const productPrice = Number(formData.productPrice);
    const unpaidAmount = Number(formData.unpaidAmount);

    if (!formData.productPrice || isNaN(productPrice) || productPrice < 0) {
      newErrors.productPrice = t('forms.invalidAmount');
    }

    if (isNaN(unpaidAmount) || unpaidAmount < 0) {
      newErrors.unpaidAmount = t('forms.invalidAmount');
    }

    // Validate pricing logic
    if (productPrice && unpaidAmount >= 0 && !validateSalePricing(productPrice, unpaidAmount)) {
      newErrors.unpaidAmount = t('forms.invalidPricing');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      operationType: formData.operationType,
      customerName: formData.customerName.trim(),
      transactionStatus: formData.transactionStatus,
      productPrice: Number(formData.productPrice),
      unpaidAmount: Number(formData.unpaidAmount),
      employeeId: formData.employeeId,
    });
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {sale ? t('common.edit') : t('dashboard.addSale')}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sales.operationType')}
            </label>
            <select
              value={formData.operationType}
              onChange={(e) => setFormData({ ...formData, operationType: e.target.value })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoadingOperationTypes}
            >
              {isLoadingOperationTypes ? (
                <option value="">{t('common.loading')}</option>
              ) : operationTypes.length === 0 ? (
                <option value="">{t('settings.noOperationTypes')}</option>
              ) : (
                operationTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sales.customerName')}
            </label>
            <input
              type="text"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              placeholder={t('forms.customerNamePlaceholder')}
              className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.customerName ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.customerName && (
              <p className="text-red-500 text-sm mt-1">{errors.customerName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sales.transactionStatus')}
            </label>
            <select
              value={formData.transactionStatus}
              onChange={(e) => setFormData({ ...formData, transactionStatus: e.target.value as TransactionStatus })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="paid">{t('transactionStatus.paid')}</option>
              <option value="partially-paid">{t('transactionStatus.partially-paid')}</option>
              <option value="not-paid">{t('transactionStatus.not-paid')}</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sales.productPrice')} *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.productPrice}
              onChange={(e) => {
                const newPrice = e.target.value;
                setFormData({ ...formData, productPrice: newPrice });
                updateTransactionStatus(newPrice, formData.unpaidAmount);
              }}
              placeholder={t('forms.productPricePlaceholder')}
              className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.productPrice ? 'border-red-300' : 'border-gray-300'
              }`}
              required
            />
            {errors.productPrice && (
              <p className="text-red-500 text-sm mt-1">{errors.productPrice}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sales.unpaidAmount')}
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.unpaidAmount}
              onChange={(e) => {
                const newUnpaidAmount = e.target.value;
                setFormData({ ...formData, unpaidAmount: newUnpaidAmount });
                updateTransactionStatus(formData.productPrice, newUnpaidAmount);
              }}
              placeholder={t('forms.unpaidAmountPlaceholder')}
              className={`w-full p-2 border rounded-md focus:ring-blue-500 focus:border-blue-500 ${
                errors.unpaidAmount ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.unpaidAmount && (
              <p className="text-red-500 text-sm mt-1">{errors.unpaidAmount}</p>
            )}
            {formData.productPrice && formData.unpaidAmount && (
              <p className="text-sm text-gray-600 mt-1">
                {t('sales.amountPaid')}: {new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
                  style: 'currency',
                  currency: 'EGP',
                  numberingSystem: 'latn',
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 0,
                }).format(Number(formData.productPrice) - Number(formData.unpaidAmount))}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t('sales.employee')}
            </label>
            <select
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: Number(e.target.value) })}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {locale === 'ar' ? employee.name : employee.nameEn}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              {t('common.save')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400 focus:ring-2 focus:ring-gray-500"
            >
              {t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
