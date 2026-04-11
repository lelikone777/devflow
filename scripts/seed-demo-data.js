const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const mongoose = require("mongoose");

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  const lines = fs.readFileSync(filePath, "utf8").split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) continue;

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function createSchemas() {
  const { Schema } = mongoose;

  const UserSchema = new Schema(
    {
      name: { type: String, required: true },
      username: { type: String, required: true, unique: true },
      email: { type: String, required: true, unique: true },
      bio: String,
      image: String,
      location: String,
      portfolio: String,
      reputation: { type: Number, default: 0 },
    },
    { timestamps: true }
  );

  const QuestionSchema = new Schema(
    {
      title: { type: String, required: true },
      content: { type: String, required: true },
      tags: [{ type: Schema.Types.ObjectId, ref: "Tag" }],
      views: { type: Number, default: 0 },
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
      answers: { type: Number, default: 0 },
      author: { type: Schema.Types.ObjectId, ref: "User", required: true },
    },
    { timestamps: true }
  );

  const AnswerSchema = new Schema(
    {
      author: { type: Schema.Types.ObjectId, ref: "User", required: true },
      question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
      content: { type: String, required: true },
      upvotes: { type: Number, default: 0 },
      downvotes: { type: Number, default: 0 },
    },
    { timestamps: true }
  );

  const TagSchema = new Schema(
    {
      name: { type: String, required: true, unique: true },
      questions: { type: Number, default: 0 },
    },
    { timestamps: true }
  );

  const VoteSchema = new Schema(
    {
      author: { type: Schema.Types.ObjectId, ref: "User", required: true },
      actionId: { type: Schema.Types.ObjectId, required: true },
      actionType: {
        type: String,
        enum: ["question", "answer"],
        required: true,
      },
      voteType: {
        type: String,
        enum: ["upvote", "downvote"],
        required: true,
      },
    },
    { timestamps: true }
  );

  const CollectionSchema = new Schema(
    {
      author: { type: Schema.Types.ObjectId, ref: "User", required: true },
      question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    },
    { timestamps: true }
  );

  const InteractionSchema = new Schema(
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      action: {
        type: String,
        enum: ["view", "upvote", "downvote", "bookmark", "post", "edit", "delete", "search"],
        required: true,
      },
      actionId: { type: Schema.Types.ObjectId, required: true },
      actionType: {
        type: String,
        enum: ["question", "answer"],
        required: true,
      },
    },
    { timestamps: true }
  );

  const TagQuestionSchema = new Schema(
    {
      tag: { type: Schema.Types.ObjectId, ref: "Tag", required: true },
      question: { type: Schema.Types.ObjectId, ref: "Question", required: true },
    },
    { timestamps: true }
  );

  return {
    User: mongoose.models.User || mongoose.model("User", UserSchema),
    Question: mongoose.models.Question || mongoose.model("Question", QuestionSchema),
    Answer: mongoose.models.Answer || mongoose.model("Answer", AnswerSchema),
    Tag: mongoose.models.Tag || mongoose.model("Tag", TagSchema),
    Vote: mongoose.models.Vote || mongoose.model("Vote", VoteSchema),
    Collection:
      mongoose.models.Collection || mongoose.model("Collection", CollectionSchema),
    Interaction:
      mongoose.models.Interaction ||
      mongoose.model("Interaction", InteractionSchema),
    TagQuestion:
      mongoose.models.TagQuestion ||
      mongoose.model("TagQuestion", TagQuestionSchema),
  };
}

function markdown(text) {
  return text.trim();
}

function getDnsRecords(recordType, hostname, property) {
  const command = [
    "$ErrorActionPreference = 'Stop'",
    `Resolve-DnsName -Type ${recordType} ${hostname} | Select-Object -ExpandProperty ${property}`,
  ].join("; ");

  return execFileSync("powershell", ["-NoProfile", "-Command", command], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  })
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}

function normalizeMongoUri(uri) {
  if (!uri.startsWith("mongodb+srv://")) return uri;

  const parsed = new URL(uri);
  const srvHosts = getDnsRecords("SRV", parsed.hostname, "NameTarget").map((host) =>
    host.replace(/\.$/, "")
  );
  const txtRecords = getDnsRecords("TXT", parsed.hostname, "Strings");

  if (srvHosts.length === 0) {
    throw new Error(`Could not resolve SRV records for ${parsed.hostname}`);
  }

  const authPart =
    parsed.username || parsed.password
      ? `${encodeURIComponent(parsed.username)}:${encodeURIComponent(parsed.password)}@`
      : "";
  const hostsPart = srvHosts.map((host) => `${host}:27017`).join(",");
  const dbPath = parsed.pathname || "";
  const existingParams = parsed.searchParams.toString();
  const txtParams = txtRecords
    .flatMap((record) => record.split(/\s+/))
    .join("&")
    .replace(/^"+|"+$/g, "")
    .replace(/"/g, "");
  const mergedParams = [existingParams, txtParams, "tls=true"]
    .filter(Boolean)
    .join("&");

  return `mongodb://${authPart}${hostsPart}${dbPath}${mergedParams ? `?${mergedParams}` : ""}`;
}

async function run() {
  const rootDir = path.resolve(__dirname, "..");
  loadEnvFile(path.join(rootDir, ".env"));
  loadEnvFile(path.join(rootDir, ".env.local"));

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    throw new Error("MONGODB_URI is not defined in .env or .env.local");
  }

  await mongoose.connect(normalizeMongoUri(mongoUri), { dbName: "devflow" });

  const { User, Question, Answer, Tag, Vote, Collection, Interaction, TagQuestion } =
    createSchemas();

  const existingUsers = await User.find({})
    .sort({ createdAt: 1 })
    .select("_id name username email image location portfolio bio reputation")
    .lean();

  const demoUsersSeed = [
    {
      name: "Alex Mercer",
      username: "alexmercer_demo",
      email: "alexmercer.demo@devflow.local",
      bio: "Frontend engineer focused on React, animation systems, and UI architecture.",
      image: "https://api.dicebear.com/9.x/adventurer/svg?seed=Alex",
      location: "Warsaw, Poland",
      portfolio: "https://example.com/alex",
      reputation: 420,
    },
    {
      name: "Maya Chen",
      username: "mayachen_demo",
      email: "mayachen.demo@devflow.local",
      bio: "Backend developer working on APIs, queues, and observability.",
      image: "https://api.dicebear.com/9.x/adventurer/svg?seed=Maya",
      location: "Berlin, Germany",
      portfolio: "https://example.com/maya",
      reputation: 560,
    },
    {
      name: "Ilya Volkov",
      username: "ilyavolkov_demo",
      email: "ilyavolkov.demo@devflow.local",
      bio: "Full-stack engineer who likes TypeScript, MongoDB, and product quality.",
      image: "https://api.dicebear.com/9.x/adventurer/svg?seed=Ilya",
      location: "Tbilisi, Georgia",
      portfolio: "https://example.com/ilya",
      reputation: 315,
    },
    {
      name: "Sara Johnson",
      username: "sarajohnson_demo",
      email: "sarajohnson.demo@devflow.local",
      bio: "Platform engineer interested in infra reliability and deployment workflows.",
      image: "https://api.dicebear.com/9.x/adventurer/svg?seed=Sara",
      location: "Austin, USA",
      portfolio: "https://example.com/sara",
      reputation: 640,
    },
  ];

  const ensuredDemoUsers = [];
  for (const user of demoUsersSeed) {
    const existing = await User.findOne({ email: user.email });
    if (existing) {
      await User.updateOne({ _id: existing._id }, { $set: user });
      ensuredDemoUsers.push({ ...(existing.toObject ? existing.toObject() : existing), ...user, _id: existing._id });
      continue;
    }

    const created = await User.create(user);
    ensuredDemoUsers.push(created.toObject());
  }

  const users = [...existingUsers, ...ensuredDemoUsers].reduce((acc, user) => {
    if (!acc.find((item) => String(item._id) === String(user._id))) acc.push(user);
    return acc;
  }, []);

  if (users.length < 4) {
    throw new Error("Need at least 4 users to generate meaningful demo data");
  }

  await Promise.all([
    Vote.deleteMany({}),
    Collection.deleteMany({}),
    Interaction.deleteMany({}),
    Answer.deleteMany({}),
    TagQuestion.deleteMany({}),
    Question.deleteMany({}),
    Tag.deleteMany({}),
  ]);

  const tagDocs = await Tag.insertMany([
    { name: "react", questions: 0 },
    { name: "nextjs", questions: 0 },
    { name: "typescript", questions: 0 },
    { name: "mongodb", questions: 0 },
    { name: "tailwindcss", questions: 0 },
    { name: "authentication", questions: 0 },
    { name: "vercel", questions: 0 },
    { name: "performance", questions: 0 },
  ]);

  const tagMap = Object.fromEntries(tagDocs.map((tag) => [tag.name, tag]));

  const questionSeeds = [
    {
      title: "How can I avoid hydration mismatch in a Next.js App Router page with theme switching?",
      content: markdown(`
I have a Next.js app that uses a server layout and a client-side theme switcher.

The page renders correctly on the server, but after hydration I sometimes get a mismatch warning when the stored theme differs from the initial HTML.

What is the safest pattern for theme-dependent UI in App Router?

\`\`\`tsx
export default function ThemeLabel() {
  const { theme } = useTheme();
  return <span>{theme}</span>;
}
\`\`\`

I want a solution that keeps SEO-friendly HTML and avoids flashing the wrong theme.
      `),
      tags: ["nextjs", "react", "authentication"],
      author: users[0]._id,
      views: 184,
      upvotes: 7,
      downvotes: 1,
      createdAt: new Date("2026-04-09T09:20:00Z"),
    },
    {
      title: "Best way to model question tags in MongoDB when I need both filtering and top-tag stats?",
      content: markdown(`
I'm building a Q&A product on MongoDB and currently store tag ids directly inside a question document.

That works for filtering, but I also need fast counters for tag pages and user profile statistics.

Would you keep:

1. only \`question.tags: ObjectId[]\`
2. only a junction collection
3. both, with counters updated transactionally

The traffic is moderate, but I want to keep reads cheap.
      `),
      tags: ["mongodb", "typescript", "performance"],
      author: users[1]._id,
      views: 132,
      upvotes: 11,
      downvotes: 0,
      createdAt: new Date("2026-04-08T13:45:00Z"),
    },
    {
      title: "Why does my Vercel deployment succeed but runtime logs show missing environment variables?",
      content: markdown(`
The build passes on Vercel, but the app throws at runtime because a server action cannot find \`MONGODB_URI\`.

Locally everything works from \`.env\`.

What is the recommended way to debug:

- build-time env
- runtime env
- preview vs production differences

I also want a reliable workflow for checking logs after each push.
      `),
      tags: ["vercel", "nextjs", "mongodb"],
      author: users[2]._id,
      views: 207,
      upvotes: 9,
      downvotes: 2,
      createdAt: new Date("2026-04-07T17:10:00Z"),
    },
    {
      title: "How do you structure Tailwind utility classes so animated sidebar navigation stays maintainable?",
      content: markdown(`
My sidebar links now have gradients, hover shadows, icon motion, and active-state styling.

The problem is that the class strings are growing fast and are hard to reason about.

Do you usually:

- extract helper utilities in globals.css
- keep everything inline with \`cn()\`
- create small variant helpers with class-variance-authority

I'm looking for a pattern that still keeps hover effects expressive.
      `),
      tags: ["tailwindcss", "react", "typescript"],
      author: users[3]._id,
      views: 96,
      upvotes: 5,
      downvotes: 0,
      createdAt: new Date("2026-04-06T11:05:00Z"),
    },
    {
      title: "What is a clean way to sort answers by votes while keeping newest-first as a fallback?",
      content: markdown(`
On a question page I support multiple answer filters.

I want:

- "highest votes" to use score first
- ties to fall back to newest
- stable pagination without duplicate items between pages

The data sits in MongoDB and answers have separate upvote/downvote counters.
      `),
      tags: ["mongodb", "performance", "typescript"],
      author: users[0]._id,
      views: 71,
      upvotes: 4,
      downvotes: 0,
      createdAt: new Date("2026-04-05T08:30:00Z"),
    },
  ];

  const questions = [];
  for (const seed of questionSeeds) {
    const tags = seed.tags.map((name) => tagMap[name]._id);
    const question = await Question.create({
      title: seed.title,
      content: seed.content,
      tags,
      views: seed.views,
      upvotes: seed.upvotes,
      downvotes: seed.downvotes,
      answers: 0,
      author: seed.author,
      createdAt: seed.createdAt,
      updatedAt: seed.createdAt,
    });

    questions.push(question);

    await Promise.all(
      seed.tags.map((name) =>
        TagQuestion.create({
          tag: tagMap[name]._id,
          question: question._id,
          createdAt: seed.createdAt,
          updatedAt: seed.createdAt,
        })
      )
    );
  }

  for (const tag of tagDocs) {
    const count = await Question.countDocuments({ tags: tag._id });
    await Tag.updateOne({ _id: tag._id }, { $set: { questions: count } });
  }

  const answerSeeds = [
    {
      questionIndex: 0,
      author: users[1]._id,
      content: markdown(`
The safest pattern is to avoid rendering theme-dependent text until the client has mounted.

For App Router I usually do this:

\`\`\`tsx
const [mounted, setMounted] = useState(false);

useEffect(() => {
  setMounted(true);
}, []);

if (!mounted) return null;
return <span>{theme}</span>;
\`\`\`

If you want no layout shift, render a fixed-size placeholder on the server and swap it after mount.
      `),
      upvotes: 6,
      downvotes: 0,
      createdAt: new Date("2026-04-09T10:05:00Z"),
    },
    {
      questionIndex: 0,
      author: users[3]._id,
      content: markdown(`
Another option is to keep the value out of the server-rendered tree entirely.

Put theme-sensitive controls behind a client boundary and keep the rest of the page static.

That usually gives the cleanest separation between SEO content and browser-only preferences.
      `),
      upvotes: 3,
      downvotes: 0,
      createdAt: new Date("2026-04-09T12:15:00Z"),
    },
    {
      questionIndex: 1,
      author: users[2]._id,
      content: markdown(`
If your read path is important, keeping tag ids on the question plus a junction collection is reasonable.

Use the embedded ids for page queries and the join table for aggregation-heavy workflows.

The key is to update both in one transaction and treat the counters as derived data you can rebuild if needed.
      `),
      upvotes: 8,
      downvotes: 1,
      createdAt: new Date("2026-04-08T15:00:00Z"),
    },
    {
      questionIndex: 2,
      author: users[0]._id,
      content: markdown(`
Vercel env problems are often scope issues.

Check whether the variable exists in:

- Production
- Preview
- Development

Then redeploy after editing env vars. Logs help confirm whether the missing value happens at build time or only when a serverless function runs.
      `),
      upvotes: 5,
      downvotes: 0,
      createdAt: new Date("2026-04-07T19:30:00Z"),
    },
    {
      questionIndex: 3,
      author: users[1]._id,
      content: markdown(`
I would keep the visual language in the component, but extract recurring motion primitives into semantic utility classes.

For example:

- base shell
- active state
- hover glow
- icon motion

That keeps your JSX readable without hiding design decisions too deeply.
      `),
      upvotes: 4,
      downvotes: 0,
      createdAt: new Date("2026-04-06T12:10:00Z"),
    },
    {
      questionIndex: 4,
      author: users[3]._id,
      content: markdown(`
For stable sorting, use a compound sort:

\`\`\`js
{ upvotes: -1, createdAt: -1, _id: -1 }
\`\`\`

That gives you deterministic ordering and prevents pagination drift when multiple answers have the same score.
      `),
      upvotes: 7,
      downvotes: 0,
      createdAt: new Date("2026-04-05T09:00:00Z"),
    },
  ];

  const answers = [];
  for (const seed of answerSeeds) {
    const answer = await Answer.create({
      author: seed.author,
      question: questions[seed.questionIndex]._id,
      content: seed.content,
      upvotes: seed.upvotes,
      downvotes: seed.downvotes,
      createdAt: seed.createdAt,
      updatedAt: seed.createdAt,
    });

    answers.push(answer);
  }

  for (const question of questions) {
    const count = await Answer.countDocuments({ question: question._id });
    await Question.updateOne({ _id: question._id }, { $set: { answers: count } });
  }

  const voteSeeds = [
    { author: users[1]._id, actionId: questions[0]._id, actionType: "question", voteType: "upvote" },
    { author: users[2]._id, actionId: questions[0]._id, actionType: "question", voteType: "upvote" },
    { author: users[3]._id, actionId: questions[0]._id, actionType: "question", voteType: "downvote" },
    { author: users[0]._id, actionId: questions[1]._id, actionType: "question", voteType: "upvote" },
    { author: users[2]._id, actionId: questions[1]._id, actionType: "question", voteType: "upvote" },
    { author: users[3]._id, actionId: questions[2]._id, actionType: "question", voteType: "upvote" },
    { author: users[1]._id, actionId: questions[2]._id, actionType: "question", voteType: "downvote" },
    { author: users[0]._id, actionId: answers[0]._id, actionType: "answer", voteType: "upvote" },
    { author: users[2]._id, actionId: answers[0]._id, actionType: "answer", voteType: "upvote" },
    { author: users[3]._id, actionId: answers[2]._id, actionType: "answer", voteType: "upvote" },
    { author: users[0]._id, actionId: answers[2]._id, actionType: "answer", voteType: "upvote" },
    { author: users[1]._id, actionId: answers[5]._id, actionType: "answer", voteType: "upvote" },
  ];

  await Vote.insertMany(voteSeeds);

  await Collection.insertMany([
    { author: users[0]._id, question: questions[1]._id },
    { author: users[0]._id, question: questions[2]._id },
    { author: users[1]._id, question: questions[0]._id },
    { author: users[2]._id, question: questions[3]._id },
  ]);

  const interactionSeeds = [
    { user: users[0]._id, action: "view", actionId: questions[0]._id, actionType: "question" },
    { user: users[0]._id, action: "bookmark", actionId: questions[1]._id, actionType: "question" },
    { user: users[1]._id, action: "view", actionId: questions[1]._id, actionType: "question" },
    { user: users[1]._id, action: "post", actionId: answers[0]._id, actionType: "answer" },
    { user: users[2]._id, action: "upvote", actionId: questions[1]._id, actionType: "question" },
    { user: users[2]._id, action: "view", actionId: questions[2]._id, actionType: "question" },
    { user: users[3]._id, action: "post", actionId: questions[3]._id, actionType: "question" },
    { user: users[3]._id, action: "upvote", actionId: answers[2]._id, actionType: "answer" },
  ];

  await Interaction.insertMany(interactionSeeds);

  const summary = {
    usersAvailable: await User.countDocuments({}),
    questions: await Question.countDocuments({}),
    answers: await Answer.countDocuments({}),
    tags: await Tag.countDocuments({}),
    votes: await Vote.countDocuments({}),
    collections: await Collection.countDocuments({}),
    interactions: await Interaction.countDocuments({}),
  };

  console.log("Demo data seeded successfully.");
  console.log(JSON.stringify(summary, null, 2));

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Seed failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
