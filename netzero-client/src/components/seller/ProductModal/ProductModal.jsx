import React from "react";
import styles from "./ProductModal.module.scss";
import useProductModal from "./useProductModal";
import ProductModalHandler from "./ProductModalHandler";
import { GoogleIcon } from "../../common";

export default function ProductModal({
    isOpen = false,
    mode = "create", // "create" or "edit"
    product = null,
    onClose,
    onSave,
    isLoading = false,
    className = ""
}) {
    const { 
        stateProductModal, 
        setProductModal, 
        setFormField,
        setThumbnail,
        setCover,
        addAdditionalImages,
        removeAdditionalImage,
        clearThumbnail,
        clearCover,
        setError,
        clearError
    } = useProductModal(product, mode);
    
    const hookFunctions = {
        setFormField,
        setThumbnail,
        setCover,
        addAdditionalImages,
        removeAdditionalImage,
        clearThumbnail,
        clearCover,
        setError,
        clearError
    };
    
    const handlers = ProductModalHandler(stateProductModal, hookFunctions, onSave, onClose);

    if (!isOpen) return null;

    return (
        <div className={styles.ModalOverlay}>
            <div className={`${styles.Container} ${className}`}>
                <div className={styles.Header}>
                    <h2 className={styles.Title}>
                        <GoogleIcon 
                            iconType={mode === "create" ? "add" : "edit"} 
                            size="medium" 
                        />
                        {mode === "create" ? "เพิ่มสินค้าใหม่" : "แก้ไขสินค้า"}
                    </h2>
                    <button 
                        className={styles.CloseButton}
                        onClick={onClose}
                        disabled={isLoading}
                    >
                        <GoogleIcon iconType="close" size="small" />
                    </button>
                </div>

                <form className={styles.Form} onSubmit={handlers.handleSubmit}>
                    <div className={styles.FormGrid}>
                        {/* Title Field */}
                        <div className={styles.FormGroup}>
                            <label className={styles.Label}>
                                ชื่อสินค้า <span className={styles.Required}>*</span>
                            </label>
                            <input
                                type="text"
                                className={styles.Input}
                                value={stateProductModal.formData.title}
                                onChange={(e) => handlers.handleInputChange("title", e.target.value)}
                                placeholder="ใส่ชื่อสินค้า"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Category Field */}
                        <div className={styles.FormGroup}>
                            <label className={styles.Label}>
                                หมวดหมู่ <span className={styles.Required}>*</span>
                            </label>
                            <select
                                className={styles.Select}
                                value={stateProductModal.formData.category}
                                onChange={(e) => handlers.handleInputChange("category", e.target.value)}
                                disabled={isLoading}
                                required
                            >
                                <option value="">เลือกหมวดหมู่</option>
                                <option value="อาหารแปรรูป">อาหารแปรรูป</option>
                                <option value="ผักผลไม้">ผักผลไม้</option>
                                <option value="เครื่องใช้">เครื่องใช้</option>
                                <option value="ของใช้ในครัวเรือน">ของใช้ในครัวเรือน</option>
                                <option value="อื่นๆ">อื่นๆ</option>
                            </select>
                        </div>

                        {/* Type Field */}
                        <div className={styles.FormGroup}>
                            <label className={styles.Label}>
                                ประเภทการขาย <span className={styles.Required}>*</span>
                            </label>
                            <select
                                className={styles.Select}
                                value={stateProductModal.formData.type}
                                onChange={(e) => handlers.handleInputChange("type", e.target.value)}
                                disabled={isLoading}
                                required
                            >
                                <option value="">เลือกประเภท</option>
                                <option value="market">ขายในตลาด</option>
                                <option value="willing">ยินดีให้</option>
                                <option value="barter">แลกเปลี่ยน</option>
                            </select>
                        </div>

                        {/* Price Field */}
                        <div className={styles.FormGroup}>
                            <label className={styles.Label}>
                                ราคา <span className={styles.Required}>*</span>
                            </label>
                            <div className={styles.PriceInputContainer}>
                                <input
                                    type="number"
                                    className={styles.Input}
                                    value={stateProductModal.formData.price}
                                    onChange={(e) => handlers.handleInputChange("price", e.target.value)}
                                    placeholder="0"
                                    min="0"
                                    step="0.01"
                                    disabled={isLoading || stateProductModal.formData.type === "willing"}
                                    required={stateProductModal.formData.type !== "willing"}
                                />
                                <span className={styles.PriceUnit}>บาท</span>
                            </div>
                            {stateProductModal.formData.type === "willing" && (
                                <p className={styles.HelperText}>
                                    สินค้าประเภท "ยินดีให้" ไม่ต้องกำหนดราคา
                                </p>
                            )}
                        </div>

                        {/* Stock Quantity Field */}
                        <div className={styles.FormGroup}>
                            <label className={styles.Label}>
                                จำนวนคงเหลือ <span className={styles.Required}>*</span>
                            </label>
                            <input
                                type="number"
                                className={styles.Input}
                                value={stateProductModal.formData.stock_quantity}
                                onChange={(e) => handlers.handleInputChange("stock_quantity", e.target.value)}
                                placeholder="0"
                                min="0"
                                disabled={isLoading}
                                required
                            />
                        </div>

                        {/* Unit Field */}
                        <div className={styles.FormGroup}>
                            <label className={styles.Label}>หน่วย</label>
                            <input
                                type="text"
                                className={styles.Input}
                                value={stateProductModal.formData.unit}
                                onChange={(e) => handlers.handleInputChange("unit", e.target.value)}
                                placeholder="เช่น ชิ้น, กิโลกรัม, ห่อ"
                                disabled={isLoading}
                            />
                        </div>
                    </div>

                    {/* Description Field */}
                    <div className={styles.FormGroup}>
                        <label className={styles.Label}>
                            รายละเอียดสินค้า <span className={styles.Required}>*</span>
                        </label>
                        <textarea
                            className={styles.Textarea}
                            value={stateProductModal.formData.description}
                            onChange={(e) => handlers.handleInputChange("description", e.target.value)}
                            placeholder="ใส่รายละเอียดสินค้า เช่น คุณภาพ สภาพ วิธีการใช้งาน หรือข้อมูลอื่นๆ"
                            rows="4"
                            disabled={isLoading}
                            required
                        />
                    </div>

                    {/* Image Upload Section */}
                    <div className={styles.ImageSection}>
                        <label className={styles.Label}>รูปภาพสินค้า</label>
                        
                        {/* Thumbnail Upload */}
                        <div className={styles.ImageUploadGroup}>
                            <label className={styles.ImageLabel}>รูปหลัก (Thumbnail)</label>
                            <div className={styles.ImageUpload}>
                                <input
                                    type="file"
                                    ref={stateProductModal.thumbnailInputRef}
                                    onChange={handlers.handleThumbnailChange}
                                    accept="image/*"
                                    className={styles.HiddenInput}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.UploadButton}
                                    onClick={() => stateProductModal.thumbnailInputRef.current?.click()}
                                    disabled={isLoading}
                                >
                                    <GoogleIcon iconType="upload" size="small" />
                                    เลือกรูปหลัก
                                </button>
                                {stateProductModal.thumbnailPreview && (
                                    <div className={styles.ImagePreview}>
                                        <img 
                                            src={stateProductModal.thumbnailPreview} 
                                            alt="Thumbnail preview" 
                                        />
                                        <button
                                            type="button"
                                            className={styles.RemoveImageButton}
                                            onClick={handlers.handleRemoveThumbnail}
                                            disabled={isLoading}
                                        >
                                            <GoogleIcon iconType="close" size="small" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Cover Upload */}
                        <div className={styles.ImageUploadGroup}>
                            <label className={styles.ImageLabel}>รูปปก (Cover)</label>
                            <div className={styles.ImageUpload}>
                                <input
                                    type="file"
                                    ref={stateProductModal.coverInputRef}
                                    onChange={handlers.handleCoverChange}
                                    accept="image/*"
                                    className={styles.HiddenInput}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.UploadButton}
                                    onClick={() => stateProductModal.coverInputRef.current?.click()}
                                    disabled={isLoading}
                                >
                                    <GoogleIcon iconType="upload" size="small" />
                                    เลือกรูปปก
                                </button>
                                {stateProductModal.coverPreview && (
                                    <div className={styles.ImagePreview}>
                                        <img 
                                            src={stateProductModal.coverPreview} 
                                            alt="Cover preview" 
                                        />
                                        <button
                                            type="button"
                                            className={styles.RemoveImageButton}
                                            onClick={handlers.handleRemoveCover}
                                            disabled={isLoading}
                                        >
                                            <GoogleIcon iconType="close" size="small" />
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Additional Images Upload */}
                        <div className={styles.ImageUploadGroup}>
                            <label className={styles.ImageLabel}>รูปเพิ่มเติม (สูงสุด 5 รูป)</label>
                            <div className={styles.ImageUpload}>
                                <input
                                    type="file"
                                    ref={stateProductModal.imagesInputRef}
                                    onChange={handlers.handleImagesChange}
                                    accept="image/*"
                                    multiple
                                    className={styles.HiddenInput}
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className={styles.UploadButton}
                                    onClick={() => stateProductModal.imagesInputRef.current?.click()}
                                    disabled={isLoading || stateProductModal.additionalImages.length >= 5}
                                >
                                    <GoogleIcon iconType="upload" size="small" />
                                    เลือกรูปเพิ่มเติม
                                </button>
                                {stateProductModal.additionalImages.length > 0 && (
                                    <div className={styles.MultipleImagePreviews}>
                                        {stateProductModal.additionalImages.map((image, index) => (
                                            <div key={index} className={styles.ImagePreview}>
                                                <img src={image.preview} alt={`Additional ${index + 1}`} />
                                                <button
                                                    type="button"
                                                    className={styles.RemoveImageButton}
                                                    onClick={() => handlers.handleRemoveAdditionalImage(index)}
                                                    disabled={isLoading}
                                                >
                                                    <GoogleIcon iconType="close" size="small" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Recommend Toggle */}
                    <div className={styles.FormGroup}>
                        <label className={styles.CheckboxLabel}>
                            <input
                                type="checkbox"
                                className={styles.Checkbox}
                                checked={stateProductModal.formData.isRecommend}
                                onChange={(e) => handlers.handleInputChange("isRecommend", e.target.checked)}
                                disabled={isLoading}
                            />
                            <span className={styles.CheckboxText}>แนะนำสินค้านี้</span>
                        </label>
                    </div>

                    {/* Error Message */}
                    {stateProductModal.error && (
                        <div className={styles.ErrorMessage}>
                            <GoogleIcon iconType="error" size="small" />
                            {stateProductModal.error}
                        </div>
                    )}

                    {/* Form Actions */}
                    <div className={styles.FormActions}>
                        <button
                            type="button"
                            className={styles.CancelButton}
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            ยกเลิก
                        </button>
                        <button
                            type="submit"
                            className={styles.SubmitButton}
                            disabled={isLoading || !stateProductModal.isFormValid}
                        >
                            {isLoading && <div className={styles.LoadingSpinner} />}
                            <GoogleIcon iconType="save" size="small" />
                            {mode === "create" ? "เพิ่มสินค้า" : "บันทึกการแก้ไข"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}