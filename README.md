<!--
@Author: Guilherme Serradilha
@Date:   24-Apr-2016, 12:19:54
@Last modified by:   Guilherme Serradilha
-->


# Pseudoword
A pseudoword generator for node.js or scrabble.

## What the heck is a pseudoword?
A pseudoword or *non-word* is a unit of speech or text that appears to be an actual word in a certain language, while in fact it has no meaning in the lexicon. In order words, it doesn't really exist.

But they are hella cool and fit well in a bunch of different scenarios:

* When trying to figure a name for your new startup company
* Generating a bunch of weapons and locations names for a MMORPG
* Running a [wug test](https://en.wikipedia.org/wiki/Jean_Berko_Gleason) with toddlers
* Or even creating easy-reading, although weird, passwords

## How does it work?
Our pseudowords are meticulously handcrafted using [Markov chains](https://en.wikipedia.org/wiki/Markov_chain) on top of some data you give us.

It's painless, simple and fast.

```javascript
const pseudoword = require('pseudoword');
var fruits = ["apple", "apricot", "avocado", "banana", "bilberry", "blackberry", "blueberry", "boysenberry",
   			  "cantaloupe", "currant", "cherry", "cherimoya", "cloudberry", "coconut", "cranberry", "damson",
              "dragonfruit", "durian", "elderberry", "gooseberry", "grape", "grapefruit", "guava", "berry",
              "jabuticaba", "jackfruit", "jambul", "jujube", "kiwifruit", "kumquat", "lemon", "lime",
              "loquat", "lychee", "mango", "marionberry", "melon", "honeydew","watermelon", "mulberry",
              "nectarine", "nance", "olive", "orange", "clementine","mandarine", "tangerine", "papaya",
              "passionfruit", "peach", "pear", "persimmon", "plantain", "plum", "pineapple", "pomegranate",
              "pomelo", "raspberry", "salmonberry", "redcurrant", "strawberry", "tamarillo", "tamarind"];

var myGenerator = pseudoword(fruits);
console.log(myGenerator.getWord());
----
rawberry
salonfruit
cocaba
```

### pseudoword(seed[, order, charset])
This function works like a constructor and returns a "generator object" with a transition matrix ready to roll. All it needs is a load of awesome reference words to look at and learn from it. And in this case, buddy, size matters.

`seed {string|string[]}` References that will be used  to build our transition matrix. It can be either a huge string full of words or an array.

`order {integer}` *(default = 2)* Markov's order. Defines how many previous characters will be used to predict the next one. The greater it is, the more realistic our pseudoword will look like. If you go too crazy on this, it'll end up just copy-pasting your seeds.

`charset {string}` *(default = 'abcdefghijklmnopqrstuvwxyzáàãâäéèêëíìîïóòõôöúùûüçß')* Allowed characters when creating pseudowords.

### .getWord([, length])
Returns a new pseudoword. Easy peasy.

`length {integer}` *(default = 20)* You can set a maximum length, optionally.

### .density()
Sometimes your pseudowords will look like a bunch of fragments or complete non-sense. This may be due your seed being too small.

Whenever you face this, double check your `density`.

This function returns a percentage of how many combinations your `seed` can create, against all possible combinations from your `charset`. If `density` is low, it means your reference words are not teaching enough stuff to our generator. We need *moar!*
