require("./prototypes");

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

            sqlite.conn = require('better-sqlite3')('db/liria.db');

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
        if(result.months > 0){
            toReturn += `${result.months} meses `
        }
        if(result.days > 0){
            toReturn += `${toReturn !== "" && result.hours === 0 && result.minutes === 0 && result.seconds > 0 ? "e " : ""}${result.days} dias `
        }
        if(result.hours > 0){
            toReturn += `${toReturn !== "" && result.minutes === 0 && result.seconds > 0 ? "e " : ""}${result.hours} horas `
        }
        if(result.minutes > 0){
            toReturn += `${toReturn !== "" && result.seconds > 0 ? "e " : ""}${result.minutes} minutos `
        }
        if(result.seconds > 0){
            toReturn += `${toReturn !== "" ? "e " : ""}${result.seconds} segundos`
        }
        return toReturn;

    }else{

        return result;

    }

};

module.exports.randomInt = randomInt;
module.exports.sqlite = sqlite;
module.exports.dateInterval = dateInterval;
