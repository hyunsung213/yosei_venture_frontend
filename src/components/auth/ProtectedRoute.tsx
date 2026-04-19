'use client';

import React, { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AccessDenied from "./AccessDenied";
import { RoleType } from "@/interface/interface";

// 5가지 권한 체계
const ROLE_HIERARCHY: Record<RoleType, number> = {
  guest: 0,
  general: 1,
  wave: 2,
  super: 3,
};

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: RoleType[]; // 명시적으로 허용된 권한 목록
  minRole?: RoleType; // 최소 요구 권한
}

export default function ProtectedRoute({ children, allowedRoles, minRole }: ProtectedRouteProps) {
  const { role } = useAuth();

  let hasAccess = true;

  if (allowedRoles && !allowedRoles.includes(role)) {
    hasAccess = false;
  }

  if (minRole && ROLE_HIERARCHY[role] < ROLE_HIERARCHY[minRole]) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return <AccessDenied />;
  }

  return <>{children}</>;
}
