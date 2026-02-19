const API_BASE = '/api';
let allRoles = [];

// ==================== WORKFLOW LEVELS ====================

// Form submission handler
document.getElementById('levelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const levelId = document.getElementById('levelId').value;
    
    // Collect workflow level data
    const levelData = {
        levelOrder: parseInt(document.getElementById('levelOrder').value),
        levelName: document.getElementById('levelName').value,
        role: document.getElementById('role').value,
        nextLevel: document.getElementById('nextLevel').value ? 
            parseInt(document.getElementById('nextLevel').value) : null,
        queryReturnLevel: document.getElementById('queryReturnLevel').value ? 
            parseInt(document.getElementById('queryReturnLevel').value) : 1,
        enabled: document.getElementById('enabled').checked
    };
    
    try {
        // Save workflow level (RBAC role is auto-created/updated by backend)
        const levelUrl = levelId ? `${API_BASE}/admin/levels/${levelId}` : `${API_BASE}/admin/levels`;
        const levelMethod = levelId ? 'PUT' : 'POST';
        
        const levelResponse = await fetch(levelUrl, {
            method: levelMethod,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(levelData)
        });
        
        if (!levelResponse.ok) {
            throw new Error('Failed to save workflow level');
        }
        
        showResult(`${levelId ? 'Updated' : 'Created'} successfully! RBAC role auto-synced.`, 'success');
        resetForm();
        loadLevels();
        loadRoles(); // Refresh RBAC tab too
        
    } catch (error) {
        showResult(`Error: ${error.message}`, 'danger');
    }
});

// Load all levels with their RBAC permissions
async function loadLevels() {
    try {
        // Load workflow levels
        const levelsResponse = await fetch(`${API_BASE}/admin/levels`);
        const levels = await levelsResponse.json();
        
        // Load RBAC roles
        const rolesResponse = await fetch(`${API_BASE}/rbac/roles`);
        allRoles = await rolesResponse.json();
        
        if (!Array.isArray(levels)) {
            document.getElementById('levelsList').innerHTML = 
                '<div class="alert alert-warning">Invalid response from server</div>';
            return;
        }
        
        // Sort by level order
        levels.sort((a, b) => a.levelOrder - b.levelOrder);
        
        // Build unified view
        let html = '';
        levels.forEach(level => {
            const role = allRoles.find(r => r.roleName === level.role);
            const isFinal = role ? role.isFinalLevel : false;
            const permissions = role ? role.permissions : [];
            
            html += `
                <div class="card level-card ${isFinal ? 'final-level' : ''}">
                    <div class="level-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h5 class="mb-0">
                                    ${level.levelName}
                                    ${isFinal ? '<span class="badge bg-danger ms-2">FINAL LEVEL</span>' : ''}
                                    ${!level.enabled ? '<span class="badge bg-secondary ms-2">DISABLED</span>' : ''}
                                </h5>
                            </div>
                            <div>
                                <button class="btn btn-warning btn-sm" onclick="editLevel(${level.id})">
                                    ✏️ Edit
                                </button>
                                <button class="btn btn-danger btn-sm" onclick="deleteLevel(${level.id}, '${level.levelName}')">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Workflow Configuration:</h6>
                                <p class="mb-1"><strong>Order:</strong> ${level.levelOrder}</p>
                                <p class="mb-1"><strong>Role:</strong> <code>${level.role}</code></p>
                                <p class="mb-1"><strong>Next Level:</strong> ${level.nextLevel || 'Final (Material ID Generated)'}</p>
                                <p class="mb-1"><strong>Query Return:</strong> Level ${level.queryReturnLevel || 1}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>RBAC Permissions:</h6>
                                ${role ? renderPermissions(permissions) : '<span class="text-danger">⚠️ Role not found - will be auto-created</span>'}
                                ${role ? `<p class="mt-2 mb-0"><small class="text-muted">${permissions.length} permissions assigned</small></p>` : ''}
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        document.getElementById('levelsList').innerHTML = html || '<p class="text-center">No levels configured</p>';
        
        // Update workflow diagram
        visualizeWorkflow(levels.filter(l => l.enabled));
        
    } catch (error) {
        console.error('Error loading levels:', error);
        document.getElementById('levelsList').innerHTML = 
            `<div class="alert alert-danger">Error loading levels: ${error.message}</div>`;
    }
}

// Edit level
async function editLevel(id) {
    try {
        const levelsResponse = await fetch(`${API_BASE}/admin/levels`);
        const levels = await levelsResponse.json();
        const level = levels.find(l => l.id === id);
        
        if (!level) {
            alert('Level not found');
            return;
        }
        
        // Populate workflow fields
        document.getElementById('levelId').value = level.id;
        document.getElementById('levelOrder').value = level.levelOrder;
        document.getElementById('levelName').value = level.levelName;
        document.getElementById('role').value = level.role;
        document.getElementById('nextLevel').value = level.nextLevel || '';
        document.getElementById('queryReturnLevel').value = level.queryReturnLevel || 1;
        document.getElementById('enabled').checked = level.enabled;
        
        // Update button text
        document.getElementById('btnIcon').textContent = '💾';
        document.getElementById('btnText').textContent = 'Update Level';
        
        // Scroll to form
        document.getElementById('levelForm').scrollIntoView({ behavior: 'smooth' });
        
    } catch (error) {
        alert('Error loading level: ' + error.message);
    }
}

// Delete level
async function deleteLevel(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"?\n\nThis will also delete the associated RBAC role.\n\nThis action cannot be undone!`)) {
        return;
    }
    
    try {
        // Delete the workflow level (backend will auto-delete RBAC role)
        await fetch(`${API_BASE}/admin/levels/${id}`, { method: 'DELETE' });
        
        showResult('Level and role deleted successfully!', 'success');
        loadLevels();
        loadRoles(); // Refresh RBAC tab too
        
    } catch (error) {
        alert('Error deleting level: ' + error.message);
    }
}

// Reset form
function resetForm() {
    document.getElementById('levelForm').reset();
    document.getElementById('levelId').value = '';
    document.getElementById('enabled').checked = true;
    document.getElementById('queryReturnLevel').value = '1';
    document.getElementById('btnIcon').textContent = '➕';
    document.getElementById('btnText').textContent = 'Add Level';
    document.getElementById('formResult').innerHTML = '';
}

// Show result message
function showResult(message, type) {
    document.getElementById('formResult').innerHTML = 
        `<div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>`;
}

// Visualize workflow
function visualizeWorkflow(levels) {
    let html = '<div class="d-flex justify-content-center align-items-center flex-wrap">';
    
    levels.forEach((level, index) => {
        html += `<div class="flow-node">${level.levelName}</div>`;
        if (index < levels.length - 1) {
            html += '<span class="flow-arrow">→</span>';
        }
    });
    
    html += '<span class="flow-arrow">→</span>';
    html += '<div class="flow-node" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">✓ Material ID Generated</div>';
    html += '</div>';
    
    document.getElementById('workflowDiagram').innerHTML = html;
}

// ==================== RBAC PERMISSIONS ====================

// Load all roles
async function loadRoles() {
    try {
        const response = await fetch(`${API_BASE}/rbac/roles`);
        const roles = await response.json();
        
        const tbody = document.getElementById('rolesTableBody');
        
        if (roles.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No roles found</td></tr>';
            return;
        }
        
        // Sort by level order
        roles.sort((a, b) => a.levelOrder - b.levelOrder);
        
        tbody.innerHTML = roles.map(role => `
            <tr>
                <td>
                    <strong>Level ${role.levelOrder}</strong>
                    ${role.isFinalLevel ? '<br><span class="badge bg-danger">FINAL LEVEL</span>' : ''}
                </td>
                <td><code>${role.roleName}</code></td>
                <td>${role.description || '-'}</td>
                <td>
                    ${renderPermissions(role.permissions)}
                    <br><small class="text-muted">${role.permissions.length} permissions</small>
                </td>
                <td>
                    <button class="btn btn-sm btn-primary" onclick="editPermissions(${role.id})">
                        ✏️ Edit Permissions
                    </button>
                </td>
            </tr>
        `).join('');
        
    } catch (error) {
        console.error('Error loading roles:', error);
        document.getElementById('rolesTableBody').innerHTML = 
            '<tr><td colspan="5" class="text-center text-danger">Error loading roles</td></tr>';
    }
}

// Render permissions as badges
function renderPermissions(permissions) {
    if (!permissions || permissions.length === 0) {
        return '<span class="text-muted">No permissions</span>';
    }
    
    const allPerms = ['CREATE_REQUEST', 'APPROVE_TASK', 'QUERY_TASK', 'EDIT_REQUEST', 'VIEW_REQUEST', 
                      'DELETE_REQUEST', 'VIEW_ALL_REQUESTS', 'MANAGE_LEVELS'];
    
    let html = '<div>';
    allPerms.forEach(perm => {
        const has = permissions.includes(perm);
        const shortName = perm.replace('_REQUEST', '').replace('_TASK', '').replace('_REQUESTS', '').replace('_LEVELS', '').replace('_', ' ');
        const isAdmin = ['DELETE_REQUEST', 'VIEW_ALL_REQUESTS', 'MANAGE_LEVELS'].includes(perm);
        
        if (has) {
            html += `<span class="permission-badge ${isAdmin ? 'perm-admin' : 'perm-has'}">${isAdmin ? '🔑 ' : ''}${shortName}</span>`;
        } else {
            html += `<span class="permission-badge perm-none">${shortName}</span>`;
        }
    });
    html += '</div>';
    return html;
}

// Edit permissions
async function editPermissions(roleId) {
    try {
        const response = await fetch(`${API_BASE}/rbac/roles`);
        const roles = await response.json();
        const role = roles.find(r => r.id === roleId);
        
        if (!role) {
            alert('Role not found');
            return;
        }
        
        document.getElementById('editRoleId').value = roleId;
        document.getElementById('editRoleName').textContent = role.roleName;
        document.getElementById('editRoleDescription').textContent = role.description || 'No description';
        
        // Populate permissions checkboxes
        const allPerms = ['CREATE_REQUEST', 'APPROVE_TASK', 'QUERY_TASK', 'EDIT_REQUEST', 'VIEW_REQUEST', 
                          'DELETE_REQUEST', 'VIEW_ALL_REQUESTS', 'MANAGE_LEVELS'];
        
        let html = '';
        allPerms.forEach(perm => {
            const checked = role.permissions.includes(perm) ? 'checked' : '';
            const label = perm.replace(/_/g, ' ');
            const isAdmin = ['DELETE_REQUEST', 'VIEW_ALL_REQUESTS', 'MANAGE_LEVELS'].includes(perm);
            html += `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${perm}" 
                           id="perm_${perm}" ${checked}>
                    <label class="form-check-label" for="perm_${perm}">
                        ${isAdmin ? '🔑 ' : ''}${label}
                    </label>
                </div>
            `;
        });
        
        document.getElementById('permissionsCheckboxes').innerHTML = html;
        
        const modal = new bootstrap.Modal(document.getElementById('permissionsModal'));
        modal.show();
        
    } catch (error) {
        alert('Error loading role: ' + error.message);
    }
}

// Save permissions
async function savePermissions() {
    const roleId = document.getElementById('editRoleId').value;
    
    // Get selected permissions
    const permissions = [];
    document.querySelectorAll('#permissionsCheckboxes input[type="checkbox"]:checked').forEach(cb => {
        permissions.push(cb.value);
    });
    
    if (permissions.length === 0) {
        alert('Please select at least one permission');
        return;
    }
    
    try {
        // Get current role data
        const response = await fetch(`${API_BASE}/rbac/roles`);
        const roles = await response.json();
        const role = roles.find(r => r.id == roleId);
        
        if (!role) {
            alert('Role not found');
            return;
        }
        
        // Update only permissions
        const roleData = {
            roleName: role.roleName,
            levelOrder: role.levelOrder,
            description: role.description,
            isFinalLevel: role.isFinalLevel,
            permissions: permissions
        };
        
        const updateResponse = await fetch(`${API_BASE}/rbac/roles/${roleId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(roleData)
        });
        
        if (updateResponse.ok) {
            alert('Permissions updated successfully!');
            bootstrap.Modal.getInstance(document.getElementById('permissionsModal')).hide();
            loadRoles();
            loadLevels(); // Refresh workflow tab too
        } else {
            alert('Error updating permissions');
        }
        
    } catch (error) {
        alert('Error saving permissions: ' + error.message);
    }
}

// Initialize on page load
window.onload = () => {
    loadLevels();
    loadRoles();
};


// ==================== FORM BUILDER FUNCTIONS ====================

let currentFormId = null;
let allLevels = [];

// Load all forms
async function loadForms() {
    try {
        const response = await fetch(`${API_BASE}/forms`);
        const forms = await response.json();
        
        const container = document.getElementById('formsList');
        
        if (forms.length === 0) {
            container.innerHTML = '<p class="text-center text-muted">No forms created yet. Click "Create New Form" to get started.</p>';
            return;
        }
        
        let html = '<div class="row">';
        forms.forEach(form => {
            html += `
                <div class="col-md-6 mb-3">
                    <div class="card">
                        <div class="card-header bg-light">
                            <h6 class="mb-0">
                                ${form.formName}
                                ${form.active ? '<span class="badge bg-success ms-2">Active</span>' : '<span class="badge bg-secondary ms-2">Inactive</span>'}
                            </h6>
                        </div>
                        <div class="card-body">
                            <p class="text-muted">${form.description || 'No description'}</p>
                            <p class="mb-2"><strong>Fields:</strong> ${form.fields ? form.fields.length : 0}</p>
                            <div class="btn-group btn-group-sm" role="group">
                                <button class="btn btn-primary" onclick="manageFormFields(${form.id})">
                                    📝 Manage Fields
                                </button>
                                <button class="btn btn-warning" onclick="editFormModal(${form.id})">
                                    ✏️ Edit
                                </button>
                                <button class="btn btn-danger" onclick="deleteFormConfirm(${form.id}, '${form.formName}')">
                                    🗑️ Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        
        container.innerHTML = html;
        
    } catch (error) {
        console.error('Error loading forms:', error);
        document.getElementById('formsList').innerHTML = 
            '<div class="alert alert-danger">Error loading forms</div>';
    }
}

// Show create form modal
function showCreateFormModal() {
    document.getElementById('formModalTitle').textContent = 'Create New Form';
    document.getElementById('formId').value = '';
    document.getElementById('formName').value = '';
    document.getElementById('formDescription').value = '';
    document.getElementById('formActive').checked = true;
    
    const modal = new bootstrap.Modal(document.getElementById('formModal'));
    modal.show();
}

// Edit form modal
async function editFormModal(formId) {
    try {
        const response = await fetch(`${API_BASE}/forms/${formId}`);
        const form = await response.json();
        
        document.getElementById('formModalTitle').textContent = 'Edit Form';
        document.getElementById('formId').value = form.id;
        document.getElementById('formName').value = form.formName;
        document.getElementById('formDescription').value = form.description || '';
        document.getElementById('formActive').checked = form.active;
        
        const modal = new bootstrap.Modal(document.getElementById('formModal'));
        modal.show();
        
    } catch (error) {
        alert('Error loading form: ' + error.message);
    }
}

// Save form
async function saveForm() {
    const formId = document.getElementById('formId').value;
    const formData = {
        formName: document.getElementById('formName').value.trim(),
        description: document.getElementById('formDescription').value.trim(),
        active: document.getElementById('formActive').checked
    };
    
    if (!formData.formName) {
        alert('Form name is required');
        return;
    }
    
    try {
        const url = formId ? `${API_BASE}/forms/${formId}` : `${API_BASE}/forms`;
        const method = formId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        });
        
        if (response.ok) {
            alert(formId ? 'Form updated successfully!' : 'Form created successfully!');
            bootstrap.Modal.getInstance(document.getElementById('formModal')).hide();
            loadForms();
        } else {
            alert('Error saving form');
        }
        
    } catch (error) {
        alert('Error saving form: ' + error.message);
    }
}

// Delete form
async function deleteFormConfirm(formId, formName) {
    if (!confirm(`Are you sure you want to delete form "${formName}"?\n\nThis will also delete all fields and data associated with this form.\n\nThis action cannot be undone!`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/forms/${formId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Form deleted successfully!');
            loadForms();
        } else {
            alert('Error deleting form');
        }
        
    } catch (error) {
        alert('Error deleting form: ' + error.message);
    }
}

// Manage form fields
async function manageFormFields(formId) {
    currentFormId = formId;
    
    try {
        const response = await fetch(`${API_BASE}/forms/${formId}`);
        const form = await response.json();
        
        let html = `
            <div class="d-flex justify-content-between align-items-center mb-3">
                <div>
                    <h5>${form.formName}</h5>
                    <p class="text-muted mb-0">${form.description || ''}</p>
                </div>
                <div>
                    <button class="btn btn-secondary btn-sm" onclick="loadForms()">
                        ← Back to Forms
                    </button>
                    <button class="btn btn-success btn-sm" onclick="showAddFieldModal(${formId})">
                        ➕ Add Field
                    </button>
                </div>
            </div>
        `;
        
        if (!form.fields || form.fields.length === 0) {
            html += '<div class="alert alert-info">No fields added yet. Click "Add Field" to create your first field.</div>';
        } else {
            html += '<div class="table-responsive"><table class="table table-hover">';
            html += '<thead><tr><th>Order</th><th>Label</th><th>Type</th><th>Required</th><th>Visible At</th><th>Editable At</th><th>Actions</th></tr></thead><tbody>';
            
            form.fields.sort((a, b) => a.displayOrder - b.displayOrder);
            
            form.fields.forEach(field => {
                html += `
                    <tr>
                        <td>${field.displayOrder}</td>
                        <td><strong>${field.fieldLabel}</strong><br><small class="text-muted">${field.fieldName}</small></td>
                        <td><span class="badge bg-info">${field.fieldType}</span></td>
                        <td>${field.required ? '<span class="badge bg-danger">Required</span>' : '<span class="badge bg-secondary">Optional</span>'}</td>
                        <td><small>${field.visibleAtLevels}</small></td>
                        <td><small>${field.editableAtLevels}</small></td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="editFieldModal(${formId}, ${field.id})">✏️</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteFieldConfirm(${formId}, ${field.id}, '${field.fieldLabel}')">🗑️</button>
                        </td>
                    </tr>
                `;
            });
            
            html += '</tbody></table></div>';
        }
        
        document.getElementById('formsList').innerHTML = html;
        
    } catch (error) {
        alert('Error loading form fields: ' + error.message);
    }
}

// Show add field modal
async function showAddFieldModal(formId) {
    document.getElementById('fieldModalTitle').textContent = 'Add Field';
    document.getElementById('fieldId').value = '';
    document.getElementById('fieldFormId').value = formId;
    document.getElementById('fieldName').value = '';
    document.getElementById('fieldLabel').value = '';
    document.getElementById('fieldType').value = 'TEXT';
    document.getElementById('fieldPlaceholder').value = '';
    document.getElementById('fieldOptions').value = '';
    document.getElementById('fieldHelpText').value = '';
    document.getElementById('fieldRequired').checked = false;
    document.getElementById('fieldOptionsDiv').style.display = 'none';
    
    await populateLevelCheckboxes();
    
    const modal = new bootstrap.Modal(document.getElementById('fieldModal'));
    modal.show();
}

// Edit field modal
async function editFieldModal(formId, fieldId) {
    try {
        const response = await fetch(`${API_BASE}/forms/${formId}`);
        const form = await response.json();
        const field = form.fields.find(f => f.id === fieldId);
        
        if (!field) {
            alert('Field not found');
            return;
        }
        
        document.getElementById('fieldModalTitle').textContent = 'Edit Field';
        document.getElementById('fieldId').value = field.id;
        document.getElementById('fieldFormId').value = formId;
        document.getElementById('fieldName').value = field.fieldName;
        document.getElementById('fieldLabel').value = field.fieldLabel;
        document.getElementById('fieldType').value = field.fieldType;
        document.getElementById('fieldPlaceholder').value = field.placeholder || '';
        document.getElementById('fieldOptions').value = field.fieldOptions || '';
        document.getElementById('fieldHelpText').value = field.helpText || '';
        document.getElementById('fieldRequired').checked = field.required;
        
        // Show options div if needed
        if (['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(field.fieldType)) {
            document.getElementById('fieldOptionsDiv').style.display = 'block';
        } else {
            document.getElementById('fieldOptionsDiv').style.display = 'none';
        }
        
        await populateLevelCheckboxes(field.visibleAtLevels, field.editableAtLevels);
        
        const modal = new bootstrap.Modal(document.getElementById('fieldModal'));
        modal.show();
        
    } catch (error) {
        alert('Error loading field: ' + error.message);
    }
}

// Populate level checkboxes
async function populateLevelCheckboxes(visibleLevels = '1,2,3,4,5,6,7,8,9,10', editableLevels = '1') {
    // Get workflow levels
    try {
        const response = await fetch(`${API_BASE}/admin/levels`);
        allLevels = await response.json();
        allLevels.sort((a, b) => a.levelOrder - b.levelOrder);
    } catch (error) {
        console.error('Error loading levels:', error);
        allLevels = [{levelOrder: 1}, {levelOrder: 2}, {levelOrder: 3}]; // Default
    }
    
    const visibleArray = visibleLevels.split(',');
    const editableArray = editableLevels.split(',');
    
    let visibleHtml = '<div class="row">';
    let editableHtml = '<div class="row">';
    
    allLevels.forEach(level => {
        const levelNum = level.levelOrder.toString();
        const visibleChecked = visibleArray.includes(levelNum) ? 'checked' : '';
        const editableChecked = editableArray.includes(levelNum) ? 'checked' : '';
        
        visibleHtml += `
            <div class="col-md-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${levelNum}" 
                           id="visible_${levelNum}" ${visibleChecked}>
                    <label class="form-check-label" for="visible_${levelNum}">
                        Level ${levelNum}
                    </label>
                </div>
            </div>
        `;
        
        editableHtml += `
            <div class="col-md-3">
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${levelNum}" 
                           id="editable_${levelNum}" ${editableChecked}>
                    <label class="form-check-label" for="editable_${levelNum}">
                        Level ${levelNum}
                    </label>
                </div>
            </div>
        `;
    });
    
    visibleHtml += '</div>';
    editableHtml += '</div>';
    
    document.getElementById('visibleLevelsCheckboxes').innerHTML = visibleHtml;
    document.getElementById('editableLevelsCheckboxes').innerHTML = editableHtml;
}

// Save field
async function saveField() {
    const fieldId = document.getElementById('fieldId').value;
    const formId = document.getElementById('fieldFormId').value;
    
    // Get visible levels
    const visibleLevels = [];
    allLevels.forEach(level => {
        const checkbox = document.getElementById(`visible_${level.levelOrder}`);
        if (checkbox && checkbox.checked) {
            visibleLevels.push(level.levelOrder);
        }
    });
    
    // Get editable levels
    const editableLevels = [];
    allLevels.forEach(level => {
        const checkbox = document.getElementById(`editable_${level.levelOrder}`);
        if (checkbox && checkbox.checked) {
            editableLevels.push(level.levelOrder);
        }
    });
    
    const fieldData = {
        fieldName: document.getElementById('fieldName').value.trim(),
        fieldLabel: document.getElementById('fieldLabel').value.trim(),
        fieldType: document.getElementById('fieldType').value,
        placeholder: document.getElementById('fieldPlaceholder').value.trim(),
        fieldOptions: document.getElementById('fieldOptions').value.trim(),
        helpText: document.getElementById('fieldHelpText').value.trim(),
        required: document.getElementById('fieldRequired').checked,
        visibleAtLevels: visibleLevels.join(','),
        editableAtLevels: editableLevels.join(','),
        displayOrder: 0,
        active: true
    };
    
    if (!fieldData.fieldName || !fieldData.fieldLabel) {
        alert('Field name and label are required');
        return;
    }
    
    if (visibleLevels.length === 0) {
        alert('Please select at least one level where this field is visible');
        return;
    }
    
    try {
        const url = fieldId ? 
            `${API_BASE}/forms/${formId}/fields/${fieldId}` : 
            `${API_BASE}/forms/${formId}/fields`;
        const method = fieldId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fieldData)
        });
        
        if (response.ok) {
            alert(fieldId ? 'Field updated successfully!' : 'Field added successfully!');
            bootstrap.Modal.getInstance(document.getElementById('fieldModal')).hide();
            manageFormFields(formId);
        } else {
            alert('Error saving field');
        }
        
    } catch (error) {
        alert('Error saving field: ' + error.message);
    }
}

// Delete field
async function deleteFieldConfirm(formId, fieldId, fieldLabel) {
    if (!confirm(`Are you sure you want to delete field "${fieldLabel}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/forms/${formId}/fields/${fieldId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Field deleted successfully!');
            manageFormFields(formId);
        } else {
            alert('Error deleting field');
        }
        
    } catch (error) {
        alert('Error deleting field: ' + error.message);
    }
}

// Field type change handler
document.addEventListener('DOMContentLoaded', function() {
    const fieldTypeSelect = document.getElementById('fieldType');
    if (fieldTypeSelect) {
        fieldTypeSelect.addEventListener('change', function() {
            const fieldType = this.value;
            const optionsDiv = document.getElementById('fieldOptionsDiv');
            
            if (['DROPDOWN', 'RADIO', 'CHECKBOX'].includes(fieldType)) {
                optionsDiv.style.display = 'block';
            } else {
                optionsDiv.style.display = 'none';
            }
        });
    }
});

// Initialize forms tab
document.addEventListener('DOMContentLoaded', function() {
    const formsTab = document.getElementById('forms-tab');
    if (formsTab) {
        formsTab.addEventListener('shown.bs.tab', function() {
            loadForms();
        });
    }
});
