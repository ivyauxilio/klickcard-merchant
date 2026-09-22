// components/products/ProductFilters.jsx
"use client";

import {
  MagnifyingGlassIcon,
  FunnelIcon,
  ViewGridIcon,
  ViewListIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function ProductFilters({
  search,
  setSearch,
  category,
  setCategory,
  categories,
  statusFilter,
  setStatusFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  viewMode,
  setViewMode,
  onFilter,
  onClear,
}) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search products by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onFilter()}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          {search && (
            <button
              onClick={() => {
                setSearch("");
                onFilter();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <XMarkIcon className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Filter */}
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            onFilter();
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            onFilter();
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={onFilter}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <FunnelIcon className="w-5 h-5" />
            Apply Filters
          </button>
          <button
            onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            title={
              viewMode === "grid"
                ? "Switch to List View"
                : "Switch to Grid View"
            }
          >
            {/* {viewMode === "grid" ? (
              <ViewListIcon className="w-5 h-5 text-gray-600" />
            ) : (
              <ViewGridIcon className="w-5 h-5 text-gray-600" />
            )} */}
          </button>
        </div>
      </div>

      {/* Sort Options */}
      <div className="flex flex-wrap items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              onFilter();
            }}
            className="px-2 py-1 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm bg-white"
          >
            <option value="created_at">Date Created</option>
            <option value="name">Name</option>
            <option value="price">Price</option>
            <option value="stock_quantity">Stock</option>
            <option value="updated_at">Last Updated</option>
          </select>
          <button
            onClick={() => {
              setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              onFilter();
            }}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {sortOrder === "asc" ? "↑" : "↓"}
          </button>
        </div>
        <span className="text-gray-300">|</span>
        <button
          onClick={() => {
            if (onClear) {
              onClear();
            } else {
              setSearch("");
              setCategory("");
              setStatusFilter("all");
              setSortBy("created_at");
              setSortOrder("desc");
              onFilter();
            }
          }}
          className="text-purple-600 hover:text-purple-700 font-medium"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
