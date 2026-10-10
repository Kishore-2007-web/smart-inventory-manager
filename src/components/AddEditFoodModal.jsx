import React, { useState, useEffect } from 'react';
import { X, Camera, Sparkles, Check, AlertCircle, Upload, Loader2 } from 'lucide-react';
import { getIsoDateString } from '../utils/dateUtils.js';
import { scanFoodLabel } from '../utils/ocrScanner.js';
import {
  playModalOpenSound,
  playModalCloseSound,
  playBarcodeScanSound,
  playFilterSelectSound
} from '../utils/soundEffects.js';

const COMMON_SUGGESTIONS = [
  'Fresh Spinach (Palak)',
  'Ripe Tomatoes',
  'Red Onions',
  'Toor Dal',
  'Toned Milk',
  'Farm Fresh Eggs',
  'Basmati Rice',
  'Cottage Cheese (Paneer)',
  'Green Chillies & Ginger',
  'Greek Yogurt / Curd',
  'Potatoes',
  'Coriander Leaves'
];

export default function AddEditFoodModal({
  isOpen,
  onClose,
  onSave,
  editItem = null,
  currencySymbol = '₹'
}) {
  const [activeTab, setActiveTab] = useState('manual');

  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pcs');
  const [category, setCategory] = useState('Produce');
  const [location, setLocation] = useState('refrigerator');
  const [dateType, setDateType] = useState('best-before');
  const [date, setDate] = useState(getIsoDateString(3));
  const [price, setPrice] = useState('');
  const [notes, setNotes] = useState('');

  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      playModalOpenSound();
    }
    if (editItem) {
      setName(editItem.name || '');
      setQuantity(String(editItem.quantity || '1'));
      setUnit(editItem.unit || 'pcs');
      setCategory(editItem.category || 'Produce');
      setLocation(editItem.location || 'refrigerator');
      setDateType(editItem.dateType || 'best-before');
      setDate(editItem.date || getIsoDateString(3));
      setPrice(editItem.price ? String(editItem.price) : '');
      setNotes(editItem.notes || '');
      setActiveTab('manual');
    } else {
      setName('');
      setQuantity('1');
      setUnit('pcs');
      setCategory('Produce');
      setLocation('refrigerator');
      setDateType('best-before');
      setDate(getIsoDateString(3));
      setPrice('');
      setNotes('');
      setScanResult(null);
      setScanError(null);
      setActiveTab('manual');
    }
  }, [editItem, isOpen]);

  const handleCloseModal = () => {
    playModalCloseSound();
    onClose();
  };

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const parsedQty = parseFloat(quantity) || 1;
    const parsedPrice = price ? parseFloat(price) : null;

    const itemData = {
      name: name.trim(),
      normalizedName: name.trim().toLowerCase(),
      quantity: parsedQty,
      unit,
      category,
      location,
      dateType,
      date: date || null,
      dateSource: scanResult ? 'OCR Label Scan (Confirmed by user)' : 'User entered',
      price: parsedPrice,
      notes: notes.trim(),
      status: editItem?.status || 'active',
      updatedAt: new Date().toISOString()
    };

    if (editItem) {
      onSave({ ...editItem, ...itemData });
    } else {
      onSave({
        id: `food_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        createdAt: new Date().toISOString(),
        ...itemData
      });
    }

    onClose();
  };

  const handleImageFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanError(null);
    setScanResult(null);

    try {
      const res = await scanFoodLabel(file);
      setIsScanning(false);
      setScanResult(res);
      playBarcodeScanSound();

      if (res.extractedName) {
        setName(res.extractedName);
      }
      if (res.extractedDate) {
        setDate(res.extractedDate);
      }
      if (res.extractedDateType) {
        setDateType(res.extractedDateType);
      }
    } catch (err) {
      setIsScanning(false);
      setScanError('Failed to read image. Please enter details manually.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-forest/40 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-card border border-subtle-border relative my-8">
        <button
          onClick={handleCloseModal}
          className="absolute right-4 top-4 p-2 rounded-xl text-secondary-text hover:text-forest hover:bg-ivory transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-extrabold text-forest">
          {editItem ? 'Edit Food Item' : 'Add Food Item'}
        </h2>
        <p className="text-secondary-text text-xs mt-0.5">
          {editItem ? 'Update inventory details and shelf dates' : 'Track groceries and rescue what matters'}
        </p>

        {/* Tab switcher */}
        {!editItem && (
          <div className="flex border-b border-subtle-border mt-4 mb-4">
            <button
              type="button"
              onClick={() => {
                playFilterSelectSound();
                setActiveTab('manual');
              }}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
                activeTab === 'manual'
                  ? 'border-forest text-forest'
                  : 'border-transparent text-secondary-text hover:text-forest'
              }`}
            >
              Manual Quick Entry
            </button>
            <button
              type="button"
              onClick={() => {
                playFilterSelectSound();
                setActiveTab('scan');
              }}
              className={`pb-2.5 px-3 text-xs font-bold border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === 'scan'
                  ? 'border-forest text-forest'
                  : 'border-transparent text-secondary-text hover:text-forest'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-apricot" />
              Scan Packaging Label (OCR)
            </button>
          </div>
        )}

        {/* OCR Scan Sub-view */}
        {activeTab === 'scan' && (
          <div className="mb-5 p-4 bg-ivory rounded-2xl border border-subtle-border space-y-3">
            <div className="flex items-start gap-2.5">
              <Camera className="w-5 h-5 text-forest shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-forest">Label Text Extraction</h4>
                <p className="text-[11px] text-secondary-text leading-relaxed">
                  Upload a photo of your product label or expiry stamp. OCR parses dates and item titles for your verification.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex-1 cursor-pointer flex items-center justify-center gap-2 py-3 px-4 rounded-xl border-2 border-dashed border-sage hover:border-forest bg-white text-secondary-text hover:text-forest text-xs font-semibold transition-all">
                <Upload className="w-4 h-4 text-primary-green" />
                <span>Upload Label Image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {isScanning && (
              <div className="flex items-center justify-center gap-2 py-3 text-xs text-forest">
                <Loader2 className="w-4 h-4 animate-spin text-primary-green" />
                <span>Scanning label with Tesseract OCR...</span>
              </div>
            )}

            {scanResult && (
              <div className="p-3 bg-white rounded-xl border border-sage text-xs space-y-1">
                <p className="font-bold text-primary-green flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Label scanned
                </p>
                <p className="text-secondary-text text-[11px]">
                  {scanResult.notes}
                </p>
              </div>
            )}

            {scanError && (
              <div className="p-2.5 bg-red-50 rounded-xl border border-red-200 text-xs text-error-red flex items-center gap-1.5">
                <AlertCircle className="w-3.5 h-3.5" />
                {scanError}
              </div>
            )}
          </div>
        )}

        {/* Food Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-forest mb-1">
              Food Name <span className="text-error-red">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Fresh Spinach, Tomatoes, Toor Dal"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-ivory text-sm focus:outline-none focus:ring-2 focus:ring-forest text-main-text"
            />

            {!editItem && !name && (
              <div className="flex flex-wrap gap-1 mt-2">
                {COMMON_SUGGESTIONS.slice(0, 5).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => {
                      playFilterSelectSound();
                      setName(item);
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-lg bg-ivory hover:bg-mint text-forest border border-subtle-border font-medium"
                  >
                    + {item}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-forest mb-1">
                Quantity <span className="text-error-red">*</span>
              </label>
              <input
                type="number"
                step="any"
                min="0.1"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-ivory text-sm focus:outline-none focus:ring-2 focus:ring-forest text-main-text font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-forest mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest text-forest font-medium"
              >
                <option value="pcs">pieces (pcs)</option>
                <option value="g">grams (g)</option>
                <option value="kg">kilograms (kg)</option>
                <option value="ml">millilitres (ml)</option>
                <option value="L">litres (L)</option>
                <option value="bunch">bunch / packet</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-forest mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest text-forest font-medium"
              >
                <option value="Produce">Produce (Vegetables / Fruit)</option>
                <option value="Dairy">Dairy & Eggs</option>
                <option value="Pantry">Pantry & Grains</option>
                <option value="Protein">Meat & Protein</option>
                <option value="Bakery">Bakery & Breads</option>
                <option value="Other">Other Groceries</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest mb-1">
                Storage Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest text-forest font-medium"
              >
                <option value="refrigerator">Refrigerator</option>
                <option value="freezer">Freezer</option>
                <option value="pantry">Pantry / Shelf</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-forest mb-1">
                Date Type
              </label>
              <select
                value={dateType}
                onChange={(e) => setDateType(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl border border-subtle-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-forest text-forest font-medium"
              >
                <option value="use-by">Use-by (Firm deadline)</option>
                <option value="best-before">Best-before (Quality date)</option>
                <option value="expiry">Expiry Date</option>
                <option value="opened-date">Opened Date</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-forest mb-1">
                Recorded Date <span className="text-error-red">*</span>
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-2xl border border-subtle-border bg-ivory text-sm focus:outline-none focus:ring-2 focus:ring-forest text-main-text font-bold"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-subtle-border grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-secondary-text mb-1">
                Purchase Price ({currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                min="0"
                placeholder="e.g. 40"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-subtle-border bg-ivory text-xs focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-secondary-text mb-1">
                Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Fresh crisp leaves"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl border border-subtle-border bg-ivory text-xs focus:outline-none focus:ring-2 focus:ring-forest"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2.5 rounded-xl text-secondary-text text-xs font-semibold hover:bg-ivory transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-2xl bg-forest hover:bg-forest-light text-white text-xs font-bold transition-all shadow-card"
            >
              {editItem ? 'Update Food' : 'Save to Fridge'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
