import React from 'react';

export const ProductCardSkeleton = () => (
  <div className="flex h-full">
    <div className="flex flex-col justify-between w-full bg-[#1a1a1a] border border-white/10 rounded-xl overflow-hidden shadow-lg animate-pulse">
      {/* Image Area */}
      <div className="aspect-square w-full bg-white/5" />
      
      {/* Content Area */}
      <div className="p-4 flex flex-col flex-grow">
        {/* Title Lines */}
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-white/5 rounded w-full" />
          <div className="h-4 bg-white/5 rounded w-2/3" />
        </div>
        
        {/* Rating Line */}
        <div className="h-3 bg-white/5 rounded w-1/4 mb-3" />
        
        {/* Price Line */}
        <div className="h-6 bg-white/5 rounded w-1/3 mb-4" />
        
        {/* Button */}
        <div className="h-10 bg-white/5 rounded-lg w-full mt-auto" />
      </div>
    </div>
  </div>
);

export const ProductDetailsSkeleton = () => (
  <div className="max-w-6xl mx-auto py-8 md:py-12 animate-pulse px-4">
    <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
      {/* Sidebar Thumbnails */}
      <div className="hidden md:flex md:col-span-1 flex-col gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-white/5 rounded-lg w-full" />
        ))}
      </div>

      {/* Main Image */}
      <div className="md:col-span-5 aspect-square bg-white/5 rounded-2xl w-full" />

      {/* Info Sidebar */}
      <div className="md:col-span-6 flex flex-col gap-6">
        <div className="space-y-4 border-b border-white/10 pb-6">
          <div className="h-10 bg-white/5 rounded w-3/4" />
          <div className="h-8 bg-white/5 rounded w-1/4" />
        </div>

        {/* Color/Size Swatches */}
        <div className="space-y-4">
          <div className="h-4 bg-white/5 rounded w-24" />
          <div className="flex gap-3">
            {[1, 2, 3].map(i => <div key={i} className="w-10 h-10 rounded-full bg-white/5" />)}
          </div>
        </div>

        <div className="space-y-4">
          <div className="h-4 bg-white/5 rounded w-16" />
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => <div key={i} className="w-12 h-10 rounded-lg bg-white/5" />)}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-4">
          <div className="h-14 bg-white/5 rounded-xl flex-grow" />
          <div className="h-14 bg-white/5 rounded-xl flex-grow" />
        </div>

        {/* Warranty Box */}
        <div className="h-20 bg-white/5 rounded-xl w-full mt-4" />
      </div>
    </div>
  </div>
);
