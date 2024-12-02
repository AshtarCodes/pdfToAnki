## Example Usage

To generate Anki flashcards from a set of images, run the following command
`node js/index.js --directory {DIRECTORY} --deckName {DECKNAME}  --profile {PROFILE}`

Where:

- DIRECTORY is like: `~/Downloads/respiratory/mechanical-ventilation`
- DECKNAME is like `RESPIRATORY::MECHANICAL-VENTILATION`
- PROFILE is like `'User 1'`

See `--help` for more information on each flag.

## Possible Errors

### ECONN Reset with Anki Connect on localhost

- set keepAlive to false
- disable firewall on your machine

node js/index.js --file "sandbox/input/card-test.pdf" --deckName "pdf-test" --profile "silis anki"
