# 🎯 How to Access and Use the Unified Admin Panel

## ✅ Application is Running!

The application has been cleaned, compiled, and started successfully.

---

## 🌐 Access the Admin Panel

### URL:
```
http://localhost:8080/admin.html
```

### What You'll See:
A **single unified page** with:
1. **Add New Level Form** (at the top)
2. **Current Workflow Levels** (cards showing each level with RBAC permissions)
3. **Workflow Flow Diagram** (visual representation)
4. **Quick Guide** (permission reference)

---

## 📋 How It Works Now

### Single Unified View
- **NO MORE TABS!** Everything is on one page
- Each workflow level card shows:
  - Workflow configuration (Order, Role, Next Level)
  - RBAC permissions (inline with badges)
  - Edit and Delete buttons
- Add/Edit form includes both workflow AND RBAC fields

---

## ➕ Adding a New Level (e.g., Level 4)

### Step 1: Fill the Form
At the top of the page, fill in:

**Workflow Fields:**
- **Level Order**: `4`
- **Level Name**: `Level 4 - Final Review`
- **Role**: `ROLE_LEVEL4`
- **Next Level**: (leave empty if final level)
- **Query Return**: `1`
- **Enabled**: ✓ (checked)

**RBAC Fields:**
- **Description**: `Level 4 Approver - Final review with admin access`
- **Permissions**: Check the boxes you want:
  - For middle level: APPROVE, QUERY, EDIT, VIEW
  - For final level: All permissions
- **Mark as Final Level**: ✓ (check if this is the last level)

### Step 2: Click "Add Level"
- Both workflow level AND RBAC role are created together
- You'll see a success message
- The new level appears in the list below

### Step 3: Update Previous Level
If you added a new level between existing levels:
1. Find the previous level card (e.g., Level 3)
2. Click **Edit** button
3. Change **Next Level** to `4`
4. Click **Update Level**

---

## ✏️ Editing a Level

### How to Edit:
1. Find the level card you want to edit
2. Click the **✏️ Edit** button
3. The form at the top fills with current values
4. Make your changes (workflow or permissions)
5. Click **💾 Update Level**

### What You Can Edit:
- Level name
- Next level routing
- Permissions (add/remove)
- Final level status
- Enable/disable the level

---

## 🗑️ Deleting a Level

### How to Delete:
1. Find the level card
2. Click the **🗑️ Delete** button
3. Confirm the deletion
4. Both workflow level AND RBAC role are deleted together

**Warning**: This action cannot be undone!

---

## 🎨 Visual Features

### Level Cards Show:
- **Blue left border**: Regular level
- **Red left border**: Final level (admin)
- **Red "FINAL LEVEL" badge**: Indicates admin permissions
- **Gray "DISABLED" badge**: Level is disabled

### Permission Badges:
- **Green badges**: Permissions the level HAS
- **Gray faded badges**: Permissions the level DOESN'T have
- **Red badges with 🔑**: Admin permissions (DELETE, VIEW ALL, MANAGE)

---

## 📊 Example: Current Default Setup

When you open the page, you'll see 3 levels:

### Level 1 - Initial Review
- **Workflow**: Order 1, ROLE_LEVEL1, Next: 2
- **Permissions**: CREATE ✓, VIEW ✓ (only these two)

### Level 2 - Manager Approval
- **Workflow**: Order 2, ROLE_LEVEL2, Next: 3
- **Permissions**: APPROVE ✓, QUERY ✓, EDIT ✓, VIEW ✓

### Level 3 - Director Approval (FINAL LEVEL)
- **Workflow**: Order 3, ROLE_LEVEL3, Next: Final
- **Permissions**: All permissions including 🔑 DELETE, 🔑 VIEW ALL, 🔑 MANAGE

---

## 🔄 Complete Workflow Example

### Scenario: Add Level 4 as new final level

#### Step 1: Add Level 4
```
Level Order: 4
Level Name: Level 4 - Executive Approval
Role: ROLE_LEVEL4
Next Level: (empty)
Query Return: 1
Description: Executive final approval with full admin access
Permissions: ✓ All (check all boxes)
Mark as Final Level: ✓
```
Click **Add Level**

#### Step 2: Edit Level 3
1. Find "Level 3 - Director Approval" card
2. Click **Edit**
3. Change **Next Level** from empty to `4`
4. **Uncheck** "Mark as Final Level"
5. **Uncheck** admin permissions (DELETE, VIEW ALL, MANAGE)
6. Click **Update Level**

#### Step 3: Test
1. Go to http://localhost:8080
2. Create a new request
3. Approve through Level 2, 3, 4
4. Material ID generated after Level 4 approval

---

## 🎯 Key Differences from Before

### Before (Old Design):
- ❌ Two separate tabs (Workflow Levels | RBAC Permissions)
- ❌ Had to switch between tabs
- ❌ Workflow and RBAC managed separately

### Now (New Design):
- ✅ Single unified page
- ✅ Everything visible at once
- ✅ Workflow and RBAC managed together
- ✅ Each level card shows complete information
- ✅ Add/Edit form handles both workflow and permissions

---

## 🔍 What Each Section Does

### 1. Add New Level Form (Top)
- Create new levels with workflow + RBAC in one go
- Edit existing levels (click Edit on any card)
- All fields in one place

### 2. Current Workflow Levels (Middle)
- Cards showing each level
- Inline display of permissions
- Quick Edit/Delete actions

### 3. Workflow Flow Diagram (Bottom)
- Visual representation of approval flow
- Shows the sequence: Level 1 → Level 2 → Level 3 → Material ID

### 4. Quick Guide (Bottom)
- Reference for permission structure
- Shows what each level type should have

---

## 💡 Tips

1. **Always hard refresh** after changes: `Ctrl + Shift + R`
2. **Only one final level** - system enforces this
3. **Level 1 should only CREATE and VIEW** - separation of duties
4. **Middle levels should APPROVE, QUERY, EDIT, VIEW**
5. **Final level gets all permissions** including admin powers

---

## 🚨 Troubleshooting

### Page shows old design with tabs?
- Hard refresh: `Ctrl + Shift + R`
- Clear browser cache
- Try incognito mode

### Changes not saving?
- Check browser console (F12) for errors
- Verify application is running
- Check that all required fields are filled

### Permissions not showing?
- Refresh the page
- Check H2 Console: http://localhost:8080/h2-console
- Query: `SELECT * FROM role`

---

## 📱 Navigation

- **Main Workflow Page**: http://localhost:8080
- **Admin Panel**: http://localhost:8080/admin.html
- **Camunda Cockpit**: http://localhost:8080/camunda (admin/admin)
- **H2 Console**: http://localhost:8080/h2-console (jdbc:h2:mem:workflowdb, sa, no password)

---

## ✅ Summary

**Access**: http://localhost:8080/admin.html

**Features**:
- ✅ Single unified page (no tabs)
- ✅ Add/Edit levels with workflow + RBAC together
- ✅ Visual cards showing complete level information
- ✅ Inline permission badges
- ✅ Easy Edit/Delete actions
- ✅ Workflow diagram
- ✅ Quick reference guide

**Ready to use!** 🎉
