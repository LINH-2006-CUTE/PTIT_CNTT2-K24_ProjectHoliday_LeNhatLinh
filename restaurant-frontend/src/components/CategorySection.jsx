import React from 'react';

export default function CategorySection({ categories, selectedCategory, setSelectedCategory }) {
  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-8 bg-[#FAF7F2]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-bold text-[#4A2810] uppercase tracking-widest font-sans">
            Khám phá Danh mục Thực đơn
          </h3>
          {selectedCategory && (
            <button
              onClick={() => setSelectedCategory(null)}
              className="text-xs font-semibold text-[#8C3A27] hover:underline"
            >
              Xem tất cả danh mục
            </button>
          )}
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer ${
              selectedCategory === null
                ? 'bg-[#8C3A27] text-white shadow-md'
                : 'bg-white text-[#4A2810] border border-[#4A2810]/10 hover:border-[#8C3A27]'
            }`}
          >
            Tất cả món ăn
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.id;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                className={`px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#8C3A27] text-white shadow-md'
                    : 'bg-white text-[#4A2810] border border-[#4A2810]/10 hover:border-[#8C3A27]'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

      </div>
    </section>
  );
}
