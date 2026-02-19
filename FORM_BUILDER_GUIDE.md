# 📝 Form Builder - Complete Guide

## ✅ Implementation Complete!

The dynamic form builder is now fully functional. You can create forms with customizable fields and configure which levels can see and edit each field.

---

## 🌐 How to Access

```
http://localhost:8080/admin.html
```

Click on the **"📝 Form Builder"** tab.

---

## 🎯 Creating Your First Form

### Step 1: Create a Form

1. Click **"➕ Create New Form"**
2. Fill in:
   - **Form Name**: Material Request Form
   - **Description**: Form for requesting materials with multi-level approval
   - **Active**: ✓ (checked)
3. Click **"Save Form"**

### Step 2: Add Fields

Click **"📝 Manage Fields"** on your form.

#### Field 1: Requester Name
- Click **"➕ Add Field"**
- **Field Name**: `requesterName` (no spaces)
- **Field Label**: Requester Name
- **Field Type**: Text (Single Line)
- **Placeholder**: Enter your full name
- **Required**: ✓ (checked)
- **Visible at Levels**: ☑ 1, ☑ 2, ☑ 3, ☑ 4, ☑ 5
- **Editable at Levels**: ☑ 1 only
- Click **"Save Field"**

#### Field 2: Product Name
- **Field Name**: `productName`
- **Field Label**: Product Name
- **Field Type**: Text (Single Line)
- **Placeholder**: Enter product name
- **Required**: ✓
- **Visible at Levels**: ☑ All
- **Editable at Levels**: ☑ 1 only

#### Field 3: Quantity
- **Field Name**: `quantity`
- **Field Label**: Quantity
- **Field Type**: Number
- **Placeholder**: Enter quantity
- **Required**: ✓
- **Visible at Levels**: ☑ All
- **Editable at Levels**: ☑ 1, ☑ 2 (Level 2 can modify)

#### Field 4: Budget Code
- **Field Name**: `budgetCode`
- **Field Label**: Budget Code
- **Field Type**: Text (Single Line)
- **Placeholder**: Enter budget code
- **Required**: No
- **Visible at Levels**: ☑ 2, ☑ 3, ☑ 4, ☑ 5 (NOT visible at Level 1)
- **Editable at Levels**: ☑ 2 only

#### Field 5: Priority
- **Field Name**: `priority`
- **Field Label**: Priority Level
- **Field Type**: Dropdown
- **Options** (one per line):
  ```
  Low
  Medium
  High
  Urgent
  ```
- **Required**: No
- **Visible at Levels**: ☑ 3, ☑ 4, ☑ 5
- **Editable at Levels**: ☑ 3 only

#### Field 6: Final Comments
- **Field Name**: `finalComments`
- **Field Label**: Final Approval Comments
- **Field Type**: Text Area (Multiple Lines)
- **Placeholder**: Enter any final comments
- **Required**: No
- **Visible at Levels**: ☑ 3, ☑ 4, ☑ 5
- **Editable at Levels**: ☑ 3, ☑ 4, ☑ 5 (All final levels can add comments)

---

## 📊 How It Works

### Level 1 (Creator) Sees:
```
┌─────────────────────────────────────┐
│ Requester Name: [________] (edit)   │
│ Product Name:   [________] (edit)   │
│ Quantity:       [________] (edit)   │
│                                      │
│ [Create Request]                     │
└─────────────────────────────────────┘
```
**Cannot see**: Budget Code, Priority, Final Comments

### Level 2 (Manager) Sees:
```
┌─────────────────────────────────────┐
│ Requester Name: John Doe (read-only)│
│ Product Name:   Laptop (read-only)  │
│ Quantity:       [____2____] (edit)  │ ← Can modify
│                                      │
│ Budget Code:    [________] (edit)   │ ← New field
│                                      │
│ [Approve] [Reject] [Query]           │
└─────────────────────────────────────┘
```
**Cannot see**: Priority, Final Comments

### Level 3 (Director) Sees:
```
┌─────────────────────────────────────┐
│ Requester Name: John Doe (read-only)│
│ Product Name:   Laptop (read-only)  │
│ Quantity:       2 (read-only)       │
│ Budget Code:    IT-2024 (read-only) │
│                                      │
│ Priority:       [High▼] (edit)      │ ← New field
│ Final Comments: [________] (edit)   │ ← New field
│                                      │
│ [Approve] [Reject] [Query]           │
└─────────────────────────────────────┘
```
**Sees all fields**, can edit Priority and Final Comments

---

## 🎨 Field Types

### TEXT
- Single-line text input
- Use for: Names, codes, short descriptions

### TEXTAREA
- Multi-line text input
- Use for: Comments, descriptions, notes

### NUMBER
- Numeric input only
- Use for: Quantities, amounts, counts

### EMAIL
- Email validation
- Use for: Email addresses

### DATE
- Date picker
- Use for: Deadlines, dates

### DROPDOWN
- Select one option from a list
- **Requires options** (one per line)
- Use for: Status, priority, categories

### RADIO
- Radio button selection
- **Requires options** (one per line)
- Use for: Yes/No, single choice

### CHECKBOX
- Multiple checkboxes
- **Requires options** (one per line)
- Use for: Multiple selections

---

## 🔧 Field Configuration

### Field Name
- **No spaces**, use camelCase
- Examples: `requesterName`, `budgetCode`, `finalComments`
- Used internally in the system

### Field Label
- **User-friendly** display name
- Examples: "Requester Name", "Budget Code", "Final Comments"
- Shown to users in the form

### Placeholder
- Hint text shown in empty fields
- Examples: "Enter your name", "Select an option"

### Help Text
- Additional guidance for users
- Shown below the field
- Examples: "Enter the budget code from finance department"

### Required
- If checked, field must be filled before submission
- Validation enforced by the system

### Visible at Levels
- Check which levels can **see** this field
- Unchecked levels won't see the field at all

### Editable at Levels
- Check which levels can **edit** this field
- Other levels see it as read-only
- **Must be a subset of visible levels**

---

## 📋 Best Practices

### 1. Level 1 Fields
- Basic information fields
- Editable only at Level 1
- Visible at all levels
- Examples: Requester name, product name, description

### 2. Middle Level Fields
- Additional information added during approval
- Visible from that level onwards
- Editable at specific levels
- Examples: Budget code (Level 2), Priority (Level 3)

### 3. Final Level Fields
- Summary or final decision fields
- Visible at final levels only
- Editable at final levels
- Examples: Final comments, approval notes

### 4. Shared Fields
- Fields that multiple levels can edit
- Example: Quantity (Level 1 creates, Level 2 can modify)
- Use sparingly to avoid conflicts

---

## 🔍 Testing Your Form

### Test API Endpoints

#### 1. Get Form for Level 1:
```
GET http://localhost:8080/api/forms/1/render?level=1
```
**Should return**: Only fields visible at Level 1, marked as editable

#### 2. Get Form for Level 2:
```
GET http://localhost:8080/api/forms/1/render?level=2
```
**Should return**: Level 1 fields (read-only) + Level 2 fields (editable)

#### 3. Get Form with Data:
```
GET http://localhost:8080/api/forms/1/render?level=2&processInstanceId=abc-123
```
**Should return**: Form with existing data filled in

#### 4. Submit Form Data:
```
POST http://localhost:8080/api/forms/submit
{
  "processInstanceId": "abc-123",
  "formId": 1,
  "currentLevel": 2,
  "userRole": "ROLE_LEVEL2",
  "fieldValues": {
    "1": "John Doe",
    "2": "Laptop",
    "3": "2",
    "4": "IT-2024"
  }
}
```

---

## 🎯 Common Use Cases

### Use Case 1: Progressive Data Collection
- Level 1: Basic info
- Level 2: Financial info
- Level 3: Final approval info
- Each level adds more data

### Use Case 2: Data Refinement
- Level 1: Initial request
- Level 2: Can modify quantities/specs
- Level 3: Final review (read-only)
- Earlier levels can refine data

### Use Case 3: Conditional Fields
- Some fields only visible to certain levels
- Example: Budget details only for finance levels
- Sensitive info hidden from lower levels

---

## 💡 Tips

1. **Start Simple**: Create a basic form first, test it, then add more fields
2. **Use Descriptive Names**: Make field labels clear and user-friendly
3. **Set Appropriate Visibility**: Don't show fields to levels that don't need them
4. **Mark Required Fields**: Ensure critical data is always collected
5. **Test Each Level**: Check how the form looks at each approval level
6. **Use Help Text**: Guide users on what to enter
7. **Group Related Fields**: Keep related information together

---

## 🚨 Troubleshooting

### Fields Not Showing
- Check "Visible at Levels" configuration
- Ensure the level number is checked
- Verify form is active

### Cannot Edit Field
- Check "Editable at Levels" configuration
- Ensure current level is checked
- Field must be visible to be editable

### Options Not Showing (Dropdown/Radio/Checkbox)
- Ensure options are entered (one per line)
- Check field type is DROPDOWN, RADIO, or CHECKBOX

### Form Not Saving
- Check all required fields are filled
- Verify field names have no spaces
- Check browser console for errors

---

## ✅ Summary

**Access**: http://localhost:8080/admin.html → Form Builder tab

**Features**:
- ✅ Create unlimited forms
- ✅ Add unlimited fields per form
- ✅ 8 field types supported
- ✅ Level-based visibility control
- ✅ Level-based editability control
- ✅ Required field validation
- ✅ Field ordering
- ✅ Edit/delete forms and fields

**Next Step**: Integrate forms with workflow (Phase 4)

**Ready to use!** 🎉
