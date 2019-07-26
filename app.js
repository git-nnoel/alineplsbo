// Requires
const tmi = require('tmi.js');
const getJSON = require('get-json');
require("dotenv").config();

const {randomInt, sqlite, dateInterval} = require("./src/maux");

require("./src/prototypes");


// Handlers
const app = {

    messageRateCounter: 0,
    sleepTime: false,
    blockedOnCellbit: false,

    isOnRateLimit() {

        return app.messageRateCounter >= messagesRateLimit

    },

    onConnect(addr, port) {

        console.log(`* Connected to ${addr}:${port}`);

    },


    onMessage(target, context, rawText, self) {
      const channel_name1 = target.replace("#", "");
        if (

            self ||
            context["username"] === process.env.BOT_USERNAME ||
            context["message-type"] !== "chat" ||
            app.isOnRateLimit()

        )
          return;
        else if(app.blockedOnCellbit === true && channel_name1 === "cellbit")
         return;

        // maux
        const sendToIRC = (cb, retain, useSleep = true) => {

            if ((!useSleep && !app.isOnRateLimit()) || (useSleep && !app.sleepTime && !app.isOnRateLimit())) {

                app.messageRateCounter++;
                app.sleepTime = true;

                cb();

                setTimeout(() => {
                    app.messageRateCounter--
                }, 20000);
                setTimeout(() => {
                    app.sleepTime = false
                }, 2000);

            } else {

                if (retain) {

                    setTimeout(() => {

                        sendToIRC(cb, retain);

                    }, 1000);

                }

            }

        };
        var lastmsg;
        const say = (msg, retain = false, useSleep = true) => {
            sendToIRC(() => {
//              if (target.indexOf(`.com`)== -1 && target.indexOf(`_com`)== -1 )
//              if (msg.indexOf(`.com`)== -1 && msg.indexOf(`_com`)== -1 ){
                if (msg != this.lastmsg) {
                    this.lastmsg = msg;
                    client.say(target, msg);
                } else if (msg == this.lastmsg) {
                    msg = msg + " 󠀀 ";
                    client.say(target, msg + " 󠀀 ");
                    this.lastmsg = msg + " 󠀀 "
//              }
                }

            }, retain, useSleep);

        };
        const ban = (reason, retain = true) => {
          if (channel_name1 != "cellbit")
            sendToIRC(() => {

                client.ban(target, username, reason)
                    .then((data) => {
                        console.log("Banned: ", username)
                    }).catch((err) => {
                    console.log(err)
                });

            }, retain);

        };
        const unBan = (retain = true) => {
          if (channel_name1 != "cellbit")
            sendToIRC(() => {

                client.unban(target, username)
                    .then((data) => {

                        console.log("Unbanned: ", username)

                    }).catch((err) => {

                    console.log(err);

                });

            }, retain);

        };
        const timeout = (s, reason, retain = true) => {
          if (channel_name1 != "cellbit")
            sendToIRC(() => {

                client.timeout(target, username, s, reason)
                    .then((data) => {

                        console.log(`Timeout ${s} seconds: `, username)

                    }).catch((err) => {

                    console.log(err);

                });

            }, retain);

        };
        const deleteMessage = (retain = true) => {
          if (channel_name1 != "cellbit")
            sendToIRC(() => {

                client.deletemessage(target, messageID).then((data) => {

                    console.log(`Deleted message: `, username)

                }).catch((err) => {

                    console.log("error");
                    console.log(err);

                });

            }, retain);

        };

        // Set Vars
        const channel_name = target.replace("#", "");
        const displayName = context["display-name"];
        const username = context["username"];
        const userID = context["user-id"];
        const messageID = context["id"];
        const messageType = context["message-type"];
        const isMod = context["mod"];
        const isSubscriber = context["subscriber"];
        const prefix = sqlite.select("select prefix from channel where name = ?", channel_name)[0]["prefix"];
        const bannedPhrases = sqlite.select("select phrase, action from bannedPhrase where channel_name = ?", channel_name);

        let toAnalise = rawText.removeSpecialChars(prefix).removeRepeats().trim();
        let toCommand = rawText.replaceAll("󠀀", "").deepTrim().split(" ");
        let toLookfor = rawText.replaceAll("󠀀", "").deepTrim();

        // Set vars
        let fakeI = toAnalise.replaceAll("I", "l", true).toLowerCase();
        let fakeL = toAnalise.replaceAll("l", "I", true).toLowerCase();
        let fakeY = toAnalise.replaceAll("y", "i").toLowerCase();
        let fakeI2 = toAnalise.replaceAll("i", "y").toLowerCase();
        toAnalise = toAnalise.toLowerCase();

        // Delete Tests
        let action = null;
        const defineAction = (actionDefined, action) => {

            if (action) {

                if (actionDefined === "ban") {

                    action = "ban"

                } else if (!isNaN(actionDefined)) {

                    action = (!isNaN(action))
                        ? parseInt(action) + parseInt(actionDefined)
                        : parseInt(actionDefined);

                }

            } else {

                action = actionDefined;

            }

            return action;

        };

        bannedPhrases.each((bannedPhrase) => {

            if (

                toAnalise.contains(bannedPhrase.phrase) ||
                fakeI.contains(bannedPhrase.phrase) ||
                fakeL.contains(bannedPhrase.phrase) ||
                fakeY.contains(bannedPhrase.phrase) ||
                fakeI2.contains(bannedPhrase.phrase)

            ) {

                action = defineAction(bannedPhrase.action, action);

            }

        });

        // Ban Phrase Detector test
        /*
                function DetectBanPhrase (msgtosearch){
                  console.log(msgtosearch);
                  bannedPhrases.each((bannedPhrase) => {
                  if (

                      toAnalise.contains(msgtosearch.phrase) ||
                      fakeI.contains(msgtosearch.phrase) ||
                      fakeL.contains(msgtosearch.phrase) ||
                      fakeY.contains(msgtosearch.phrase) ||
                      fakeI2.contains(msgtosearch.phrase)

                  ) {
                      console.log("1");
                      return true;
                  }
                  });
                  return;

                }
        */


        if (action) {

            switch (action) {
                case "del":
                    deleteMessage();
                    return;

                case "ban":
                    ban("Você disse uma palavra ruim D:");
                    return;

                default:
                    timeout(action, "Você disse uma palavra ruim D:");
                    return;

            }

        }

        const maskFakeMod = ["me da ?", "me da um ?", "mim da ?", "min da um ?", "? em mim", "? ne mim", "? em eu", "cade meu ?", "quero um ?", "? eu quero"];
        const actionFakeBan = ["ban", "banimento"];
        const actionFakeTimeout = ["to", "timeout", "time out", "out time", "outtime", "tempo fora"];

        let flagged;
        action = null;

        maskFakeMod.each(fakeBannedPhrase => {

            flagged = actionFakeBan.each(toReplace => {

                if (toAnalise.contains(fakeBannedPhrase.replaceAll("?", toReplace))) {

                    action = "ban";
                    return true;

                }

            });
            if (flagged) return true;

            flagged = actionFakeTimeout.each(toInsert => {

                if (toAnalise.contains(fakeBannedPhrase.replaceAll("?", toInsert))) {

                    action = "86400";
                    return true;

                }

            });
            if (flagged) return true;

        });

        if (action) {

            switch (action) {
                case "del":
                    deleteMessage();
                    return;

                case "ban":
                    ban("Você pediu :)");
                    unBan();
                    return;

                default:
                    timeout(action, "Você pediu :)");
                    unBan();
                    return;

            }

        }


        let exist = sqlite.select("select name from user where name = ?", username);
        if (exist.length < 1) {

            sqlite.run("insert into user (name) values (?)", username)

        }
        if (toCommand[0].indexOf(prefix) === -1) {

            sqlite.run("insert into message_on_channel(channel_name, user_name, message, sended_at) values(?, ?, ?, CURRENT_TIMESTAMP)", channel_name, username, rawText);

        }


        const hasMessage = sqlite.select("select user_from, message from remind where user_to = ?", username);
        if (hasMessage.length > 0) {

            hasMessage.forEach(messageData => {

                const from = messageData["user_from"];
                const message = messageData["message"];

                say(`${username}, AYAYA FBBlock ✉ carta de ${from}: ${message}`, true);

            });
            sqlite.run("delete from remind where user_to = ?", username);

        }

        const isReturnOfAFK = sqlite.select("select message, started_at from afk where user_name = ?", username);
        if (isReturnOfAFK.length > 0) {

            say(`${username} voltou após ${dateInterval(isReturnOfAFK[0]["started_at"])}: ${isReturnOfAFK[0]["message"]}`, true);
            sqlite.run("delete from afk where user_name = ?", username);

            return;

        }


        let allCommands = {

            //"repetir" : `envia a repetição de uma mensagem 'n' vezes. Sintaxe: \`${prefix}repetir {quantidade} {mensagem}\` ou \`${prefix}repetir {quantidade} {mensagem}\\\``,
            "afk": `informa que o usuário está ausente. Sintaxe: \`${prefix}afk {mensagem}\``,
            "carta": `envia uma carta para o usuário que será recebida na proxima vez que ele mandar uma mensagem nos chats que eu estou. Sintaxe: \`${prefix}carta {usuario} {mensagem}\``,
            "%": `retorna uma porcentagem aleatória. Sintaxe: \`${prefix}%\``,
            "rl": `retorna uma mensagem aleátoria enviada pelo usuário no canal. Sintaxe: \`${prefix}rl\` ou \`${prefix}rl {usuario}\``,
            "comando": `fornece mais informações sobre um comando. Sintaxe \`${prefix}comando {comando}\``,
            "comandos": `exibe os comandos disponiveis no canal. Sintaxe: \`${prefix}comandos\``,

        };

        // Commands test
        switch (toCommand.shift().toLowerCase()) {
//
            case `${prefix}repetir`:
                const times = Math.abs(parseInt(toCommand.shift()));
                if (!isNaN(times) && toCommand.length > 0) {

                    let toRepeat = toCommand.join(" ");
                    if (toRepeat[toRepeat.length - 1] !== "\\") {

                        toRepeat += " "

                    } else {

                        toRepeat = toRepeat.slice(0, toRepeat.length - 1)

                    }

                    var toSend = toRepeat.repeat(times).slice(0, 80);
                    say(`${username}, ` + toSend);

                }

                return;
//
            case `${prefix}piramide`:
                const size = Math.abs(parseInt(toCommand.shift()));
                if (!isNaN(size) && toCommand.length > 0 && channel_name != "cellbit") {

                    let toRepeat = toCommand.join(" ");


                    toRepeat += " ";

                    let sizeinit = 0;
                    while (sizeinit <= size) {
                        say(toRepeat.repeat(sizeinit), false, false);
                        sizeinit++;
                    }
                    sizeinit = size - 1;
                    while (sizeinit >= 0) {
                        say(toRepeat.repeat(sizeinit), false, false);
                        sizeinit--;
                    }

                }

                return;
//
            case `${prefix}%`:
                let tmsg = toCommand.join(" ");
                if (toLookfor.contains("AYAYA") || toLookfor.contains("carlarai"))
                    say(`${username}, ${randomInt(80, 100)}% AYAYA`);
                else
                    say(`${username}, ${randomInt(0, 100)}% Thonk`);
                return;
//

            case `${prefix}love`:
                var lovepercentage = [
                    `${randomInt(70, 100)}% love Pog ❤ `,
                    `${randomInt(40, 70)}% love cellA`,
                    `${randomInt(20, 40)}% love :| TeaTime`,
                    `${randomInt(0, 20)}% love cellH 💔 `,
                ];
                let targetlove = toCommand.join(" ");
                if (`${username}` == "nnoel")
                    say(`${username} and ` + targetlove + ` ${randomInt(70, 100)}% love Pog ❤ `);
                else if (`${username}` == "bhaskarai" && targetlove == "carlamorena" || `${username}` == "carlamorena" && targetlove == "bhaskarai")
                    say(`${username} and ` + targetlove + ` 100% love 💓 😍`);
                else
                    say(`${username} and ` + targetlove + ` ` + lovepercentage[randomInt(0, lovepercentage.length - 1)]);
                return;

            case `${prefix}afk`:

                let message;
                if (toCommand.length > 0) {

                    message = toCommand.join(" ");

                } else {

                    message = "sem mensagem? :z"

                }
                sqlite.run("insert into afk(user_name, message, started_at) values(?, ?, CURRENT_TIMESTAMP)", username, message);

                say(`o ${username} está afk agora :z 💤 `, true);

                return;
            case `${prefix}rl`:

                let userToSearch;
                if (toCommand.length > 0) {
                    userToSearch = toCommand.shift().toLowerCase();
                } else {
                    userToSearch = username;
                }

                // noinspection SqlResolve
                let ma = sqlite.select(`SELECT message, sended_at
                                        FROM message_on_channel
                                        WHERE channel_name = ?
                                          and user_name = ?
                                          and _ROWID_ >= (abs(random()) % (SELECT max(_ROWID_)
                                                                           FROM message_on_channel
                                                                           WHERE channel_name = ?
                                                                             and user_name = ?))
                                        LIMIT 1`, channel_name, userToSearch, channel_name, userToSearch);
                if (ma.length > 0) {

                    let message = ma[0]["message"];

                    let date = new Date(ma[0]["sended_at"] + " GMT");

                    let day = date.getDate() > 9 ? date.getDate() : "0" + date.getDate();
                    let month = date.getMonth() > 9 ? date.getMonth() : "0" + date.getMonth();
                    let hours = date.getHours() > 9 ? date.getHours() : "0" + date.getHours();
                    let minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();
                    let seconds = date.getSeconds() > 9 ? date.getSeconds() : "0" + date.getSeconds();

                    let dateFormatted = `${day}/${month}/${date.getFullYear()}`;
                    let hourFormatted = `${hours}:${minutes}`;

                    say(`(${dateFormatted},${hourFormatted}) ${userToSearch}: ${message}`)

                } else {

                    say(`${username} acho que eu nunca vi essa pessoa por aqui ppL `)

                }

                return;
            case `${prefix}carta`:

                if (toCommand.length > 1) {

                    const toMessage = toCommand.shift().toLowerCase();
                    const message = toCommand.join(" ");
                    if (
                        toMessage !== username &&
                        toMessage !== process.env.BOT_USERNAME
                    ) {

                        const userExists = sqlite.select("select name from user where name = ?", toMessage);
                        if (userExists.length > 0) {

                            const count = sqlite.select("select count(user_to) as cRemind from remind where user_to = ?", toMessage)[0]["cRemind"];
                            if (parseInt(count) < 4) {

                                sqlite.run("insert into remind(user_from, user_to, message) values (?, ?, ?)", username, toMessage, message);
                                say(`${username} deixa comigo! sua mensagem vai chegar nele. assim que eu achar ele... ✉ cellEMOTE `, true);

                            } else {

                                say(`${username} eu já tenho muitas mensagens pra entregar para esse ai >(`, true);

                            }

                        } else {

                            say(`${username}, não conheço esse usuário, não tenho como enviar isso cellH`, true);

                        }

                    }

                }

                return;
            case `${prefix}comandos`:

                let list = "";
                allCommands.each((_, command) => {

                    list += `${prefix}${command}; `

                });
                say(`${username}, os comandos disponiveis são: ${list}`, true);
                say(`${username}, Digite \`$comando {comando}\` para mais informações sobre cada um. Ex: \`$comando $repetir\``, true);
                return;
            case `${prefix}comando`:

                if (toCommand.length > 0) {

                    let search = toCommand.shift().toLowerCase();
                    allCommands.each((description, command) => {

                        if (command === search || `${prefix}${command}` === search) {

                            say(`${username}, ${prefix}${command} ${description}`)

                        }

                    });

                } else {

                    say(`${username}, Digite \`$comando {comando}\` para mais informações sobre cada comando. Ex: \`$ajuda $repetir\``);

                }
                return;

            case `${prefix}spam`:
                const toSpam = toCommand.join(" ");
                const spamallowed = ["nnoel", "liriapatin", "bhaskarai"];
                spamallowed.each(sall => {
                    if (toSpam.length > 0 && `${username}` == sall) {

                        let count = 0;
                        let interval = setInterval(() => {

                            say(toSpam, false, false);
                            count++;
                            if (count === 25) {
                                clearInterval(interval);
                            }

                        }, 100);

                    }
                });
                break;

        }
        if (toCommand.shift() == `${prefix}turnoff`) {
              const turnoffallowed = ["nnoel", "liriapatin", "bhaskarai"];
              turnoffallowed.each(toff => {
                  if (`${username}` == toff){
                    say (`:Z . o O ( :Z 💤 ) `)
                      process.exit();
                    }
              });
              return;
        }

        // Set Vars
        const saudacao = ["eae", "oi","olá", "bom dia", "boa tarde", "boa noite", "tchau", "flw", "xau", "hi"];
        const names = ["chat", "aline", "alinepls"];

        if (channel_name === "liriapatin") {

            names.push("patin", "liriapatin");

        }

        // Arbitrary phrases test
        flagged = saudacao.each(toTest => {

            return names.each(name => {

                if (toAnalise.contains(`${toTest} ${name}`, false)) {

                    setTimeout(function () {
                        say(`${toTest} ${username} cellR`);
                    }, 900);

                    return true;

                }

            })

        });
        if (flagged) return;


        const anotherBots = [
            "dontpinghaxk",
            "mobot",
            "priestbot",
            "nightbot",
            "phantombot",
            "streamelements",
            "liriabot",
            "streamlabs"
        ];
        const answers = [
            "por que você está falando o nome dele? AYAYAWeird",
            "por que insistem em falar dele? KujoThump ",
            "SAY THAT NAME ONE MORE TIME KarenGun ",
            "menciona esse nome de novo pra eu testar uma coisa KarenGun",
            "what you said? KarenGun ",
            "eu não sou suficiente pra você? KarenShock ",
            "this name KujoBaka ",
            "I'm a joke for you? AYAYAWeird",
            "de quem você esta falando? KujoBaka "
        ];

        flagged = anotherBots.each(botName => {
            if (toAnalise.contains(botName, false) && channel_name != "cellbit") {

                say(`${username}, ` + answers[randomInt(0, answers.length - 1)]);
                return true;

            }

        });
        if (flagged) return;


        //tem live
        const pepegater = ["kd", "cade", "tem", "qndo", "quando", "vai", "cde", "qando", "tm", "que","te", "onde", "ta","comeca","comecar","hj","hoje","amanha"];


        flagged = pepegaTarget.each(pe => {

            pepegater.each(pg => {

                    if (toAnalise.removeAccents().contains(pg + " " + pe, false)
                        && rawText.indexOf("?") !== -1) {

                        setTimeout(function () {
                            say(`${username} escreve !status no chat pra saber da proxima live :z TeaTime`);
                        }, 2000);


                        return true;

                    }

                })

        });
        if (flagged) return;



        const plugquestion = ["link do plug","ouvindo musica"];

        plugquestion.each(pq => {

          if (toAnalise.contains(pq, false)) {

                setTimeout(function () {
                  say(`${username} plug.dj/-5321101498343942054 pepeJAM`);
                }, 900);


                return true;

              }

        });






        //
        //
        //

//
//
        //Verifica se existe algum emote que indique falsa pergunta
        const emotesToFake = [":D", ":\\)", ";\\)", "R\\)", ":\\(", ":Z", ">\\(", ":O", ":P", ":z", ":\\|", ":\\/","cellPP","cellX",
        "cellTa","cellOi","cellNormie", "AYAYA", "cellR", "cellEMOTE", "cellGr", "cellA", "cellH", "cellAYAYA", "cellFofo", "cellWtf", "Pepega"];

        const rFake = new RegExp("(" + emotesToFake.join("|") + ")");
        const rCellGo = new RegExp("\\b(" + cellGOEmotes.join("|") + ")\\b", "i");


        if(

            rawText.indexOf("?") !== -1 &&
            !rFake.test(rawText) &&
            rCellGo.test(toAnalise)

        ){

            setTimeout(function () {

                say(`${username} escreve !emotes no chat pra saber como funcionam os emotes :)`, true);
                say(`${username} ou !mobile se você estiver no celular :z`, true);

            }, 1800);
            return;

        }

//
//
//
//
//










        const smiles = [":D", ":)", ";)", "R)", ":(", ":Z", ">(", ":O", ":P", ":z", ":|", ":/", "AYAYA",
        "cellR", "cellEMOTE", "cellGr", "cellA", "cellH", "cellAYAYA", "cellFofo", "cellWtf","cellWD","cellX","cellZ","cellPP","cellTa"];
/*
        const pepega1 = ["se a carapuca serve", "se a carapuca serve!"];
        const pepega2 = ["ae repete", "ae? repete!","ah e repete", "ah e? repete!"];

        flagged = pepega1.each(pp1 => {

            pepega2.each(pp2 => {

                if (toAnalise.contains(pp1, false))
                    setTimeout(function () {
                        say("Pepega AÉ? REPETE!");
                    }, 800);

                else if (toAnalise.contains(pp2, false))
                    setTimeout(function () {
                        say("Pepega SE A CARAPUÇA SERVE");
                    }, 800);

                return true;

            })

        });
        if (flagged) return;
        */

        /*
        math command system

            const qntoe = [
              "{replace} quanto e" + $(urlfetch http://twitch.center/customapi/math?expr=$(querystring)),
              "{replace} quanto da"+ $(urlfetch http://twitch.center/customapi/math?expr=$(querystring)),
              "{replace} quanto fica" + $(urlfetch http://twitch.center/customapi/math?expr=$(querystring))
            ]

            flagged = names.each(name => {

              qntoe.each(qnto => {

              if(toAnalise.contains(name.replaceAll("{replace}", qnto)) && rawText.indexOf("?") !== -1){

                return true;

                }

              })

            });
            if(flagged) return;
        */


        const alinefeliz = ["alinepls", "aline", "alienpls"];
        const smilephrase = [
            "{replace} {replace2}",
            "{replace2} {replace}"
        ];

        alinefeliz.each(al => {
            smiles.each(sm => {
                smilephrase.each(smp => {
                    if (toLookfor.contains(smp.replaceAll("{replace}", al).replaceAll("{replace2}", sm))) {
                        setTimeout(function () {
                            say(`${username} ` + sm);
                        }, 600);

                        return true;

                    } else if (toLookfor.contains(smp.replaceAll("{replace}", al).replaceAll("{replace2}", "R)"))) {
                        setTimeout(function () {
                            say(`${username} R) arrrg`);
                        }, 600);

                        return true;
                    }

                })
            })
        });
    }

};
//
//
// Cria uma lista com todas as possibilidades no inicio do aplicativo
const cellGOEmotes = [];

const cellGOEmotes1 = ["ve os {replace}", "ver os {replace}", "vejo os {replace}", "vejo esses {replace}", "como que ve esses {replace}", "onde que ve esses {replace}", "baixo essa {replace}","o que e {replace}", "consigo essa {replace}", "baixa essa {replace}", "baixa a {replace}", "e essa {replace}","extensao dos {replace}","extencao dos {replace}"];
const cellGOEmotes2 = ["emotes", "emote", "emoji", "emoticon", "emojis", "emoticons", "emtes", "extensao","extencao", "extenção", "extensão", "bbtv", "bttv"];

cellGOEmotes1.each(c1 => {
    cellGOEmotes2.each(c2 => {

        cellGOEmotes.push(c1.replaceAll("{replace}", c2).removeAccents().removeRepeats().trim())

    })
});

const pepegaTarget = [];
const pepegaTarget2 = ["live", "lives","laive", "streams", "stream", "live stream", "celbit", "cellbo", "celbinho", "cel", "celbitos", "celbitinho", "zerbit", "lvie", "liev"];
const pepegaTarget1 = ["a {replace}","tem {replace}","o {replace}","{replace} hoje","{replace} hj","e a {replace}","e as {replace}","sao as {replace}","comeca a {replace}","comeca as {replace}","comecam as {replace}","horas tem {replace}","horas e a {replace}","hora e a {replace}","hora tem {replace}"];
pepegaTarget1.each(c1 => {
    pepegaTarget2.each(c2 => {

        pepegaTarget.push(c1.replaceAll("{replace}", c2).removeAccents().removeRepeats().trim())

    })
});
//
//




/*
    //autoturnoff when stream starts 1
getJSON('https://api.twitch.tv/helix/streams/ecgfmopuk1i53vofoflwbbvwnxfxvk?user_name=cellbit ')
.then(function(response) {

  if (channel["cellbit"] !== null) {
    say (`:Z . o O ( :Z 💤 ) `)
    process.exit();
  }

}).catch(function(error) {
  console.log(error);
});
*/

    //autoturnoff when stream starts 2
const fetch = require("node-fetch");


setInterval(autoturnoff1,20000);

function autoturnoff1(){
fetch('https://api.twitch.tv/helix/streams/?user_login=cellbit',
{ method: 'get', headers: { 'Client-Id' : 'ecgfmopuk1i53vofoflwbbvwnxfxvk' }, })
.then(res => res.json() )
.then(res => {

  if (res.data.length > 0){

    app.blockedOnCellbit = true;

  } else{

    app.blockedOnCellbit = false;

  }


});
}




sqlite.connect();
const channels = sqlite.select("select name from channel").map(data => data.name);

// Configs
const messagesRateLimit = process.env.MESSAGES_RATE_LIMIT;
const client = new tmi.client({
    identity: {

        username: "alinepls",
        password: "oauth:yace41u852lssyua5ahlck9t4icu9q"

    },
    channels: [
        "liriapatin", "nnoel", "cellbit"
    ]
});

client.on('connected', app.onConnect);
client.on('message', app.onMessage);

console.log(`* Iniciando...`);
client.connect();




// const math = require("mathjs");
//
// let exp = "2 + 4";
// try{
//
//     console.log(math.evaluate(exp));
//
// }catch(err){
//
//     console.log("invalido");
//
// }
