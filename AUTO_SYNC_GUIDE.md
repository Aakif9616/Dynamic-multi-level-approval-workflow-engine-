# 🔄 Auto-Sync Workflow & RBAC System

## ✅ What Changed

### Before (Old System):
- ❌ Had to manually create workflow levels AND RBAC roles separately
- ❌ Could have 5 workflow levels but only 3 RBAC roles (mismatch!)
- ❌ Had to remember to sync them manually

### Now (New System):
- ✅ **Auto-sync**: RBAC roles automatically created/updated/deleted with workflow levels
- ✅ **Always in sync**: 5 workflow levels = 5 RBAC roles automatically
- ✅ **Default permissions**: System assigns appropriate permissions based on level
- ✅ **Customize later**: Edit permissions in RBAC tab without affecting workflow

---

## 🌐 How to Access

```
http://localhost:8080/admin.html
```

You'll see **TWO TABS**:

### Tab 1: 📋 Workflow Levels
- Add/edit/delete workflow levels
- RBAC roles auto-created with default permissions
- Shows current permissions for each level

### Tab 2: 🔐 RBAC Permissions
- View all roles (auto-synced from workflow)
- Edit permissions only (no add/delete buttons)
- Customize permissions for each role

---

## ➕ Adding a New Level

### Example: Add Level 4

1. **Go to Workflow Levels tab**
2. **Fill the form**:
   ```
   Level Order: 4
   Level Name: Level 4 - Executive Approval
   Role: ROLE_LEVEL4
   Next Level: (empty if final level)
   Query Return: 1
   Enabled: ✓
   ```
3. **Click "Add Level"**

### What Happens Automatically:
✅ Workflow level created
✅ RBAC role `ROLE_LEVEL4` auto-created
✅ Default permissions assigned:
   - If Level 1: CREATE_REQUEST, VIEW_REQUEST
   - If Level 2+: APPROVE_TASK, QUERY_TASK, EDIT_REQUEST, VIEW_REQUEST
   - If Final Level: All above + DELETE_REQUEST, VIEW_ALL_REQUESTS, MANAGE_LEVELS

---

## ✏️ Editing a Level

### Scenario: Change Level 3 from final to middle level

1. **Go to Workflow Levels tab**
2. **Click "Edit" on Level 3**
3. **Change "Next Level"** from empty to `4`
4. **Click "Update Level"**

### What Happens Automatically:
✅ Workflow level updated
✅ RBAC role auto-updated
✅ Admin permissions removed (DELETE, VIEW_ALL, MANAGE)
✅ Keeps approver permissions (APPROVE, QUERY, EDIT, VIEW)

---

## 🗑️ Deleting a Level

### Example: Delete Level 5

1. **Go to Workflow Levels tab**
2. **Click "Delete" on Level 5**
3. **Confirm deletion**

### What Happens Automatically:
✅ Workflow level deleted
✅ RBAC role `ROLE_LEVEL5` auto-deleted
✅ No orphaned roles left in database

---

## 🔐 Customizing Permissions

### Scenario: Give Level 2 additional permissions

1. **Go to RBAC Permissions tab**
2. **Find Level 2 (ROLE_LEVEL2)**
3. **Click "Edit Permissions"**
4. **Check/uncheck permissions** as needed
5. **Click "Save Permissions"**

### What You Can Do:
✅ Add or remove any permission
✅ Customize for specific business needs
✅ Changes don't affect workflow routing

### What You CANNOT Do:
❌ Add new roles manually (use Workflow tab)
❌ Delete roles manually (use Workflow tab)
❌ Change role name (edit in Workflow tab)

---

## 📊 Default Permission Structure

### Level 1 (Creator):
```
✓ CREATE_REQUEST
✓ VIEW_REQUEST
```
**Purpose**: Create requests, cannot approve own requests

### Levels 2+ (Approvers):
```
✓ APPROVE_TASK
✓ QUERY_TASK
✓ EDIT_REQUEST
✓ VIEW_REQUEST
```
**Purpose**: Approve, query, edit requests

### Final Level (Admin):
```
✓ APPROVE_TASK
✓ QUERY_TASK
✓ EDIT_REQUEST
✓ VIEW_REQUEST
✓ DELETE_REQUEST 🔑
✓ VIEW_ALL_REQUESTS 🔑
✓ MANAGE_LEVELS 🔑
```
**Purpose**: All approver permissions + admin powers

---

## 🔄 How Auto-Sync Works

### When You Add a Workflow Level:
```
1. You fill form in Workflow tab
2. Click "Add Level"
3. Backend creates workflow level
4. Backend automatically creates RBAC role
5. Backend assigns default permissions
6. Both tabs refresh automatically
```

### When You Update a Workflow Level:
```
1. You edit level in Workflow tab
2. Click "Update Level"
3. Backend updates workflow level
4. Backend automatically updates RBAC role
5. If final level status changed:
   - Became final → Add admin permissions
   - No longer final → Remove admin permissions
6. Both tabs refresh automatically
```

### When You Delete a Workflow Level:
```
1. You click "Delete" in Workflow tab
2. Confirm deletion
3. Backend deletes workflow level
4. Backend automatically deletes RBAC role
5. Both tabs refresh automatically
```

---

## 🎯 Complete Example

### Scenario: Expand from 3 levels to 5 levels

#### Current State:
- Level 1 → Level 2 → Level 3 (Final)

#### Goal:
- Level 1 → Level 2 → Level 3 → Level 4 → Level 5 (Final)

#### Steps:

**Step 1: Add Level 4**
1. Workflow tab → Fill form:
   - Order: 4, Name: Level 4 - Review, Role: ROLE_LEVEL4
   - Next Level: (empty for now)
2. Click "Add Level"
3. ✅ ROLE_LEVEL4 auto-created with approver permissions

**Step 2: Add Level 5**
1. Workflow tab → Fill form:
   - Order: 5, Name: Level 5 - Final, Role: ROLE_LEVEL5
   - Next Level: (empty - this is final)
2. Click "Add Level"
3. ✅ ROLE_LEVEL5 auto-created with admin permissions

**Step 3: Update Level 3**
1. Workflow tab → Edit Level 3
2. Change Next Level from empty to `4`
3. Click "Update Level"
4. ✅ ROLE_LEVEL3 auto-updated (admin permissions removed)

**Step 4: Update Level 4**
1. Workflow tab → Edit Level 4
2. Change Next Level from empty to `5`
3. Click "Update Level"
4. ✅ ROLE_LEVEL4 auto-updated

**Step 5: Verify**
1. Go to RBAC Permissions tab
2. See all 5 roles with correct permissions
3. Level 5 has admin permissions (🔑 badges)

**Step 6: Customize (Optional)**
1. RBAC tab → Edit permissions for any level
2. Add/remove permissions as needed
3. Save

---

## 💡 Key Points

### Always in Sync
- **5 workflow levels = 5 RBAC roles** automatically
- No more mismatches!
- No manual sync needed

### Smart Defaults
- System assigns appropriate permissions based on:
  - Level order (1 vs 2+)
  - Final level status (has next level or not)

### Flexible Customization
- Default permissions are just starting points
- Customize in RBAC tab anytime
- Changes don't break workflow routing

### Single Source of Truth
- Workflow tab is the master
- RBAC roles follow workflow levels
- Delete in workflow = delete in RBAC

---

## 🚨 Important Notes

### DO in Workflow Tab:
✅ Add new levels
✅ Edit level configuration
✅ Delete levels
✅ Change final level status

### DO in RBAC Tab:
✅ View all roles and permissions
✅ Edit permissions for any role
✅ Customize for business needs

### DON'T in RBAC Tab:
❌ Try to add new roles (use Workflow tab)
❌ Try to delete roles (use Workflow tab)
❌ Expect to see "Add Role" button (it's not there!)

---

## 🔍 How Permissions Are Used

### During Workflow Execution:

When a user tries to perform an action, the system checks their role's permissions:

```java
// Example: User with ROLE_LEVEL2 tries to approve
1. System finds ROLE_LEVEL2 in database
2. Checks if APPROVE_TASK permission exists
3. If yes → Allow approval
4. If no → Deny with error message
```

### Permission Checks:
- **CREATE_REQUEST**: Can create new workflow requests
- **APPROVE_TASK**: Can approve/reject tasks
- **QUERY_TASK**: Can raise queries to Level 1
- **EDIT_REQUEST**: Can edit request details
- **VIEW_REQUEST**: Can view request information
- **DELETE_REQUEST** 🔑: Can delete requests (admin)
- **VIEW_ALL_REQUESTS** 🔑: Can see all requests (admin)
- **MANAGE_LEVELS** 🔑: Can manage workflow config (admin)

---

## ✅ Summary

**Access**: http://localhost:8080/admin.html

**Workflow Tab**:
- Add/edit/delete levels
- RBAC auto-syncs

**RBAC Tab**:
- View roles
- Edit permissions only

**Auto-Sync**:
- Always in sync
- Smart defaults
- Flexible customization

**Ready to use!** 🎉
