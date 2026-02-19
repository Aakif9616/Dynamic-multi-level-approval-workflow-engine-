# How to Access Forms - Quick Guide

## Your Questions Answered

### Q1: "Now the create request is not working, solve that"
**Status**: ✅ FIXED

**What was wrong**: Duplicate event listener in app.js was preventing form submission.

**What was fixed**:
- Removed duplicate event listener
- Fixed form data collection
- Added form rendering in task modals
- Integrated form submission with workflow

**How to test**:
1. Start app: `mvn spring-boot:run`
2. Go to: http://localhost:8080/
3. Select a form from dropdown (or use basic form)
4. Fill fields and click "Create Request"
5. Should see success message with Request ID

### Q2: "After creating the request, how to access the other levels and see the forms?"

**Answer**: Here's the complete flow:

#### Step 1: Create Request at Level 1
1. Go to http://localhost:8080/
2. Select form from "Select Form (Optional)" dropdown
3. Fill the fields that are editable at Level 1
4. Click "Create Request"
5. Note the Request ID from success message

#### Step 2: Access Level 2 Tasks
1. On the same page (http://localhost:8080/)
2. Look for "My Pending Tasks" section (right side)
3. In "Select Your Role" dropdown, choose "Level 2 Approver"
4. Click "Load Tasks" button
5. You'll see the pending task
6. Click "Open Task" button

#### Step 3: View and Edit Form at Level 2
When the task modal opens, you will see:
- **Task Details** at the top
- **Form Data** section showing:
  - Fields from Level 1 (read-only, already filled)
  - Fields editable at Level 2 (empty, you can fill them)
- **Comments** section
- **Action** dropdown (Approve/Reject/Query)

Fill the Level 2 fields and click "Submit" to approve.

#### Step 4: Continue Through Other Levels
Repeat the same process for each level:
1. Select "Level 3 Approver" from role dropdown
2. Click "Load Tasks"
3. Click "Open Task"
4. See all previous data (read-only) + Level 3 editable fields
5. Fill Level 3 fields and approve
6. Continue until final level

### Q3: "Where can I see the forms present?"

**Answer**: Forms are visible in multiple places:

#### In Admin Panel (Create/Edit Forms)
1. Go to: http://localhost:8080/admin.html
2. Click "Form Builder" tab
3. You'll see:
   - List of all forms (active and inactive)
   - "Create New Form" button
   - Edit/Delete buttons for each form
4. Click "Edit" on a form to:
   - See all fields
   - Add new fields
   - Edit existing fields
   - Configure visibility/editability per level

#### In Main Application (Use Forms)
1. Go to: http://localhost:8080/
2. In "Create New Request" section
3. Look for "Select Form (Optional)" dropdown
4. All active forms appear here
5. Select a form to see its fields

#### In Task Approval (View Form Data)
1. Go to: http://localhost:8080/
2. Select your role from dropdown
3. Click "Load Tasks"
4. Click "Open Task" on any task
5. If the request was created with a form, you'll see:
   - All form fields visible at your level
   - Previous level data (read-only)
   - Your level fields (editable)

### Q4: "If I created a form in Level 2, in Level 2 tasks the form fields should appear"

**Important Clarification**: 
- Forms are NOT created "in" a specific level
- Forms are created in the Admin Panel and apply to ALL levels
- What changes per level is which fields are VISIBLE and EDITABLE

**How it works**:
1. Create ONE form in Admin Panel
2. For each field, configure:
   - **Visible at Levels**: 1,2,3,4,5 (which levels can see this field)
   - **Editable at Levels**: 2 (which levels can edit this field)
3. When Level 2 opens a task:
   - They see ALL fields visible at Level 2
   - They can EDIT only fields editable at Level 2
   - They see data from Level 1 as read-only

**Example Configuration**:
```
Field: Product Name
- Visible at Levels: 1,2,3,4,5 (everyone sees it)
- Editable at Levels: 1 (only Level 1 can edit)

Field: Quantity
- Visible at Levels: 1,2,3,4,5 (everyone sees it)
- Editable at Levels: 2 (only Level 2 can edit)

Field: Budget
- Visible at Levels: 1,2,3,4,5 (everyone sees it)
- Editable at Levels: 3 (only Level 3 can edit)
```

**Result**:
- Level 1 creates request → fills Product Name
- Level 2 approves → sees Product Name (read-only), fills Quantity
- Level 3 approves → sees Product Name + Quantity (read-only), fills Budget
- Level 4 approves → sees all data (read-only), adds final comments

## Complete Access Map

### Admin Panel (http://localhost:8080/admin.html)
- **Workflow Levels Tab**: Manage approval levels
- **Form Builder Tab**: Create and manage forms
  - Create new forms
  - Add/edit/delete fields
  - Configure visibility/editability
  - Activate/deactivate forms

### Main Application (http://localhost:8080/)
- **Create Request Section** (left side):
  - Select form dropdown
  - Dynamic form fields appear
  - Create request button
  
- **My Pending Tasks Section** (right side):
  - Role selector dropdown
  - Load Tasks button
  - Task list with "Open Task" buttons
  
- **Task Modal** (popup when opening task):
  - Task details
  - Form fields (if request has form)
  - Comments
  - Action selector
  - Submit button

### Camunda Cockpit (http://localhost:8080/camunda)
- Login: admin/admin
- View running processes
- View process variables (including formId)
- Monitor workflow execution

### H2 Database Console (http://localhost:8080/h2-console)
- JDBC URL: jdbc:h2:mem:workflowdb
- Username: sa
- Password: (empty)
- View tables:
  - `form` - Form definitions
  - `form_field` - Field configurations
  - `form_data` - Submitted form data

## Quick Test Scenario

1. **Create Form** (Admin Panel):
   - Go to admin.html → Form Builder
   - Create "Test Form"
   - Add field "Name" (editable at Level 1)
   - Add field "Quantity" (editable at Level 2)

2. **Create Request** (Main App):
   - Go to index.html
   - Select "Test Form"
   - Fill "Name" field
   - Create request

3. **Level 2 Approval** (Main App):
   - Select "Level 2 Approver"
   - Load Tasks
   - Open Task
   - See "Name" (read-only)
   - Fill "Quantity" (editable)
   - Approve

4. **Level 3 Approval** (Main App):
   - Select "Level 3 Approver"
   - Load Tasks
   - Open Task
   - See "Name" and "Quantity" (both read-only)
   - Approve

## Troubleshooting

### Forms not appearing in dropdown
- Check if form is marked as "Active" in admin panel
- Hard refresh page (Ctrl+Shift+R)

### Form fields not showing in task
- Verify form was selected when creating request
- Check field visibility configuration
- Hard refresh page (Ctrl+Shift+R)

### Cannot edit fields
- Check "Editable at Levels" configuration
- Ensure you selected correct role
- Verify current level matches editable level

### Create request not working
- Check browser console for errors (F12)
- Verify all required fields are filled
- Try using basic form (don't select any form)

## Summary

✅ Forms are created in Admin Panel
✅ Forms are used in Main Application
✅ Same form flows through ALL levels
✅ Each level sees different fields based on configuration
✅ Each level can edit different fields based on configuration
✅ Data accumulates as request flows through levels
✅ All data is stored in database
