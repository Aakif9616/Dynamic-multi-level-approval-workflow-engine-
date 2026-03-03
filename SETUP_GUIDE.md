# Quick Setup Guide

## Prerequisites Installation

### 1. Install Java 17
- Download from [Oracle](https://www.oracle.com/java/technologies/downloads/#java17) or [OpenJDK](https://adoptium.net/)
- Verify: `java -version`

### 2. Install Maven
- Download from [maven.apache.org](https://maven.apache.org/download.cgi)
- Add to PATH
- Verify: `mvn -version`

### 3. Install PostgreSQL
- Download from [postgresql.org](https://www.postgresql.org/download/)
- During installation:
  - Set password for postgres user (remember this!)
  - Default port: 5432
  - Install pgAdmin 4 (included)

## Database Setup (5 minutes)

### Step 1: Create Database
1. Open **pgAdmin 4**
2. Connect to PostgreSQL (enter your password)
3. Right-click **Databases** → **Create** → **Database**
4. Name: `workflow_db`
5. Owner: `postgres`
6. Click **Save**

### Step 2: Configure Application
1. Open `src/main/resources/application.yml`
2. Update password if different from `admin123`:
```yaml
spring:
  datasource:
    password: YOUR_POSTGRES_PASSWORD
```

## Run Application (2 minutes)

### Step 1: Build
```bash
mvn clean install
```

### Step 2: Run
```bash
mvn spring-boot:run
```

### Step 3: Verify
- Application starts on: http://localhost:8080
- Check logs for: "Started WorkflowApplication"

### Step 4: Verify Database Tables
1. Open **pgAdmin 4**
2. Navigate: `workflow_db → Schemas → public → Tables`
3. Right-click **Tables** → **Refresh**
4. You should see 9+ tables (form, form_field, form_data, form_instance, etc.)

## First Time Usage (10 minutes)

### 1. Access Admin Panel
- Go to: http://localhost:8080/admin.html

### 2. Create Workflow Levels
1. Click **Workflow Levels** tab
2. Add Level 1:
   - Name: "Level 1"
   - Role: "ROLE_LEVEL1" (auto-filled)
   - Click **Add Level**
3. Add Level 2:
   - Name: "Level 2"
   - Role: "ROLE_LEVEL2"
   - Click **Add Level**
4. Add Level 3:
   - Name: "Final Approver"
   - Role: "ROLE_LEVEL3"
   - Check **Is Final Level**
   - Click **Add Level**

### 3. Create a Form
1. Click **Form Builder** tab
2. Click **Create New Form**
3. Form Name: "Material Request"
4. Add fields:
   - **Field 1**: Label="Material Name", Type="TEXT", Required=Yes
   - **Field 2**: Label="Quantity", Type="NUMBER", Required=Yes
   - **Field 3**: Label="Description", Type="TEXTAREA"
5. For each field, check all levels for **Visible** and **Editable**
6. Click **Save Form**
7. Click **Activate** button

### 4. Submit First Request
1. Go to: http://localhost:8080
2. Select "Material Request" from dropdown
3. Fill in:
   - Material Name: "Test Material"
   - Quantity: 100
   - Description: "Testing workflow"
4. Click **Submit Request**
5. Note the **Form Instance ID** (e.g., FI-20240303-0001)

### 5. Process Approval
1. Go to: http://localhost:8080/camunda
2. Login: `admin` / `admin`
3. Click **Tasklist**
4. Select role: **ROLE_LEVEL2**
5. Click on the task
6. Click **Approve**
7. Repeat for **ROLE_LEVEL3** (Final Level)

### 6. Verify Material ID Generated
1. Open **pgAdmin 4**
2. Right-click `workflow_db` → **Query Tool**
3. Run:
```sql
SELECT form_instance_id, material_id, status 
FROM form_instance 
WHERE status = 'COMPLETED';
```
4. You should see Material ID: **MAT-FI-20240303-0001**

## Accessing Tables in pgAdmin

### Navigation Path
```
pgAdmin 4
└── Servers
    └── PostgreSQL 16
        └── Databases
            └── workflow_db
                └── Schemas
                    └── public
                        └── Tables
```

### View Data
**Right-click any table** → **View/Edit Data** → **All Rows**

### Useful Queries
```sql
-- View all form instances
SELECT * FROM form_instance ORDER BY created_at DESC;

-- View workflow levels
SELECT * FROM workflow_level ORDER BY level_order;

-- View all forms
SELECT * FROM form WHERE is_active = true;

-- View form data with instance ID
SELECT fd.*, fi.form_instance_id 
FROM form_data fd
JOIN form_instance fi ON fd.form_instance_id = fi.form_instance_id;
```

## Troubleshooting

### Application won't start
- **Error**: "database workflow_db does not exist"
  - **Fix**: Create database in pgAdmin (see Database Setup)

- **Error**: "password authentication failed"
  - **Fix**: Update password in `application.yml`

### Can't see tables
- **Fix**: Right-click Tables → Refresh in pgAdmin

### Port 8080 already in use
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

### Browser shows old data
- **Fix**: Hard refresh (Ctrl + Shift + R)

## Key Concepts

### Form Instance ID
- Unique ID for each form submission
- Format: FI-YYYYMMDD-NNNN
- **Never changes** throughout workflow
- Like a tracking number

### Material ID
- Generated when workflow completes
- Format: MAT-FI-YYYYMMDD-NNNN
- Based on Form Instance ID

### Data Persistence
- All data saved in PostgreSQL
- Survives application restarts
- Can be queried in pgAdmin

## Next Steps

1. ✅ Explore the Admin Panel
2. ✅ Create more complex forms with different field types
3. ✅ Test query and rejection flows
4. ✅ View data in pgAdmin tables
5. ✅ Customize workflow levels for your use case

## Support

- Check README.md for detailed documentation
- Review API endpoints in README
- Check logs for errors
- Query database in pgAdmin to verify data

---

**You're all set! Start building your workflows.** 🚀
