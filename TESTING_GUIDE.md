# Dynamic Forms Testing Guide

## Overview
The dynamic forms system is now fully integrated with the workflow. Forms flow through all levels with progressive data collection based on visibility and editability configuration.

## How to Test

### Step 1: Start the Application
```bash
mvn spring-boot:run
```

Wait for the application to start (look for "Started WorkflowApplication" in console).

### Step 2: Access the Admin Panel
1. Open browser: http://localhost:8080/admin.html
2. Click on "Form Builder" tab
3. Create a new form:
   - Form Name: "Product Request Form"
   - Description: "Multi-level product approval form"
   - Click "Create Form"

### Step 3: Add Form Fields
For the created form, add these fields:

**Field 1: Product Name (Level 1 only)**
- Field Name: product_name
- Field Label: Product Name
- Field Type: TEXT
- Required: Yes
- Visible at Levels: 1,2,3,4,5
- Editable at Levels: 1
- Click "Add Field"

**Field 2: Quantity (Level 2 can edit)**
- Field Name: quantity
- Field Label: Quantity Required
- Field Type: NUMBER
- Required: Yes
- Visible at Levels: 1,2,3,4,5
- Editable at Levels: 2
- Click "Add Field"

**Field 3: Budget Approval (Level 3 can edit)**
- Field Name: budget_approved
- Field Label: Budget Approved
- Field Type: DROPDOWN
- Field Options (one per line):
  ```
  Yes
  No
  Pending
  ```
- Required: Yes
- Visible at Levels: 1,2,3,4,5
- Editable at Levels: 3
- Click "Add Field"

**Field 4: Final Comments (Final level can edit)**
- Field Name: final_comments
- Field Label: Final Approval Comments
- Field Type: TEXTAREA
- Required: No
- Visible at Levels: 1,2,3,4,5
- Editable at Levels: 4 (or whatever your final level is)
- Click "Add Field"

### Step 4: Create a Request with the Form
1. Go to main page: http://localhost:8080/
2. In "Create New Request" section:
   - Select "Product Request Form" from the dropdown
   - You should see the "Product Name" field appear (editable)
   - Fill in: "Laptop Computer"
   - Click "Create Request"
3. Note the Request ID and Process ID from the success message

### Step 5: Approve at Level 2
1. On the same page, select "Level 2 Approver" from role dropdown
2. Click "Load Tasks"
3. Click "Open Task" on the pending task
4. You should see:
   - Product Name: "Laptop Computer" (read-only, filled from Level 1)
   - Quantity Required: (editable, empty - Level 2 fills this)
5. Fill in Quantity: 10
6. Select Action: "Approve"
7. Click "Submit"

### Step 6: Approve at Level 3
1. Select "Level 3 Approver" from role dropdown
2. Click "Load Tasks"
3. Click "Open Task"
4. You should see:
   - Product Name: "Laptop Computer" (read-only)
   - Quantity Required: 10 (read-only, filled from Level 2)
   - Budget Approved: (editable dropdown - Level 3 fills this)
5. Select Budget Approved: "Yes"
6. Select Action: "Approve"
7. Click "Submit"

### Step 7: Final Approval
1. Select your final level approver from role dropdown
2. Click "Load Tasks"
3. Click "Open Task"
4. You should see:
   - Product Name: "Laptop Computer" (read-only)
   - Quantity Required: 10 (read-only)
   - Budget Approved: "Yes" (read-only)
   - Final Approval Comments: (editable textarea)
5. Fill in Final Comments: "Approved for purchase"
6. Select Action: "Approve"
7. Click "Submit"

## Expected Behavior

### Progressive Data Collection
- Each level sees all previous data (read-only)
- Each level can only edit fields configured for their level
- Data accumulates as the request flows through levels
- Same form ID flows through entire workflow

### Form Visibility
- If a field is not visible at a level, it won't appear
- If a field is visible but not editable, it shows as read-only
- If a field is visible and editable, it shows as an input field

### Data Persistence
- Form data is saved in the `form_data` table
- Each field value is linked to the process instance
- Data persists across level transitions
- Previous level data is automatically loaded when opening a task

## Troubleshooting

### Form fields not appearing
- Hard refresh the page (Ctrl+Shift+R)
- Check browser console for errors
- Verify form is marked as "Active" in admin panel

### Cannot edit fields
- Check "Editable at Levels" configuration
- Ensure you selected the correct role
- Verify the current level matches the editable level

### Form data not saving
- Check browser console for errors
- Verify backend logs for exceptions
- Ensure all required fields are filled

### Old data showing
- Clear browser cache
- Hard refresh (Ctrl+Shift+R)
- Check the cache-busting parameter in index.html

## Database Verification

To verify form data is being saved, you can check the H2 console:
1. Go to: http://localhost:8080/h2-console
2. JDBC URL: jdbc:h2:mem:workflowdb
3. Username: sa
4. Password: (leave empty)
5. Run query:
```sql
SELECT * FROM form_data WHERE process_instance_id = 'YOUR_PROCESS_ID';
```

## Key Features Implemented

✅ Form Builder UI in Admin Panel
✅ Dynamic form selection at request creation
✅ Form fields render based on level visibility
✅ Progressive data collection (each level adds data)
✅ Read-only display of previous level data
✅ Form data persistence in database
✅ Form integration with workflow approval process
✅ Support for all field types (TEXT, NUMBER, DATE, DROPDOWN, RADIO, CHECKBOX, TEXTAREA, EMAIL)
✅ Field validation (required fields)
✅ Level-based editability control

## Next Steps (Optional Enhancements)

- Add form data export functionality
- Add form templates/cloning
- Add conditional field visibility (show field X only if field Y = value)
- Add field validation rules (min/max, regex patterns)
- Add file upload field type
- Add form versioning
- Add form preview in admin panel
