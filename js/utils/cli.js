function printHelp() {
  console.log("pdfToAnki usage:");
  console.log("");
  console.log("--help                      print this help");
  console.log("-, --in                     read file from stdin");
  console.log("");
  console.log("Image to Anki OPTIONS (common):");
  console.log("--directory {directory}     read files from {directory}");
  console.log("");
  console.log("------ Coming soon to image to anki ------");
  console.log("--llm {MODEL}     specify which llm model to use");
  console.log("");
  console.log("GENERAL OPTIONS (required):");
  console.log(
    "--profile {profile}       The name of the Anki Profile to add notes to."
  );
  console.log("");
  ("--deckName {DECKNAME}       The name of the anki deck to add the notes to.");
  console.log("");
  console.log("------ Coming soon ------");
  console.log("--noteType {noteType}     specify which Anki note type to use");
  console.log("");
  console.log("");
  console.log("PDF to Anki OPTIONS (rare):");
  console.log("--file {FILENAME}           read file from {FILENAME}");
  console.log("");
  console.log("--chapter {CHAPTER}       The chapter to look for.");
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
