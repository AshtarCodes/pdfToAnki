# Getting started
1. You will need an AWS Credentials Profile set up on your machine. As an alternative, you can export your AWS public and secret access keys in your environment prior to running the app. These are used to query the Amazon Textract API. 
1. Copy the .env.example and paste it into a '.env. file. You will need to provide your own OPENAI API Token here. Visit OPENAI to learn more on how to do that.


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
