import { DAY } from "std/datetime/constants.ts";

/**
 * Converts a given Date object into a UTC timestamp.
 * @param {Date} date - The Date object to convert.
 * @returns {number} - The UTC timestamp in milliseconds.
 */
function getTimeFromDate(date: Date): number {
  return Date.UTC(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
  );
}

/**
 * Calculates the rating score for a given post based on user engagement, time spent, and recency.
 * @param {number} likes - Number of likes for the post.
 * @param {number} comments - Number of comments on the post.
 * @param {Date} postDate - Date of the post.
 * @returns {number} - The rating score of the post.
 */
export function calculateRating(
  likes: number,
  comments: number,
  postDate: Date,
): number {
  const likesWeight = 0.1;
  const commentsWeight = 0.5;
  const recencyWeight = 0.9;

  const likesScore = likes * likesWeight;
  const commentsScore = comments * commentsWeight;

  // https://stackoverflow.com/questions/2627473/how-to-calculate-the-number-of-days-between-two-dates
  const start = getTimeFromDate(new Date());
  const end = getTimeFromDate(postDate);
  const daysSincePublication = (start - end) / DAY;
  const recencyScore = recencyWeight / (daysSincePublication + 1);

  const ratingScore = likesScore + commentsScore + recencyScore;

  return ratingScore;
}
