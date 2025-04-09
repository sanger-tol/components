/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { env } from "../index";

const adverbs = [
    "quickly", "silently", "carefully", "calmly", "efficiently", "smoothly", "gently", "patiently", "enthusiastically",
    "happily", "precisely", "diligently", "modestly", "professionally", "cheerfully", "honestly"
];

const gerunds = [
    "analyzing", "solving", "completing", "assisting", "collaborating", "organizing", "innovating", "discussing",
    "preparing", "managing", "creating", "executing", "reviewing", "advising", "optimizing", "designing"
];

const colors = [
    "red", "orange", "yellow", "lime", "green",
    "teal", "cyan", "sky", "blue", "indigo",
    "violet", "purple", "magenta", "pink", "brown",
    "gray"
  ];

const animals = [
    "lion", "elephant", "dolphin", "koala", "tiger", "giraffe", "panda", "eagle", "whale", "owl", "shark", "wolf",
    "penguin", "zebra", "rhinoceros", "kangaroo"
];

const convertSubstr = (gitSHA: string, index: number): number => {
    const subSHA = gitSHA.charAt(index);

    return parseInt(subSHA, 16);
}

const getFriendlyReleaseName = (gitSHA: string): string => {
    if (!gitSHA) return "dev";
    if (gitSHA.length < 4) return "error";

    const adverb = adverbs[convertSubstr(gitSHA, 0)];
    const gerund = gerunds[convertSubstr(gitSHA, 1)];
    const color = colors[convertSubstr(gitSHA, 2)]
    const animal = animals[convertSubstr(gitSHA, 3)];

    return `${adverb} ${gerund} ${color} ${animal}`;
}

const getCharFromWord = (wordArray: string[], word: string): string => {
    const index = wordArray.indexOf(word);
    return index.toString(16);
}

const getGitSHAFromName = (friendlyName: string): string => {
    if (!friendlyName) return "";

    const words = friendlyName.split(' ');

    const chars = [adverbs, gerunds, colors, animals].map(
        (wordArray, i) => {
            const word = words[i];
            return getCharFromWord(wordArray, word);
        }
    );

    return chars.join('');
}

function ReleaseInfo() {
    const gitSHA = env.GIT_COMMIT_SHA;
    const gitTimestamp = env.GIT_TIMESTAMP;

    const friendlyName = getFriendlyReleaseName(gitSHA);

    return (
        <div>
            <h4>{friendlyName}</h4>
            <h5>{gitTimestamp}</h5>
        </div>
    )
}

export { ReleaseInfo, getGitSHAFromName };
