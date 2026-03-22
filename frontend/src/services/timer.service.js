const formatTime = (time) => {
  if (time === null) return "Loading...";

  const minutes = Math.floor(time / 60);
  const seconds = time % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};
export default formatTime