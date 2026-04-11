import type { Metadata } from "next";

import AuthForm from "@/components/forms/AuthForm";
import { signInWithCredentials } from "@/lib/actions/auth.action";
import { createPageMetadata } from "@/lib/seo";
import { SignInSchema } from "@/lib/validations";

export const metadata: Metadata = createPageMetadata({
  title: "Вход",
  description:
    "Войдите в DevFlow, чтобы задавать вопросы, публиковать ответы, голосовать, сохранять материалы и управлять профилем.",
  path: "/sign-in",
  noIndex: true,
});

const SignIn = () => {
  return (
    <AuthForm
      formType="SIGN_IN"
      schema={SignInSchema}
      defaultValues={{ email: "", password: "" }}
      onSubmit={signInWithCredentials}
    />
  );
};

export default SignIn;
