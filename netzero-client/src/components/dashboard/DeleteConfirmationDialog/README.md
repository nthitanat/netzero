# DeleteConfirmationDialog Component

A reusable, styled delete confirmation dialog component that follows the project's design system and can be used across all dashboards.

## Features

- ✅ Preset styling from styles folder (modals, buttons, colors, animations)
- ✅ Theme support (default, events, market, barter, willing)
- ✅ Loading state with spinner
- ✅ Customizable text and messages
- ✅ Accessible and responsive
- ✅ Consistent with existing UI patterns
- ✅ Click outside to dismiss (when not loading)

## Usage

### Basic Example

```jsx
import { DeleteConfirmationDialog } from "../../components/dashboard";

function MyComponent() {
  const [showDelete, setShowDelete] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const handleDelete = (item) => {
    setItemToDelete(item);
    setShowDelete(true);
  };

  const handleConfirm = async () => {
    // Perform delete operation
    await api.deleteItem(itemToDelete.id);
    setShowDelete(false);
    setItemToDelete(null);
  };

  const handleCancel = () => {
    setShowDelete(false);
    setItemToDelete(null);
  };

  return (
    <>
      <button onClick={() => handleDelete(item)}>Delete</button>
      
      <DeleteConfirmationDialog
        isOpen={showDelete}
        title="ยืนยันการลบสินค้า"
        message="คุณต้องการลบสินค้านี้หรือไม่?"
        itemName={itemToDelete?.title}
        warningText="การดำเนินการนี้ไม่สามารถย้อนกลับได้"
        confirmText="ลบสินค้า"
        cancelText="ยกเลิก"
        isLoading={false}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        theme="default"
      />
    </>
  );
}
```

### With Loading State

```jsx
const [isDeleting, setIsDeleting] = useState(false);

const handleConfirm = async () => {
  setIsDeleting(true);
  try {
    await api.deleteItem(itemToDelete.id);
    setShowDelete(false);
  } catch (error) {
    console.error('Delete failed:', error);
  } finally {
    setIsDeleting(false);
  }
};

<DeleteConfirmationDialog
  isOpen={showDelete}
  isLoading={isDeleting}
  onConfirm={handleConfirm}
  onCancel={handleCancel}
  // ... other props
/>
```

### Using the Hook (Advanced)

For more complex scenarios, use the included hook:

```jsx
import { 
  DeleteConfirmationDialog, 
  useDeleteConfirmationDialog 
} from "../../components/dashboard/DeleteConfirmationDialog";

function MyComponent() {
  const {
    stateDeleteConfirmation,
    openDeleteConfirmation,
    closeDeleteConfirmation,
    setLoading
  } = useDeleteConfirmationDialog();

  const handleDelete = (item) => {
    openDeleteConfirmation({
      title: "ยืนยันการลบสินค้า",
      message: "คุณต้องการลบสินค้านี้หรือไม่?",
      itemName: item.title,
      itemToDelete: item,
      theme: "seller"
    });
  };

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.deleteItem(stateDeleteConfirmation.itemToDelete.id);
      closeDeleteConfirmation();
    } catch (error) {
      console.error('Delete failed:', error);
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => handleDelete(item)}>Delete</button>
      
      <DeleteConfirmationDialog
        isOpen={stateDeleteConfirmation.isOpen}
        title={stateDeleteConfirmation.title}
        message={stateDeleteConfirmation.message}
        itemName={stateDeleteConfirmation.itemName}
        warningText={stateDeleteConfirmation.warningText}
        confirmText={stateDeleteConfirmation.confirmText}
        cancelText={stateDeleteConfirmation.cancelText}
        isLoading={stateDeleteConfirmation.isLoading}
        onConfirm={handleConfirm}
        onCancel={closeDeleteConfirmation}
        theme={stateDeleteConfirmation.theme}
      />
    </>
  );
}
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | `boolean` | `false` | Controls dialog visibility |
| `title` | `string` | `"ยืนยันการลบ"` | Dialog title |
| `message` | `string` | `"คุณต้องการลบรายการนี้หรือไม่?"` | Main confirmation message |
| `itemName` | `string` | `""` | Name of item being deleted (shown in bold) |
| `warningText` | `string` | `"การดำเนินการนี้ไม่สามารถย้อนกลับได้"` | Warning message text |
| `confirmText` | `string` | `"ลบ"` | Text for confirm button |
| `cancelText` | `string` | `"ยกเลิก"` | Text for cancel button |
| `isLoading` | `boolean` | `false` | Shows loading spinner on confirm button |
| `onConfirm` | `function` | `undefined` | Callback when confirm is clicked |
| `onCancel` | `function` | `undefined` | Callback when cancel is clicked or overlay clicked |
| `theme` | `string` | `"default"` | Theme variant: `default`, `events`, `market`, `barter`, `willing` |

## Themes

The component supports multiple theme variants that match different dashboard contexts:

- **`default`** - Standard green theme (for seller dashboard, general use)
- **`events`** - Events/map theme with lighter green tones
- **`market`** - Market theme with orange accents
- **`barter`** - Barter trade theme
- **`willing`** - Willing theme with pink accents

## Styling

The component uses preset styles from the styles folder:

- **Modals**: `@include modal-container-base`, `@include modal-overlay`, `@include modal-body-base`
- **Buttons**: `@include button-secondary` (cancel), custom danger styling (confirm)
- **Colors**: Uses CSS variables from `_colors.scss` (`--error-dark`, `--error-light`)
- **Animations**: `@include fade-in-animation`, `@include expand-animation`
- **Typography**: Uses `@include font-size-palette` mixins

## Responsive Design

The component is fully responsive:
- Desktop: 400-500px width, centered
- Mobile: 90vw width, stacked buttons

## Accessibility

- Keyboard accessible (Tab, Enter, Escape)
- Click outside to dismiss (when not loading)
- Disabled state during loading
- Semantic HTML structure
- Clear visual hierarchy

## Integration Examples

### SellerDashboard (Product Deletion)

Already integrated in:
- [ProductManagementPanel.jsx](../ProductManagementPanel/ProductManagementPanel.jsx)

```jsx
<DeleteConfirmationDialog
  isOpen={showDeleteConfirm}
  title="ยืนยันการลบสินค้า"
  message="คุณต้องการลบสินค้านี้หรือไม่?"
  itemName={selectedProduct?.title}
  warningText="การดำเนินการนี้ไม่สามารถย้อนกลับได้"
  confirmText="ลบสินค้า"
  cancelText="ยกเลิก"
  isLoading={false}
  onConfirm={onConfirmDelete}
  onCancel={onCancelDelete}
  theme="default"
/>
```

### EventDashboard (Event Deletion)

Already integrated in:
- [EventManagementPanel.jsx](../EventManagementPanel/EventManagementPanel.jsx)

```jsx
<DeleteConfirmationDialog
  isOpen={showDeleteConfirm}
  title="ยืนยันการลบกิจกรรม"
  message="คุณแน่ใจหรือไม่ที่จะลบกิจกรรมนี้?"
  itemName={selectedEvent?.title}
  warningText="การกระทำนี้ไม่สามารถยกเลิกได้ และข้อมูลกิจกรรมจะถูกลบอย่างถาวร"
  confirmText="ลบกิจกรรม"
  cancelText="ยกเลิก"
  isLoading={isSubmittingEvent}
  onConfirm={onConfirmDelete}
  onCancel={onCancelDelete}
  theme="events"
/>
```

## Files

- `DeleteConfirmationDialog.jsx` - Main component
- `DeleteConfirmationDialog.module.scss` - Styles using preset mixins
- `useDeleteConfirmationDialog.js` - Optional hook for state management
- `DeleteConfirmationDialogHandler.js` - Optional handler utilities
- `index.js` - Exports

## Benefits

✅ **Consistency** - Same look and feel across all dashboards
✅ **Maintainability** - Single source of truth for delete confirmations
✅ **Reusability** - Easy to implement in new features
✅ **Themeable** - Matches different dashboard contexts
✅ **Accessible** - Follows best practices
✅ **Type-safe** - Clear prop documentation
