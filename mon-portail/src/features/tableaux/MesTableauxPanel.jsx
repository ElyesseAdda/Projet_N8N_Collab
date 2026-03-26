import React, { useState, useEffect } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import { supabase, isSupabaseAvailable } from '../../lib/supabase';
import { TABLE_TABLEAU } from '../../config/constants';
import { SearchInput, StatusMessage, Button } from '../../components/ui';
import TableauCard from './TableauCard';
import './MesTableauxPanel.css';

const MesTableauxPanel = ({ openTableaux, onTableauToggle, onTableauDeleted, onTableauUpdated, onRefresh }) => {
  const [tableaux, setTableaux] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isReduced, setIsReduced] = useState(false);

  const loadTableaux = async () => {
    if (!isSupabaseAvailable() || !supabase) {
      console.warn('[Supabase] Client non disponible');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { data, error: err } = await supabase.from(TABLE_TABLEAU).select('*');
      if (err) throw err;
      setTableaux(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('[Supabase] Erreur chargement tableaux:', err);
      setError(err?.message || 'Erreur lors du chargement des tableaux');
      setTableaux([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableaux();
  }, []);

  const categories = [
    ...new Set(tableaux.map((t) => t.category ?? t.Category).filter(Boolean)),
  ];

  const filterTableau = (t) => {
    const resumeTable = (t.resume_table ?? t.Resume_table ?? '').toString();
    const matchesSearch =
      !searchQuery || resumeTable.toLowerCase().includes(searchQuery.toLowerCase());
    const cat = t.category ?? t.Category;
    const matchesCategory = !selectedCategory || cat === selectedCategory;
    return matchesSearch && matchesCategory;
  };

  const filteredTableaux = tableaux.filter(filterTableau);
  const selectedIds = new Set((openTableaux ?? []).map((t) => t.id));
  const selectedFiltered = (openTableaux ?? []).filter((t) => filterTableau(t));
  const addableCandidates = filteredTableaux.filter((t) => !selectedIds.has(t.id));

  const showReduced = isReduced && openTableaux?.length > 0;
  const canReduce = openTableaux?.length > 0;

  return (
    <div className={`tableaux-panel ${showReduced ? 'tableaux-panel--reduced' : ''}`}>
      <div className="tableaux-header">
        <h2 className="tableaux-title">Mes Tableaux</h2>
        <div className="tableaux-filters">
          <SearchInput
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={showReduced ? 'Rechercher pour ajouter...' : 'Rechercher...'}
            className="tableaux-search-wrap"
          />
          {!showReduced && categories.length > 0 && (
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="tableaux-category-select"
            >
              <option value="">Toutes les categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          )}
          {canReduce && (
            <Button
              variant="ghost"
              size="sm"
              className="tableaux-reduce-btn"
              icon={showReduced ? <PanelRightOpen size={18} /> : <PanelRightClose size={18} />}
              onClick={() => setIsReduced((r) => !r)}
            >
              {showReduced ? 'Afficher tout' : 'Réduire'}
            </Button>
          )}
        </div>
      </div>

      {loading && <StatusMessage type="loading" message="Chargement des tableaux..." />}

      {error && <StatusMessage type="error" message={error} />}

      {!loading && !error && showReduced && (
        <>
          <div className="tableaux-grid tableaux-grid--selected">
            {selectedFiltered.length === 0 ? (
              <p className="tableaux-selected-empty">
                {searchQuery.trim()
                  ? 'Aucun tableau sélectionné ne correspond à la recherche.'
                  : 'Aucun tableau sélectionné.'}
              </p>
            ) : (
              selectedFiltered.map((tableau, idx) => (
                <TableauCard
                  key={tableau.id || idx}
                  tableau={tableau}
                  isSelected
                  onClick={() => onTableauToggle?.(tableau)}
                  onRefresh={onRefresh ?? loadTableaux}
                  onTableauDeleted={onTableauDeleted}
                  onTableauUpdated={onTableauUpdated}
                />
              ))
            )}
          </div>
          {searchQuery.trim() && (
            <div className="tableaux-add-more">
              <h3 className="tableaux-add-more-title">Ajouter des tableaux</h3>
              {addableCandidates.length === 0 ? (
                <StatusMessage type="empty" message="Aucun autre tableau ne correspond à la recherche" />
              ) : (
                <div className="tableaux-grid tableaux-grid--addable">
                  {addableCandidates.map((tableau, idx) => (
                    <TableauCard
                      key={tableau.id || idx}
                      tableau={tableau}
                      isSelected={false}
                      onClick={() => onTableauToggle?.(tableau)}
                      onRefresh={onRefresh ?? loadTableaux}
                      onTableauDeleted={onTableauDeleted}
                      onTableauUpdated={onTableauUpdated}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      {!loading && !error && !showReduced && filteredTableaux.length === 0 && (
        <StatusMessage
          type="empty"
          message={searchQuery || selectedCategory ? 'Aucun resultat trouve' : 'Aucun tableau disponible'}
        />
      )}

      {!loading && !error && !showReduced && filteredTableaux.length > 0 && (
        <div className="tableaux-grid">
          {filteredTableaux.map((tableau, idx) => (
            <TableauCard
              key={tableau.id || idx}
              tableau={tableau}
              isSelected={openTableaux?.some((t) => t.id === tableau.id)}
              onClick={() => onTableauToggle?.(tableau)}
              onRefresh={onRefresh ?? loadTableaux}
              onTableauDeleted={onTableauDeleted}
              onTableauUpdated={onTableauUpdated}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MesTableauxPanel;
