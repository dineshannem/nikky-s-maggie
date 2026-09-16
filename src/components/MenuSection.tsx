import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Category, MenuItem, AddonOption } from '../types';
import { AVAILABLE_ADDONS } from '../data/initialMenu';
import { 
  Search, 
  Plus, 
  Minus, 
  ShoppingBag, 
  X, 
  Tag, 
  Sparkles,
  ArrowRight, 
  Check, 
  Flame, 
  Clock, 
  SlidersHorizontal,
  QrCode,
  Smartphone,
  Info
} from 'lucide-react';
import { CATEGORY_FALLBACK_IMAGES } from '../utils/upi';

export const MenuSection: React.FC = () => {
  const { 
    menuItems, 
    getItemName, 
    t, 
    cart, 
    addToCart, 
    updateCartQuantity, 
    removeFromCart, 
    cartTotal, 
    cartCount,
    setCheckoutOpen,
    currentTable,
    setTableQrOpen,
    setUpiGuideOpen,
    setSelectedItemForBooking
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'popular' | 'price_asc' | 'price_desc'>('popular');

  // Customization modal state
  const [customizingItem, setCustomizingItem] = useState<MenuItem | null>(null);
  const [customSpice, setCustomSpice] = useState<'mild' | 'medium' | 'spicy'>('medium');
  const [customAddons, setCustomAddons] = useState<AddonOption[]>([]);

  const categories: { id: Category; labelKey: string; icon: string; name: string }[] = [
    { id: 'all', labelKey: 'all', icon: '🍽️', name: 'All Dishes' },
    { id: 'maggie', labelKey: 'maggie', icon: '🍜', name: 'Maggie' },
    { id: 'tea_coffee', labelKey: 'tea_coffee', icon: '☕', name: 'Tea & Coffee' },
    { id: 'dosa', labelKey: 'dosa', icon: '🥞', name: 'Dosas' },
    { id: 'pizza', labelKey: 'pizza', icon: '🍕', name: 'Pizzas' },
    { id: 'rice_varieties', labelKey: 'rice_varieties', icon: '🍚', name: 'Rice' },
    { id: 'snacks', labelKey: 'snacks', icon: '🍟', name: 'Snacks' },
    { id: 'chapati', labelKey: 'chapati', icon: '🫓', name: 'Chapati' },
    { id: 'non_veg', labelKey: 'non_veg', icon: '🍗', name: 'Non-Veg' },
    { id: 'specials', labelKey: 'specials', icon: '⭐', name: 'Specials' }
  ];

  // Filter & sort dishes
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (vegOnly && !item.isVeg) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query) ||
                            (item.nameHi && item.nameHi.toLowerCase().includes(query)) ||
                            (item.nameTe && item.nameTe.toLowerCase().includes(query)) ||
                            (item.nameEs && item.nameEs.toLowerCase().includes(query));
        const matchesDesc = item.description.toLowerCase().includes(query);
        const matchesCat = item.category.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      return b.rating - a.rating;
    });
  }, [menuItems, selectedCategory, vegOnly, searchQuery, sortBy]);

  const openCustomizer = (item: MenuItem) => {
    setCustomizingItem(item);
    setCustomSpice(item.spiceLevel || 'medium');
    setCustomAddons([]);
  };

  const handleToggleAddon = (addon: AddonOption) => {
    if (customAddons.some(a => a.id === addon.id)) {
      setCustomAddons(customAddons.filter(a => a.id !== addon.id));
    } else {
      setCustomAddons([...customAddons, addon]);
    }
  };

  const handleAddCustomizedToCart = () => {
    if (!customizingItem) return;
    addToCart(customizingItem, 1, customSpice, customAddons);
    setCustomizingItem(null);
  };

  const handleOrderNow = (event: React.MouseEvent, item: MenuItem) => {
    event.preventDefault();
    event.stopPropagation();
    if (item.stock <= 0) return;
    setSelectedItemForBooking(item);
  };

  const handleAddItemToTray = (event: React.MouseEvent, item: MenuItem) => {
    event.preventDefault();
    event.stopPropagation();
    if (item.stock <= 0) return;
    addToCart(item, 1, item.spiceLevel || 'medium');
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-28">
      
      {/* SCAN & ORDER HERO BANNER (Zero Waiting in Queue) */}
      <div className="bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent dark:from-amber-500/10 dark:via-neutral-900/40 dark:to-transparent rounded-3xl p-4 sm:p-6 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider bg-amber-500 text-neutral-950 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Scan & Order • Zero Queue</span>
            </span>

            <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-neutral-200 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200">
              Coupon: <strong>NIKKY10</strong> (10% OFF)
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
            Order Piping Hot Food Directly From Your Mobile
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
            No waiting in line at the counter. Scan QR or choose your favorites, pay instantly via UPI, and pick up hot food when your token is called.
          </p>
        </div>

        {/* Quick Kiosk Actions */}
        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto shrink-0">
          <button
            onClick={() => setTableQrOpen(true)}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs font-black flex items-center justify-center gap-1.5 shadow-xs transition-all active:scale-95"
          >
            <QrCode className="w-4 h-4" />
            <span>Scan & Order QR</span>
          </button>
        </div>
      </div>

      {/* CATEGORIES BAR: Zero-Scroll Grid (All 10 categories 100% visible on any screen) */}
      <div className="bg-white dark:bg-neutral-900 p-2 sm:p-3 rounded-2xl border border-neutral-200 dark:border-neutral-800 space-y-1.5 sm:space-y-2 shadow-2xs">
        <div className="flex items-center justify-between px-1 text-xs">
          <span className="font-bold text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-amber-500" />
            <span>Categories (Zero-Scroll View)</span>
          </span>
          <span className="text-neutral-500 text-[11px]">
            {filteredItems.length} {filteredItems.length === 1 ? 'item' : 'items'} available
          </span>
        </div>

        {/* Zero-Scroll Responsive Category Grid (Visible on all devices without any horizontal scrolling) */}
        <div className="grid grid-cols-5 sm:grid-cols-5 lg:grid-cols-10 gap-1 sm:gap-1.5">
          {categories.map(cat => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl text-center transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-neutral-950 shadow-xs font-black ring-1 ring-amber-600/50 scale-[1.02]'
                    : 'bg-neutral-100 dark:bg-neutral-800/90 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 font-semibold'
                }`}
                title={cat.name}
              >
                <span className="text-base sm:text-lg leading-none mb-1">{cat.icon}</span>
                <span className="text-[10px] sm:text-[11px] leading-tight truncate w-full text-center px-0.5">
                  {cat.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEARCH AND FILTERS */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search Maggie, filter coffee, crisp dosa, pizza..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder-neutral-400 text-xs focus:outline-hidden focus:border-amber-500 shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setVegOnly(!vegOnly)}
            className={`px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs ${
              vegOnly
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                : 'bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Veg Only</span>
          </button>

          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-3 py-2.5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold focus:outline-hidden shadow-2xs"
          >
            <option value="popular">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* DISHES GRID */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-neutral-900/40 rounded-3xl border border-neutral-200 dark:border-neutral-800 space-y-3">
          <span className="text-4xl">🔍</span>
          <h3 className="text-base font-bold text-neutral-800 dark:text-neutral-200">No dishes match your search</h3>
          <p className="text-xs text-neutral-500">Try changing your search term or category filter.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
              setVegOnly(false);
            }}
            className="px-4 py-2 rounded-xl bg-amber-500 text-neutral-950 text-xs font-bold hover:bg-amber-400"
          >
            Show All Dishes
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredItems.map(item => {
            const isOut = item.stock <= 0;
            const isLow = item.stock > 0 && item.stock <= 5;

            // Check if item is already in tray
            const cartItemsForItem = cart.filter(ci => ci.menuItemId === item.id);
            const totalQtyInCart = cartItemsForItem.reduce((sum, ci) => sum + ci.quantity, 0);
            const primaryCartItem = cartItemsForItem[0];

            return (
              <div
                key={item.id}
                id={`dish-card-${item.id}`}
                className="group rounded-3xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 hover:border-amber-500/50 transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md text-neutral-900 dark:text-neutral-100"
              >
                {/* Photo & Badges */}
                <div className="relative h-40 w-full overflow-hidden bg-neutral-100 dark:bg-neutral-950">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    onError={(e) => {
                      e.currentTarget.src = CATEGORY_FALLBACK_IMAGES[item.category] || CATEGORY_FALLBACK_IMAGES.default;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    referrerPolicy="no-referrer"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />

                  {/* Veg / Non-Veg Indicator */}
                  <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
                    <div className={`p-1 rounded-md bg-white/90 dark:bg-black/70 backdrop-blur-xs border ${
                      item.isVeg ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'
                    }`}>
                      <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    </div>
                  </div>

                  {/* Stock Badges */}
                  <div className="absolute top-2.5 right-2.5">
                    {isOut ? (
                      <span className="px-2 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-extrabold uppercase">
                        Sold Out
                      </span>
                    ) : isLow ? (
                      <span className="px-2 py-0.5 rounded-md bg-amber-500 text-neutral-950 text-[10px] font-black animate-pulse">
                        Only {item.stock} left!
                      </span>
                    ) : null}
                  </div>

                  {/* Price & Prep Time Tag */}
                  <div className="absolute bottom-2 left-2.5 right-2.5 flex items-center justify-between text-white">
                    <span className="px-2.5 py-0.5 rounded-lg bg-black/70 backdrop-blur-xs font-mono font-black text-amber-400 text-base border border-neutral-700">
                      ₹{item.price}
                    </span>
                    <span className="text-[10px] font-semibold text-neutral-200 bg-black/70 px-2 py-0.5 rounded-md flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{item.preparationTime}</span>
                    </span>
                  </div>
                </div>

                {/* Dish Information */}
                <div className="p-3.5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-bold text-sm sm:text-base text-neutral-900 dark:text-neutral-100 line-clamp-1">
                      {getItemName(item)}
                    </h3>
                    <p className="text-[11px] text-neutral-500 dark:text-neutral-400 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {/* Action Buttons: Instant Order vs Tray */}
                  <div className="space-y-1.5 pt-1">
                    {isOut ? (
                      <button
                        disabled
                        className="w-full py-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-400 text-xs font-bold cursor-not-allowed"
                      >
                        Sold Out Today
                      </button>
                    ) : (
                      <div className="grid grid-cols-2 gap-1.5">
                        {/* Instant Direct Order Modal */}
                        <button
                          type="button"
                          onClick={event => handleOrderNow(event, item)}
                          className="py-2 px-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-black text-[11px] flex items-center justify-center gap-1 shadow-xs transition-all active:scale-95"
                          title="Instant single-item booking & direct UPI payment"
                        >
                          <Flame className="w-3.5 h-3.5 text-neutral-950" />
                          <span>Order Now</span>
                        </button>

                        {/* Add to Tray or Counter */}
                        {totalQtyInCart === 0 ? (
                          <button
                            type="button"
                            onClick={event => handleAddItemToTray(event, item)}
                            className="py-2 px-2.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-neutral-800 dark:text-neutral-200 font-bold text-[11px] flex items-center justify-center gap-1 border border-neutral-300 dark:border-neutral-700 transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Add Tray</span>
                          </button>
                        ) : (
                          <div className="flex items-center justify-between bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 border border-neutral-300 dark:border-neutral-700">
                            <button
                              type="button"
                              onClick={() => {
                                if (primaryCartItem) {
                                  updateCartQuantity(primaryCartItem.id, primaryCartItem.quantity - 1);
                                }
                              }}
                              className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-black text-amber-600 dark:text-amber-400">
                              {totalQtyInCart} in tray
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (primaryCartItem) {
                                  updateCartQuantity(primaryCartItem.id, primaryCartItem.quantity + 1);
                                }
                              }}
                              className="p-1 hover:bg-white dark:hover:bg-neutral-700 rounded-lg text-neutral-700 dark:text-neutral-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MOBILE STICKY FLOATING TRAY BAR (Does not overlap content, properly padded) */}
      {cartCount > 0 && (
        <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 animate-in slide-in-from-bottom-5 duration-200">
          <div className="bg-neutral-900/95 dark:bg-neutral-900/95 text-white backdrop-blur-md rounded-2xl p-3 sm:p-3.5 shadow-2xl border border-amber-500/40 flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="font-bold text-xs">
                  {cartCount} {cartCount === 1 ? 'Dish' : 'Dishes'} in Tray
                </span>
              </div>
              <p className="text-sm font-black text-amber-400">
                ₹{cartTotal} <span className="text-[10px] text-neutral-400 font-normal">(+GST)</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => setCheckoutOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-neutral-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all shrink-0"
            >
              <span>Instant Pay & Order</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
