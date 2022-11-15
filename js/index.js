#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');
const axios = require('axios');
require('core-js/proposals/string-replace-all-stage-4');
const args = require("minimist")(process.argv.slice(2),{
	boolean: ["help",],
	string: ["file","deckName","profile","chapter"],
});

const BASEPATH =
	path.resolve(process.env.BASEPATH || __dirname);
console.log('args ',args)
if (args.help || process.argv.length <= 2) {
	error(null,/*showHelp=*/true);
} else if (args.file && args.deckName && args.chapter) {
    let filePath = path.join(BASEPATH,args.file);
	fs.readFile(filePath,function(err,contents){
		if (err) error(err.toString());
		else processFile(contents).then((questions) => {
            // const notes = toAnkiNotesFormat(questions,args.deckName)
            // console.log('after processing: ',notes[0])
            return postToAnki(questions, args);
        }).catch(err => console.error(err));
	});
} else {
	error("Usage incorrect.",/*showHelp=*/true);
}

async function makeRequest(method, body ){
    let result;
   try {
        const {data} = await axios({url: 'http://localhost:8765/',method, data: body});
        result = data;   
    } catch (error) {
        console.error('Axios error: ',error)
    } finally {
        checkForAnkiConnectError(result);
        return result 
   }
}
function checkForAnkiConnectError(data){
    if (data.error) {
        throw data.error;
    }
}
async function postToAnki(questions, args){
    const version = 6;
    const {deckName} = args;
    // request permission, get profiles, load mom's profile, multi request?, addNote / addNotes, 
    const permission = await makeRequest('POST', {action: 'requestPermission', version});
    if (!permission.result?.permission === 'granted') {
        throw new Error('AnkiConnect Permission denied.');
    }
    const {result: profileResult} = await makeRequest('POST', {action: "getProfiles", version });
    const profileToLoad = profileResult.length <= 1 ? profileResult[0] : args.profile && profileResult.find(res => res.toLowerCase() === args.profile.toLowerCase());
    const {result: loadProfileResult} = await makeRequest('POST', {action: 'loadProfile', version, params: {name: profileToLoad}});
    // const {result: syncResult} = await makeRequest('POST', {action: 'sync', version});
    const notes = toAnkiNotesFormat(questions, deckName);
    const {result: existingDecksResult} = await makeRequest('POST', {action: 'deckNames', version});
    if (!existingDecksResult.includes(deckName)){
        const {result: createDeckResult} = await makeRequest('POST', {action: 'createDeck', version, params: { deck: deckName}});
    }
    const {result: createNoteResult} = await makeRequest('POST', {action: 'addNotes', version, params: { notes: notes}});
    const {result: finalSyncResult} = await makeRequest('POST', {action: 'sync', version});
    console.log(createNoteResult);
}

function createAnkiNoteTemplate({question: questionObj, deckName, tags}) {
    const {question, choices, answer, answerExtra, feedback} = questionObj;
    const fields = { Question: question.trim()};
    Object.keys(choices).forEach((choice, i) => {
         fields[`Choice ${i+1}`] =  choices[choice].trim();
    });
    fields.Answer = answer.trim();
    fields[`Answer Extra`] = answerExtra;
    fields[`Feedback`] = feedback.trim();

    return {
        deckName: deckName,
        modelName: "Anki Connect Basic",
        fields,
        tags,
        // audio,
        // video,
        // picture
    }
}

function toAnkiNotesFormat(questions, deckName) {
    return questions.map(question => createAnkiNoteTemplate({question, deckName}))
}

function printHelp() {
	console.log("pdfToAnki usage:");
	console.log("");
	console.log("--help                      print this help");
	console.log("-, --in                     read file from stdin");
	console.log("--file={FILENAME}           read file from {FILENAME}");
	console.log("");
	console.log("");
}
function error(err,showHelp = false) {
	process.exitCode = 1;
	console.error(err);
	if (showHelp) {
		console.log("");
		printHelp();
	}
}

function isIncremental(str, format) {
    const numbers = Array(100).fill(0);
    if (format === 1){
        // Page 28
        const format1 = numbers.map((n,i) => `${str} ${i+1}`);
        return format1
    } else if (format === 2) {
        // 1.
        const format2 = numbers.map((n,i) => `${i+1}.`);
        return format2;
    } else if (format === 3) {
        // Chapter 3:
        const format3 = numbers.map((n,i) => `${str} ${i+1}:`);
        return format3;
    } else if (format === 4) {
        const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map((l) => `${l})`);
        return letters;
    }
    return numbers
}

function isQuestion(line) {
    // match 3. or 3.A , but not 3.8
    line = line.trim();
    const isQ = /^[0-9]{1,2}(?=[.])(?!.[0-9])/.test(line);
    return isQ ? line[0] : null;
}

function processFile(dataBuffer) {
    return new Promise((resolve,reject) => {
        pdfParse(dataBuffer).then((data) => {
            let rawText = data.text;
            rawText = rawText.split('\n');
            let phraseFound = false; 
            let firstPass = []
            for (let line of rawText) { 
                if (line.includes(`Chapter ${args.chapter}`)) {
                    phraseFound = true
                }
                if (line.includes(`Chapter ${+args.chapter + 1}`)) {
                    phraseFound = false
                }
                if (phraseFound) {
                    firstPass.push(line);
                }
            }
            firstPass = firstPass.filter(x => {
                if (/^\s*$/.test(x)) {
                    // filter newlines/ carriage returns
                    return false
                } else if (isIncremental('Page',1).includes(x.trim())) {
                    // Page 28
                    return false
                } else if (isIncremental('Chapter', 3).includes(x.trim())) {
                    // Chapter 30:
                    return false;
                } else if (/(?=.*:)/.test(x)) {
                    x = x.trim();
                    // ${word}:
                    if (x.startsWith('Feedback:') ||
                        x.startsWith('Rationale:') ||
                        x.toLowerCase().startsWith('answer:') ||
                        x.toLowerCase().startsWith('ans:') ||
                        x.startsWith('Question format:') ||
                        x.startsWith('Format:')
                        ) {
                        return true
                    };
                    return false
                }
                return true;
            });
            // console.log(firstPass)
            let currentQuestion, questionObject, level, choice;
            const secondPass = firstPass.reduce((acc, line, idx, arr) => {
                line = line.replaceAll('abirb.com/test', '');
                const isQ = isQuestion(line);
                if (isQ) {
                    currentQuestion = Number(isQ?.replace('.', ''));
                    level = 'question';
                    questionObject = {questionNum: currentQuestion, question: '', choices: {}, answer: '', answerExtra: '', feedback: '' };
                    acc.push(questionObject);
                }
                // parse question, choices, answers, and feedback
                const {currentLevel, currentChoice} = processQuestion({line, currentLevel: level, questionObject, currentChoice: choice});
                level = currentLevel;
                choice = currentChoice;
                return acc;
            },[]);
            resolve(secondPass);
        })
        .catch(err => {
            console.error(err);
            reject(err)
        })
    })
}

function processQuestion({line, currentLevel, questionObject, currentChoice}){
    line = line.trim();
    const isAQuestion = isQuestion(line) && 'question';
    const isChoice = /^[A-Z](?=[).])/.test(line) && 'choice';
    const isAnswer = (line.startsWith('Ans:') || line.startsWith('Answer:')) && 'answer';
    const isFeedback = (line.startsWith('Feedback:') || line.startsWith('Rationale:')) && 'feedback';
    const isEndOfFeedback = line.startsWith('Question format:') || line.startsWith('Format:');
    if (isAQuestion || isChoice || isAnswer || isFeedback || isEndOfFeedback) {
        currentLevel = isAQuestion || isChoice || isAnswer || isFeedback || isEndOfFeedback;
    }

    if (currentLevel === 'question') {
        questionObject.question += `${line} `;
    }
    else if (currentLevel === 'choice') {
        if (isChoice) {
            currentChoice = line[0];
            questionObject.choices[currentChoice] = ''; 
        }
        const choice = isChoice ? line[0] : currentChoice;
        questionObject.choices[choice] += line; 

    }
    else if (currentLevel === 'answer') {
        questionObject.answer += `${line}`;
        let expandedAnswers = ''
        line.replace(/Ans:|Answer:/).split(/[,\s ]/).forEach(ans => {
            const choices = questionObject.choices;
            if (choices[ans]) {
                expandedAnswers += `\n${choices[ans]}`;
            }
        });
        questionObject.answerExtra += expandedAnswers;
    }
    else if (currentLevel === 'feedback') {
            questionObject.feedback += `${line} `;
    }
    return {currentLevel, currentChoice};
}
