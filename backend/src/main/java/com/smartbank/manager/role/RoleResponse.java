package com.smartbank.manager.role;

public record RoleResponse(
        Long roleId,
        String roleName
) {
    public static RoleResponse from(Role role) {
        return new RoleResponse(role.getRoleId(), role.getRoleName());
    }
}
