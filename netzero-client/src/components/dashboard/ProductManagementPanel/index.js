/**
 * ProductManagementPanel Module
 * 
 * A pure presentation component for managing seller products.
 * All state and business logic is managed by the parent component.
 * 
 * Usage:
 * import { ProductManagementPanel } from './components/dashboard/ProductManagementPanel';
 * 
 * <ProductManagementPanel
 *   products={products}
 *   isLoading={loading}
 *   selectedProduct={selectedProduct}
 *   showDeleteConfirm={showDeleteConfirm}
 *   onCreateProduct={handleCreate}
 *   onEditProduct={handleEdit}
 *   onDeleteProduct={handleDelete}
 *   onConfirmDelete={handleConfirmDelete}
 *   onCancelDelete={handleCancelDelete}
 *   onRefresh={handleRefresh}
 *   onAddToEvent={handleAddToEvent}
 * />
 */

export { default as ProductManagementPanel } from './ProductManagementPanel';
