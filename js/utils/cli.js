function printHelp() {
  console.log("pdfToAnki usage:");
  console.log("");
  console.log("--help                      print this help");
  console.log("-, --in                     read file from stdin");
  console.log("--file={FILENAME}           read file from {FILENAME}");
  console.log("");
  console.log("--chapter {CHAPTER}       The chapter to look for.");
  console.log("");
  console.log(
    "--deckName {DECKNAME}       The name of the anki deck to add the notes to."
  );
  console.log("");
  console.log("--profile {profile}       The name of the Anki Profile.");
  console.log("");
  console.log("");
}
function error(err, showHelp = false) {
  process.exitCode = 1;
  console.error(err);
  if (showHelp) {
    console.log("");
    printHelp();
  }
}

module.exports = {
  printHelp,
  error,
};
