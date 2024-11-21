function formatTime(date) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return formatter.format(date);
}

module.exports = { formatTime };
