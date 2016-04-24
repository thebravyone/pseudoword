/**
* @Author: Guilherme Serradilha <thebravyone>
* @Date:   23-Apr-2016, 16:27:06
* @Last modified by:   Guilherme Serradilha
* @Last modified time: 24-Apr-2016, 12:43:51
*/

"use strict";

/**
 * Pseudoword generator using markov chains
 * @param  {string|string[]} seed    - reference for building our transitional matrix
 * @param  {integer}         order   - markov order
 * @param  {string}          charset - set of chars to build words
 */
var pseudoword = function(seed, order, charset) {

    if (!seed) throw new Error('"Seed" parameter is missing');
    if (!order || !Number.isInteger(order)) order = 2;
    if (!charset || typeof charset !== 'string') charset = 'abcdefghijklmnopqrstuvwxyzáàãâäéèêëíìîïóòõôöúùûüçß';

    var transitionMatrix = getTransitionMatrix(parseSeed(seed), order, sanitazeCharset(charset));

    /**
     * Calculates the density of current seed
     * against all possible matches from charset
     * @return {number} percentage of density
     */
    self.density = function() {
        var actual = Object.keys(transitionMatrix).length,
            max = 0;

        //'max' comes from a polynomial function:
        //f(a) = a^(n) + a^(n-1) + ... + a^(1) + a^(0)
        //a = charset size
        //n = order
        //bonus insight: a^(0) = 1 and refers to our '$' token
        for (var i = order; i > 0; i--)
            max += Math.pow(charset.length, i);

        return actual * 100 / max;
    }

    /**
     * Retrieves a pseudoword from transition matrix
     * @param  {integer} length - maximum char length
     * @return {string}
     */
    self.getWord = function(length) {

        if (!length || !Number.isInteger(length)) length = 20;

        var pseudo = '',
            sample = '$';

        for (var i = 0; i < length; i++) {

            var nextKey = getNextKey(sample, transitionMatrix);
            if (nextKey === '$')
                return pseudo;

            pseudo += nextKey;
            sample = pseudo.substr(pseudo.length - order);
        }
        return pseudo;
    }

    /**
     * Parses raw seed into an array of words
     * @param  {string|string[]} rawSeed
     * @return {string[]}
     */
    function parseSeed(rawSeed) {

        var seed = [];

        if (typeof rawSeed === 'string') {
            seed = rawSeed.toLowerCase().split(' ');
        } else if (Array.isArray(rawSeed)) {
            for (var i = 0; i < rawSeed.length; i++)
                if (typeof rawSeed[i] === 'string') seed.push(rawSeed[i]);
        }

        if (seed.length < 1) throw new Error('"Seed" parameter is invalid');
        return seed;
    }

    /**
     * Replaces all occurrences of '$' within given charset
     * @param  {string} charset
     * @return {string}
     */
    function sanitazeCharset(charset) {
        return charset.replace(new RegExp('$', 'g'), '');
    }

    /**
     * Generates markov's transition matrix
     * @param  {string[]}   seed
     * @param  {integer}    order
     * @param  {string}     charset
     * @return {object}
     */
    function getTransitionMatrix(seed, order, charset) {
        var tMatrix = {};
        for (var word in seed) {
            if (seed.hasOwnProperty(word) && checkWord(seed[word], charset)) {

                //split word into an array of chars
                var chars = seed[word].split('');

                //loop through all chars
                //building up our transition matrix
                for (var pointer = 0; pointer <= chars.length; pointer++) {

                    //range of analysis is based on our 'order' property
                    //it's defined as a pointer followed by a tail
                    var tail = pointer - order;
                    if (tail < 0) tail = 0;

                    //next key of transition
                    //in case pointer is placed on last char
                    //use boundary token
                    //so it collects data of how words should end
                    var nextKey = '';
                    if (pointer < chars.length)
                        nextKey = chars[pointer];
                    else
                        nextKey = '$';

                    //transition sample
                    //use boundary token when pointer is initialized
                    //so it collects data of how words should begin
                    var sample = '';
                    if (pointer < 1)
                        sample = '$';
                    else if (pointer < chars.length)
                        sample = seed[word].substr(tail, pointer - tail);
                    else
                        sample = seed[word].substr(tail);

                    //create blank transition for given sample
                    //in case there isn't one
                    if (!tMatrix.hasOwnProperty(sample))
                        tMatrix[sample] = createBlankTransition(charset);

                    //increment transition values
                    tMatrix[sample]['transition'][nextKey]++;
                    tMatrix[sample]['total']++;
                }

            }
        }

        return tMatrix;
    }

    /**
     * Checks whether a string contains only chars from given charset
     * @param  {strin}   word
     * @param  {string}  charset
     * @return {boolean}
     */
    function checkWord(word, charset) {

        //split word into an array of chars
        var chars = word.split('');

        //return false in case 'word' is made of a single char
        if (chars.length < 2) return false;

        //checks if all chars match with charset
        for (var i = 0; i < chars.length; i++) {
            if (charset.indexOf(chars[i]) === -1)
                return false;
        }
        return true;
    }

    /**
     * Creates a blank transition
     * @param  {string} charset - charset that will be used as keys
     * @return {object}         - blank transition
     */
    function createBlankTransition(charset) {

        var transition = {},
            keys = charset.split('');

        //add boundary token as key
        keys.push('$');

        //populate object with blank data
        for (var i = 0; i < keys.length; i++) {
            transition[keys[i]] = 0;
        }

        return {
            transition: transition,
            total: 0
        }
    }

    /**
     * Get the next char based on a sample
     * @param  {string} sample  - sample
     * @param  {object} tMatrix - transition matrix
     * @return {string}         - string of a single char
     */
    function getNextKey(sample, tMatrix) {

        //check if we have records of this sample
        //in our transition matrix
        if (!tMatrix.hasOwnProperty(sample))
            return '$';

        var transitions = tMatrix[sample]['transition'],
            sortedTransitions = [],
            rangesTransitions = [];

        //sort transitions
        for (var k in transitions)
            sortedTransitions.push([k, transitions[k]]);
        sortedTransitions.sort(function(a, b) {return a[1] - b[1]});

        //generate probability ranges
        var accumulated = 0;
        for (var i = 0; i < sortedTransitions.length; i++) {
            //clone transition
            rangesTransitions[i] = sortedTransitions[i];

            //set range
            accumulated += sortedTransitions[i][1];
            rangesTransitions[i][1] = accumulated;
        }

        //get random value
        var random = Math.random() * tMatrix[sample]['total'];

        //evaluate random value against transition probabilities
        //and pick next key
        for (var i = 0; i < rangesTransitions.length; i++) {
            if (random <= rangesTransitions[i][1]){
                return rangesTransitions[i][0];
                break;
            }
        }

        return false;
    }

    return self;
}

module.exports = pseudoword;
