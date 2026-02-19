# 🚀 Quick Start Guide

## Start the Application

```bash
mvn spring-boot:run
```

Wait for: `Started WorkflowApplication in X seconds`

---

## Access Points

| Page | URL | Purpose |
|------|-----|---------|
| **Main Workflow** | http://localhost:8080 | Create requests, approve tasks |
| **Admin Panel** | http://localhost:8080/admin.html | Manage levels & RBAC |
| **Camunda Cockpit** | http://localhost:8080/camunda | View process details |
| **H2 Console** | http://localhost:8080/h2-console | Database access |

---

## Admin Panel - Two Tabs

### Tab 1: 📋 Workflow Levels
- Add/edit approval levels
- Configure routing
- View workflow diagram

### Tab 2: 🔐 RBAC Permissions
- Add/edit roles
- Manage permissions
- Set final level

---

## Add a New Level (e.g., Level 4)

### 1. Add Workflow Level
- Go to: http://localhost:8080/admin.html
- Tab: **Workflow Levels**
- Fill form:
  - Level Order: `4`
  - Level Name: `Level 4 - Final Review`
  - Role: `ROLE_LEVEL4`
  - Next Level: (empty)
  - Query Return Level: `1`
- Click: **Add Level**

### 2. Create RBAC Role
- Tab: **RBAC Permissions**
- Click: **➕ Add New Role**
- Fill modal:
  - Role Name: `ROLE_LEVEL4`
  - Level Order: `4`
  - Description: `Level 4 Approver`
  - Check: **Mark as Final Level** (if last level)
  - Select: All permissions (if final) or approver permissions
- Click: **Save Role**

### 3. Update Previous Level
- Tab: **Workflow Levels**
- Edit: Level 3
- Set: Next Level = `4`
- Click: **Update Level**

### 4. Test
- Go to: http://localhost:8080
- Create a request
- Approve through all levels
- Verify Level 4 receives task

---

## Default Configuration

### Levels
- **Level 1**: Creator (ROLE_LEVEL1)
- **Level 2**: Approver (ROLE_LEVEL2)
- **Level 3**: Final/Admin (ROLE_LEVEL3)

### Permissions
- **Level 1**: CREATE, VIEW only
- **Level 2**: APPROVE, QUERY, EDIT, VIEW
- **Level 3**: All permissions (admin)

---

## Common Tasks

### Create a Request
1. Go to http://localhost:8080
2. Fill form: Requester, Product Name, Description
3. Click: **Create Request**

### Approve a Task
1. Select role: ROLE_LEVEL2 (or ROLE_LEVEL3)
2. Click: **Load Tasks**
3. Click: **View Details**
4. Select: **Approve**
5. Add comments
6. Click: **Submit**

### Raise a Query
1. Load task (any level except Level 1)
2. Select: **Raise Query**
3. Enter question
4. Submit
5. Level 1 receives query
6. Level 1 responds
7. Response returns to originating level

### Reject a Request
1. Load task (any level except Level 1)
2. Select: **Reject**
3. Add comments
4. Submit
5. Level 1 receives rejection
6. Level 1 can resubmit or cancel

---

## Important Notes

### Browser Cache
**Always use Ctrl+Shift+R** after changes!

### Database
Resets on restart (H2 in-memory mode)

### Workflow Changes
Affect NEW requests only

### Final Level
Only ONE level can be final

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Changes not visible | Hard refresh: Ctrl+Shift+R |
| Tasks not showing | Verify role name matches exactly |
| RBAC not loading | Check browser console (F12) |
| Database issues | Check H2 Console |
| Process stuck | Check Camunda Cockpit |

---

## Documentation

- **README.md** - Complete documentation
- **ADMIN_PANEL_GUIDE.md** - Detailed admin guide
- **INTEGRATION_COMPLETE.md** - Integration details

---

## Default Credentials

### Camunda Cockpit
- Username: `admin`
- Password: `admin`

### H2 Console
- JDBC URL: `jdbc:h2:mem:workflowdb`
- Username: `sa`
- Password: (empty)

---

## Need Help?

1. Check README.md for detailed docs
2. Check browser console (F12) for errors
3. Check H2 Console for database state
4. Check Camunda Cockpit for process state
5. Check application logs in terminal

---

**Ready to go!** 🎉

Start with: `mvn spring-boot:run`
Then open: http://localhost:8080/admin.html
