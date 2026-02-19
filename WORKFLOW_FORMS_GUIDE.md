# 📝 Using Dynamic Forms in Workflow - Complete Guide

## ✅ Integration Complete!

Dynamic forms are now fully integrated into the workflow. Forms appear automatically based on the level and show different fields for each approval level.

---

## 🎯 How It Works

### Step-by-Step Flow:

1. **Create a Form** in Admin Panel (Form Builder tab)
2. **Add Fields** with level visibility/editability rules
3. **Select Form** when creating a request
4. **Form fields appear** automatically at each level
5. **Data persists** through all approval levels

---

## 📋 Complete Example

### Step 1: Create a Form (Admin Panel)

1. Go to http://localhost:8080/admin.html
2. Click **"📝 Form Builder"** tab
3. Click **"➕ Create New Form"**
4. Enter:
   - **Form Name**: Material Request Form
   - **Description**: Multi-level material request with dynamic fields
   - **Active**: ✓
5. Click **"Save Form"**

### Step 2: Add Fields

Click **"📝 Manage Fields"** on your form, then add these fields:

#### Field 1: Requester Name
- **Field Name**: `requesterName`
- **Field Label**: Requester Name
- **Field Type**: Text (Single Line)
- **Placeholder**: Enter your full name
- **Required**: ✓
- **Visible at Levels**: ☑ 1, ☑ 2, ☑ 3
- **Editable at Levels**: ☑ 1 only
- Click **"Save Field"**

#### Field 2: Product Name
- **Field Name**: `productName`
- **Field Label**: Product Name
- **Field Type**: Text (Single Line)
- **Required**: ✓
- **Visible at Levels**: ☑ 1, ☑ 2, ☑ 3
- **Editable at Levels**: ☑ 1 only

#### Field 3: Quantity
- **Field Name**: `quantity`
- **Field Label**: Quantity
- **Field Type**: Number
- **Required**: ✓
- **Visible at Levels**: ☑ 1, ☑ 2, ☑ 3
- **Editable at Levels**: ☑ 1, ☑ 2 (Level 2 can modify)

#### Field 4: Budget Code
- **Field Name**: `budgetCode`
- **Field Label**: Budget Code
- **Field Type**: Text (Single Line)
- **Placeholder**: Enter budget code
- **Required**: No
- **Visible at Levels**: ☑ 2, ☑ 3 (NOT visible at Level 1)
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
- **Visible at Levels**: ☑ 3 only
- **Editable at Levels**: ☑ 3 only

---

## 🚀 Using the Form in Workflow

### Step 3: Create a Request with the Form

1. Go to http://localhost:8080 (main workflow page)
2. In the **"Create New Request"** section:
   - **Select Form**: Choose "Material Request Form" from dropdown
   - The form fields will appear dynamically
3. Fill in the fields:
   - **Requester Name**: John Doe
   - **Product Name**: Laptop
   - **Quantity**: 2
4. Click **"Create Request"**

**What happens**:
- Request is created
- Form data is saved
- Workflow starts at Level 1
- Process moves to Level 2

---

### Step 4: Level 2 Approval

1. In **"My Pending Tasks"** section:
   - **Select Your Role**: Level 2 - Manager Approval
   - Click **"Load Tasks"**
2. Click **"View Details"** on the task

**What Level 2 sees**:
```
┌─────────────────────────────────────┐
│ Requester Name: John Doe (read-only)│
│ Product Name:   Laptop (read-only)  │
│ Quantity:       [____2____] (edit)  │ ← Can modify
│                                      │
│ Budget Code:    [________] (edit)   │ ← New field!
│                                      │
│ Comments: [________________]         │
│ Action: [Approve ▼]                  │
│ [Submit]                             │
└─────────────────────────────────────┘
```

3. Level 2 can:
   - See all Level 1 fields (read-only)
   - Modify Quantity if needed
   - Fill in Budget Code (new field)
4. Select **"Approve"** and click **"Submit"**

---

### Step 5: Level 3 Approval

1. **Select Your Role**: Level 3 - Director Approval
2. Click **"Load Tasks"**
3. Click **"View Details"**

**What Level 3 sees**:
```
┌─────────────────────────────────────┐
│ Requester Name: John Doe (read-only)│
│ Product Name:   Laptop (read-only)  │
│ Quantity:       2 (read-only)       │
│ Budget Code:    IT-2024 (read-only) │
│                                      │
│ Priority:       [High▼] (edit)      │ ← New field!
│                                      │
│ Comments: [________________]         │
│ Action: [Approve ▼]                  │
│ [Submit]                             │
└─────────────────────────────────────┘
```

3. Level 3 can:
   - See all previous fields (read-only)
   - Set Priority (new field)
4. Select **"Approve"** and click **"Submit"**
5. Material ID is generated!

---

## 📊 Field Visibility Matrix

| Field | Level 1 | Level 2 | Level 3 |
|-------|---------|---------|---------|
| Requester Name | ✏️ Edit | 👁️ View | 👁️ View |
| Product Name | ✏️ Edit | 👁️ View | 👁️ View |
| Quantity | ✏️ Edit | ✏️ Edit | 👁️ View |
| Budget Code | ❌ Hidden | ✏️ Edit | 👁️ View |
| Priority | ❌ Hidden | ❌ Hidden | ✏️ Edit |

**Legend**:
- ✏️ Edit = Can modify the field
- 👁️ View = Can see but cannot modify (read-only)
- ❌ Hidden = Cannot see the field at all

---

## 🎨 How Forms Appear

### At Level 1 (Creation):
- Form selector dropdown appears
- Select your form
- Only Level 1 fields show (editable)
- Hidden fields don't appear

### At Level 2 (Approval):
- Task details modal opens
- Level 1 fields show (read-only)
- Level 2 fields show (editable)
- Form data from Level 1 is pre-filled

### At Level 3 (Final Approval):
- All previous fields show (read-only)
- Level 3 fields show (editable)
- Complete history visible

---

## 💡 Key Features

### 1. Progressive Data Collection
- Each level adds more information
- Data accumulates through the workflow
- No data is lost

### 2. Level-Based Visibility
- Fields hidden from levels that don't need them
- Example: Budget Code only visible from Level 2+
- Keeps forms clean and focused

### 3. Level-Based Editability
- Control who can modify each field
- Example: Requester Name editable only at Level 1
- Prevents unauthorized changes

### 4. Data Persistence
- All data saved in database
- Linked to process instance
- Audit trail maintained

### 5. Flexible Configuration
- Change visibility/editability anytime
- Add/remove fields without code changes
- Reorder fields as needed

---

## 🔧 API Flow

### Creating Request with Form:
```
POST /api/workflow/requests
{
  "requester": "Dynamic Form User",
  "productName": "From Dynamic Form",
  "description": "Request created using dynamic form",
  "formId": 1,
  "formData": {
    "1": "John Doe",      // Field ID 1 = Requester Name
    "2": "Laptop",        // Field ID 2 = Product Name
    "3": "2"              // Field ID 3 = Quantity
  }
}
```

### Getting Form for Level:
```
GET /api/forms/1/render?level=2&processInstanceId=abc-123

Response:
{
  "id": 1,
  "formName": "Material Request Form",
  "fields": [
    {
      "id": 1,
      "fieldLabel": "Requester Name",
      "fieldType": "TEXT",
      "currentValue": "John Doe",
      "isEditable": false  // Read-only at Level 2
    },
    {
      "id": 4,
      "fieldLabel": "Budget Code",
      "fieldType": "TEXT",
      "currentValue": "",
      "isEditable": true   // Editable at Level 2
    }
  ]
}
```

---

## 🚨 Troubleshooting

### Form Not Appearing
- Check form is **Active** in Form Builder
- Verify fields have correct **Visible at Levels**
- Hard refresh browser (Ctrl+Shift+R)

### Fields Not Editable
- Check **Editable at Levels** configuration
- Ensure current level is checked
- Field must be visible to be editable

### Data Not Saving
- Check browser console for errors (F12)
- Verify all **Required** fields are filled
- Check API response for validation errors

### Form Selector Empty
- Ensure forms exist in Form Builder
- Check forms are marked as **Active**
- Verify API: GET /api/forms/active

---

## ✅ Summary

**How to Use**:
1. Create form in Admin Panel → Form Builder tab
2. Add fields with visibility/editability rules
3. Go to main workflow page
4. Select form from dropdown
5. Fill fields and create request
6. Form appears automatically at each level with appropriate fields

**Access Points**:
- **Create Forms**: http://localhost:8080/admin.html → Form Builder tab
- **Use Forms**: http://localhost:8080 → Select form dropdown

**Key Concept**:
- Same form flows through all levels
- Each level sees different fields
- Data persists and accumulates
- Fully configurable without code changes

**Ready to use!** 🎉

Create your first form and test it in the workflow!
