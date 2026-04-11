import TagCard from "@/components/cards/TagCard";
import type { Tag } from "@/types";

interface QuestionTagsProps {
  tags: Tag[];
}

const QuestionTags = ({ tags }: QuestionTagsProps) => {
  return (
    <div className="mt-8 flex flex-wrap gap-2">
      {tags.map((tag) => (
        <TagCard key={tag._id} _id={tag._id as string} name={tag.name} compact />
      ))}
    </div>
  );
};

export default QuestionTags;
