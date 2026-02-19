# Admin Panel - Quick Access Guide

## How to Access

1. **Start the application**:
   ```bash
   mvn spring-boot:run
   ```

2. **Open Admin Panel**:
   - URL: http://localhost:8080/admin.html
   - Or click "Admin Panel" button from the main workflow page

## Admin Panel Features

The Admin Panel now has **TWO TABS** in a single unified interface:

### 📋 Tab 1: Workflow Levels

**Purpose**: Configure the approval workflow structure

**What you can do**:
- Add new approval levels
- Edit existing levels
- Delete levels
- View workflow flow diagram
- Set level order, names, roles, and routing

**Example**: Add Level 4, Level 5, etc. as your workflow grows

---

### 🔐 Tab 2: RBAC Permissions

**Purpose**: Manage roles and permissions for all levels

**What you can do**:
- Create new roles for new levels
- Edit permissions for existing roles
- Delete roles
- Mark a level as "Final Level" (admin permissions)
- View permission legend

**Example**: When you add Level 4 in Workflow tab, create ROLE_LEVEL4 here with appropriate permissions

---

## Complete Workflow: Adding a New Level

### Step 1: Add Workflow Level
1. Go to **Workflow Levels** tab
2. Fill in the form:
   - Level Order: `4`
   - Level Name: `Level 4 - Final Review`
   - Role: `ROLE_LEVEL4`
   - Next Level: (empty if final)
   - Query Return Level: `1`
3. Click **Add Level**

### Step 2: Create RBAC Role
1. Switch to **RBAC Permissions** tab
2. Click **➕ Add New Role**
3. Fill in the modal:
   - Role Name: `ROLE_LEVEL4`
   - Level Order: `4`
   - Description: `Level 4 Approver - Final Review`
   - Check **Mark as Final Level** (if this is the last level)
   - Select permissions:
     - For middle levels: APPROVE_TASK, QUERY_TASK, EDIT_REQUEST, VIEW_REQUEST
     - For final level: All permissions
4. Click **Save Role**

### Step 3: Update Previous Level
1. Go back to **Workflow Levels** tab
2. Click **Edit** on Level 3
3. Change **Next Level** from empty to `4`
4. Click **Update Level**

### Step 4: Test
1. Go to main workflow page (http://localhost:8080)
2. Create a new request
3. Approve through levels 1, 2, 3
4. Verify Level 4 receives the task

---

## Permission Guidelines

### Level 1 (Creator)
- ✅ CREATE_REQUEST
- ✅ VIEW_REQUEST
- ❌ Cannot approve own requests

### Levels 2+ (Approvers)
- ✅ APPROVE_TASK
- ✅ QUERY_TASK
- ✅ EDIT_REQUEST
- ✅ VIEW_REQUEST
- ❌ Cannot create requests

### Final Level (Admin)
- ✅ All approver permissions
- ✅ DELETE_REQUEST
- ✅ VIEW_ALL_REQUESTS
- ✅ MANAGE_LEVELS

**Important**: Only ONE level can be marked as "Final Level"

---

## Navigation

- **From Main Page**: Click "Admin Panel" button in top navigation
- **From Admin Panel**: Click "Back to Workflow" to return to main page
- **Camunda Cockpit**: Click "Camunda Cockpit" to view process details (login: admin/admin)

---

## Key Changes from Previous Version

### ✅ What Changed
- RBAC management is now integrated into Admin Panel (Tab 2)
- Removed separate rbac.html page
- Single unified interface for all admin functions
- Removed RBAC button from navigation

### ✅ What Stayed the Same
- All RBAC functionality works exactly as before
- All API endpoints remain unchanged
- Database structure is identical
- Permission system works the same way

---

## Tips

1. **Always hard refresh** (Ctrl+Shift+R) after making changes
2. **Add workflow level first**, then create the RBAC role
3. **Only one final level** - system enforces this automatically
4. **Test with new requests** - existing processes use old configuration
5. **Check H2 Console** if you need to verify database state

---

## Quick Reference

| Action | Tab | Button/Link |
|--------|-----|-------------|
| Add approval level | Workflow Levels | Fill form → Add Level |
| Edit approval level | Workflow Levels | Edit button on level |
| Delete approval level | Workflow Levels | Delete button on level |
| Add RBAC role | RBAC Permissions | ➕ Add New Role |
| Edit RBAC role | RBAC Permissions | ✏️ Edit button |
| Delete RBAC role | RBAC Permissions | 🗑️ Delete button |
| View permissions guide | RBAC Permissions | Permission Legend section |

---

## Need Help?

- Check README.md for complete documentation
- Use H2 Console to inspect database: http://localhost:8080/h2-console
- Use Camunda Cockpit to debug processes: http://localhost:8080/camunda
- Check browser console for JavaScript errors (F12)
