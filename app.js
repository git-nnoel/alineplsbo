// Requires
const tmi = require('tmi.js');
const fetch = require("node-fetch");
const {randomInt, sqlite, dateInterval} = require("./src/tools");
require("dotenv").config();

// Handlers
const app = {

	conn : null,
	blocked : ["cellbit"],
	alter : ["carlamorena","tataxmei","alinepls"],

	lastmsg: " ",
	messageRateCounter: 0,
	sleepTime: false,

	mute: {},
	masters : ["nnoel", "emma_lee", "bhaskarai","noblezito","tataxmei","carlamorena"],
	bots : ["dont_ping_haxk", "moobot", "priestbot", "nightbot", "phantombot", "streamelements", "streamlabs", "baguette_bot", "vivbot", "coolshiba", "ohbot", "deepbot", "ankhbot", "wizeBot", "coebot", "xanbot", "hnlbot", "drangrybot", "stay_hydrated_bot", "alinepls", "liriabot"],
	ignore : ["rasfael","naoseiquenomeeuotobo"],
	regex : {},

	pCount : {},
	Broken : false,

	preprocess(){
		const emotes = [];
		const emotes1 = ["ve os {replace}", "ver os {replace}", "vejo os {replace}", "vejo esses {replace}", "como que ve esses {replace}", "onde que ve esses {replace}", "baixo essa {replace}", "o que e {replace}", "consigo essa {replace}", "baixa essa {replace}", "baixa a {replace}", "e essa {replace}", "extensao dos {replace}", "extencao dos {replace}"];
		const emotes2 = ["emotes", "emote", "emoji", "emoticon", "emojis", "emoticons", "emtes", "extensao", "extencao", "extenção", "extensão", "bbtv", "bttv"];
		emotes1.each(c1 => {
			emotes2.each(c2 => {

				emotes.push(c1.replaceAll("{replace}", c2).removeAccents().removeRepeats().trim())

			})
		});

		const fakeTest = [":D", ":\\)", ";\\)", "R\\)", ":\\(", ":Z", ">\\(", ":O", ":P", ":z", ":\\|", ":\\/", "cellPP", "cellX",
			"cellTa", "cellOi", "cellNormie", "AYAYA", "cellR", "cellEMOTE", "cellGr", "cellA", "cellH", "cellAYAYA", "cellFofo", "cellWtf", "Pepega", "cellQ", "cellG"];

		const hel = [];
		const hellos = ["eae", "oi", "ola", "bom dia", "boa tarde", "boa noite", "tchau", "flw", "xau", "hi"];
		const names = ["chat", "aline", "alinepls", "galera", "galero", "pessoas", "pessoal"];
		hellos.each(hello => {
			names.each(name => {

				hel.push(`${hello} ${name}`);
				hel.push(`${name} ${hello}`);

			})
		});

		const lives = [];
		const lives1 = ["live", "lives", "laive", "streams", "stream", "live stream", "celbit", "cellbo", "celbinho", "cel", "celbitos", "celbitinho", "zerbit", "lvie", "liev"];
		const lives2 = ["a {replace}", "tem {replace}", "o {replace}", "{replace} hoje", "{replace} hj", "e a {replace}", "e as {replace}", "sao as {replace}", "comeca a {replace}", "comeca as {replace}", "comecam as {replace}", "horas tem {replace}", "horas e a {replace}", "hora e a {replace}", "hora tem {replace}"];
		const lives3 = ["kd", "cade", "tem", "qndo", "quando", "vai", "cde", "qando", "tm", "que", "te", "onde", "ta", "comeca", "comecar", "hj", "hoje", "amanha"];
		lives1.each(l1 => {
			lives2.each(l2 => {
				lives3.each(l3 => {

					const clear = l2.replaceAll("{replace}", l1).removeAccents().removeRepeats().trim();
					lives.push(`${l3} ${clear}`);
					lives.push(`${clear} ${l3}`);

				});
			});
		});

		const colors = ['OrangeRed', 'Chocolate', 'YellowGreen', 'SeaGreen', 'Blue', 'BlueViolet'];

		const plug = ["link do plug", "ouvindo musica"];


		const alineinteractions = [];
		const alinepeepos = [];
		const smiles = [":D", ":)", ";)", "R)", ":(", ":Z", ">(", ":O", ":P", ":z", ":|", ":/", "o_O", "R)", ";P", "AYAYA", "cellFofo", "cellBurro", "cellWD", "cellAYAYA", "cellA", "cellZ", "cellX", "cellB", "cellHmm", "cellR", "cellGr", "cellS", "cell0", "cellH", "cellL", "cellV", "patoD"];
		const peepos = ["peepoEZ", "peepoBlush", "peepoShrug", "peepoS", "peepoChave", "peepoSad", "peepoMad", "peepoHurt", "peepoSadMan", "peepoOkay", "PeepoWeird", "peepoHands", "peepoThink", "peepoPog", "WideHardo", "Pepege", "peepoChampion", "PepLaugh", "peepoNerd", "peepoGlad", "peepoSus", "peepoComfy", "peepoPogMe", "pepeL", "peepoPat"];
		const alinefeliz = ["alinepls", "aline", "alienpls","chat"];
	  alinefeliz.each(al => {
			smiles.each(sm => {

				alineinteractions.push(`${sm} ${al}`);
				alineinteractions.push(`${al} ${sm}`);

			});
		});
		alinefeliz.each(al => {
			peepos.each(sm => {

				alinepeepos.push(`${sm} ${al}`);
				alinepeepos.push(`${al} ${sm}`);

			});
		});

		app.regex.testForFake             = new RegExp("(" + fakeTest.join("|") + ")");
		app.regex.lives                   = new RegExp("\\b(" + lives.join("|") + ")\\b", "i");
		app.regex.emotes                  = new RegExp("\\b(" + emotes.join("|") + ")\\b", "i");
		app.regex.hello                   = new RegExp("\\b(" + hel.join("|") + ")\\b", "i");
		app.regex.plug                    = new RegExp("\\b(" + plug.join("|") + ")\\b", "i");
	  app.regex.names                   = new RegExp("(" + names.join("|") + ")");
		app.smiles                        = smiles;
		app.peepos												= peepos;
		app.alineinteractions							= alineinteractions;
		app.alinepeepos										= alinepeepos;
		app.colors												= colors;
		app.originalcolor									= "Chocolate";

	},
	autoMute(){

		setInterval(() => {

			fetch('https://api.twitch.tv/helix/streams/?user_login=cellbit', {method: 'get', headers: {'Client-Id': process.env.API_KEY}})
				.then(res => res.json())
				.then(res => {

					if(res.data && res.data.length > 0){
						app.conn.part("#cellbit")
						.then((data) => {
						}).catch((err) => {
						});

					}
					else{

						app.conn.join("#cellbit")
						.then((data) => {
						}).catch((err) => {
						});

					}

				})

		}, 20000);

	},
	say(target, msg, retain = false, sleep = true, timeouttime = 1000){

		setTimeout(() => {

			if ((app.messageRateCounter < 18) && ((!sleep) || (sleep && !app.sleepTime))) {

				if(!msg.testBanned(target.replace("#", ""), "$")){


					if(timeouttime !== 0){
						app.messageRateCounter++;
						app.sleepTime = true;
					}


					if (msg !== app.lastmsg) {
    				app.lastmsg = msg;
  					app.conn.say(target, msg);
					}
					else if (msg === app.lastmsg) {
        		msg = msg + " 󠀀 ";
        		app.conn.say(target, msg);
      			app.lastmsg = msg + " 󠀀 "
     			}


					if (timeouttime !== 0){

						setTimeout(() => {
							app.messageRateCounter--
						}, 20000);
						setTimeout(() => {
							app.sleepTime = false
						}, 2000);

					}

				}

			}
			else if (retain)
				setTimeout(() => {app.say(target, msg, retain)}, timeouttime);

		}, timeouttime);

	},

	save_message(username, channel_name, rawText, prefix){

		let exist = sqlite.select("select name from user where name = ?", username);
		if (exist.length < 1) {

			sqlite.run("insert into user (name) values (?)", username)

		}
		if (rawText.charAt(0) !== prefix) {

			sqlite.run("insert into message_on_channel(channel_name, user_name, message, sended_at) values(?, ?, ?, CURRENT_TIMESTAMP)", channel_name, username, rawText);

		}

	},
	has_remind(username, target){

		const hasMessage = sqlite.select("select user_from, message from remind where user_to = ?", username);
		if (hasMessage.length > 0){

			hasMessage.forEach(messageData => {

				const from = messageData["user_from"];
				const message = messageData["message"];

				app.say(target, `${username}, AYAYA FBBlock ✉ carta de ${from}: ${message}`, true);

			});
			sqlite.run("delete from remind where user_to = ?", username);
			return true;

		}else return false;

	},
	is_return_afk(username, target){

		const isReturnOfAFK = sqlite.select("select message, started_at from afk where user_name = ?", username);
		if (isReturnOfAFK.length > 0) {

			app.say(target, `${username} voltou após ${dateInterval(isReturnOfAFK[0]["started_at"])}: ${isReturnOfAFK[0]["message"]}`, true);
			sqlite.run("delete from afk where user_name = ?", username);

			return true;

		}else return false;

	},
	is_a_command(rawText, prefix, username, target){

		let toCommand = rawText.replaceAll("󠀀", "").deepTrim().split(" ");

		let channel_name = target.replace("#", "");
		let allCommands = {

			//"repetir" : ``,
			//"piramide" : ``,
			//"spam" : ``,

			"%": `retorna uma porcentagem aleatória. Sintaxe: \`${prefix}%\``,
			"love" : `nivel de amor entre você e alguma outra coisa. Sintaxe: \`${prefix}love moobot\``,
			"afk": `informa que o usuário está ausente. Sintaxe: \`${prefix}afk {mensagem}\``,
			"rl": `retorna uma mensagem aleátoria enviada pelo usuário no canal. Sintaxe: \`${prefix}rl\` ou \`${prefix}rl {usuario}\``,
			"rq": `retorna uma mensagem aleátoria enviada no canal. Sintaxe: \`${prefix}rq\``,
			"carta": `envia uma carta para o usuário que será recebida na proxima vez que ele mandar uma mensagem nos chats que eu estou. Sintaxe: \`${prefix}carta {usuario} {mensagem}\``,

			"comando": `fornece mais informações sobre um comando. Sintaxe \`${prefix}comando {comando}\``,
			"comandos": `exibe os comandos disponiveis no canal. Sintaxe: \`${prefix}comandos\``,

		};
		let msg;

		// Commands test
		switch (toCommand.shift().toLowerCase()) {

			case `${prefix}repetir`:
				if(app.blocked.includes(channel_name)||app.ignore.includes(`${username}`)) return;

				const times = Math.abs(parseInt(toCommand.shift()));
				if (!isNaN(times) && toCommand.length > 0) {

					let toRepeat = toCommand.join(" ");
					if (toRepeat[toRepeat.length - 1] !== "\\") {

						toRepeat += " "

					} else {

						toRepeat = toRepeat.slice(0, toRepeat.length - 1)

					}

					var toSend = toRepeat.repeat(times).slice(0, 80);
					app.say(target, `${username}, ` + toSend, false);

				}

				return true;
			case `${prefix}piramide`:

				if(app.blocked.includes(channel_name)||app.ignore.includes(`${username}`)) return;

				if(app.masters.includes(`${username}`)){

					const size = Math.abs(parseInt(toCommand.shift()));
					if (!isNaN(size)) {

						let toRepeat = toCommand.join(" ");

						toRepeat += " ";

						let sizeinit = 0;
						while (sizeinit <= size) {
							app.say(target, toRepeat.repeat(sizeinit), false, false, 0);
							sizeinit++;
						}
						sizeinit = size - 1;
						while (sizeinit >= 0) {
							app.say(target, toRepeat.repeat(sizeinit), false, false, 0);
							sizeinit--;
						}

					}

				}

				return true;
			case `${prefix}spam`:
				//if(app.blocked.includes(channel_name)) return;
				return;


				const toSpam = toCommand.join(" ");
					if (toSpam.length > 0) {

						let count = 0;
						let interval = setInterval(() => {

							app.say(target, toSpam, false, false, 0);
							count++;
							if (count === 25) {
								clearInterval(interval);
							}

						}, 100);

					}
				return true;

			case `${prefix}%`:
				toCommand = toCommand.join(" ");
				if (toCommand.contains("ayaya") || toCommand.contains("carlarai"))
					msg = `${username}, ${randomInt(80, 100)}% AYAYA`;
				else
					msg = `${username}, ${randomInt(0, 100)}% Thonk`;

				app.say(target, msg);

				return true;
			case `${prefix}love`:

				const percent = [

					`${randomInt(70, 100)}% love Pog ❤ `,
					`${randomInt(40, 70)}% love cellA`,
					`${randomInt(20, 40)}% love :| TeaTime`,
					`${randomInt(0, 20)}% love cellH 💔 `,

				];

				let lTarget = toCommand.join(" ");
				if (lTarget === "arstotzka" || lTarget === "Arstotzka"){
					app.say(target, "/color red", false, false);
					msg = `/me ${username} $ ${lTarget} : 100% cellGr 7 GLORIA A ARSTOTZKA`;
					}
				else if ((username === "bhaskarai" && lTarget === "carlamorena") || (username === "carlamorena" && lTarget === "bhaskarai"))
					msg = `${username} & ${lTarget} : 100% love 💓 😍`;
				else if (username === "dinokat" && (lTarget === "emma_lee" || lTarget === "emma" || lTarget === "liriapatin" || lTarget === "liria" || lTarget === "patin"))
					msg = `${username} :z http://prntscr.com/ojpjr6`;
					// vai la beijar a satanya velho filho da puta cellGr
				else if (lTarget === "emma_lee" || lTarget === "emma" || lTarget === "liriapatin" || lTarget === "liria" || lTarget === "patin")
					msg = `${username} & ${lTarget} : 0% love cellH 💔`;
				else if (app.masters.includes(username))
					msg = `${username} & ${lTarget} : ${randomInt(80, 100)}% love Pog ❤ `;
				else
					msg = `${username} & ${lTarget} : ${percent[randomInt(0, percent.length - 1)]}`;

				app.say(target, msg, false, false);
				app.say(target, "/color " + app.originalcolor, true);
				return true;
			case `${prefix}afk`:
				if (toCommand.length > 0)
					msg = toCommand.join(" ");

				else
					msg = "🔇 :z";

				sqlite.run("insert into afk(user_name, message, started_at) values(?, ?, CURRENT_TIMESTAMP)", username, msg);
				app.say(target,`o ${username} está afk agora :z 💤 `, true);

				return true;
			case `${prefix}rl`:

				let uTarget;
				if (toCommand.length > 0)
					uTarget = toCommand.shift().toLowerCase();
				else
					uTarget = username;

				if (!app.bots.includes(uTarget)) {

					// noinspection SqlResolve
					let dResult = sqlite.select(`SELECT message, sended_at FROM message_on_channel WHERE channel_name = ? and user_name = ? order by random() limit 1`, [channel_name, uTarget]);
					if (dResult.length > 0) {

						let message = dResult[0]["message"];

						let date = new Date(dResult[0]["sended_at"] + " GMT");

						let day     = date.getDate()    > 9 ? date.getDate()    : "0" + date.getDate();
						let month   = date.getMonth()   > 9 ? date.getMonth()   : "0" + date.getMonth();
						let hours   = date.getHours()   > 9 ? date.getHours()   : "0" + date.getHours();
						let minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();

						let dateFormatted = `${day}/${month}/${date.getFullYear()}`;
						let hourFormatted = `${hours}:${minutes}`;

						msg = `[${dateFormatted} - ${hourFormatted}] ${uTarget}: ${message}`;

					} else
						msg = `${username} acho que eu nunca vi essa pessoa por aqui ppL `;

					app.say(target, msg);

				}

				return true;
			case `${prefix}rq`:

				// noinspection SqlResolve
				let dataResult = sqlite.select(`SELECT user_name, message, sended_at FROM message_on_channel WHERE channel_name = ? order by random() limit 1`, [channel_name]);
				if (dataResult.length > 0) {

					let message = dataResult[0]["message"];
					let user = dataResult[0]["user_name"];

					let date = new Date(dataResult[0]["sended_at"] + " GMT");

					let day     = date.getDate()    > 9 ? date.getDate()    : "0" + date.getDate();
					let month   = date.getMonth()   > 9 ? date.getMonth()   : "0" + date.getMonth();
					let hours   = date.getHours()   > 9 ? date.getHours()   : "0" + date.getHours();
					let minutes = date.getMinutes() > 9 ? date.getMinutes() : "0" + date.getMinutes();

					let dateFormatted = `${day}/${month}/${date.getFullYear()}`;
					let hourFormatted = `${hours}:${minutes}`;

					msg = `[${dateFormatted} - ${hourFormatted}] ${user}: ${message}`;

          app.say(target, msg);

				}
				return true;
			case `${prefix}carta`:

				if (toCommand.length > 1) {

					const toMessage = toCommand.shift().toLowerCase();
					const message = toCommand.join(" ");
					if (!app.bots.includes(toMessage)) {

						const userExists = sqlite.select("select name from user where name = ?", toMessage);
						if (userExists.length > 0) {

							const count = sqlite.select("select count(user_to) as cRemind from remind where user_to = ?", toMessage)[0]["cRemind"];
							if (parseInt(count) < 4) {

								sqlite.run("insert into remind(user_from, user_to, message) values (?, ?, ?)", username, toMessage, message);
								msg = `${username} deixa comigo! sua mensagem vai chegar nele. assim que eu achar ele... ✉ cellEMOTE `;

							}else msg = `${username} eu já tenho muitas mensagens pra entregar para esse ai >(`;
						}else msg = `${username}, não conheço esse usuário, não tenho como enviar isso cellH`;

						app.say(target, msg, true);

					}

				}

				return true;
			case `${prefix}rainbow`:
			return;

				if (toCommand.length > 0 && toCommand.length <= 10) {
					var rainbowtext = toCommand.shift();
				}
				else{
					var rainbowtext = "RainbowPls it's Rainbow Time";
				}

				// if (channel_name === "cellbit"){
				// 	var rainbowsleep = true
				//
				// }
				// else{
				// 	var rainbowsleep = false
				// }

				app.colors.each(col => {
					app.say(target, "/color " + col, false, false);
					app.say(target, "/me " + rainbowtext, false, false);
				});

				app.say(target, "/color " + app.originalcolor, false, false)


				return true;
			case `${prefix}comandos`:

				let list = "";
				allCommands.each((_, command) => {list += `${prefix}${command}; `});

				app.say(target, `${username}, os comandos disponiveis são: ${list}`, true);
				return true;
			case `${prefix}comando`:

				if (toCommand.length > 0) {

					let search = toCommand.shift().toLowerCase();
					allCommands.each((description, command) => {

						if (command === search || `${prefix}${command}` === search)
							msg = `${username}, ${prefix}${command} ${description}`;

					});

				}else
					msg = `${username}, Digite \`$comando {comando}\` para mais informações sobre cada comando. Ex: \`$ajuda $repetir\``;

				app.say(target, msg);
				return true;

		}

	},

	testAutoAnswer(rawText, username, target){

		let toAnalise = rawText.replaceAll("󠀀", "").deepTrim();

		return (
			app.testHello(toAnalise, username, target) ||
			app.testLive(toAnalise, rawText, username, target) ||
			app.testPlug(toAnalise, rawText, username, target) ||
			app.testEmotes(toAnalise, rawText, username, target) ||
    	app.testInteraction(toAnalise, rawText, username, target) ||
			app.testTPeepos(toAnalise, rawText, username, target)
		)

	},
	testHello(toAnalise, username, target){

		if (app.regex.hello.test(toAnalise)) {

			app.say(target,`${username} 👋 cellQ`);

			return true;
		}else return false;

	},
	testLive(toAnalise, rawText, username, target){
		const channel_name = target.replace("#", "");
		if (app.alter.includes(channel_name)) return false;
		if (app.regex.lives.test(toAnalise) && rawText.indexOf("?") !== -1) {

			app.say(target,`${username} escreve !status no chat pra saber da proxima live :z TeaTime`);

			return true;
		}else return false;

	},
	testPlug(toAnalise, rawText, username, target){
		const channel_name = target.replace("#", "");
		if (app.alter.includes(channel_name)) return false;
		if (app.regex.plug.test(toAnalise) && rawText.indexOf("?") !== -1) {

			app.say(target,`${username} plug.dj/alinepls pepeJAM`);

			return true;
		}else return false;

	},
	testEmotes(toAnalise, rawText, username, target){
		const channel_name = target.replace("#", "");
		if (app.alter.includes(channel_name)) return false;
		if (

			rawText.indexOf("?") !== -1 &&
			!app.regex.testForFake.test(rawText) &&
			app.regex.emotes.test(toAnalise)

		) {

			app.say(target, `${username} escreve !emotes no chat pra saber como funcionam os emotes :)`, true);
			app.say(target, `${username} ou !mobile se você estiver no celular :z`, true);

			return true;
		}else return false;

	},
  	testInteraction(toAnalise, rawText, username, target){
		return app.alineinteractions.each(ai => {
			app.smiles.each(sm =>{

			if(toAnalise.contains(ai) && toAnalise.contains(sm)){
				app.say(target, `${username} ` + sm, true);
				return true;

			}

		})
		})

	},
	testTPeepos(toAnalise, rawText, username, target){
	const channel_name = target.replace("#", "");
	if (channel_name !== "tataxmei") return false;
	return app.alinepeepos.each(ai => {
		app.peepos.each(sm =>{

		if(toAnalise.contains(ai) && toAnalise.contains(sm)){
			app.say(target, `${username} ` + sm, true);
			return true;

		}

	})
	})

},

	testPyramid(rawText, username, target){

		const channel_name = target.replace("#", "");

		const pTest = rawText.split(" ");
		if(pTest.length > 0){

			const isAllSame = pTest.reduce((all, att) => all & (att === pTest[0]) , true);

			if(isAllSame){

				if(
					pTest.length === 1 &&
					(
						!app.pCount[channel_name] ||
						(app.pCount[channel_name] && app.pCount[channel_name].step !== 2)
					)
				){

					app.pCount[channel_name] = {
						members : [username],
						length : 1,
						step : 1,
						pChar : pTest[0]
					}

				}

				else if(app.pCount[channel_name]){

					if(app.pCount[channel_name].pChar === pTest[0]){

						if(

							app.pCount[channel_name].step + 1 === pTest.length &&
							app.pCount[channel_name].step === app.pCount[channel_name].length

						){

							if(!app.pCount[channel_name].members.includes(username))
								app.pCount[channel_name].members.push(username);

							app.pCount[channel_name].step++;
							app.pCount[channel_name].length = pTest.length;

						}

						else if(app.pCount[channel_name].step - 1 === pTest.length){

							if(pTest.length !== 1 && !app.pCount[channel_name].members.includes(username))
								app.pCount[channel_name].members.push(username);

							app.pCount[channel_name].step--;

						}
						else{
							app.pCount[channel_name] = null;
							app.Broken = true;
							return false;

						}

						if(

							app.pCount[channel_name] !== null &&
							app.pCount[channel_name].length > 1 &&
							app.pCount[channel_name].step === 1 &&
							app.Broken !== true

						){

							const length = app.pCount[channel_name].length;
							const pChar = app.pCount[channel_name].pChar;
							const members = app.pCount[channel_name].members;
							const endedByMember = members.includes(username);
							const action = endedByMember ? (
								members.length === 1 ? `${members[0]} fez` : `${members.join(", ")} fizeram`
							) : `${username} roubou`;

							if(length >= 3 && length < 5){

								app.say(target, `${action} uma piramide de ${length} ${pChar} ${endedByMember ? "too smol ppL" : "monkaJ"}`);

							}
							else if(length >= 5 && length < 10){

								app.say(target, `${action} uma piramide de ${length} ${pChar} ${endedByMember ? "Pog" : "monkaJ"}`);

							}
							else if(length >= 10 && length  < 15){

								app.say(target, `${action} uma piramide de ${length} ${pChar} ${endedByMember ? "PogU" : "monkaJ"}`);

							}
							else if(length >= 15 && length < 25){

								app.say(target, `${action} uma piramide de ${length} ${pChar} ${endedByMember ? "✋ WutFaceW STOP" : " :tf: Problemo?"}`);

							}
							else if(length >= 25){

								app.say(target, `${action} uma piramide de ${length} ${pChar} ${endedByMember ? ":D /ban" : "monkaJ Clap You made history"}}`);

							}
							app.pCount[channel_name] = null;

						}

					}else {
						app.pCount[channel_name] = null;
						return false;
						}
				}else
				app.pCount[channel_name] = null;
				app.Broken = false;
				return false;

			}

		}else
			app.pCount[channel_name] = null;
			app.Broken = false;
			return false;

	},

	onConnect(addr, port) {

		console.log(`* Connected to ${addr}:${port}`);

		const channels = process.argv[2] === undefined ? process.env.prodChannels.split("|") : process.argv[2] === "dev" ? process.env.devChannels.split("|") : process.env.alterChannels.split("|");
		channels.map(channel => `#${channel}`);

		const connect = () => {

			if(channels.length > 0){

				const channel = channels.shift();
				app.conn.join(channel).then((data) => {
					connect()
				}).catch((err) => {
					channels.push(channel);
					connect();
				});

			}

		};
		connect();

	},
	onMessage(target, context, rawText, self){

		// Set Vars
		const channel_name  = target.replace("#", "");
		const displayName   = context["display-name"];
		const username      = context["username"];
		const userID        = context["user-id"];
		const messageID     = context["id"];
		const messageType   = context["message-type"];
		const isMod         = context["mod"];
		const isSubscriber  = context["subscriber"];
		const prefix        = "$";

		if((rawText === `${prefix}mute on` || rawText === `${prefix}mute off`) && app.masters.includes(username)){

			// Se for é pq é pra mutar 4Head, se não é pra desmutar 4Head
			app.mute[channel_name] = (rawText === `${prefix}mute on`);

		}

		if(

			self ||
			username === process.env.BOT_USERNAME ||
			messageType !== "chat" ||
			app.mute[channel_name] ||
			app.ignore.includes(username) ||
			app.bots.includes(username) ||
			rawText.testBanned(channel_name, prefix)

		) return;

		app.save_message(username, channel_name, rawText, prefix);

		return (

		 	app.has_remind(username, target) ||
		 	app.is_return_afk(username, target) ||
		 	app.is_a_command(rawText, prefix, username, target) ||
		 	app.testAutoAnswer(rawText, username, target) ||
		 	app.testPyramid(rawText, username, target)

		 );

	},

	init(){

		const kkomrade = process.argv[2];
		// presets
		app.preprocess();
		if (kkomrade === undefined)
		app.autoMute();
		sqlite.connect();

		// Configs
		const username = process.env.BOT_USERNAME;
		const password = process.env.BOT_PASSWORD;
		const identity = {username, password};

		// Evitar conflitos de ambientes de teste (em modo teste ela só aparece no canal da alinepls, iniciar com "yarn dev" ou "npm dev")

		const channels = [];

		app.conn = new tmi.client({
			identity,
			channels,
			connection: {
				reconnect : true,
				secure : true,
			}
		});
		app.conn.on('connected', app.onConnect);
		app.conn.on('message', app.onMessage);

		console.log(`* Iniciando...`);
		app.conn.connect();

	}

};

app.init();
