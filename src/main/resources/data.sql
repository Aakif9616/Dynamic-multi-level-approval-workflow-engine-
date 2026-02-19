-- Initialize workflow levels
INSERT INTO workflow_levels (level_order, level_name, role, next_level, query_return_level, enabled) 
VALUES (1, 'Level 1 - Initial Review', 'ROLE_LEVEL1', 2, null, true);

INSERT INTO workflow_levels (level_order, level_name, role, next_level, query_return_level, enabled) 
VALUES (2, 'Level 2 - Manager Approval', 'ROLE_LEVEL2', 3, 1, true);

INSERT INTO workflow_levels (level_order, level_name, role, next_level, query_return_level, enabled) 
VALUES (3, 'Level 3 - Director Approval', 'ROLE_LEVEL3', null, 1, true);

-- Initialize roles with RBAC permissions
-- Level 1: Can ONLY create and view requests (initiator role)
INSERT INTO roles (role_name, level_order, is_final_level, description) VALUES
('ROLE_LEVEL1', 1, false, 'Level 1 - Request Initiator (Can only create and view requests)');

INSERT INTO role_permissions (role_id, permission) VALUES
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL1'), 'CREATE_REQUEST'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL1'), 'VIEW_REQUEST');

-- Level 2: Can approve, query, edit, view (first approver)
INSERT INTO roles (role_name, level_order, is_final_level, description) VALUES
('ROLE_LEVEL2', 2, false, 'Level 2 Approver - Can approve, edit, query requests');

INSERT INTO role_permissions (role_id, permission) VALUES
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL2'), 'APPROVE_TASK'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL2'), 'QUERY_TASK'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL2'), 'EDIT_REQUEST'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL2'), 'VIEW_REQUEST');

-- Level 3 (Final Level): ALL PERMISSIONS
INSERT INTO roles (role_name, level_order, is_final_level, description) VALUES
('ROLE_LEVEL3', 3, true, 'Level 3 Approver (Final) - Full access to all functions');

INSERT INTO role_permissions (role_id, permission) VALUES
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL3'), 'APPROVE_TASK'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL3'), 'QUERY_TASK'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL3'), 'EDIT_REQUEST'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL3'), 'VIEW_REQUEST'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL3'), 'DELETE_REQUEST'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL3'), 'MANAGE_LEVELS'),
((SELECT id FROM roles WHERE role_name = 'ROLE_LEVEL3'), 'VIEW_ALL_REQUESTS');
