import React from "react";
import styles from "./AddProductToEventDialog.module.scss";
import useAddProductToEventDialog from "./useAddProductToEventDialog";
import AddProductToEventDialogHandler from "./AddProductToEventDialogHandler";
import { GoogleIcon } from "../../common";

export default function AddProductToEventDialog({
  isOpen = false,
  product = null,
  onClose,
  onSuccess,
  className = ""
}) {
  const {
    stateAddProductToEventDialog,
    setSelectedEvent,
    setSelectedEventPrice,
    setSelectedEventQuantity,
    setEditingEventProduct,
    cancelEditEventProduct,
    setEditEventPrice,
    setEditStockQuantity,
    addEventAssignment,
    removeEventAssignment,
    setError,
    clearError,
    loadExistingEventProducts
  } = useAddProductToEventDialog(product, isOpen);

  const hookFunctions = {
    setSelectedEvent,
    setSelectedEventPrice,
    setSelectedEventQuantity,
    setEditingEventProduct,
    cancelEditEventProduct,
    setEditEventPrice,
    setEditStockQuantity,
    addEventAssignment,
    removeEventAssignment,
    setError,
    clearError,
    loadExistingEventProducts
  };

  const handlers = AddProductToEventDialogHandler(
    stateAddProductToEventDialog,
    hookFunctions,
    product,
    onSuccess,
    onClose
  );

  if (!isOpen) return null;

  return (
    <div className={styles.ModalOverlay}>
      <div className={`${styles.Container} ${className}`}>
        <div className={styles.Header}>
          <h2 className={styles.Title}>
            <GoogleIcon iconType="event_available" size="medium" />
            เพิ่มสินค้าในอีเวนต์
          </h2>
          <button 
            className={styles.CloseButton}
            onClick={handlers.handleCancel}
          >
            <GoogleIcon iconType="close" size="small" />
          </button>
        </div>

        <div className={styles.ProductInfo}>
          <h3 className={styles.ProductTitle}>{product?.title}</h3>
          <div className={styles.ProductDetails}>
            <span className={styles.DetailItem}>
              <GoogleIcon iconType="inventory" size="small" />
              จำนวนทั้งหมด: {product?.stock_quantity || 0}
            </span>
            <span className={styles.DetailItem}>
              <GoogleIcon iconType="check_circle" size="small" />
              ที่ยังไม่ได้กำหนด: {stateAddProductToEventDialog.maxQuantity}
            </span>
            <span className={styles.DetailItem}>
              <GoogleIcon iconType="event" size="small" />
              เหลือที่จะเพิ่มได้: {stateAddProductToEventDialog.remainingQuantity}
            </span>
          </div>
        </div>

        <form className={styles.Form} onSubmit={handlers.handleSubmit}>
          {/* Existing Event Products Section */}
          {stateAddProductToEventDialog.existingEventProducts.length > 0 && (
            <div className={styles.ExistingSection}>
              <h3 className={styles.SectionTitle}>
                <GoogleIcon iconType="event_available" size="small" />
                อีเวนต์ที่เพิ่มสินค้าแล้ว ({stateAddProductToEventDialog.existingEventProducts.length})
              </h3>
              
              <div className={styles.ExistingList}>
                {stateAddProductToEventDialog.existingEventProducts.map((eventProduct) => {
                  const isEditing = stateAddProductToEventDialog.editingEventProductId === eventProduct.event_product_id;
                  
                  return (
                    <div key={eventProduct.event_product_id} className={styles.ExistingCard}>
                      <div className={styles.ExistingInfo}>
                        <div className={styles.ExistingHeader}>
                          <div className={styles.ExistingTitle}>
                            <GoogleIcon iconType="event" size="small" />
                            {eventProduct.event_title}
                          </div>
                          <span className={`${styles.StatusBadge} ${styles[eventProduct.event_product_status]}`}>
                            {eventProduct.event_product_status === 'confirmed' ? 'ยืนยันแล้ว' : 'รอยืนยัน'}
                          </span>
                        </div>
                        
                        <div className={styles.ExistingDetails}>
                          <div className={styles.DetailRow}>
                            <span className={styles.DetailLabel}>
                              <GoogleIcon iconType="location_on" size="small" />
                              {eventProduct.location}
                            </span>
                            <span className={styles.DetailLabel}>
                              <GoogleIcon iconType="calendar_today" size="small" />
                              {new Date(eventProduct.event_date).toLocaleDateString('th-TH')}
                            </span>
                          </div>
                          
                          {/* Event Price */}
                          <div className={styles.EditableField}>
                            <span className={styles.FieldLabel}>ราคาในอีเวนต์:</span>
                            {isEditing ? (
                              <div className={styles.EditInput}>
                                <input
                                  type="number"
                                  className={styles.Input}
                                  value={stateAddProductToEventDialog.editEventPrice}
                                  onChange={(e) => handlers.handleEditEventPriceChange(e.target.value)}
                                  step="0.01"
                                  min="0"
                                />
                                <span className={styles.Unit}>บาท</span>
                                <button
                                  type="button"
                                  className={styles.SaveButton}
                                  onClick={() => handlers.handleSaveEventProductPrice(eventProduct.event_product_id)}
                                >
                                  <GoogleIcon iconType="check" size="small" />
                                </button>
                                <button
                                  type="button"
                                  className={styles.CancelEditButton}
                                  onClick={handlers.handleCancelEditEventProduct}
                                >
                                  <GoogleIcon iconType="close" size="small" />
                                </button>
                              </div>
                            ) : (
                              <div className={styles.FieldValue}>
                                <span className={styles.Value}>{eventProduct.event_price} บาท</span>
                                <button
                                  type="button"
                                  className={styles.EditButton}
                                  onClick={() => handlers.handleStartEditEventProduct(eventProduct)}
                                  title="แก้ไขราคา"
                                >
                                  <GoogleIcon iconType="edit" size="small" />
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {/* Stock Quantity */}
                          <div className={styles.EditableField}>
                            <span className={styles.FieldLabel}>จำนวน:</span>
                            {isEditing ? (
                              <div className={styles.EditInput}>
                                <input
                                  type="number"
                                  className={styles.Input}
                                  value={stateAddProductToEventDialog.editStockQuantity}
                                  onChange={(e) => handlers.handleEditStockQuantityChange(e.target.value)}
                                  min="0"
                                />
                                <span className={styles.Unit}>ชิ้น</span>
                                <button
                                  type="button"
                                  className={styles.SaveButton}
                                  onClick={() => handlers.handleSaveEventProductStock(eventProduct.event_product_id)}
                                >
                                  <GoogleIcon iconType="check" size="small" />
                                </button>
                                <button
                                  type="button"
                                  className={styles.CancelEditButton}
                                  onClick={handlers.handleCancelEditEventProduct}
                                >
                                  <GoogleIcon iconType="close" size="small" />
                                </button>
                              </div>
                            ) : (
                              <div className={styles.FieldValue}>
                                <span className={styles.Value}>{eventProduct.stock_quantity} ชิ้น</span>
                                <button
                                  type="button"
                                  className={styles.EditButton}
                                  onClick={() => handlers.handleStartEditEventProduct(eventProduct)}
                                  title="แก้ไขจำนวน"
                                >
                                  <GoogleIcon iconType="edit" size="small" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Add Event Section */}
          <div className={styles.AddEventSection}>
            <h3 className={styles.SectionTitle}>เพิ่มอีเวนต์</h3>
            
            {stateAddProductToEventDialog.isLoadingEvents ? (
              <div className={styles.LoadingContainer}>
                <div className={styles.LoadingSpinner} />
                <p>กำลังโหลดอีเวนต์...</p>
              </div>
            ) : stateAddProductToEventDialog.eventsError ? (
              <div className={styles.ErrorMessage}>
                <GoogleIcon iconType="error" size="small" />
                {stateAddProductToEventDialog.eventsError}
              </div>
            ) : stateAddProductToEventDialog.availableEvents.length === 0 ? (
              <div className={styles.EmptyState}>
                <GoogleIcon iconType="event_busy" size="large" />
                <p>ไม่พบอีเวนต์ที่สามารถเพิ่มสินค้าได้</p>
                <small>สร้างอีเวนต์ใหม่หรือตรวจสอบสถานะอีเวนต์</small>
              </div>
            ) : (
              <div className={styles.AddEventForm}>
                <div className={styles.FormRow}>
                  <div className={styles.FormGroup}>
                    <label className={styles.Label}>
                      เลือกอีเวนต์ <span className={styles.Required}>*</span>
                    </label>
                    <select
                      className={styles.Select}
                      value={stateAddProductToEventDialog.selectedEventId}
                      onChange={(e) => handlers.handleEventChange(e.target.value)}
                    >
                      <option value="">-- เลือกอีเวนต์ --</option>
                      {stateAddProductToEventDialog.availableEvents
                        .filter(event => 
                          !stateAddProductToEventDialog.eventAssignments.some(
                            a => a.event_id === event.id
                          )
                        )
                        .map(event => (
                          <option key={event.id} value={event.id}>
                            {event.title} ({new Date(event.event_date).toLocaleDateString('th-TH')})
                          </option>
                        ))}
                    </select>
                  </div>

                  <div className={styles.FormGroup}>
                    <label className={styles.Label}>
                      ราคาในอีเวนต์ <span className={styles.Required}>*</span>
                    </label>
                    <div className={styles.PriceInputContainer}>
                      <input
                        type="number"
                        className={styles.Input}
                        value={stateAddProductToEventDialog.selectedEventPrice}
                        onChange={(e) => handlers.handlePriceChange(e.target.value)}
                        placeholder="0.00"
                        min="0"
                        step="0.01"
                      />
                      <span className={styles.PriceUnit}>บาท</span>
                    </div>
                    {product?.price && (
                      <small className={styles.HelperText}>
                        ราคาปกติ: {product.price} บาท
                      </small>
                    )}
                  </div>

                  <div className={styles.FormGroup}>
                    <label className={styles.Label}>
                      จำนวน <span className={styles.Required}>*</span>
                    </label>
                    <input
                      type="number"
                      className={styles.Input}
                      value={stateAddProductToEventDialog.selectedEventQuantity}
                      onChange={(e) => handlers.handleQuantityChange(e.target.value)}
                      placeholder="0"
                      min="1"
                      max={stateAddProductToEventDialog.remainingQuantity}
                    />
                    <small className={styles.HelperText}>
                      สูงสุด: {stateAddProductToEventDialog.remainingQuantity}
                    </small>
                  </div>

                  <button
                    type="button"
                    className={styles.AddButton}
                    onClick={handlers.handleAddAssignment}
                    disabled={
                      !stateAddProductToEventDialog.selectedEventId ||
                      !stateAddProductToEventDialog.selectedEventPrice ||
                      !stateAddProductToEventDialog.selectedEventQuantity ||
                      stateAddProductToEventDialog.remainingQuantity <= 0
                    }
                  >
                    <GoogleIcon iconType="add" size="small" />
                    เพิ่ม
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Event Assignments List */}
          {stateAddProductToEventDialog.eventAssignments.length > 0 && (
            <div className={styles.AssignmentsSection}>
              <h3 className={styles.SectionTitle}>
                อีเวนต์ที่เลือก ({stateAddProductToEventDialog.eventAssignments.length})
              </h3>
              
              <div className={styles.AssignmentsList}>
                {stateAddProductToEventDialog.eventAssignments.map((assignment) => (
                  <div key={assignment.event_id} className={styles.AssignmentCard}>
                    <div className={styles.AssignmentInfo}>
                      <div className={styles.AssignmentTitle}>
                        <GoogleIcon iconType="event" size="small" />
                        {assignment.event_title}
                      </div>
                      <div className={styles.AssignmentDetails}>
                        <span className={styles.DetailBadge}>
                          <GoogleIcon iconType="payments" size="small" />
                          {assignment.event_price} บาท
                        </span>
                        <span className={styles.DetailBadge}>
                          <GoogleIcon iconType="inventory_2" size="small" />
                          {assignment.stock_quantity} ชิ้น
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.RemoveButton}
                      onClick={() => handlers.handleRemoveAssignment(assignment.event_id)}
                      title="ลบ"
                    >
                      <GoogleIcon iconType="delete" size="small" />
                    </button>
                  </div>
                ))}
              </div>

              <div className={styles.AssignmentsSummary}>
                <div className={styles.SummaryItem}>
                  <span>จำนวนที่กำหนดทั้งหมด:</span>
                  <strong>{stateAddProductToEventDialog.totalAssignedQuantity}</strong>
                </div>
                <div className={styles.SummaryItem}>
                  <span>จำนวนที่เหลือ:</span>
                  <strong className={stateAddProductToEventDialog.remainingQuantity < 0 ? styles.Exceeded : ""}>
                    {stateAddProductToEventDialog.remainingQuantity}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {stateAddProductToEventDialog.error && (
            <div className={styles.ErrorMessage}>
              <GoogleIcon iconType="error" size="small" />
              {stateAddProductToEventDialog.error}
            </div>
          )}

          {/* Form Actions */}
          <div className={styles.FormActions}>
            <button
              type="button"
              className={styles.CancelButton}
              onClick={handlers.handleCancel}
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className={styles.SubmitButton}
              disabled={!stateAddProductToEventDialog.isFormValid}
            >
              <GoogleIcon iconType="check" size="small" />
              ยืนยันการเพิ่มสินค้า ({stateAddProductToEventDialog.eventAssignments.length} อีเวนต์)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
