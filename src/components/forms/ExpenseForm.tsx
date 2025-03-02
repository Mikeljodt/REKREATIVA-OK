import React, { useState, useRef } from 'react';
import { Button } from '../ui/Button';
import { useStore } from '../../store';
import { formatCurrency } from '../../utils/formatters';
import { AlertTriangle, Upload } from 'lucide-react';
import type { Expense } from '../../types';

interface ExpenseFormProps {
  onClose: () => void;
  initialData?: Expense | null;
  isEditing?: boolean;
}

export function ExpenseForm({ onClose, initialData, isEditing = false }: ExpenseFormProps) {
  const { addExpense, updateExpense, expenseCategories } = useStore();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [processing, setProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState<Partial<Expense>>(initialData || {
    date: new Date().toISOString().split('T')[0],
    type: 'variable',
    category: 'other',
    description: '',
    amount: 0,
    paymentMethod: 'transfer',
    paymentStatus: 'pending',
    supplier: '',
    invoiceNumber: '',
    dueDate: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors: Record<string, string> = {};

    if (!formData.description?.trim()) {
      validationErrors.description = 'La descripción es obligatoria';
    }
    if (!formData.amount || formData.amount <= 0) {
      validationErrors.amount = 'El importe debe ser mayor que 0';
    }
    if (!formData.category) {
      validationErrors.category = 'La categoría es obligatoria';
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (isEditing && initialData?.id) {
      updateExpense(initialData.id, formData);
    } else {
      addExpense(formData as Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>);
    }
    onClose();
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? Number(value) : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setProcessing(true);
    try {
      // Process the invoice file
      setFormData(prev => ({
        ...prev,
        attachmentUrl: URL.createObjectURL(file)
      }));
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        file: 'Error al procesar el archivo'
      }));
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <Button
            type="button"
            variant="secondary"
            onClick={() => fileInputRef.current?.click()}
            disabled={processing}
          >
            <Upload className="h-4 w-4 mr-2" />
            Importar Factura
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        {processing && (
          <div className="flex items-center text-yellow-500">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Procesando archivo...
          </div>
        )}
      </div>

      {errors.file && (
        <div className="p-4 bg-pink-500/10 border border-pink-500 rounded-lg flex items-center">
          <AlertTriangle className="h-5 w-5 text-pink-500 mr-2" />
          <p className="text-pink-500">{errors.file}</p>
        </div>
      )}

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Fecha
            </label>
            <input
              type="date"
              name="date"
              value={formData.date || ''}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Tipo
            </label>
            <select
              name="type"
              value={formData.type || 'variable'}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="fixed">Fijo</option>
              <option value="variable">Variable</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Categoría
          </label>
          <select
            name="category"
            value={formData.category || ''}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          >
            <option value="">Selecciona una categoría</option>
            {expenseCategories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-pink-500">{errors.category}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Descripción
          </label>
          <input
            type="text"
            name="description"
            value={formData.description || ''}
            onChange={handleChange}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-pink-500">{errors.description}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Importe
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount || ''}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
            {errors.amount && (
              <p className="mt-1 text-sm text-pink-500">{errors.amount}</p>
            )}
            {formData.amount > 0 && (
              <p className="mt-1 text-sm text-gray-400">
                {formatCurrency(formData.amount)}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Método de Pago
            </label>
            <select
              name="paymentMethod"
              value={formData.paymentMethod || 'transfer'}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="cash">Efectivo</option>
              <option value="transfer">Transferencia</option>
              <option value="card">Tarjeta</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Proveedor
            </label>
            <input
              type="text"
              name="supplier"
              value={formData.supplier || ''}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Número de Factura
            </label>
            <input
              type="text"
              name="invoiceNumber"
              value={formData.invoiceNumber || ''}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-400">
              Estado del Pago
            </label>
            <select
              name="paymentStatus"
              value={formData.paymentStatus || 'pending'}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            >
              <option value="pending">Pendiente</option>
              <option value="paid">Pagado</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400">
              Fecha de Vencimiento
            </label>
            <input
              type="date"
              name="dueDate"
              value={formData.dueDate || ''}
              onChange={handleChange}
              className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400">
            Notas Adicionales
          </label>
          <textarea
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full bg-gray-800/50 border border-gray-700 rounded-lg px-4 py-2"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-4">
        <Button variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Actualizar' : 'Registrar'} Gasto
        </Button>
      </div>
    </form>
  );
}
