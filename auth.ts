import mongoose from "mongoose";
import slugify from "slugify";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";

import Account, { IAccountDoc } from "./database/account.model";
import User, { IUserDoc } from "./database/user.model";
import dbConnect from "./lib/mongoose";
import { SignInSchema } from "./lib/validations";

async function syncOAuthAccount({
  provider,
  providerAccountId,
  user,
}: SignInWithOAuthParams) {
  await dbConnect();

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const slugifiedUsername = slugify(user.username, {
      lower: true,
      strict: true,
      trim: true,
    });

    let existingUser = await User.findOne({ email: user.email }).session(session);

    if (!existingUser) {
      [existingUser] = await User.create(
        [
          {
            name: user.name,
            username: slugifiedUsername,
            email: user.email,
            image: user.image,
          },
        ],
        { session }
      );
    } else {
      const updatedData: { name?: string; image?: string } = {};

      if (existingUser.name !== user.name) updatedData.name = user.name;
      if (existingUser.image !== user.image) updatedData.image = user.image;

      if (Object.keys(updatedData).length > 0) {
        await User.updateOne(
          { _id: existingUser._id },
          { $set: updatedData }
        ).session(session);
      }
    }

    const existingAccount = await Account.findOne({
      provider,
      providerAccountId,
    }).session(session);

    if (!existingAccount) {
      await Account.create(
        [
          {
            userId: existingUser._id,
            name: user.name,
            image: user.image,
            provider,
            providerAccountId,
          },
        ],
        { session }
      );
    }

    await session.commitTransaction();
    return true;
  } catch {
    await session.abortTransaction();
    return false;
  } finally {
    await session.endSession();
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({}),
    Google({}),
    Credentials({
      async authorize(credentials) {
        const validatedFields = SignInSchema.safeParse(credentials);

        if (validatedFields.success) {
          const { email, password } = validatedFields.data;
          await dbConnect();

          const existingAccount = (await Account.findOne({
            provider: "credentials",
            providerAccountId: email,
          }).lean()) as IAccountDoc | null;

          if (!existingAccount) return null;

          const existingUser = (await User.findById(
            existingAccount.userId
          ).lean()) as IUserDoc | null;

          if (!existingUser) return null;

          const isValidPassword = await bcrypt.compare(
            password,
            existingAccount.password!
          );

          if (isValidPassword) {
            return {
              id: existingUser.id,
              name: existingUser.name,
              email: existingUser.email,
              image: existingUser.image,
            };
          }
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      session.user.id = token.sub as string;
      return session;
    },
    async jwt({ token, account }) {
      if (account) {
        await dbConnect();

        const existingAccount = (await Account.findOne({
          provider: account.provider,
          providerAccountId:
            account.type === "credentials" ? token.email! : account.providerAccountId,
        }).lean()) as IAccountDoc | null;

        if (!existingAccount) return token;

        const userId = existingAccount.userId;

        if (userId) token.sub = userId.toString();
      }

      return token;
    },
    async signIn({ user, profile, account }) {
      if (account?.type === "credentials") return true;
      if (!account || !user) return false;

      const userInfo = {
        name: user.name!,
        email: user.email!,
        image: user.image!,
        username:
          account.provider === "github"
            ? (profile?.login as string)
            : (user.name?.toLowerCase() as string),
      };

      const success = await syncOAuthAccount({
        user: userInfo,
        provider: account.provider as "github" | "google",
        providerAccountId: account.providerAccountId,
      });

      if (!success) return false;

      return true;
    },
  },
});
