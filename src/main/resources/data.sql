-- Initialize workflow levels
INSERT INTO workflow_levels (level_order, level_name, role, next_level, query_return_level, enabled) 
VALUES (1, 'Level 1 - Initial Review', 'ROLE_LEVEL1', 2, null, true);

INSERT INTO workflow_levels (level_order, level_name, role, next_level, query_return_level, enabled) 
VALUES (2, 'Level 2 - Manager Approval', 'ROLE_LEVEL2', 3, 1, true);

INSERT INTO workflow_levels (level_order, level_name, role, next_level, query_return_level, enabled) 
VALUES (3, 'Level 3 - Director Approval', 'ROLE_LEVEL3', null, 1, true);
