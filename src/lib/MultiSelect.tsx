import React, { useState, useEffect, useRef } from 'react';
import { MultiSelectProps } from '@/lib/Components';

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, label }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleToggle = (value: string) => {
    const updated = selected.includes(value)
      ? selected.filter(item => item !== value)
      : [...selected, value];

    onChange(updated);
  };

  const handleSelectAll = () => {
    if (selected.length === options.length) {
      onChange([]);
    } else {
      onChange([...options]);
    }
  };

  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allSelected = selected.length === options.length;

  // Fecha o pop-up ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} style={{ position: 'relative' }}>
      {label && <p><strong>{label}</strong></p>}

      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search some species"
        onFocus={() => setIsOpen(true)}
        style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
      />

      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 5px)',
            left: 0,
            width: '300px',
            backgroundColor: '#111',
            border: '1px solid #333',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 9999,
            marginTop: '5px',
            maxHeight: '300px',
            overflowY: 'auto',
            padding: '10px',
          }}
        >
          <div style={{ marginBottom: '10px' }}>
            <label>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={handleSelectAll}
              />{' '}
              Select All
            </label>
          </div>

          {filteredOptions.length > 0 ? (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {filteredOptions.map(option => (
                <li key={option}>
                  <label>
                    <input
                      type="checkbox"
                      value={option}
                      checked={selected.includes(option)}
                      onChange={() => handleToggle(option)}
                    />{' '}
                    {option}
                  </label>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontStyle: 'italic', color: '#777' }}>No options found </p>
          )}
        </div>
      )}
    </div>
  );
};
