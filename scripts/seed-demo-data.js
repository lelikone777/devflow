const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const { execFileSync } = require("child_process");

const DEFAULT_PASSWORD = "Devflow123!";

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return;

  for (const line of fs.readFileSync(filePath, "utf8").split(/\r?\n/)) {
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
    if (!process.env[key]) process.env[key] = value;
  }
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
  const mergedParams = [existingParams, txtParams, "tls=true"].filter(Boolean).join("&");

  return `mongodb://${authPart}${hostsPart}${dbPath}${mergedParams ? `?${mergedParams}` : ""}`;
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

  const AccountSchema = new Schema(
    {
      userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
      name: { type: String, required: true },
      image: String,
      password: String,
      provider: { type: String, required: true },
      providerAccountId: { type: String, required: true },
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
      actionType: { type: String, enum: ["question", "answer"], required: true },
      voteType: { type: String, enum: ["upvote", "downvote"], required: true },
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
      actionType: { type: String, enum: ["question", "answer"], required: true },
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
    Account: mongoose.models.Account || mongoose.model("Account", AccountSchema),
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

function createRng(seed) {
  let value = seed >>> 0;
  return () => {
    value += 0x6d2b79f5;
    let t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rng = createRng(20260411);

function randInt(min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

function sample(array) {
  return array[randInt(0, array.length - 1)];
}

function sampleMany(array, count, exclude = new Set()) {
  const pool = array.filter((item) => !exclude.has(String(item._id ?? item)));
  const copy = [...pool];
  const picked = [];
  while (copy.length > 0 && picked.length < count) {
    picked.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  }
  return picked;
}

function markdown(lines) {
  return lines.join("\n").trim();
}

const userSeeds = [
  ["Алексей Петров", "aleksei.petrov", "Москва, Россия", "Frontend-разработчик. Люблю Next.js, аккуратные интерфейсы и типизацию."],
  ["Марина Соколова", "marina.sokolova", "Санкт-Петербург, Россия", "Делаю сложные панели управления и привожу хаотичный UI к порядку."],
  ["Илья Ковалёв", "ilya.kovalev", "Казань, Россия", "Backend-инженер. Node.js, MongoDB, очереди и спокойные ночные деплои."],
  ["Екатерина Смирнова", "ekaterina.smirnova", "Екатеринбург, Россия", "Разбираю инциденты и чиню архитектуру, когда быстрые патчи уже перестают помогать."],
  ["Никита Орлов", "nikita.orlov", "Новосибирск, Россия", "Full-stack разработчик. Чаще упрощаю решения, чем усложняю."],
  ["София Волкова", "sofia.volkova", "Нижний Новгород, Россия", "Люблю продуктовые интерфейсы и понятные данные под ними."],
  ["Тимур Сафиуллин", "timur.safiullin", "Уфа, Россия", "Platform engineer. CI/CD, логи, observability и скучная надёжная инфраструктура."],
  ["Ольга Жукова", "olga.zhukova", "Самара, Россия", "Работаю с React и аналитикой. Люблю понятные интерфейсы без визуального шума."],
  ["Даниил Лебедев", "daniil.lebedev", "Краснодар, Россия", "Автоматизирую всё, что можно не делать руками дважды."],
  ["Анна Белова", "anna.belova", "Томск, Россия", "Интересуюсь безопасностью, авторизацией и тем, как не испортить UX защитой."],
  ["Maya Cole", "maya.cole", "Berlin, Germany", "Full-stack engineer focused on product velocity, observability, and clean deployments."],
  ["Anton Reed", "anton.reed", "Prague, Czechia", "I like maintainable code, small abstractions, and boring infrastructure."],
];

const tagNames = [
  "react",
  "nextjs",
  "typescript",
  "javascript",
  "nodejs",
  "mongodb",
  "postgresql",
  "tailwindcss",
  "vercel",
  "authentication",
  "testing",
  "performance",
  "api",
  "docker",
  "redis",
  "graphql",
  "css",
  "debugging",
];

const questionSeeds = [
  ["ru", "Как безопасно убрать hydration mismatch в Next.js App Router при переключении темы?", ["nextjs", "react", "typescript"]],
  ["ru", "Как хранить теги вопросов в MongoDB, чтобы и фильтрация была быстрой, и статистика не тормозила?", ["mongodb", "typescript", "performance"]],
  ["ru", "На Vercel деплой успешный, но серверное действие не видит MONGODB_URI. Куда копать?", ["vercel", "nextjs", "mongodb"]],
  ["ru", "Как держать hover-эффекты в Tailwind под контролем, чтобы классы не превращались в кашу?", ["tailwindcss", "react", "css"]],
  ["ru", "Как сортировать ответы по голосам без дёрганой пагинации и дублей между страницами?", ["mongodb", "performance", "api"]],
  ["ru", "Почему search input с синхронизацией в URL начинает дёргаться при быстром вводе?", ["react", "typescript", "debugging"]],
  ["ru", "Можно ли нормально использовать Credentials и OAuth в одном NextAuth-конфиге?", ["authentication", "nextjs", "typescript"]],
  ["ru", "Как не сломать данные при удалении вопроса, если с ним связаны ответы, голоса и теги?", ["mongodb", "nodejs", "api"]],
  ["ru", "Как типизировать ответ серверного действия, чтобы не размазывать проверки success/error по всему UI?", ["typescript", "react", "api"]],
  ["ru", "Почему populate в Mongoose начинает тормозить уже на умеренном количестве связей?", ["mongodb", "nodejs", "performance"]],
  ["ru", "Как аккуратно сделать optimistic update для голосования, чтобы UI не врал пользователю?", ["react", "typescript", "api"]],
  ["ru", "Как организовать поиск по вопросам, ответам, пользователям и тегам без ощущения хаоса?", ["mongodb", "performance", "api"]],
  ["ru", "Почему hover-анимации на десктопе выглядят хорошо, а на мобильных только мешают?", ["css", "tailwindcss", "performance"]],
  ["ru", "Как не тащить лишние поля из jobs API и всё равно сохранить нужную информацию для карточки вакансии?", ["api", "typescript", "performance"]],
  ["ru", "Можно ли сделать единый стиль для табов на профиле и не затронуть остальные табы в проекте?", ["react", "tailwindcss", "css"]],
  ["ru", "Как лучше сидировать демо-данные для Q&A-приложения, чтобы страница не выглядела как тестовый стенд?", ["nodejs", "mongodb", "testing"]],
  ["en", "How do you avoid duplicate requests in Next.js when server and client fetch almost the same data?", ["nextjs", "react", "performance"]],
  ["ru", "Как проектировать ActionResponse, если часть ошибок идёт из zod, а часть из бизнес-логики?", ["typescript", "api", "debugging"]],
  ["ru", "Почему после смены языка часть текста всё равно остаётся на прошлом языке до hard refresh?", ["nextjs", "react", "debugging"]],
  ["en", "How would you model a bookmark feature so it stays simple now but still scales later?", ["mongodb", "api", "typescript"]],
  ["ru", "Как выбирать между MongoDB и PostgreSQL для контентного продукта, где много счётчиков и связей?", ["mongodb", "postgresql", "performance"]],
  ["ru", "Как лучше хранить markdown-контент вопроса: сырой markdown, html-preview или оба варианта?", ["api", "performance", "nodejs"]],
  ["en", "How do you keep seed data realistic enough for UI review without making the script unmaintainable?", ["testing", "nodejs", "typescript"]],
  ["ru", "Как аккуратно ограничить список стран для поиска вакансий, если провайдер стабильно работает только по US?", ["api", "react", "debugging"]],
  ["ru", "Почему Image в Next.js ломается на внешних аватарках, хотя домен вроде бы уже добавлен?", ["nextjs", "react", "debugging"]],
  ["en", "How would you implement role-based route protection in App Router without duplicating checks everywhere?", ["nextjs", "authentication", "typescript"]],
  ["ru", "Как сделать карточки тегов визуально контрастными в тёмной теме, чтобы текст и иконки не терялись?", ["tailwindcss", "css", "react"]],
  ["ru", "Как распределить hover-эффекты по интерфейсу так, чтобы они были единообразными?", ["tailwindcss", "css", "performance"]],
  ["ru", "Почему zod + react-hook-form на динамических полях иногда даёт ошибки не на том уровне вложенности?", ["typescript", "react", "testing"]],
  ["ru", "Какой минимальный набор логов стоит добавить в server actions, чтобы потом не гадать, где всё пошло не так?", ["nodejs", "debugging", "vercel"]],
];

function buildQuestionContent(language, title, tags) {
  const tagLine = tags.join(", ");
  const code =
    tags.includes("nextjs")
      ? `const [mounted, setMounted] = useState(false);\n\nuseEffect(() => {\n  setMounted(true);\n}, []);\n\nif (!mounted) return null;`
      : tags.includes("mongodb")
        ? `const result = await Model.find(filter)\n  .sort(sortCriteria)\n  .skip((page - 1) * pageSize)\n  .limit(pageSize);`
        : `const nextState = items.map((item) =>\n  item.id === targetId ? { ...item, active: true } : item\n);`;

  if (language === "en") {
    return markdown([
      "### Context",
      `I am working on a DevFlow-like product and ran into this issue: ${title}`,
      "",
      "### What I already tried",
      `- simplified the logic around ${tagLine}`,
      "- checked whether the problem happens on the server or only after hydration",
      "- reduced the amount of state, but the edge case is still there",
      "",
      "### Current snippet",
      "```ts",
      code,
      "```",
      "",
      "### What I want to solve",
      "I want a practical solution that is stable in production and not just a patch for one narrow case.",
    ]);
  }

  return markdown([
    "### Контекст",
    `Работаю над проектом, похожим на DevFlow, и упёрся в такую проблему: ${title}`,
    "",
    "### Что уже попробовал",
    `- упростил логику вокруг ${tagLine}`,
    "- проверил, воспроизводится ли проблема только на клиенте или уже на серверном рендере",
    "- уменьшил количество состояний и условий, но крайний кейс всё равно остался",
    "",
    "### Фрагмент кода",
    "```ts",
    code,
    "```",
    "",
    "### Что хочу получить",
    "Нужен не просто временный фикс, а понятный и устойчивый вариант, который не сломается после следующего рефакторинга.",
  ]);
}

const ruOpeners = [
  "Я бы начал с самого простого и воспроизводимого сценария.",
  "Похоже, проблема не в одной строчке, а в границе между слоями.",
  "У нас похожая история уже всплывала на продовом проекте.",
  "Я бы здесь сначала упростил поток данных.",
];

const ruClosers = [
  "После этого решение обычно становится намного стабильнее.",
  "Главное здесь не смешивать транспорт, состояние и представление в одном месте.",
  "Я бы сначала закрепил это тестом, а уже потом шлифовал код.",
  "Обычно уже этого хватает, чтобы убрать хаотичное поведение.",
];

const enOpeners = [
  "I would start by reducing the number of moving parts.",
  "This usually points to a boundary problem between layers.",
  "The safest approach here is normally the boring one.",
  "I would simplify the data flow before optimizing anything else.",
];

const enClosers = [
  "That usually removes most of the surprising edge cases.",
  "Once that is in place, the rest becomes much easier to reason about.",
  "I would add one small regression test around this before refactoring further.",
  "After that, you can improve the UX without guessing.",
];

function buildAnswer(language, tags, answerIndex) {
  if (language === "en") {
    if (answerIndex === 0) {
      return markdown([
        sample(enOpeners),
        "",
        "My checklist would be:",
        `1. Make one layer responsible for the initial state around ${tags.join(", ")}.`,
        "2. Remove any duplicate transformations between server and client.",
        "3. Add deterministic ordering or explicit invalidation where the UI can drift.",
        "",
        sample(enClosers),
      ]);
    }
    if (answerIndex === 1) {
      return markdown([
        "One more thing I would check is whether your requests are truly different or just triggered from different places.",
        "",
        "If the payload is effectively the same, consolidating it often solves both performance and correctness issues.",
      ]);
    }
    return markdown([
      "Small practical note: do not fix UX and architecture in the same step.",
      "",
      "First make the behavior correct, then make it feel fast.",
    ]);
  }

  if (answerIndex === 0) {
    return markdown([
      sample(ruOpeners),
      "",
      "Я бы предложил такой порядок действий:",
      `1. Явно определить источник истины для блока, который связан с \`${tags.join(", ")}\`.`,
      "2. Проверить, нет ли дублирующей логики между серверным рендером и клиентским состоянием.",
      "3. Добавить один воспроизводимый сценарий, по которому можно быстро проверить исправление.",
      "",
      sample(ruClosers),
    ]);
  }
  if (answerIndex === 1) {
    return markdown([
      "Плюс один к предыдущему ответу, но я бы отдельно посмотрел на данные, которые приходят уже после initial render.",
      "",
      "Очень часто кажется, что проблема в UI, а по факту срывается консистентность между query params, cookie и локальным состоянием.",
    ]);
  }
  return markdown([
    "Короткое замечание из опыта: не пытайся чинить одновременно архитектуру, анимации и UX.",
    "",
    "Сначала добейся корректного поведения, потом уже полируй ощущения от интерфейса.",
  ]);
}

function computeAnswerCount(index) {
  if ([2, 7, 14, 27].includes(index)) return 0;
  if ([0, 1, 3, 5, 8, 10, 16, 20, 24].includes(index)) return randInt(3, 5);
  return randInt(1, 3);
}

async function run() {
  const rootDir = path.resolve(__dirname, "..");
  loadEnvFile(path.join(rootDir, ".env"));
  loadEnvFile(path.join(rootDir, ".env.local"));

  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is not defined in .env or .env.local");
  }

  await mongoose.connect(normalizeMongoUri(process.env.MONGODB_URI), {
    dbName: "devflow",
  });

  const { User, Account, Question, Answer, Tag, Vote, Collection, Interaction, TagQuestion } =
    createSchemas();

  await Promise.all([
    Vote.deleteMany({}),
    Collection.deleteMany({}),
    Interaction.deleteMany({}),
    Answer.deleteMany({}),
    TagQuestion.deleteMany({}),
    Question.deleteMany({}),
    Tag.deleteMany({}),
    Account.deleteMany({}),
    User.deleteMany({}),
  ]);

  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const users = [];

  for (const [index, seed] of userSeeds.entries()) {
    const [name, username, location, bio] = seed;
    const email = `${username}@devflow.local`;
    const createdAt = new Date(Date.now() - (70 - index) * 24 * 60 * 60 * 1000);
    const image = `https://api.dicebear.com/9.x/adventurer/svg?seed=${encodeURIComponent(username)}`;
    const user = await User.create({
      name,
      username,
      email,
      location,
      bio,
      image,
      portfolio: `https://portfolio.dev/${username}`,
      reputation: randInt(20, 180),
      createdAt,
      updatedAt: createdAt,
    });

    users.push(user);

    await Account.create({
      userId: user._id,
      name,
      image,
      password: passwordHash,
      provider: "credentials",
      providerAccountId: email,
      createdAt,
      updatedAt: createdAt,
    });
  }

  const tagDocs = await Tag.insertMany(tagNames.map((name) => ({ name, questions: 0 })));
  const tagMap = Object.fromEntries(tagDocs.map((tag) => [tag.name, tag]));

  const questions = [];
  const answers = [];
  const voteDocs = [];
  const interactionDocs = [];
  const collectionDocs = [];
  const startTime = Date.now() - 45 * 24 * 60 * 60 * 1000;

  for (const [index, seed] of questionSeeds.entries()) {
    const [language, title, tags] = seed;
    const author = users[index % users.length];
    const createdAt = new Date(startTime + index * 29 * 60 * 60 * 1000);

    const question = await Question.create({
      title,
      content: buildQuestionContent(language, title, tags),
      tags: tags.map((tagName) => tagMap[tagName]._id),
      views: randInt(30, 380),
      upvotes: 0,
      downvotes: 0,
      answers: 0,
      author: author._id,
      createdAt,
      updatedAt: createdAt,
    });

    questions.push({ ...question.toObject(), language, tags });

    for (const tagName of tags) {
      await TagQuestion.create({
        tag: tagMap[tagName]._id,
        question: question._id,
        createdAt,
        updatedAt: createdAt,
      });
    }

    interactionDocs.push({
      user: author._id,
      action: "post",
      actionId: question._id,
      actionType: "question",
      createdAt,
      updatedAt: createdAt,
    });

    for (const viewer of sampleMany(users, randInt(2, 6), new Set([String(author._id)]))) {
      const eventTime = new Date(createdAt.getTime() + randInt(2, 48) * 60 * 60 * 1000);
      interactionDocs.push({
        user: viewer._id,
        action: "view",
        actionId: question._id,
        actionType: "question",
        createdAt: eventTime,
        updatedAt: eventTime,
      });
    }

    const answerCount = computeAnswerCount(index);
    const answerAuthors = sampleMany(users, answerCount, new Set([String(author._id)]));

    for (let answerIndex = 0; answerIndex < answerCount; answerIndex += 1) {
      const answerAuthor = answerAuthors[answerIndex % answerAuthors.length];
      const answerCreatedAt = new Date(
        createdAt.getTime() + randInt(2, 96) * 60 * 60 * 1000 + answerIndex * 35 * 60 * 1000
      );
      const answer = await Answer.create({
        author: answerAuthor._id,
        question: question._id,
        content: buildAnswer(language, tags, answerIndex),
        upvotes: 0,
        downvotes: 0,
        createdAt: answerCreatedAt,
        updatedAt: answerCreatedAt,
      });

      answers.push(answer.toObject());
      interactionDocs.push({
        user: answerAuthor._id,
        action: "post",
        actionId: answer._id,
        actionType: "answer",
        createdAt: answerCreatedAt,
        updatedAt: answerCreatedAt,
      });
    }
  }

  for (const question of questions) {
    const answerCount = answers.filter((answer) => String(answer.question) === String(question._id)).length;
    await Question.updateOne({ _id: question._id }, { $set: { answers: answerCount } });
  }

  for (const question of questions) {
    for (const voter of sampleMany(users, randInt(2, 7), new Set([String(question.author)]))) {
      voteDocs.push({
        author: voter._id,
        actionId: question._id,
        actionType: "question",
        voteType: rng() > 0.18 ? "upvote" : "downvote",
        createdAt: new Date(new Date(question.createdAt).getTime() + randInt(2, 72) * 60 * 60 * 1000),
        updatedAt: new Date(new Date(question.createdAt).getTime() + randInt(2, 72) * 60 * 60 * 1000),
      });
    }
  }

  for (const answer of answers) {
    for (const voter of sampleMany(users, randInt(1, 5), new Set([String(answer.author)]))) {
      voteDocs.push({
        author: voter._id,
        actionId: answer._id,
        actionType: "answer",
        voteType: rng() > 0.16 ? "upvote" : "downvote",
        createdAt: new Date(new Date(answer.createdAt).getTime() + randInt(1, 48) * 60 * 60 * 1000),
        updatedAt: new Date(new Date(answer.createdAt).getTime() + randInt(1, 48) * 60 * 60 * 1000),
      });
    }
  }

  if (voteDocs.length > 0) await Vote.insertMany(voteDocs);

  for (const question of questions) {
    const related = voteDocs.filter((vote) => String(vote.actionId) === String(question._id) && vote.actionType === "question");
    const upvotes = related.filter((vote) => vote.voteType === "upvote").length;
    const downvotes = related.filter((vote) => vote.voteType === "downvote").length;
    await Question.updateOne(
      { _id: question._id },
      {
        $set: {
          upvotes,
          downvotes,
          views: upvotes * randInt(6, 15) + downvotes * randInt(2, 5) + randInt(20, 130),
        },
      }
    );
  }

  for (const answer of answers) {
    const related = voteDocs.filter((vote) => String(vote.actionId) === String(answer._id) && vote.actionType === "answer");
    const upvotes = related.filter((vote) => vote.voteType === "upvote").length;
    const downvotes = related.filter((vote) => vote.voteType === "downvote").length;
    await Answer.updateOne({ _id: answer._id }, { $set: { upvotes, downvotes } });
  }

  for (const question of questions) {
    for (const collector of sampleMany(users, randInt(0, 4), new Set([String(question.author)]))) {
      const eventTime = new Date(new Date(question.createdAt).getTime() + randInt(10, 96) * 60 * 60 * 1000);
      collectionDocs.push({
        author: collector._id,
        question: question._id,
        createdAt: eventTime,
        updatedAt: eventTime,
      });
      interactionDocs.push({
        user: collector._id,
        action: "bookmark",
        actionId: question._id,
        actionType: "question",
        createdAt: eventTime,
        updatedAt: eventTime,
      });
    }
  }

  if (collectionDocs.length > 0) await Collection.insertMany(collectionDocs);

  for (const vote of voteDocs) {
    interactionDocs.push({
      user: vote.author,
      action: vote.voteType,
      actionId: vote.actionId,
      actionType: vote.actionType,
      createdAt: vote.createdAt,
      updatedAt: vote.updatedAt,
    });
  }

  if (interactionDocs.length > 0) await Interaction.insertMany(interactionDocs);

  for (const tag of tagDocs) {
    const count = questions.filter((question) =>
      question.tags.some((questionTagId) => String(questionTagId) === String(tag._id))
    ).length;
    await Tag.updateOne({ _id: tag._id }, { $set: { questions: count } });
  }

  for (const user of users) {
    const userQuestions = await Question.find({ author: user._id }).lean();
    const userAnswers = await Answer.find({ author: user._id }).lean();
    const questionVotes = userQuestions.reduce((sum, item) => sum + item.upvotes - item.downvotes, 0);
    const answerVotes = userAnswers.reduce((sum, item) => sum + item.upvotes - item.downvotes, 0);
    const views = userQuestions.reduce((sum, item) => sum + item.views, 0);
    const reputation = 40 + userQuestions.length * 12 + userAnswers.length * 18 + questionVotes * 4 + answerVotes * 6 + Math.floor(views / 25);
    await User.updateOne({ _id: user._id }, { $set: { reputation } });
  }

  console.log("Realistic demo data seeded successfully.");
  console.log(
    JSON.stringify(
      {
        users: await User.countDocuments({}),
        accounts: await Account.countDocuments({}),
        questions: await Question.countDocuments({}),
        answers: await Answer.countDocuments({}),
        tags: await Tag.countDocuments({}),
        votes: await Vote.countDocuments({}),
        collections: await Collection.countDocuments({}),
        interactions: await Interaction.countDocuments({}),
        loginEmail: "aleksei.petrov@devflow.local",
        loginPassword: DEFAULT_PASSWORD,
        note:
          "Комментарии как отдельная сущность в проекте отсутствуют, поэтому ощущение живого общения создано через разные по тону и длине ответы.",
      },
      null,
      2
    )
  );

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("Seed failed:", error);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
