'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Sale, Employee, OperationType, TransactionStatus, OperationTypeData } from '@/lib/types';
import { calculateAmountPaid, validateSalePricing } from '@/lib/client-utils';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';

interface SalesTableProps {
  sales: Sale[];
  employees: Employee[];
  currentEmployeeId?: number;
  onAddSale?: (saleData: Omit<Sale, 'id' | 'createdAt'>) => void;
  onUpdateSale?: (saleId: string, saleData: Omit<Sale, 'id' | 'createdAt'>) => void;
}

interface EditableRow {
  isEditing: boolean;
  isNew: boolean;
  data: Omit<Sale, 'id' | 'createdAt'> & { id?: string; createdAt?: string };
  errors: Record<string, string>;
}

export default function SalesTable({ sales, employees, currentEmployeeId, onAddSale, onUpdateSale }: SalesTableProps) {
  const t = useTranslations();
  const locale = useLocale();

  // State for managing editable rows
  const [editableRows, setEditableRows] = useState<Record<string, EditableRow>>({});
  const [newRowId, setNewRowId] = useState<string | null>(null);
  
  // State for dynamic operation types
  const [operationTypes, setOperationTypes] = useState<OperationTypeData[]>([]);
  const [isLoadingOperationTypes, setIsLoadingOperationTypes] = useState(true);

  // Load operation types from settings
  useEffect(() => {
    loadOperationTypes();
  }, []);

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

  const getEmployeeName = (employeeId: number) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? (locale === 'ar' ? employee.name : employee.nameEn) : 'Unknown';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
      style: 'currency',
      currency: 'EGP',
      numberingSystem: 'latn',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, 'PPp', { locale: locale === 'ar' ? ar : enUS });
  };

  const validateRowData = (data: Omit<Sale, 'id' | 'createdAt'>) => {
    const errors: Record<string, string> = {};

    if (!data.customerName.trim()) {
      errors.customerName = t('forms.required');
    }

    if (isNaN(data.productPrice) || data.productPrice < 0) {
      errors.productPrice = t('forms.invalidAmount');
    }

    if (isNaN(data.unpaidAmount) || data.unpaidAmount < 0) {
      errors.unpaidAmount = t('forms.invalidAmount');
    }

    // Validate pricing logic
    if (data.productPrice >= 0 && data.unpaidAmount >= 0 && !validateSalePricing(data.productPrice, data.unpaidAmount)) {
      errors.unpaidAmount = t('forms.invalidPricing');
    }

    return errors;
  };

  const handleAddNewRow = () => {
    const newId = `new-${Date.now()}`;
    setNewRowId(newId);
    setEditableRows(prev => ({
      ...prev,
      [newId]: {
        isEditing: true,
        isNew: true,
        data: {
          operationType: operationTypes.length > 0 ? operationTypes[0].id : '',
          customerName: '',
          transactionStatus: 'paid' as TransactionStatus,
          productPrice: 0,
          unpaidAmount: 0,
          employeeId: currentEmployeeId || employees[0]?.id || 1,
        },
        errors: {},
      },
    }));
  };

  const handleEditRow = (saleId: string, sale: Sale) => {
    setEditableRows(prev => ({
      ...prev,
      [saleId]: {
        isEditing: true,
        isNew: false,
        data: {
          operationType: sale.operationType,
          customerName: sale.customerName,
          transactionStatus: sale.transactionStatus,
          productPrice: sale.productPrice,
          unpaidAmount: sale.unpaidAmount,
          employeeId: sale.employeeId,
        },
        errors: {},
      },
    }));
  };

  const handleCellEdit = (rowId: string, field: keyof Omit<Sale, 'id' | 'createdAt'>, value: string | number) => {
    setEditableRows(prev => ({
      ...prev,
      [rowId]: {
        ...prev[rowId],
        data: {
          ...prev[rowId].data,
          [field]: value,
        },
        errors: {
          ...prev[rowId].errors,
          [field]: '', // Clear error when user starts editing
        },
      },
    }));
  };

  const handleSaveRow = async (rowId: string) => {
    const editableRow = editableRows[rowId];
    if (!editableRow) return;

    const errors = validateRowData(editableRow.data);
    
    if (Object.keys(errors).length > 0) {
      setEditableRows(prev => ({
        ...prev,
        [rowId]: {
          ...prev[rowId],
          errors,
        },
      }));
      return;
    }

    try {
      if (editableRow.isNew && onAddSale) {
        await onAddSale(editableRow.data);
        // Remove the new row from editableRows after successful addition
        setEditableRows(prev => {
          const newRows = { ...prev };
          delete newRows[rowId];
          return newRows;
        });
        setNewRowId(null);
      } else if (!editableRow.isNew && onUpdateSale) {
        await onUpdateSale(rowId, editableRow.data);
        // Remove the row from editableRows after successful update
        setEditableRows(prev => {
          const newRows = { ...prev };
          delete newRows[rowId];
          return newRows;
        });
      }
    } catch (error) {
      console.error('Error saving row:', error);
    }
  };

  const handleCancelEdit = (rowId: string) => {
    setEditableRows(prev => {
      const newRows = { ...prev };
      delete newRows[rowId];
      return newRows;
    });
    
    if (rowId === newRowId) {
      setNewRowId(null);
    }
  };

  const renderCell = (
    rowId: string,
    field: keyof Omit<Sale, 'id' | 'createdAt'> | 'amountPaid',
    value: string | number,
    sale?: Sale
  ) => {
    const editableRow = editableRows[rowId];
    const isEditing = editableRow?.isEditing;
    
    // Handle amountPaid as a special calculated field
    let currentValue: string | number;
    if (field === 'amountPaid') {
      if (isEditing) {
        // Calculate from editable data
        currentValue = editableRow.data.productPrice - editableRow.data.unpaidAmount;
      } else {
        currentValue = value;
      }
    } else {
      const fieldValue = isEditing ? editableRow.data[field as keyof typeof editableRow.data] : undefined;
      currentValue = fieldValue !== undefined ? fieldValue : value;
    }
    
    const hasError = editableRow?.errors[field];
    const isReadOnly = !onUpdateSale || !onAddSale; // Read-only if no edit handlers provided

    if (!isEditing) {
      // Non-editable cell - show regular display with click to edit (if not read-only)
      const handleCellClick = () => {
        if (sale && !isReadOnly) {
          handleEditRow(rowId, sale);
        }
      };

      let displayValue;
      switch (field) {
        case 'operationType':
          const operationTypeData = operationTypes.find(type => type.id === currentValue);
          displayValue = operationTypeData ? 
            operationTypeData.name :
            String(currentValue); // Fallback to the raw value if not found
          break;
        case 'transactionStatus':
          displayValue = (
            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border font-mono ${
              currentValue === 'paid' 
                ? 'bg-green-900/50 text-green-400 border-green-600'
                : currentValue === 'partially-paid'
                ? 'bg-yellow-900/50 text-yellow-300 border-yellow-600'
                : currentValue === 'refunded'
                ? 'bg-blue-900/50 text-blue-300 border-blue-600'
                : currentValue === 'voided'
                ? 'bg-gray-900/50 text-gray-300 border-gray-600'
                : 'bg-red-900/50 text-red-300 border-red-600'
            }`}>
              {t(`transactionStatus.${currentValue}`)}
            </span>
          );
          break;
        case 'productPrice':
        case 'unpaidAmount':
          displayValue = formatCurrency(Number(currentValue));
          break;
        case 'amountPaid':
          // Calculate and display the paid amount
          const sale = displayRows.find(s => s.id === rowId);
          if (sale) {
            displayValue = formatCurrency(calculateAmountPaid(sale));
          } else {
            displayValue = formatCurrency(0);
          }
          break;
        case 'employeeId':
          displayValue = getEmployeeName(Number(currentValue));
          break;
        default:
          displayValue = currentValue;
      }

      return (
        <td 
          className={`px-6 py-4 whitespace-nowrap text-base text-white font-bold font-mono ${
            isReadOnly ? '' : 'cursor-pointer hover:bg-green-900/20 hover:text-green-100'
          }`}
          onClick={handleCellClick}
        >
          {displayValue}
        </td>
      );
    }

    // Editable cell - show appropriate input
    const baseClasses = `w-full p-2 text-base border rounded focus:ring-2 focus:ring-green-500 bg-black text-white font-mono ${
      hasError ? 'border-red-600 focus:border-red-500' : 'border-green-600 focus:border-green-400'
    }`;

    let inputElement;
    switch (field) {
      case 'operationType':
        inputElement = (
          <select
            value={currentValue}
            onChange={(e) => handleCellEdit(rowId, field, e.target.value)}
            className={baseClasses}
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
        );
        break;
      case 'transactionStatus':
        inputElement = (
          <select
            value={currentValue}
            onChange={(e) => handleCellEdit(rowId, field, e.target.value as TransactionStatus)}
            className={baseClasses}
          >
            <option value="paid">{t('transactionStatus.paid')}</option>
            <option value="partially-paid">{t('transactionStatus.partially-paid')}</option>
            <option value="not-paid">{t('transactionStatus.not-paid')}</option>
            <option value="refunded">{t('transactionStatus.refunded')}</option>
            <option value="voided">{t('transactionStatus.voided')}</option>
          </select>
        );
        break;
      case 'productPrice':
      case 'unpaidAmount':
        inputElement = (
          <input
            type="number"
            step="0.01"
            min="0"
            value={currentValue}
            onChange={(e) => handleCellEdit(rowId, field, Number(e.target.value))}
            className={baseClasses}
          />
        );
        break;
      case 'amountPaid':
        // Amount paid is calculated, not directly editable
        const editableRow = editableRows[rowId];
        const calculatedAmount = editableRow ? 
          editableRow.data.productPrice - editableRow.data.unpaidAmount : 0;
        inputElement = (
          <div className="p-2 text-base bg-green-900/20 rounded border border-green-600 text-white font-mono">
            {formatCurrency(calculatedAmount)} <span className="text-xs text-green-500">(calculated)</span>
          </div>
        );
        break;
      case 'employeeId':
        inputElement = (
          <select
            value={currentValue}
            onChange={(e) => handleCellEdit(rowId, field, Number(e.target.value))}
            className={baseClasses}
          >
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {locale === 'ar' ? employee.name : employee.nameEn}
              </option>
            ))}
          </select>
        );
        break;
      default:
        inputElement = (
          <input
            type="text"
            value={currentValue}
            onChange={(e) => handleCellEdit(rowId, field, e.target.value)}
            className={baseClasses}
          />
        );
    }

    return (
      <td className="px-6 py-4 whitespace-nowrap">
        {inputElement}
        {hasError && (
          <div className="text-red-400 text-xs mt-1 font-mono animate-pulse">ERROR: {hasError}</div>
        )}
      </td>
    );
  };

  // Combine existing sales with new row if present
  const displayRows = [...sales];
  if (newRowId && editableRows[newRowId]) {
    displayRows.unshift({
      id: newRowId,
      ...editableRows[newRowId].data,
      createdAt: new Date().toISOString(),
    } as Sale);
  }

  const isReadOnly = !onUpdateSale || !onAddSale; // Read-only if no edit handlers provided

  if (displayRows.length === 0 && !newRowId) {
    return (
      <div className="text-center py-8">
        <p className="text-green-400 text-lg mb-4 font-mono pulse-text">NO SALES DATA FOUND</p>
        {!isReadOnly && (
          <button
            onClick={handleAddNewRow}
            className="bg-green-900 border border-green-600 text-white px-4 py-2 rounded-md hover:bg-green-800 hover:text-green-100 transition-all hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] font-mono"
          >
            + {t('dashboard.addSale')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Add Sale Button - only show if not read-only */}
      {!isReadOnly && (
        <div className="mb-4">
          <button
            onClick={handleAddNewRow}
            disabled={newRowId !== null}
            className="bg-green-900 text-base font-bold border border-green-600 text-green-400 px-4 py-4 rounded-md hover:bg-green-800 hover:text-green-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_15px_rgba(0,255,0,0.3)] font-mono"
          >
            + {t('dashboard.addSale')}
          </button>
        </div>
      )}

      <table className="min-w-full bg-black border border-green-600 rounded-lg">
        <thead className="bg-green-800/30">
          <tr>
            <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
              {t('sales.operationType')}
            </th>
            <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
              {t('sales.customerName')}
            </th>
            <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
              {t('sales.transactionStatus')}
            </th>
            <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
              {t('sales.productPrice')}
            </th>
            <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
              {t('sales.unpaidAmount')}
            </th>
            <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
              {t('sales.amountPaid')}
            </th>
            <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
              {t('sales.employee')}
            </th>
            <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
              {t('sales.createdAt')}
            </th>
            {!isReadOnly && (
              <th className="px-6 py-3 border-b border-green-600 text-right text-base font-bold text-green-400 uppercase tracking-wider font-mono">
                {t('sales.actions')}
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-green-800/30 divide-y divide-green-800">
          {displayRows.map((sale) => {
            const editableRow = editableRows[sale.id];
            const isEditing = editableRow?.isEditing;

            return (
              <tr key={sale.id} className={isEditing ? "bg-green-900/50 shadow-[inset_0_0_10px_rgba(0,255,0,0.2)]" : "hover:bg-green-900/10 transition-all"}>
                {renderCell(sale.id, 'operationType', sale.operationType, sale)}
                {renderCell(sale.id, 'customerName', sale.customerName, sale)}
                {renderCell(sale.id, 'transactionStatus', sale.transactionStatus, sale)}
                {renderCell(sale.id, 'productPrice', sale.productPrice, sale)}
                {renderCell(sale.id, 'unpaidAmount', sale.unpaidAmount, sale)}
                {renderCell(sale.id, 'amountPaid', calculateAmountPaid(sale), sale)}
                {renderCell(sale.id, 'employeeId', sale.employeeId, sale)}
              <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-white font-mono">
                  {isEditing && editableRow?.isNew ? '-' : formatDate(sale.createdAt)}
              </td>
                {!isReadOnly && (
                <td className="px-6 py-4 whitespace-nowrap text-base font-bold space-x-2">
                    {isEditing ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleSaveRow(sale.id)}
                          className="bg-green-900 border border-green-600 text-white px-3 py-1 text-base rounded hover:bg-green-800 hover:text-green-100 transition-all hover:shadow-[0_0_10px_rgba(0,255,0,0.3)] font-mono"
                        >
                          {t('sales.saveRow')}
                        </button>
                        <button
                          onClick={() => handleCancelEdit(sale.id)}
                          className="bg-red-900 border border-red-600 text-red-300 px-3 py-1 text-base rounded hover:bg-red-800 hover:text-red-100 transition-all hover:shadow-[0_0_10px_rgba(255,0,0,0.3)] font-mono"
                        >
                          {t('common.cancel')}
                        </button>
                      </div>
                    ) : (
                    <button
                        onClick={() => handleEditRow(sale.id, sale)}
                      className="text-green-400 hover:text-green-200 font-mono border border-green-600 px-2 py-1 rounded hover:shadow-[0_0_5px_rgba(0,255,0,0.3)] transition-all"
                    >
                      {t('common.edit')}
                    </button>
                  )}
                </td>
              )}
            </tr>
            );
          })}
        </tbody>
      </table>
      
      <div className="mt-4 p-4 bg-green-900/30 rounded-0 border border-green-600">
        <div className="text-right">
          <span className="text-lg font-bold text-white font-mono">
             {t('sales.total')}: {formatCurrency(sales.reduce((total, sale) => total + calculateAmountPaid(sale), 0))}
          </span>
        </div>
      </div>
    </div>
  );
}