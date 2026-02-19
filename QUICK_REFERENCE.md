# 🚀 Quick Reference Card

## Access URL
```
http://localhost:8080/admin.html
```

## What You'll See
**Single unified page** with:
- Add/Edit form (top)
- Level cards with permissions (middle)
- Workflow diagram (bottom)

## Add New Level (Quick Steps)

1. **Fill form**:
   - Level Order: `4`
   - Level Name: `Level 4 - Review`
   - Role: `ROLE_LEVEL4`
   - Next Level: (empty if final)
   - Permissions: Check boxes
   - Final Level: Check if last

2. **Click**: Add Level

3. **Update previous**: Edit Level 3 → Next Level = 4

4. **Test**: Create request → Approve through levels

## Edit Level
1. Click **✏️ Edit** on level card
2. Modify fields
3. Click **💾 Update Level**

## Delete Level
1. Click **🗑️ Delete** on level card
2. Confirm deletion

## Permission Guide

### Level 1 (Creator)
- ✓ CREATE_REQUEST
- ✓ VIEW_REQUEST

### Levels 2+ (Approvers)
- ✓ APPROVE_TASK
- ✓ QUERY_TASK
- ✓ EDIT_REQUEST
- ✓ VIEW_REQUEST

### Final Level (Admin)
- ✓ All approver permissions
- ✓ 🔑 DELETE_REQUEST
- ✓ 🔑 VIEW_ALL_REQUESTS
- ✓ 🔑 MANAGE_LEVELS

## Visual Indicators

### Badges
- **Green**: Has permission
- **Gray**: No permission
- **Red 🔑**: Admin permission

### Cards
- **Blue border**: Regular level
- **Red border**: Final level
- **"FINAL LEVEL" badge**: Admin status

## Important

- **Hard refresh**: Ctrl+Shift+R
- **Only one final level** allowed
- **Changes affect new requests** only
- **Database resets** on restart

## Other URLs

- Main: http://localhost:8080
- Camunda: http://localhost:8080/camunda (admin/admin)
- H2: http://localhost:8080/h2-console (sa, no password)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Old design showing | Ctrl+Shift+R |
| Not saving | Check console (F12) |
| No permissions | Refresh page |

---

**Ready!** Open http://localhost:8080/admin.html
