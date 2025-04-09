/*
SPDX-FileCopyrightText: 2025 Genome Research Ltd.

SPDX-License-Identifier: MIT
*/

import { env } from "../index";

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

const getFriendlyReleaseName = (): string => {
    const gitSHA = env.GIT_COMMIT_SHA;

    if (!gitSHA) return "dev";
    if (gitSHA.length < 4) return "error";

    const words = [gerunds, colors, animals].map(
        (wordArray, i) => wordArray[convertSubstr(gitSHA, i)]
    );

    return words.join('-');
}

const getCharFromWord = (wordArray: string[], word: string): string => {
    const index = wordArray.indexOf(word);
    return index.toString(16);
}

const getGitSHAFromName = (friendlyName: string): string => {
    if (!friendlyName) return "";

    const words = friendlyName.split('-');

    const chars = [gerunds, colors, animals].map(
        (wordArray, i) => getCharFromWord(wordArray, words[i])
    );

    return chars.join('');
}

export { getFriendlyReleaseName, getGitSHAFromName };
