import UserPostedAt from "./UserPostedAt.tsx";
import { Comment } from "@/utils/db.ts";

export default function CommentSummary(props: Comment) {
  return (
    <div class="py-4">
      <UserPostedAt {...props} />
      <p>{props.text}</p>
    </div>
  );
}
