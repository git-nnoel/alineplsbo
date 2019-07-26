// Requires
const tmi = require('tmi.js');
const fetch = require("node-fetch");
const {randomInt, sqlite, dateInterval} = require("./src/tools");
require("dotenv").config();

// Handlers
const app = {

	conn : null,

	messageRateCounter: 0,
	sleepTime: false,
	mute: {},
	masters : ["nnoel", "emma_lee", "bhaskarai"],
	bots : ["dont_ping_haxk", "moobot", "priestbot", "nightbot", "phantombot", "streamelements", "streamlabs", "baguette_bot", "vivbot", "coolshiba", "ohbot", "deepbot", "ankhbot", "wizeBot", "coebot", "xanbot", "hnlbot", "drangrybot", "stay_hydrated_bot", "alinepls", "liriabot"],
	ignore : ["necronstar", "crayzerbr"],
	cute_messages : [
		"oi chat, ja disse que amo vocês?",
		"@chat vocês são muitos fofos cellFofo",
		"@chat cellTa 📱 ⚡ ❓ ",
		"AYAYA meu kokoro artificial faz doki doki por vocês chat",
		"@chat, quem de vocês querem um abraço? AYAYA FBCatch",
		"BibleThump eu só queria saber quando começa a lvieeer?",
		"cellFofo FBCatch 💜 @chat",
		"cellTa nossa chat, vocês cortaram o cabelo?",
		"cellTa vocês estão cheirosos hoje chat",
		"KKonaW hi chat, I love u",
		":z 👎 unmod nnoel que não cuida de mim",
		"digita !tutorial se você for novo aqui :z TeaTime",
		"cellPP @chat, me da um gifto sub? :D",
		"AYAYA where's my weeb friends❓",
		"💪 cellGr digita \"$love alinepls\" agora, vou quebrar quem der menos de 80%",
		"cellTa como as cores num retrato o tempo insiste em desbotar. vem ca chat, me passa seu celular 📱 ⚡ ❓",
		"cellTa esse cheiro maravilhoso é de vocês chat?",
		":/ 📝 ✉ i'm writting a letter for you, say: you're really cute 💜",
		":/ ✏ 🗺 ainda procurando o nucleo da toxicidade ta twitch",
		"5Head 📖 📚 \"não como andar na água é nadar contra OkayChamp\" - Bhaskarai, 2019",
		"cellGr digitem \"$love alinepls\" agora. ban em quem der menos que 80%",
		"cellFofo @chat, o unico ataque dos titans que conheço é meu amor invadindo seu coração 💜",
		"cellTa @chat você ja é vip no meu coração",
		"cellPP é aqui a live do alhoo?",
		"AYAYA chat, vamo ve anime ❓ ",
		"cellFofo @chat, meu amor por vocês é maior que o amor do blublu por persona",
		"cellGr cheguei, cade o spam de amor?",
		"cellPP @mods, como que compra essa espadinha do lado do nome?",
		"cellGr 👉 🚪 quem não me ama",
		":/ chat, perdão por perturbar vocês, minha twitch ta bugada. podem me dizer que horas vocês vão declarar seu amor por mim? cellFofo",
		"cellTa @chat, me chama no 📱 ⚡, meu numero é: 9",
		":z \"$love alinepls\" agora no chat. menos de 60% é kpopper",
		":D ola a todos os web internaltas que aqui se encontram, ja estava com saudade",
		"cellPP @moobot, cade o laivi?",
		"cellGr quem me ofender é kpopper",
		"💪 cellGr cade aqueles que não gostam de mim pra sair no soco?"
	],

	regex : {},

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
			"cellTa", "cellOi", "cellNormie", "AYAYA", "cellR", "cellEMOTE", "cellGr", "cellA", "cellH", "cellAYAYA", "cellFofo", "cellWtf", "Pepega"];

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

		const plug = ["link do plug", "ouvindo musica"];


		// const smiles = [":D", ":)", ";)", "R)", ":(", ":Z", ">(", ":O", ":P", ":z", ":|", ":/", "AYAYA",
		// 	"cellR", "cellEMOTE", "cellGr", "cellA", "cellH", "cellAYAYA", "cellFofo", "cellWtf", "cellWD", "cellX", "cellZ", "cellPP", "cellTa"];
		// const alinefeliz = ["alinepls", "aline", "alienpls"];
		// const smilephrase = [
		// 	"{replace} {replace2}",
		// 	"{replace2} {replace}"
		// ];
		// alinefeliz.each(al => {
		// 	smiles.each(sm => {
		// 		smilephrase.each(smp => {
		// 			if (toAnalise.contains(smp.replaceAll("{replace}", al).replaceAll("{replace2}", sm))) {
		// 				setTimeout(function () {
		// 					app.say(`${username} ` + sm);
		// 				}, 600);
		//
		// 				return true;
		//
		// 			} else if (toAnalise.contains(smp.replaceAll("{replace}", al).replaceAll("{replace2}", "R)"))) {
		// 				setTimeout(function () {
		// 					app.say(`${username} R) arrrg`);
		// 				}, 600);
		//
		// 				return true;
		// 			}
		//
		// 		})
		// 	})
		// });

		app.regex.testForFake  = new RegExp("(" + fakeTest.join("|") + ")");
		app.regex.lives        = new RegExp("\\b(" + lives.join("|") + ")\\b", "i");
		app.regex.emotes       = new RegExp("\\b(" + emotes.join("|") + ")\\b", "i");
		app.regex.hello        = new RegExp("\\b(" + hel.join("|") + ")\\b", "i");
		app.regex.plug         = new RegExp("\\b(" + plug.join("|") + ")\\b", "i");

	},
	autoMute(){

		setInterval(() => {

			fetch('https://api.twitch.tv/helix/streams/?user_login=cellbit', {method: 'get', headers: {'Client-Id': 'ecgfmopuk1i53vofoflwbbvwnxfxvk'}})
				.then(res => res.json())
				.then(res => {app.mute.cellbit = (res.data && res.data.length > 0)})
				.catch(err => {});

		}, 20000);

	},

	say(target, msg, retain = false){

		setTimeout(() => {

			if (!app.sleepTime && app.messageRateCounter < 18) {

				if(!msg.testBanned(target.replace("#", ""), "$")){

					app.messageRateCounter++;
					app.sleepTime = true;

					app.conn.say(target, msg);

					setTimeout(() => {
						app.messageRateCounter--
					}, 20000);
					setTimeout(() => {
						app.sleepTime = false
					}, 2000);

				}

			}
			else if (retain)
				setTimeout(() => {app.say(target, msg, retain)}, 1000);

		}, 1000);

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

				app.say(target, `${from} > ${username}: ${message}`, true);

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

			// Dead
			case `${prefix}repetir`:
				return;
				const times = Math.abs(parseInt(toCommand.shift()));
				if (!isNaN(times) && toCommand.length > 0) {

					let toRepeat = toCommand.join(" ");
					if (toRepeat[toRepeat.length - 1] !== "\\") {

						toRepeat += " "

					} else {

						toRepeat = toRepeat.slice(0, toRepeat.length - 1)

					}

					var toSend = toRepeat.repeat(times).slice(0, 80);
					app.say(`${username}, ` + toSend);

				}

				return true;
			case `${prefix}piramide`:
				return;
				const size = Math.abs(parseInt(toCommand.shift()));
				if (!isNaN(size) && toCommand.length > 0) {

					let toRepeat = toCommand.join(" ");


					toRepeat += " ";

					let sizeinit = 0;
					while (sizeinit <= size) {
						app.say(toRepeat.repeat(sizeinit), false);
						sizeinit++;
					}
					sizeinit = size - 1;
					while (sizeinit >= 0) {
						app.say(toRepeat.repeat(sizeinit), false);
						sizeinit--;
					}

				}

				return true;
			case `${prefix}spam`:
				return;
				const toSpam = toCommand.join(" ");
				const spamallowed = ["nnoel", "liriapatin", "bhaskarai"];
				spamallowed.each(sall => {
					if (toSpam.length > 0 && `${username}` == sall) {

						let count = 0;
						let interval = setInterval(() => {

							app.say(toSpam, false, false);
							count++;
							if (count === 25) {
								clearInterval(interval);
							}

						}, 100);

					}
				});
				return true;
			// Dead

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
				if (username === "nnoel")
					msg = `${username} & ${lTarget}: ${randomInt(70, 100)}% love Pog ❤ `;

				else if ((username === "bhaskarai" && lTarget === "carlamorena") || (username === "carlamorena" && lTarget === "bhaskarai"))
					msg = `${username} & ${lTarget}: 100% love 💓 😍`;

				else if (username === "dinokat" && (lTarget === "emma_lee" || lTarget === "emma" || lTarget === "liriapatin" || lTarget === "liria" || lTarget === "patin"))
					msg = `${username} :z http://prntscr.com/ojpjr6`;
					// vai la beijar a satanya velho filho da puta cellGr
				else if (lTarget === "emma_lee" || lTarget === "emma" || lTarget === "liriapatin" || lTarget === "liria" || lTarget === "patin")
					msg = `${username} & ${lTarget}: 0% love cellH 💔`;

				else
					msg = `${username} & ${lTarget}: ${percent[randomInt(0, percent.length - 1)]}`;

				app.say(target, msg, true);
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

				} else
					msg = `${username} acho que eu nunca vi essa pessoa por aqui ppL `;

				app.say(target, msg);

				return true;
			case `${prefix}carta`:

				if (toCommand.length > 1) {

					const toMessage = toCommand.shift().toLowerCase();
					const message = toCommand.join(" ");
					if (
						!app.ignore.includes(toMessage) &&
						!app.bots.includes(toMessage)
					) {

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

	randomAutoAnswer(){

		const timer = randomInt(1800000, 3600000);
		setTimeout(() => {

			if(!app.mute.cellbit)
				app.say("#cellbit", app.cute_messages[randomInt(0, app.cute_messages.length - 1)], true);

			app.randomAutoAnswer();

		}, timer);

	},
	testAutoAnswer(rawText, username, target){

		let toAnalise = rawText.replaceAll("󠀀", "").deepTrim();

		// Esta assim pq se um der verdadeiro ele não vai para o proximo (funcionamento interno da linguagem)
		return (
			app.testHello(toAnalise, username, target) ||
			app.testLive(toAnalise, rawText, username, target) ||
			app.testPlug(toAnalise, rawText, username, target) ||
			app.testEmotes(toAnalise, rawText, username, target)
		)

	},
	testHello(toAnalise, username, target){

		if (app.regex.hello.test(toAnalise)) {

			app.say(target,`${username} 👋 cellR`);

			return true;
		}else return false;

	},
	testLive(toAnalise, rawText, username, target){

		if (app.regex.lives.test(toAnalise) && rawText.indexOf("?") !== -1) {

			app.say(target,`${username} escreve !status no chat pra saber da proxima live :z TeaTime`);

			return true;
		}else return false;

	},
	testPlug(toAnalise, rawText, username, target){

		if (app.regex.plug.test(toAnalise) && rawText.indexOf("?") !== -1) {

			app.say(target,`${username} plug.dj/-5321101498343942054 pepeJAM`);

			return true;
		}else return false;

	},
	testEmotes(toAnalise, rawText, username, target){

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

	onConnect(addr, port) {

		console.log(`* Connected to ${addr}:${port}`);
		app.randomAutoAnswer();

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

		if (

			self ||
			username === process.env.BOT_USERNAME ||
			messageType !== "chat" ||
			app.mute[channel_name] ||
			app.ignore.includes(username) ||
			app.bots.includes(username) ||
			rawText.testBanned(channel_name, prefix)

		) return;

		app.save_message(username, channel_name, rawText, prefix);

		// Esta assim pq se um der verdadeiro ele não vai para o proximo (funcionamento interno da linguagem)
		return (

			app.has_remind(username, target) ||
			app.is_return_afk(username, target) ||
			app.is_a_command(rawText, prefix, username, target) ||
			app.testAutoAnswer(rawText, username, target)

		);

	},

	init(){

		// presets
		app.preprocess();
		app.autoMute();
		sqlite.connect();

		// Configs
		const username = "alinepls";
		const password = "oauth:yace41u852lssyua5ahlck9t4icu9q";
		const identity = {username, password};

		const channels = ["emma_lee", "cellbit", "nnoel"];

		app.conn = new tmi.client({identity, channels});
		app.conn.on('connected', app.onConnect);
		app.conn.on('message', app.onMessage);

		console.log(`* Iniciando...`);
		app.conn.connect();

	}

};

app.init();
