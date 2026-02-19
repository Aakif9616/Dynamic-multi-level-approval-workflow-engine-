# Final User Guide - Dynamic Forms in Workflow

## ✅ Issue Fixed: Create Request Now Works!

The form submission issue has been resolved. You can now:
- Create requests with dynamic forms
- Create requests with basic form (fallback)
- See form fields in task approvals
- Edit form fields at each level
- View accumulated data from previous levels

## 🎯 How to Access Forms at Each Level

### Understanding the Form Flow

**Key Concept**: ONE form flows through ALL levels. Each level sees and edits different fields based on configuration.

```
Level 1 (Create) → Level 2 (Approve) → Level 3 (Approve) → Final Level (Approve)
    ↓                    ↓                    ↓                      ↓
Fill Field A        See A (readonly)     See A,B (readonly)    See A,B,C (readonly)
                    Fill Field B         Fill Field C          Fill Field D
```

### Step-by-Step Access Guide

#### 1️⃣ Create Form (Admin Panel)

**Where**: http://localhost:8080/admin.html

**Steps**:
1. Click "Form Builder" tab
2. Click "Create New Form" button
3. Enter form name and description
4. Click "Create Form"
5. Find your form in the list and click "Edit"
6. Add fields one by one:
   - Click "Add New Field"
   - Fill field details
   - **Important**: Set "Visible at Levels" (e.g., 1,2,3,4,5)
   - **Important**: Set "Editable at Levels" (e.g., 1 or 2 or 3)
   - Click "Add Field"
7. Repeat for all fields
8. Ensure form is marked as "Active"

**Example Field Configuration**:
```
Field: Product Name
- Visible at Levels: 1,2,3,4,5 (all levels see it)
- Editable at Levels: 1 (only Level 1 fills it)

Field: Quantity
- Visible at Levels: 2,3,4,5 (Level 1 doesn't see it)
- Editable at Levels: 2 (only Level 2 fills it)

Field: Budget Approval
- Visible at Levels: 3,4,5 (only Level 3+ see it)
- Editable at Levels: 3 (only Level 3 fills it)
```

#### 2️⃣ Create Request with Form (Level 1)

**Where**: http://localhost:8080/

**Steps**:
1. Look at "Create New Request" section (left side)
2. Find "Select Form (Optional)" dropdown
3. Select your form from the list
4. Form fields will appear below
5. Fill the fields that are editable at Level 1
6. Click "Create Request"
7. Note the Request ID and Process ID from success message

**What happens**:
- Request is created in database
- Workflow process starts in Camunda
- Form data is saved to `form_data` table
- Task is created for Level 2

#### 3️⃣ Access and Approve at Level 2

**Where**: http://localhost:8080/ (same page)

**Steps**:
1. Look at "My Pending Tasks" section (right side)
2. In "Select Your Role" dropdown, choose "Level 2 Approver"
3. Click "Load Tasks" button
4. You'll see pending tasks listed
5. Click "Open Task" button on your task
6. **Task Modal Opens** showing:
   - Task details at top
   - **Form Data section** with:
     - Fields from Level 1 (shown as read-only with values)
     - Fields editable at Level 2 (shown as input fields, empty)
   - Comments section
   - Action dropdown
7. Fill the Level 2 editable fields
8. Select "Approve" from Action dropdown
9. Click "Submit"

**What happens**:
- Your Level 2 form data is saved
- Task is completed
- Workflow moves to Level 3
- Task is created for Level 3

#### 4️⃣ Access and Approve at Level 3

**Where**: http://localhost:8080/ (same page)

**Steps**:
1. In "Select Your Role" dropdown, choose "Level 3 Approver"
2. Click "Load Tasks"
3. Click "Open Task"
4. **Task Modal Opens** showing:
   - Fields from Level 1 (read-only)
   - Fields from Level 2 (read-only)
   - Fields editable at Level 3 (input fields)
5. Fill Level 3 fields
6. Select "Approve"
7. Click "Submit"

**What happens**:
- Your Level 3 form data is saved
- Task is completed
- Workflow moves to next level or completes

#### 5️⃣ Continue Through Remaining Levels

Repeat the same process for each remaining level:
- Select the role
- Load tasks
- Open task
- See all previous data (read-only)
- Fill your level's fields
- Approve

## 📍 Where to See Forms

### Location 1: Admin Panel - Form Builder
**URL**: http://localhost:8080/admin.html → Form Builder tab

**What you see**:
- Complete list of all forms (active and inactive)
- Create/Edit/Delete buttons
- Form details (name, description, field count)

**What you can do**:
- Create new forms
- Edit existing forms
- Add/edit/delete fields
- Configure field visibility per level
- Configure field editability per level
- Activate/deactivate forms

### Location 2: Main App - Create Request
**URL**: http://localhost:8080/ → Create New Request section

**What you see**:
- "Select Form (Optional)" dropdown
- List of all active forms
- "Use Basic Form" option (fallback)

**What you can do**:
- Select a form to use
- See form fields appear dynamically
- Fill fields editable at Level 1
- Create request with form data

### Location 3: Main App - Task Approval
**URL**: http://localhost:8080/ → My Pending Tasks section

**What you see**:
- Role selector
- Task list
- Task modal with form fields

**What you can do**:
- Select your role/level
- Load tasks for that level
- Open task to see form
- View previous level data (read-only)
- Fill your level's fields (editable)
- Approve/reject/query

### Location 4: Database (H2 Console)
**URL**: http://localhost:8080/h2-console

**Connection**:
- JDBC URL: jdbc:h2:mem:workflowdb
- Username: sa
- Password: (empty)

**What you see**:
```sql
-- View all forms
SELECT * FROM form;

-- View fields for a form
SELECT * FROM form_field WHERE form_id = 1;

-- View submitted form data
SELECT * FROM form_data WHERE process_instance_id = 'xxx';
```

## 🔧 Configuration Examples

### Example 1: Simple 3-Level Form

**Form**: Product Request

**Fields**:
1. Product Name (Level 1 fills)
   - Visible: 1,2,3
   - Editable: 1

2. Quantity (Level 2 fills)
   - Visible: 1,2,3
   - Editable: 2

3. Approval Status (Level 3 fills)
   - Visible: 1,2,3
   - Editable: 3

**Flow**:
- Level 1: Fills "Product Name" → Creates request
- Level 2: Sees "Product Name" (readonly), Fills "Quantity" → Approves
- Level 3: Sees "Product Name" + "Quantity" (readonly), Fills "Approval Status" → Approves

### Example 2: Progressive Disclosure Form

**Form**: Budget Request

**Fields**:
1. Request Title (Level 1 fills)
   - Visible: 1,2,3,4
   - Editable: 1

2. Amount (Level 1 fills)
   - Visible: 1,2,3,4
   - Editable: 1

3. Department Approval (Level 2 fills)
   - Visible: 2,3,4 (Level 1 doesn't see this)
   - Editable: 2

4. Finance Review (Level 3 fills)
   - Visible: 3,4 (Only Level 3+ see this)
   - Editable: 3

5. Final Decision (Level 4 fills)
   - Visible: 4 (Only final level sees this)
   - Editable: 4

**Flow**:
- Level 1: Fills "Title" + "Amount" → Creates request
- Level 2: Sees "Title" + "Amount", Fills "Department Approval" → Approves
- Level 3: Sees "Title" + "Amount" + "Department Approval", Fills "Finance Review" → Approves
- Level 4: Sees all fields, Fills "Final Decision" → Approves

## 🎨 Field Types Available

1. **TEXT** - Single line text (e.g., name, title)
2. **EMAIL** - Email address with validation
3. **TEXTAREA** - Multi-line text (e.g., description, comments)
4. **NUMBER** - Numeric input (e.g., quantity, amount)
5. **DATE** - Date picker (e.g., deadline, start date)
6. **DROPDOWN** - Select one option (e.g., status, category)
7. **RADIO** - Select one option with radio buttons
8. **CHECKBOX** - Select multiple options

**For DROPDOWN/RADIO/CHECKBOX**, enter options in "Field Options" (one per line):
```
Option 1
Option 2
Option 3
```

## 🚀 Quick Start Test

### Test Scenario: 3-Level Product Approval

**Step 1: Create Form** (2 minutes)
```
Admin Panel → Form Builder → Create New Form
Name: "Product Request"
Add Field: "Product Name" (TEXT, visible: 1,2,3, editable: 1)
Add Field: "Quantity" (NUMBER, visible: 1,2,3, editable: 2)
Add Field: "Approved" (DROPDOWN, visible: 1,2,3, editable: 3)
  Options: Yes / No / Pending
```

**Step 2: Create Request** (1 minute)
```
Main App → Create Request
Select Form: "Product Request"
Fill "Product Name": "Laptop"
Create Request
```

**Step 3: Level 2 Approval** (1 minute)
```
Main App → Select Role: "Level 2 Approver"
Load Tasks → Open Task
See: Product Name = "Laptop" (readonly)
Fill: Quantity = "10"
Action: Approve → Submit
```

**Step 4: Level 3 Approval** (1 minute)
```
Main App → Select Role: "Level 3 Approver"
Load Tasks → Open Task
See: Product Name = "Laptop" (readonly)
See: Quantity = "10" (readonly)
Fill: Approved = "Yes"
Action: Approve → Submit
```

**Result**: Request approved with complete form data!

## ❓ Common Questions

### Q: Can I create different forms for different levels?
**A**: No, one form flows through all levels. But you can configure which fields each level sees and edits.

### Q: Can Level 2 edit Level 1 data?
**A**: Only if you configure the field as editable at both levels. Otherwise, Level 2 sees Level 1 data as read-only.

### Q: What if I don't select a form?
**A**: The system falls back to the basic form (Requester, Product Name, Description).

### Q: Can I have multiple forms?
**A**: Yes! Create as many forms as you need. Users select which form to use when creating a request.

### Q: Where is the form data stored?
**A**: In the `form_data` table in the database, linked to the process instance.

### Q: Can I see form data in Camunda?
**A**: The formId is stored in process variables. The actual field data is in the database.

## 🐛 Troubleshooting

### Issue: Forms not appearing in dropdown
**Solution**: 
- Check if form is marked as "Active" in admin panel
- Hard refresh page (Ctrl+Shift+R)
- Check browser console for errors (F12)

### Issue: Form fields not showing in task
**Solution**:
- Verify form was selected when creating request
- Check field "Visible at Levels" includes current level
- Hard refresh page (Ctrl+Shift+R)

### Issue: Cannot edit fields
**Solution**:
- Check "Editable at Levels" configuration
- Ensure you selected correct role
- Verify current level matches editable level

### Issue: Create request button not working
**Solution**:
- Check browser console for errors (F12)
- Verify all required fields are filled
- Try using basic form (don't select any form)
- Hard refresh page (Ctrl+Shift+R)

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     USER INTERFACE                          │
│  ┌──────────────┐              ┌──────────────┐            │
│  │ Admin Panel  │              │  Main App    │            │
│  │ Form Builder │              │  Workflow UI │            │
│  └──────────────┘              └──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                     REST API LAYER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │FormController│  │AdminController│  │WorkflowCtrl  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    SERVICE LAYER                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │DynamicForm   │  │RBACService   │  │WorkflowSvc   │     │
│  │Service       │  │              │  │              │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  REPOSITORY LAYER                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │FormRepo      │  │FormFieldRepo │  │FormDataRepo  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                    DATABASE (H2)                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ form         │  │ form_field   │  │ form_data    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│                  CAMUNDA BPM ENGINE                         │
│              (Workflow Execution)                           │
└─────────────────────────────────────────────────────────────┘
```

## ✅ What's Working

- ✅ Form creation in admin panel
- ✅ Field management (add/edit/delete/reorder)
- ✅ Level-based visibility configuration
- ✅ Level-based editability configuration
- ✅ Form selection at request creation
- ✅ Form data submission at Level 1
- ✅ Form rendering in task modals
- ✅ Read-only display of previous level data
- ✅ Editable fields for current level
- ✅ Form data submission during approvals
- ✅ All 8 field types supported
- ✅ Field validation (required fields)
- ✅ Field options (dropdown/radio/checkbox)
- ✅ Database persistence
- ✅ Workflow integration

## 🎉 Summary

You now have a complete dynamic forms system integrated with your workflow engine. Forms flow through all levels with progressive data collection, where each level can see previous data and add their own fields. The system is fully functional and ready to use!

**Start using it**:
1. Run: `mvn spring-boot:run`
2. Create forms: http://localhost:8080/admin.html
3. Use forms: http://localhost:8080/

Happy workflow automation! 🚀
