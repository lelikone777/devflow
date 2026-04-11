import type { Metadata } from "next";

import AuthForm from "@/components/forms/AuthForm";
import { signUpWithCredentials } from "@/lib/actions/auth.action";
import { createPageMetadata } from "@/lib/seo";
import { SignUpSchema } from "@/lib/validations";

export const metadata: Metadata = createPageMetadata({
  title: "Регистрация",
  description:
    "Создайте аккаунт DevFlow, чтобы присоединиться к сообществу разработчиков, задавать вопросы, делиться ответами и развивать профиль.",
  path: "/sign-up",
  noIndex: true,
});

const SignUp = () => {
  return (
    <AuthForm
      formType="SIGN_UP"
      schema={SignUpSchema}
      defaultValues={{ email: "", password: "", name: "", username: "" }}
      onSubmit={signUpWithCredentials}
    />
  );
};

export default SignUp;
