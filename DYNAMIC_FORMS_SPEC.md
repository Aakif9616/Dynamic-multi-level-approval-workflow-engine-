# 📝 Dynamic Forms Specification

## Overview

Implement a dynamic form builder system where each workflow can have a customizable form that flows through all approval levels with level-specific field visibility and editability.

## Core Concept

```
Level 1 creates request → Fills Form Fields (A, B, C)
         ↓
Level 2 approves → Sees Fields (A, B, C) + Can add Fields (D, E)
         ↓
Level 3 approves → Sees Fields (A, B, C, D, E) + Can add Field (F)
         ↓
All data persists in ONE form throughout the workflow
```

## Key Features

### 1. Form Builder (Admin Panel)
- Create forms with multiple fields
- Drag-and-drop field ordering
- Configure field types (text, number, dropdown, date, etc.)
- Set field properties (required, placeholder, help text)
- Define level visibility rules
- Define level editability rules

### 2. Field Types
- **TEXT**: Single-line text input
- **TEXTAREA**: Multi-line text input
- **NUMBER**: Numeric input
- **EMAIL**: Email validation
- **DATE**: Date picker
- **DROPDOWN**: Select from options
- **RADIO**: Radio button selection
- **CHECKBOX**: Multiple checkboxes
- **FILE**: File upload

### 3. Level-Based Rules

#### Visibility Rules
- Configure which levels can SEE each field
- Example: Field "Budget" visible at levels 2,3,4,5
- Hidden fields don't appear in the form

#### Editability Rules
- Configure which levels can EDIT each field
- Example: Field "Requester Name" editable only at level 1
- Non-editable fields show as read-only

### 4. Data Flow

```
Request Created (Level 1):
- Form ID: 1
- Process Instance: abc-123
- Fields filled: Name, Product, Description
- Data saved to form_data table

Approved to Level 2:
- Same Form ID: 1
- Same Process Instance: abc-123
- Sees: Name (read-only), Product (read-only), Description (read-only)
- Can fill: Budget, Quantity (new fields visible at Level 2)
- Data appended to form_data table

Approved to Level 3:
- Same Form ID: 1
- Same Process Instance: abc-123
- Sees all previous fields
- Can fill: Approval Comments (new field visible at Level 3)
- Data appended to form_data table
```

## Database Schema

### forms table
```sql
id BIGINT PRIMARY KEY
form_name VARCHAR(255) NOT NULL
description VARCHAR(1000)
active BOOLEAN DEFAULT TRUE
created_at TIMESTAMP
updated_at TIMESTAMP
```

### form_fields table
```sql
id BIGINT PRIMARY KEY
form_id BIGINT FOREIGN KEY
field_name VARCHAR(255) NOT NULL
field_label VARCHAR(255) NOT NULL
field_type ENUM (TEXT, TEXTAREA, NUMBER, EMAIL, DATE, DROPDOWN, RADIO, CHECKBOX, FILE)
field_options TEXT (JSON for dropdown/radio/checkbox options)
display_order INT
required BOOLEAN DEFAULT FALSE
placeholder VARCHAR(500)
help_text VARCHAR(1000)
visible_at_levels VARCHAR(255) (e.g., "1,2,3,4,5")
editable_at_levels VARCHAR(255) (e.g., "1,2")
active BOOLEAN DEFAULT TRUE
```

### form_data table
```sql
id BIGINT PRIMARY KEY
process_instance_id VARCHAR(255) NOT NULL
form_id BIGINT FOREIGN KEY
field_id BIGINT FOREIGN KEY
field_value TEXT
entered_at_level INT
entered_by VARCHAR(255) (role name)
entered_at TIMESTAMP
updated_at TIMESTAMP
```

## API Endpoints

### Form Management (Admin)
```
GET    /api/forms                    - List all forms
POST   /api/forms                    - Create form
GET    /api/forms/{id}               - Get form details
PUT    /api/forms/{id}               - Update form
DELETE /api/forms/{id}               - Delete form

POST   /api/forms/{id}/fields        - Add field to form
PUT    /api/forms/{id}/fields/{fid}  - Update field
DELETE /api/forms/{id}/fields/{fid}  - Delete field
POST   /api/forms/{id}/fields/reorder - Reorder fields
```

### Form Rendering (Workflow)
```
GET    /api/forms/{id}/render?level={level}&processInstanceId={pid}
       - Get form with fields filtered by level
       - Includes existing data if processInstanceId provided
       - Marks fields as editable/read-only based on level

POST   /api/forms/submit
       - Submit form data
       - Validates required fields
       - Saves to form_data table
```

## UI Components

### Admin Panel - Form Builder Tab
```
Admin Panel
├── Workflow Levels (existing)
├── RBAC Permissions (existing)
└── Form Builder (NEW)
    ├── Form List
    ├── Create/Edit Form
    └── Field Configuration
        ├── Add Field
        ├── Field Properties
        ├── Level Visibility
        └── Level Editability
```

### Workflow UI - Dynamic Form
```
Create Request Page
├── Select Form (dropdown)
└── Render Form Fields
    ├── Show fields visible at Level 1
    ├── Show fields editable at Level 1
    └── Submit button

Approval Page
├── Show all previous data (read-only)
├── Show new fields editable at current level
└── Approve/Reject/Query buttons
```

## Example Configuration

### Form: "Material Request Form"

#### Field 1: Requester Name
- Type: TEXT
- Required: Yes
- Visible at: 1,2,3,4,5
- Editable at: 1
- Purpose: Level 1 enters, all levels see (read-only)

#### Field 2: Product Name
- Type: TEXT
- Required: Yes
- Visible at: 1,2,3,4,5
- Editable at: 1
- Purpose: Level 1 enters, all levels see (read-only)

#### Field 3: Quantity
- Type: NUMBER
- Required: Yes
- Visible at: 1,2,3,4,5
- Editable at: 1,2
- Purpose: Level 1 enters, Level 2 can modify

#### Field 4: Budget Approval
- Type: DROPDOWN (Approved/Rejected/Pending)
- Required: No
- Visible at: 2,3,4,5
- Editable at: 2
- Purpose: Only Level 2 sees and fills this

#### Field 5: Final Comments
- Type: TEXTAREA
- Required: No
- Visible at: 3,4,5
- Editable at: 3,4,5
- Purpose: Level 3+ can add comments

## Workflow Integration

### Modified WorkflowRequestDTO
```java
@Data
public class WorkflowRequestDTO {
    private String requester;
    private String productName;
    private String description;
    private Long formId;              // NEW: Which form to use
    private Map<Long, String> formData; // NEW: Field values
}
```

### Modified Task Display
```javascript
// When loading task
1. Get process instance ID
2. Get form ID from process variables
3. Get current level
4. Call /api/forms/{id}/render?level={level}&processInstanceId={pid}
5. Render form with:
   - Previous data (read-only)
   - New fields (editable)
6. On submit:
   - Validate required fields
   - Save form data
   - Complete task
```

## Implementation Phases

### Phase 1: Backend Foundation ✅ (DONE)
- [x] Create entities (Form, FormField, FormData, FieldType)
- [x] Create repositories
- [x] Create DTOs

### Phase 2: Form Management API
- [ ] FormService - CRUD operations
- [ ] FormController - REST endpoints
- [ ] Field validation logic
- [ ] Level filtering logic

### Phase 3: Admin UI - Form Builder
- [ ] Form list page
- [ ] Form create/edit page
- [ ] Field configuration UI
- [ ] Level visibility/editability UI
- [ ] Drag-and-drop field ordering

### Phase 4: Workflow Integration
- [ ] Modify WorkflowService to handle forms
- [ ] Update WorkflowRequestDTO
- [ ] Form rendering API
- [ ] Form submission API

### Phase 5: Frontend - Dynamic Form Rendering
- [ ] Form selector in create request
- [ ] Dynamic form renderer
- [ ] Field type components
- [ ] Validation
- [ ] Read-only field display

### Phase 6: Testing & Polish
- [ ] Test all field types
- [ ] Test level visibility rules
- [ ] Test data persistence
- [ ] Test workflow integration
- [ ] Documentation

## Benefits

1. **Flexibility**: Add/remove fields without code changes
2. **Level Control**: Each level sees only relevant fields
3. **Data Integrity**: All data in one form, no duplication
4. **Audit Trail**: Track who entered what at which level
5. **Scalability**: Works with any number of levels

## Next Steps

1. Review this specification
2. Confirm requirements
3. Proceed with Phase 2 implementation
4. Build incrementally with testing

---

**Status**: Phase 1 Complete (Entities, Repositories, DTOs created)
**Next**: Implement FormService and FormController (Phase 2)
