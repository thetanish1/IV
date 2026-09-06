import { redirect } from "next/navigation";

export default function PortalAdminLoginRedirect() {
  redirect("/admin/login");
}
