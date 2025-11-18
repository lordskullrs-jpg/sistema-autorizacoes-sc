import { useState, useEffect } from 'react';

interface DateInputProps {
  value: string; // ISO format (YYYY-MM-DD)
  onChange: (value: string) => void;
  label: string;
  required?: boolean;
  disabled?: boolean;
}

export default function DateInput({ 
  value, 
  onChange, 
  label, 
  required = false, 
  disabled = false
}: DateInputProps) {
  const [displayValue, setDisplayValue] = useState('');

  // Converter ISO para formato brasileiro (DD/MM/AAAA)
  useEffect(() => {
    if (value) {
      const [year, month, day] = value.split('-');
      setDisplayValue(`${day}/${month}/${year}`);
    } else {
      setDisplayValue('');
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
    
    // Limitar a 8 dígitos (DDMMAAAA)
    if (input.length > 8) {
      input = input.slice(0, 8);
    }

    // Aplicar máscara DD/MM/AAAA
    let formatted = '';
    if (input.length > 0) {
      formatted = input.slice(0, 2);
    }
    if (input.length >= 3) {
      formatted += '/' + input.slice(2, 4);
    }
    if (input.length >= 5) {
      formatted += '/' + input.slice(4, 8);
    }

    setDisplayValue(formatted);

    // Converter para ISO format (YYYY-MM-DD) se a data estiver completa
    if (input.length === 8) {
      const day = input.slice(0, 2);
      const month = input.slice(2, 4);
      const year = input.slice(4, 8);
      
      // Validar data
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (
        date.getFullYear() === parseInt(year) &&
        date.getMonth() === parseInt(month) - 1 &&
        date.getDate() === parseInt(day)
      ) {
        onChange(`${year}-${month}-${day}`);
      }
    } else {
      onChange('');
    }
  };

  const handleBlur = () => {
    // Validar data ao perder o foco
    if (displayValue.length === 10) {
      const [day, month, year] = displayValue.split('/');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      
      if (
        date.getFullYear() !== parseInt(year) ||
        date.getMonth() !== parseInt(month) - 1 ||
        date.getDate() !== parseInt(day)
      ) {
        setDisplayValue('');
        onChange('');
      }
    }
  };

  return (
    <div className="form-group">
      <label className="form-label">
        {label} {required && '*'}
      </label>
      <input
        type="text"
        className="form-control"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder="DD/MM/AAAA"
        required={required}
        disabled={disabled}
        maxLength={10}
      />
    </div>
  );
}
