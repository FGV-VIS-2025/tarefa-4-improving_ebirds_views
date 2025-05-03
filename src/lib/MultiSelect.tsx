import React, { useState } from 'react';
import { MultiSelectProps } from '@/lib/Components';

export const MultiSelect: React.FC<MultiSelectProps> = ({ options, selected, onChange, label }) => {
    const [searchQuery, setSearchQuery] = useState('');
  
    const handleToggle = (value: string) => {
      const updated = selected.includes(value)
        ? selected.filter(item => item !== value)
        : [...selected, value];  // Se não estiver selecionado, adiciona
  
      onChange(updated);  // Atualiza o estado
    };

    const handleSelectAll = () => {
      if (selected.length === options.length) {
        onChange([]); // Se tudo está selecionado, limpa
      } else {
        onChange([...options]); // Seleciona tudo
      }
    };

    // Filtra as opções com base no texto da pesquisa
    const filteredOptions = options.filter(option =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const allSelected = selected.length === options.length;
  
    return (
      <div>
        {label && <p><strong>{label}</strong></p>}
  
        {/* Campo de pesquisa */}
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}  // Atualiza o query de pesquisa
          placeholder="Pesquise uma opção"
          style={{ marginBottom: '10px', padding: '5px', width: '100%' }}
        />

        <div style={{ marginBottom: '10px' }}>
          <label>
            <input
              type="checkbox"
              checked={allSelected}
              onChange={handleSelectAll}
            />{' '}
            Selecionar tudo
          </label>
        </div>
  
        {/* Lista de opções filtradas */}
        {searchQuery.trim() !== '' && (
          
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {filteredOptions.map(option => (
              <li key={option}>
                <label>
                  <input
                    type="checkbox"
                    value={option}
                    checked={selected.includes(option)}  // Verifica se está marcado
                    onChange={() => handleToggle(option)}  // Atualiza o estado
                  />
                  {' '}{option}
                </label>
              </li>
            ))}
          </ul>

        )}
      </div>
    );
  };