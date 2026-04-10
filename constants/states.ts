import ROUTES from "./routes";

export const DEFAULT_EMPTY = {
  title: "states.defaultEmptyTitle",
  message: "states.defaultEmptyMessage",
  button: {
    text: "states.addData",
    href: ROUTES.HOME,
  },
};

export const DEFAULT_ERROR = {
  title: "states.defaultErrorTitle",
  message: "states.defaultErrorMessage",
  button: {
    text: "states.retryRequest",
    href: ROUTES.HOME,
  },
};

export const EMPTY_QUESTION = {
  title: "states.noQuestionsTitle",
  message: "states.noQuestionsMessage",
  button: {
    text: "states.askQuestion",
    href: ROUTES.ASK_QUESTION,
  },
};

export const EMPTY_TAGS = {
  title: "states.noTagsTitle",
  message: "states.noTagsMessage",
  button: {
    text: "states.createTag",
    href: ROUTES.TAGS,
  },
};

export const EMPTY_ANSWERS = {
  title: "states.noAnswersTitle",
  message: "states.noAnswersMessage",
};

export const EMPTY_COLLECTIONS = {
  title: "states.emptyCollectionsTitle",
  message: "states.emptyCollectionsMessage",
  button: {
    text: "states.saveToCollection",
    href: ROUTES.COLLECTION,
  },
};

export const EMPTY_USERS = {
  title: "states.noUsersTitle",
  message: "states.noUsersMessage",
};
