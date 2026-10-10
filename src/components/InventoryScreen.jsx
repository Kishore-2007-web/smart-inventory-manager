import React, { useState, useMemo } from 'react';
import { Search, Plus, Filter, ArrowUpDown, Trash2, Edit2, CheckCircle2, AlertOctagon, Minus } from 'lucide-react';
import { formatDisplayDate } from '../utils/dateUtils.js';
import { playFilterSelectSound, playQuantityStepSound, playClickSound } from '../utils/soundEffects.js';

export default function InventoryScreen({
  inventory = [],
  currencySymbol = '₹',
  onOpenAddModal,
  onEditItem,
  onDeleteItem,
  onUpdateQuantity,
  onMarkConsumed,
  onMarkDiscarded
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All');
  const [sortBy, setSortBy] = useState('priority');

  const [partialModalItem, setPartialModalItem] = useState(null);
  const [partialQty, setPartialQty] = useState('');
  const [discardModalItem, setDiscardModalItem] = useState(null);
  const [discardReason, setDiscardReason] = useState('Spoiled / Expired');
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const categories = ['All', 'Produce', 'Dairy', 'Pantry', 'Protein', 'Bakery', 'Other'];
  const locations = ['All', 'refrigerator', 'freezer', 'pantry'];

  const filteredItems = useMemo(() => {
    let result = inventory.filter(i => i.status !== 'consumed' && i.status !== 'discarded' && Number(i.quantity) > 0);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(i =>
        (i.name && i.name.toLowerCase().includes(q)) ||
        (i.notes && i.notes.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(i => i.category === selectedCategory);
    }

    if (selectedLocation !== 'All') {
      result = result.filter(i => i.location === selectedLocation);
    }

    result.sort((a, b) => {
      if (sortBy === 'priority') {
        return (b.priorityScore || 0) - (a.priorityScore || 0);
      }
      if (sortBy === 'date') {
        if (!a.date) return 1;
        if (!b.date) return -1;
        return a.date.localeCompare(b.date);
      }
      if (sortBy === 'name') {
        return (a.name || '').localeCompare(b.name || '');
      }
      return 0;
    });

    return result;
  }, [inventory, searchTerm, selectedCategory, selectedLocation, sortBy]);

  const handlePartialSubmit = (e) => {
    e.preventDefault();
    if (!partialModalItem || !partialQty) return;
    const qtyNum = parseFloat(partialQty);
    if (isNaN(qtyNum) || qtyNum <= 0) return;
    onMarkConsumed(partialModalItem, qtyNum);
    setPartialModalItem(null);
    setPartialQty('');
  };

  const handleDiscardSubmit = (e) => {
    e.preventDefault();
    if (!discardModalItem) return;
    onMarkDiscarded(discardModalItem, discardReason);
    setDiscardModalItem(null);
    setDiscardReason('Spoiled / Expired');
  };

  return (
    <div className="space-y-6 pb-20 md:pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-forest tracking-tight">Food Inventory</h1>
          <p className="text-secondary-text text-sm mt-1">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} in storage
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-forest hover:bg-forest-light text-white font-semibold text-xs shadow-card transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Add Food Item
        </button>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-3xl p-5 border border-subtle-border shadow-card space-y-3.5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-secondary-text absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search groceries by name or note..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-subtle-border bg-ivory text-sm focus:outline-none focus:ring-2 focus:ring-forest text-main-text"
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-secondary-text hidden sm:block" />
            <select
              value={sortBy}
              onChange={(e) => {
                playFilterSelectSound();
                setSortBy(e.target.value);
              }}
              className="px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-white text-xs font-semibold text-forest focus:outline-none focus:ring-2 focus:ring-forest"
            >
              <option value="priority">Sort by Rescue Urgency</option>
              <option value="date">Sort by Date</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Categories */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-bold text-secondary-text mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                playFilterSelectSound();
                setSelectedCategory(cat);
              }}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-colors ${
                selectedCategory === cat
                  ? 'bg-forest text-white'
                  : 'bg-ivory text-secondary-text hover:text-forest hover:bg-mint'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Storage Location */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-bold text-secondary-text mr-1">Storage:</span>
          {locations.map((loc) => (
            <button
              key={loc}
              onClick={() => {
                playFilterSelectSound();
                setSelectedLocation(loc);
              }}
              className={`px-3 py-1 rounded-xl text-xs capitalize font-semibold transition-colors ${
                selectedLocation === loc
                  ? 'bg-primary-green text-white'
                  : 'bg-ivory text-secondary-text hover:text-forest hover:bg-mint'
              }`}
            >
              {loc === 'All' ? 'All Locations' : loc}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 border border-subtle-border text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-mint text-forest flex items-center justify-center mx-auto">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-forest">No matching groceries</h3>
          <p className="text-secondary-text text-sm max-w-sm mx-auto">
            Try adjusting your search terms or add a new food item to your fridge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const urgency = item.urgency;
            const isUrgent = (item.priorityScore || 0) >= 70;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-3xl p-5 border shadow-card flex flex-col justify-between space-y-3 transition-all ${
                  isUrgent ? 'border-red-200 ring-1 ring-red-100' : 'border-subtle-border hover:border-sage'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-forest text-base leading-snug">
                        {item.name}
                      </h3>
                      <div className="flex flex-wrap items-center gap-1.5 mt-1">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-ivory text-secondary-text border border-subtle-border">
                          {item.category}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-ivory text-secondary-text border border-subtle-border capitalize">
                          {item.location}
                        </span>
                        {item.price && (
                          <span className="text-[10px] font-bold text-primary-green">
                            {currencySymbol}{item.price}
                          </span>
                        )}
                      </div>
                    </div>

                    {urgency && (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          urgency.badgeColor === 'red'
                            ? 'bg-red-50 text-error-red border border-red-200'
                            : urgency.badgeColor === 'amber'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : urgency.badgeColor === 'yellow'
                            ? 'bg-yellow-50 text-yellow-800 border border-yellow-200'
                            : 'bg-mint text-forest border border-sage'
                        }`}
                      >
                        {urgency.label}
                      </span>
                    )}
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between bg-ivory px-3.5 py-2 rounded-2xl border border-subtle-border">
                    <span className="text-xs font-semibold text-secondary-text">Quantity:</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          playQuantityStepSound(false);
                          onUpdateQuantity(item, Math.max(0, (item.quantity || 1) - 1));
                        }}
                        disabled={item.quantity <= 1}
                        className="w-6 h-6 rounded-lg bg-white border border-subtle-border flex items-center justify-center text-forest hover:bg-mint disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-sm font-bold text-forest min-w-10 text-center">
                        {item.quantity} {item.unit}
                      </span>
                      <button
                        onClick={() => {
                          playQuantityStepSound(true);
                          onUpdateQuantity(item, (item.quantity || 1) + 1);
                        }}
                        className="w-6 h-6 rounded-lg bg-white border border-subtle-border flex items-center justify-center text-forest hover:bg-mint"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  <div className="text-xs text-secondary-text space-y-1">
                    <div className="flex justify-between">
                      <span>{item.dateType || 'Date'}:</span>
                      <span className="font-bold text-forest">
                        {item.date ? formatDisplayDate(item.date) : 'Unrecorded'}
                      </span>
                    </div>
                    {item.notes && (
                      <p className="text-secondary-text italic text-[11px] line-clamp-1">
                        "{item.notes}"
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions */}
                <div className="mt-3 pt-3 border-t border-subtle-border flex flex-wrap items-center justify-between gap-1.5">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onMarkConsumed(item, item.quantity)}
                      title="Mark fully used"
                      className="px-2.5 py-1.5 rounded-xl bg-mint hover:bg-sage text-forest text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary-green" />
                      Used
                    </button>

                    <button
                      onClick={() => {
                        setPartialModalItem(item);
                        setPartialQty(String(Math.ceil(item.quantity / 2)));
                      }}
                      className="px-2 py-1.5 rounded-xl hover:bg-ivory text-secondary-text text-xs font-semibold transition-colors"
                    >
                      Partial
                    </button>

                    <button
                      onClick={() => setDiscardModalItem(item)}
                      className="px-2 py-1.5 rounded-xl hover:bg-red-50 text-secondary-text hover:text-error-red text-xs font-semibold transition-colors"
                    >
                      Discard
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditItem(item)}
                      title="Edit item details"
                      className="p-1.5 rounded-lg text-secondary-text hover:text-forest hover:bg-ivory transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {deleteConfirmId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDeleteItem(item.id);
                            setDeleteConfirmId(null);
                          }}
                          className="px-2 py-1 bg-error-red text-white text-[11px] font-bold rounded-lg hover:bg-red-700"
                        >
                          Confirm
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(null)}
                          className="px-1.5 py-1 text-secondary-text text-[11px]"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirmId(item.id)}
                        title="Delete item"
                        className="p-1.5 rounded-lg text-secondary-text hover:text-error-red hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Partial Modal */}
      {partialModalItem && (
        <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-card border border-subtle-border space-y-4">
            <h3 className="font-bold text-forest text-lg">
              Record Partial Usage
            </h3>
            <p className="text-xs text-secondary-text leading-relaxed">
              How much <strong>{partialModalItem.name}</strong> did you use? (Available: {partialModalItem.quantity} {partialModalItem.unit})
            </p>

            <form onSubmit={handlePartialSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-forest mb-1">
                  Quantity Used ({partialModalItem.unit})
                </label>
                <input
                  type="number"
                  step="any"
                  max={partialModalItem.quantity}
                  min="0.1"
                  required
                  value={partialQty}
                  onChange={(e) => setPartialQty(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-ivory text-sm focus:outline-none focus:ring-2 focus:ring-forest font-bold"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPartialModalItem(null)}
                  className="px-3.5 py-2 rounded-xl text-secondary-text text-xs font-semibold hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold shadow-card"
                >
                  Confirm Consumption
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Discard Modal */}
      {discardModalItem && (
        <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-card border border-subtle-border space-y-4">
            <div className="flex items-center gap-2 text-error-red">
              <AlertOctagon className="w-5 h-5" />
              <h3 className="font-bold text-forest text-lg">Record Discarded Food</h3>
            </div>
            <p className="text-xs text-secondary-text leading-relaxed">
              Discarding <strong>{discardModalItem.name}</strong> ({discardModalItem.quantity} {discardModalItem.unit}).
            </p>

            <form onSubmit={handleDiscardSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-forest mb-1">
                  Reason for Disposal
                </label>
                <select
                  value={discardReason}
                  onChange={(e) => setDiscardReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest text-forest font-medium"
                >
                  <option value="Spoiled / Molded">Spoiled / Molded</option>
                  <option value="Past recorded date & smell/taste bad">Past recorded date & smell/taste bad</option>
                  <option value="Forgotten in fridge">Forgotten in fridge</option>
                  <option value="Bought too much">Bought too much</option>
                  <option value="Storage failure / freezer burn">Storage failure / freezer burn</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setDiscardModalItem(null)}
                  className="px-3.5 py-2 rounded-xl text-secondary-text text-xs font-semibold hover:bg-ivory"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2.5 rounded-2xl bg-error-red hover:bg-red-700 text-white text-xs font-bold shadow-card"
                >
                  Record Discard
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
