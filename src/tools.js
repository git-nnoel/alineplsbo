// Prototypes
String.prototype.contains = function(toSearch, Sense){

    const getAllIndexes = (arr, val) => {
        // retirar o next
        var indexes = [];
        var next = 0;
        if (Sense == false){
            arr = arr.toLowerCase();
            val = val.toLowerCase();
        }
        while(arr.indexOf(val, next) !== -1){

            let index = arr.indexOf(val, next);
            indexes.push(index);
            next = index + 1;

        }

        return indexes;

    };

    var indexes = getAllIndexes(this, toSearch);
    return indexes.each(index => {

        if(

            (index !== -1) &&
            (!this[index - 1] || this[index - 1] === " ") &&
            (!this[index + toSearch.length] || this[index + toSearch.length] === " ")

        ){

            return true;

        }

    });

};
String.prototype.replaceAll = function(search, replace, caseSensitive){

    if(caseSensitive){
        return this.split(search).join(replace);

    }else{
        return this.split(search.toLowerCase()).join(replace).split(search.toUpperCase()).join(replace);

    }

};
String.prototype.removeAccents = function(){
    return (
        this
            .replace(/[ÁÀÂÃ]/g, 'A')
            .replace(/[ÉÈÊẼ]/g, 'E')
            .replace(/[ÍÌÎĨ]/g, 'I')
            .replace(/[ÓÒÔÕ]/g, 'O')
            .replace(/[ÚÙÛŨ]/g, 'U')
            .replace(/[áàãâ]/g, 'a')
            .replace(/[éèẽê]/g, 'e')
            .replace(/[íìĩî]/g, 'i')
            .replace(/[óòõô]/g, 'o')
            .replace(/[úùũû]/g, 'u')
            .replace(/[Ç]/g, 'C')
            .replace(/[ç]/g, 'c')
    );

};
String.prototype.removeSpecialChars = function(whiteList){

    return this.removeAccents().replace(new RegExp(`[^a-z0-9 ${whiteList}]`, "gi"), "");

};
String.prototype.removeRepeats = function(){

    let last = null;
    let out = [];
    this.each((char) => {

        if(last !== char){

            out.push(char);
            last = char;

        }

    });

    return out.join("");

};
String.prototype.deepTrim = function(){

    return this.split(" ").filter((val) => (val !== "")).join(" ");

};
Object.prototype.each = function(cb){

    var breaked = false;
    for(var index in this) {

        var value = this[index];
        if(typeof value !== "function"){
            breaked = cb(value, index);
            if(breaked){
                break
            }
        }

    }
    return breaked;

};
String.prototype.testBanned = function(channel_name, prefix){

    const rawText = this;
    const bannedPhrases = sqlite.select("select phrase, action from bannedPhrase where channel_name = ?", channel_name);

    let toAnalise = rawText.removeSpecialChars(prefix).removeRepeats().trim();

    let fakeI  = toAnalise.replaceAll("I", "l", true).toLowerCase();
    let fakeL  = toAnalise.replaceAll("l", "I", true).toLowerCase();
    let fakeY  = toAnalise.replaceAll("y", "i").toLowerCase();
    let fakeI2 = toAnalise.replaceAll("i", "y").toLowerCase();
    toAnalise  = toAnalise.toLowerCase();

    return !!bannedPhrases.each((bannedPhrase) => {
        if (

            toAnalise.contains(bannedPhrase.phrase) ||
            fakeI.contains(bannedPhrase.phrase) ||
            fakeL.contains(bannedPhrase.phrase) ||
            fakeY.contains(bannedPhrase.phrase) ||
            fakeI2.contains(bannedPhrase.phrase)

        ) return true;
    });

};

// Functions
const randomInt = (min, max) => {

    max++;
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;

};
const sqlite = {

    conn : null,
    connect(){

        if(!sqlite.conn){

            sqlite.conn = require('better-sqlite3')('db/aline.db');

        }

    },
    select(query, ...binds){

        return sqlite.conn.prepare(query).all(...binds);

    },
    run(query, ...binds){

        sqlite.conn.prepare(query).run(...binds);

    },

};
const dateInterval = (dateString, formatted = true) => {

    if(dateString.indexOf("GMT") === -1){

        dateString += " GMT";

    }

    const date = new Date(dateString);
    const att = new Date();
    if (date > att) { // swap
        var result = dateInterval(att, date);
        result.years    = -result.years;
        result.months   = -result.months;
        result.days     = -result.days;
        result.hours    = -result.hours;
        result.minutes  = -result.minutes;
        result.seconds  = -result.seconds;
        return result;
    }
    result = {
        years:  att.getFullYear()  - date.getFullYear(),
        months: att.getMonth() - date.getMonth(),
        days:   att.getDate()  - date.getDate(),
        hours:  att.getHours() - date.getHours(),
        minutes : att.getMinutes() - date.getMinutes(),
        seconds : att.getSeconds() - date.getSeconds()
    };
    if (result.seconds < 0) {
        result.minutes--;
        result.seconds += 60;
    }
    if (result.minutes < 0) {
        result.hours--;
        result.minutes += 60;
    }
    if (result.hours < 0) {
        result.days--;
        result.hours += 24;
    }
    if (result.days < 0) {
        result.months--;
        // days = days left in date1's month,
        //   plus days that have passed in date2's month
        var copy1 = new Date(date.getTime());
        copy1.setDate(32);
        result.days = 32-date.getDate()-copy1.getDate()+att.getDate();
    }
    if (result.months < 0) {
        result.years--;
        result.months+=12;
    }

    if(formatted){

        let toReturn = "";
        if(result.months > 0)
            toReturn += `${result.months}M `;

        if(result.days > 0)
            toReturn += `${result.days}d `;

        if(result.hours > 0)
            toReturn += `${result.hours}h `;

        if(result.minutes > 0)
            toReturn += `${result.minutes}m `;

        if(result.seconds > 0)
            toReturn += `${result.seconds}s`;

        return toReturn;

    }else{

        return result;

    }

};


module.exports.randomInt = randomInt;
module.exports.sqlite = sqlite;
module.exports.dateInterval = dateInterval;