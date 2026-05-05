type AdminLikeUser = {
  role: string;
};

export function isCasePackageAdminUser(user: AdminLikeUser): boolean {
  return (
    user.role === "ADMIN" ||
    user.role === "SUPER_ADMIN" ||
    user.role === "STAFF"
  );
}
