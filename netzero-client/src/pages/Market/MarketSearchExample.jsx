// Example usage of the server-side search system
import React from 'react';
import useMarket from './useMarket';
import MarketHandler from './MarketHandler';
import { useNavigate } from 'react-router-dom';

const MarketSearchExample = () => {
  const navigate = useNavigate();
  const { 
    stateMarket, 
    setMarket, 
    toggleMarketField, 
    loadMore, 
    performSearch,
    isLoading, 
    isLoadingMore, 
    hasMore, 
    isSearching 
  } = useMarket();
  
  const handlers = MarketHandler(stateMarket, setMarket, navigate, performSearch);

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      handlers.handleSearchSubmit();
    }
  };

  return (
    <div className="market-page">
      {/* Search Section */}
      <div className="search-section" style={{ marginBottom: '20px', padding: '20px', border: '1px solid #ddd' }}>
        <h3>🔍 Server-Side Search</h3>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Search products... (Press Enter or click Search)"
            value={stateMarket.searchInputValue}
            onChange={(e) => handlers.handleSearchInputChange(e.target.value)}
            onKeyPress={handleSearchKeyPress}
            style={{ 
              padding: '10px', 
              border: '1px solid #ccc', 
              borderRadius: '4px',
              flex: 1,
              fontSize: '16px'
            }}
          />
          <button 
            onClick={handlers.handleSearchSubmit}
            disabled={isSearching}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isSearching ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
          {stateMarket.isSearchMode && (
            <button 
              onClick={handlers.handleClearSearch}
              style={{
                padding: '10px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Clear
            </button>
          )}
        </div>
        
        {/* Search Status */}
        {stateMarket.isSearchMode && (
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
            🔍 Search results for: "<strong>{stateMarket.searchQuery}</strong>" 
            ({stateMarket.searchResults.length} results found)
          </div>
        )}
        
        {isSearching && (
          <div style={{ marginTop: '10px', fontSize: '14px', color: '#007bff' }}>
            🔄 Searching products...
          </div>
        )}
      </div>

      {/* Filter Controls */}
      <div className="filters" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa' }}>
        <h4>Filters</h4>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <select 
            value={stateMarket.selectedCategory} 
            onChange={(e) => handlers.handleCategoryChange(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value="all">All Categories</option>
            {stateMarket.categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <select 
            value={stateMarket.selectedRegion} 
            onChange={(e) => handlers.handleRegionChange(e.target.value)}
            style={{ padding: '8px', borderRadius: '4px' }}
          >
            <option value="all">All Regions</option>
            {stateMarket.regions.map(region => (
              <option key={region} value={region}>{region}</option>
            ))}
          </select>

          <button 
            onClick={handlers.handleRefresh}
            style={{
              padding: '8px 15px',
              backgroundColor: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <div>📦 Loading products...</div>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid" style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
        gap: '20px',
        marginBottom: '20px'
      }}>
        {stateMarket.filteredProducts.map(product => (
          <div key={product.id} className="product-card" style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '15px',
            backgroundColor: 'white',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{product.title}</h3>
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0' }}>{product.description}</p>
            <p style={{ color: '#007bff', fontWeight: 'bold', margin: '5px 0' }}>
              Price: {typeof product.price === 'number' ? product.price.toLocaleString() : product.price} บาท
            </p>
            <p style={{ color: '#666', fontSize: '12px', margin: '5px 0' }}>Category: {product.category}</p>
            <p style={{ color: '#666', fontSize: '12px', margin: '5px 0' }}>Region: {product.address || 'Unknown'}</p>
            
            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
              <button 
                onClick={() => handlers.handleProductClick(product)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                View Details
              </button>
              <button 
                onClick={() => handlers.handleReserveClick(product)}
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#28a745',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Reserve
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* No Results Message */}
      {!isLoading && stateMarket.filteredProducts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          {stateMarket.isSearchMode ? (
            <div>
              <p>🔍 No products found for "{stateMarket.searchQuery}"</p>
              <p>Try different keywords or clear the search to see all products.</p>
            </div>
          ) : (
            <p>📦 No products available</p>
          )}
        </div>
      )}

      {/* Load More Button (only in non-search mode) */}
      {!stateMarket.isSearchMode && hasMore && stateMarket.filteredProducts.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button 
            onClick={() => handlers.handleLoadMore(loadMore)}
            disabled={isLoadingMore}
            style={{
              padding: '12px 30px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoadingMore ? 'not-allowed' : 'pointer',
              fontSize: '16px'
            }}
          >
            {isLoadingMore ? '📦 Loading More...' : '📄 Load More Products'}
          </button>
        </div>
      )}

      {/* Search Mode Info */}
      {stateMarket.isSearchMode && (
        <div style={{ 
          textAlign: 'center', 
          marginTop: '20px', 
          padding: '15px',
          backgroundColor: '#e9ecef',
          borderRadius: '4px',
          color: '#495057'
        }}>
          <p>ℹ️ You are viewing search results. Load More is not available in search mode.</p>
          <p>Use filters or clear the search to browse all products with pagination.</p>
        </div>
      )}
    </div>
  );
};

export default MarketSearchExample;