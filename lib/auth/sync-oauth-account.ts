import mongoose from "mongoose";
import slugify from "slugify";

import Account from "@/database/account.model";
import User from "@/database/user.model";
import type { SignInWithOAuthParams } from "@/types";

import dbConnect from "../mongoose";

export async function syncOAuthAccount({
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
