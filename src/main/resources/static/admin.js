const API_BASE = '/api';

document.getElementById('levelForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const levelId = document.getElementById('levelId').value;
    const data = {
        levelOrder: parseInt(document.getElementById('levelOrder').value),
        levelName: document.getElementById('levelName').value,
        role: document.getElementById('role').value,
        nextLevel: document.getElementById('nextLevel').value ? 
            parseInt(document.getElementById('nextLevel').value) : null,
        queryReturnLevel: document.getElementById('queryReturnLevel').value ? 
            parseInt(document.getElementById('queryReturnLevel').value) : null,
        enabled: document.getElementById('enabled').checked
    };
    
    try {
        const url = levelId ? `${API_BASE}/admin/levels/${levelId}` : `${API_BASE}/admin/levels`;
        const method = levelId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        document.getElementById('formResult').innerHTML = 
            `<div class="alert alert-success">${levelId ? 'Updated' : 'Created'} successfully!</div>`;
        
        resetForm();
        loadLevels();
    } catch (error) {
        document.getElementById('formResult').innerHTML = 
            `<div class="alert alert-danger">Error: ${error.message}</div>`;
    }
});

async function loadLevels() {
    try {
        const response = await fetch(`${API_BASE}/admin/levels`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const levels = await response.json();
        
        if (!Array.isArray(levels)) {
            console.error('Levels is not an array:', levels);
            document.getElementById('levelsList').innerHTML = 
                '<div class="alert alert-warning">Invalid response from server</div>';
            return;
        }
        
        levels.sort((a, b) => a.levelOrder - b.levelOrder);
        
        let html = '';
        levels.forEach(level => {
            html += `
                <div class="level-item ${!level.enabled ? 'disabled' : ''}">
                    <div class="d-flex justify-content-between align-items-start">
                        <div>
                            <h6>${level.levelName || 'Unnamed Level'}</h6>
                            <span class="level-badge bg-primary text-white">Order: ${level.levelOrder}</span>
                            <span class="level-badge bg-secondary text-white">${level.role || 'No Role'}</span>
                            <span class="level-badge bg-info text-white">Next: ${level.nextLevel || 'Final'}</span>
                            ${!level.enabled ? '<span class="level-badge bg-danger text-white">Disabled</span>' : ''}
                        </div>
                        <div>
                            <button class="btn btn-sm btn-warning btn-action" onclick="editLevel(${level.id})">Edit</button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="deleteLevel(${level.id})">Delete</button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        const levelsListElement = document.getElementById('levelsList');
        if (levelsListElement) {
            levelsListElement.innerHTML = html || '<p>No levels configured</p>';
        }
        
        // Update active levels count if element exists
        const activeLevelsElement = document.getElementById('activeLevels');
        if (activeLevelsElement) {
            activeLevelsElement.textContent = levels.filter(l => l.enabled).length;
        }
        
        visualizeWorkflow(levels.filter(l => l.enabled));
    } catch (error) {
        console.error('Error loading levels:', error);
        const levelsListElement = document.getElementById('levelsList');
        if (levelsListElement) {
            levelsListElement.innerHTML = 
                `<div class="alert alert-danger">Error loading levels: ${error.message}</div>`;
        }
    }
}

async function editLevel(id) {
    try {
        const response = await fetch(`${API_BASE}/admin/levels`);
        const levels = await response.json();
        const level = levels.find(l => l.id === id);
        
        if (level) {
            document.getElementById('levelId').value = level.id;
            document.getElementById('levelOrder').value = level.levelOrder;
            document.getElementById('levelName').value = level.levelName;
            document.getElementById('role').value = level.role;
            document.getElementById('nextLevel').value = level.nextLevel || '';
            document.getElementById('queryReturnLevel').value = level.queryReturnLevel || '';
            document.getElementById('enabled').checked = level.enabled;
            
            document.getElementById('formTitle').textContent = 'Edit Level';
            document.getElementById('submitBtn').textContent = 'Update Level';
        }
    } catch (error) {
        alert('Error loading level: ' + error.message);
    }
}

async function deleteLevel(id) {
    if (!confirm('Are you sure you want to delete this level?')) return;
    
    try {
        await fetch(`${API_BASE}/admin/levels/${id}`, { method: 'DELETE' });
        loadLevels();
    } catch (error) {
        alert('Error deleting level: ' + error.message);
    }
}

function resetForm() {
    document.getElementById('levelForm').reset();
    document.getElementById('levelId').value = '';
    document.getElementById('formTitle').textContent = 'Add New Level';
    document.getElementById('submitBtn').textContent = 'Add Level';
    document.getElementById('formResult').innerHTML = '';
}

function visualizeWorkflow(levels) {
    let html = '<div class="text-center">';
    
    levels.forEach((level, index) => {
        html += `<div class="flow-node">${level.levelName}</div>`;
        if (index < levels.length - 1) {
            html += '<span class="flow-arrow">→</span>';
        }
    });
    
    html += '<div class="flow-node" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">Material ID Generated</div>';
    html += '</div>';
    
    document.getElementById('workflowDiagram').innerHTML = html;
}

window.onload = () => {
    loadLevels();
};
