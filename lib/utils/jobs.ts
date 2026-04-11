export function processJobTitle(title: string | undefined | null): string {
  if (!title) {
    return "No Job Title";
  }

  const validWords = title.split(" ").filter((word) => {
    const normalizedWord = word.toLowerCase();

    return normalizedWord !== "undefined" && normalizedWord !== "null";
  });

  if (validWords.length === 0) {
    return "No Job Title";
  }

  return validWords.join(" ");
}
