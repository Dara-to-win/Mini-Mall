/**
 * 登录页面（服务端壳 → 客户端表单）
 */
import { LoginForm } from "./LoginForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const params = await searchParams;
  return <LoginForm redirect={params.redirect || ""} />;
}
