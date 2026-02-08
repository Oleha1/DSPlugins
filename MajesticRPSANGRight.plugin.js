/**
 * @name MajesticRPSANGRight
 * @author Oleha discrod: mroleha
 * @version 1.0.4
 * @description Majestic RP Washington SANG Right Click version.
 * @source https://github.com/Oleha1/BDPlugin
 * @updateUrl https://raw.githubusercontent.com/Oleha1/BDPlugin/main/MajesticRPSANGRight.plugin.js
 * @downloadUrl https://raw.githubusercontent.com/Oleha1/BDPlugin/main/MajesticRPSANGRight.plugin.js
 */

const TARGET_GUILD_ID = "1214393279936991252";
const TARGET_CHANNEL_ID_KA = "1214393282201919542"

const TARGET_CHANNEL_ID_MI = "1214393282201919543";

const PLUGIN_VERSION = "1.0.4";
const UPDATE_URL = "https://raw.githubusercontent.com/Oleha1/BDPlugin/main/MajesticRPSANGRight.plugin.js";
const PLUGIN_FILE_NAME = "MajesticRPSANGRight.plugin.js";

module.exports = (() => {
	if (!window.BDFDB_Global || (!window.BDFDB_Global.loaded && !window.BDFDB_Global.started)) {
		return class MissingLibraryPlugin {
			load() {
				BdApi.UI.showConfirmationModal("Library Missing", "The BDFDB Library Plugin is required.", {
					confirmText: "Download",
					onConfirm: () => {
						BdApi.Net.fetch("https://mwittrien.github.io/BetterDiscordAddons/Library/0BDFDB.plugin.js")
							.then(r => r.text())
							.then(b => {
								require("fs").writeFileSync(
									require("path").join(BdApi.Plugins.folder, "0BDFDB.plugin.js"),
									b
								);
							});
					}
				}
				);
			}

			start() { }
			stop() { }
		};
	}

	async function checkForUpdate() {
		try {
			const res = await fetch(UPDATE_URL);
			const text = await res.text();

			const match = text.match(/@version\s+([0-9.]+)/);
			if (!match) return;

			const remoteVersion = match[1];
			
			if (remoteVersion !== PLUGIN_VERSION) {
				BdApi.UI.showConfirmationModal(
					"Доступно обновление",
					`Текущая версия: ${PLUGIN_VERSION}\nНовая версия: ${remoteVersion}\n\nПерезапустить Discord после обновления?`,
					{
						confirmText: "Обновить и перезапустить",
						cancelText: "Отмена",
						onConfirm: () => {
							const fs = require("fs");
							const path = require("path");

							const pluginPath = path.join(BdApi.Plugins.folder, PLUGIN_FILE_NAME);
							fs.writeFileSync(pluginPath, text);

							BdApi.UI.showToast("Плагин обновлён. Перезапуск Discord...", { type: "success" });

							setTimeout(() => {
								BdApi.restart();
							}, 1000);
						}
					}
				);
			}
		} catch (err) {
			console.error("Ошибка проверки обновления:", err);
		}
	}

	return (([Plugin, BDFDB]) => {
		
		const departments = [
			{
				keyAndValue: "",
				name: "Выберите отдел"
			},
			{
				keyAndValue: "DIV",
				name: "DIV - Devision"
			},
			{
				keyAndValue: "MP",
				name: "MP - Military Police"
			},
			{
				keyAndValue: "DF",
				name: "DF - Delta Force"
			},
			{
				keyAndValue: "MMS",
				name: "MMS - Military Medical Service"
			},
			{
				keyAndValue: "USAF",
				name: "USAF - United States Air Force"
			},
			{
				keyAndValue: "DIA",
				name: "DIA - Defense Intelligence Agency"
			},
			{
				keyAndValue: "MA",
				name: "MA - Military Academy"
			},
			{
				keyAndValue: "A",
				name: "A - Academy"
			}
		]

		const buttons = [
			{
				type: "separator",
			},
			{
				type: "item",
				id: "buttonPromotion",
				name: "Повышение",
				action: function (message , channel) {
					let userId = getUserIDOnMessage(message)
					BDFDB.ModalUtils.open(this, {
						header: "Подробности повышения",
						size: "LARGE",
						children: BdApi.React.createElement(UpModal, {msg: message, channel, selectedUserId: userId })
					});
				}
			},
			{
				type: "item",
				id: "buttonTranslation",
				name: "Перевод",
				action: function (message , channel) {
					let userId = getUserIDOnMessage(message)
					BDFDB.ModalUtils.open(this, {
						header: "Подробности перевода",
						size: "LARGE",
						children: BdApi.React.createElement(TranslationModal, {msg: message, channel, selectedUserId: userId })
					});
				}
			},
			{
				type: "separator",
			},
			{
				type: "item",
				id: "buttonAcceptance",
				name: "Принятие",
				action: function (message , channel) {
					let selfId = BdApi.Webpack.getModule(m => m.getCurrentUser).getCurrentUser().id;

					if (!getUserNick(selfId) || !getUserNick(message.author.id)) return;
					if (!getUserStatick(selfId) || ! getUserStatick(message.author.id)) return

					sendMessage(
						TARGET_CHANNEL_ID_KA,
						`1. <@${selfId}> ${getUserNick(selfId)} ${getUserStatick(selfId)}\n2. <@${message.author.id}> ${getUserNick(message.author.id)} ${getUserStatick(message.author.id)}\n3. Принятие\n4. Ранг - 1\n5. Собеседование`,
						"Принятие отписано!"
					)
				}
			},
			{
				type: "item",
				id: "buttonDismissal",
				name: "Увольнение",
				action: function (message , channel) {
					let userId = getUserIDOnMessage(message)
					BDFDB.ModalUtils.open(this, {
						header: "Подробности увольнения",
						size: "LARGE",
						children: BdApi.React.createElement(DismissalModal, {msg: message, channel, selectedUserId: userId })
					});
				}
			},
			{
				type: "separator",
			},
			{
				type: "item",
				id: "buttonMilitaryID",
				name: "Военный билет",
				action: function (message , channel) {
					let selfId = BdApi.Webpack.getModule(m => m.getCurrentUser).getCurrentUser().id;

					sendMessage(
						TARGET_CHANNEL_ID_MI,
						`1. <@${selfId}> ${getUserStatick(selfId)}\n2. <@${message.author.id}> ${getUserStatick(message.author.id)}\n3. ${getData()}\n4. ${createLink(channel,message)}`,
						"Военный билет отписан!"
					)
				}
			}
		]

		function getUserIDOnMessage(msg) {
			if (msg.embeds && msg.embeds.length) {
				for (const embed of msg.embeds) {
					if (embed.fields) {
						for (const field of embed.fields) {
							if (field.rawName == "Discord пользователь") return field.rawValue.slice(2, field.rawValue.length - 1);
						}
					}
				}
			}
			return msg.author.id.toString();
		}

		function getUserDisplayName(userId) {
			const member = BDFDB.LibraryStores.GuildMemberStore.getMember(TARGET_GUILD_ID, userId);
			if (!member || !member.nick) {
				BdApi.UI.showToast("Пользователь не найден", { type: "warning" });
				return false;
			}
			return member.nick;
		}

		function getUserNick(userId) {
			const nick = getUserDisplayName(userId);
			if (!nick) {
				BdApi.UI.showToast("Пользователь не найден", { type: "warning" });
				return false;
			}

			const split = nick.split("|");
			if (split.length < 2) {
				BdApi.UI.showToast(`Ник ${nick} не по форме!`, { type: "warning" });
				return false;
			}

			return split[1];
		}

		function getUserStatick(userId) {
			const nick = getUserDisplayName(userId);
			if (!nick) {
				BdApi.UI.showToast("Пользователь не найден", { type: "warning" });
				return false;
			}
			const match = nick.match(/\d+/g);

			if (!match) {
				BdApi.UI.showToast(`У пользователя ${nick} нет статика`, { type: "warning" });
				return false;
			}

			return match;
		}

		function getData() {
			const date = new Date();
			let day = String(date.getDate()).padStart(2, '0');
			let month = String(date.getMonth() + 1).padStart(2, '0');
			let year = date.getFullYear();
			return `${day}.${month}.${year}`;
		}

		function createLink(channel,message) {
			return `https://discord.com/channels/${TARGET_GUILD_ID}/${channel.id}/${message.id}`;
		}

		function sendMessage(channelID, content, messageToast, rederect = true) {
			BdApi.Webpack.getModule(m => m.sendMessage).sendMessage(
				channelID,
				{
					content: content,
					tts: false
				},
				false,
				{
					nonce: Date.now().toString()
				}
			).then(() => {
				BdApi.UI.showToast(messageToast, { type: "success" });
				if (rederect) {
					BDFDB.LibraryModules.HistoryUtils.transitionTo(`/channels/${TARGET_GUILD_ID}/${channelID}`)
				}
			}).catch(error => {
				console.error("Ошибка отправки:", error);
				BdApi.UI.showToast("Ошибка отправки", { type: "error" });
			});
		}

		function getAuthorOption(msg, selectedUserId) {
			const mentions = msg.content.match(/<@\d+>/g);
			const allUserId = mentions.map(mention => 
				mention.replace(/[<@>]/g, '')
			);
			allUserId.unshift(selectedUserId);

			const uniqueIds = [...new Set(allUserId)];

			const authorOption = uniqueIds.map(Ids =>
				BdApi.React.createElement("option", {
					key: Ids,
					value: Ids,
					style: {
						width: "100%",
					}
				}, "" + getUserDisplayName(Ids))
			);
			authorOption.unshift(
				BdApi.React.createElement("option", {
					key: "",
					value: "",
					style: {
						width: "100%",
					}
				}, "Выберите пользователя")
			)
			return authorOption;
		}

		function renderMessage(msg,channel) {
			return BdApi.React.createElement(
				BDFDB.LibraryComponents.MessageGroup, {
					message: msg,
					channel: channel,
					disableInteraction: true,
					className: BDFDB.disCN.messagespopoutgroupcozy,
					style: { backgroundColor: "var(--background-base-low)", boxShadow: "var(--legacy-elevation-border), var(--legacy-elevation-high)" },
				}, true
			)
		}

		function renderInput(placeholder, onChange) {
			return BdApi.React.createElement("input", {
					placeholder: placeholder,
					onChange: onChange,
					style: { 
						color: "white",
						padding: "12px",
						borderRadius: "6px",
						fontSize: "18px",
						width: "100%",
						marginBottom: "10px",
						backgroundColor: "var(--background-base-low)",
						boxShadow: "0px 1px 0.4em rgba(255, 255, 255, 0.1)",
						border: "none"
					}
				}
			)
		}
		function renderSelect(options, onChange) {
			return BdApi.React.createElement("select", {
				onChange: onChange,
				style: {
					color: "white",
					padding: "12px",
					borderRadius: "6px",
					fontSize: "18px",
					width: "100%",
					marginBottom: "10px",
					backgroundColor: "var(--background-base-low)",
					boxShadow: "0px 1px 0.4em rgba(255, 255, 255, 0.1)",
					border: "none"
				}
			},[
				options
			])
		}

		function renderButton(onClick) {
			return BdApi.React.createElement("button", {
				style: { 
					marginTop: 10, 
					padding: "6px 12px",
					fontSize: "18px",
					color: "white",
					cursor: "pointer", 
					backgroundColor: "rgb(0, 103, 199)", 
					border: "none", 
					borderRadius: "6px"
				},
				onClick: onClick
			}, "Отправить отчёт")
		}

		function closeMenu() {
			document.dispatchEvent(new KeyboardEvent('keydown', {
				key: 'Escape',
				code: 'Escape',
				keyCode: 27,
				which: 27,
				bubbles: true,
				cancelable: true
			}));
		}

		class TranslationModal extends BdApi.React.Component {
			constructor(props) {
				super(props);
				this.state = { rankBefore: "", rankAfter: "", authorID: ""};
			}

			render() {
				const { msg, channel, selectedUserId} = this.props;
				const { rankBefore, rankAfter, authorID} = this.state;

				const options = departments.map(department => 
					BdApi.React.createElement("option", {
						key: department.keyAndValue,
						value: department.keyAndValue,
						style: {
							width: "100%",
						}
					}, department.name)
				);

				const authorIDSelect = renderSelect(getAuthorOption(msg,selectedUserId), e => { this.setState({ authorID: e.target.value }) })
				const rankAfterSelect = renderSelect(options, e => { this.setState({ rankAfter: e.target.value }) })
				const rankBeforeSelect = renderSelect(options, e => { this.setState({ rankBefore: e.target.value }) })

				return BdApi.React.createElement("div", {
					style: {
						padding: 10
					}
				}, [
					renderMessage(msg,channel),

					BdApi.React.createElement("div", {
						style: { 
							marginTop: 20, 
							display: "flex", 
							gap: 10,
							flexDirection: "column"
						}
					}, [
						BdApi.React.createElement("span",{},"Пользователь"),
						authorIDSelect,
						BdApi.React.createElement("span",{},"Отдел до"),
						rankBeforeSelect,
						BdApi.React.createElement("span",{},"Отдел после"),
						rankAfterSelect,
					]),

					renderButton(() => {
							if (!authorID.trim()) {
								BdApi.UI.showToast("Выберите пользователя!", { type: "warning" });
								return;
							}
							if (!rankAfter.trim() || !rankBefore.trim()) {
								BdApi.UI.showToast("Выберите отделы: до и после!", { type: "warning" });
								return;
							}

							let selfId = BdApi.Webpack.getModule(m => m.getCurrentUser).getCurrentUser().id;
							
							if (!getUserNick(selfId) || !getUserNick(authorID)) return;
							if (!getUserStatick(selfId) || ! getUserStatick(authorID)) return

							sendMessage(
								TARGET_CHANNEL_ID_KA,
								`1. <@${selfId}> ${getUserNick(selfId)} ${getUserStatick(selfId)}\n2. <@${authorID}> ${getUserNick(authorID)} ${getUserStatick(authorID)}\n3. Перевод\n4. с ${rankBefore} в ${rankAfter}\n5. ${createLink(channel,msg)}`,
								"Перевод отписано!"
							)
							closeMenu();
						}
					)
				]
				);
			}
		}

		class DismissalModal extends BdApi.React.Component {
			constructor(props) {
				super(props);
				this.state = { cause: "", rank: ""};
			}

			render() {
				const { msg, channel, selectedUserId} = this.props;
				const { cause, rank } = this.state;
				
				return BdApi.React.createElement("div", {
					style: {
						padding: 10
					}
				}, [
					renderMessage(msg,channel),

					BdApi.React.createElement("div", {
						style: { 
							marginTop: 20, 
							display: "flex", 
							gap: 10 
						}
					}, [
						renderInput("Ранг",e => { this.setState({ rank: e.target.value }) }),
						renderInput("Причина",e => { this.setState({ cause: e.target.value }) })
					]),

					renderButton(() => {
							if (!rank.trim() || !cause.trim()) {
								BdApi.UI.showToast("Заполните оба поля: ранг и причина!", { type: "warning" });
								return;
							}

							let selfId = BdApi.Webpack.getModule(m => m.getCurrentUser).getCurrentUser().id;
							
							if (!getUserNick(selfId) || !getUserNick(selectedUserId)) return;
							if (!getUserStatick(selfId) || ! getUserStatick(selectedUserId)) return

							sendMessage(
								TARGET_CHANNEL_ID_KA,
								`1. <@${selfId}> ${getUserNick(selfId)} ${getUserStatick(selfId)}\n2. <@${selectedUserId}> ${getUserNick(selectedUserId)} ${getUserStatick(selectedUserId)}\n3. Увольнение\n4. Ранг при увольнении - ${rank}\n5. Причина: ${cause} \n${createLink(channel,msg)}`,
								"Увольнение отписано!"
							)
							closeMenu();
						}
					)
				]
				);
			}
		}

		class UpModal extends BdApi.React.Component {
			constructor(props) {
				super(props);
				this.state = { rankBefore: "", rankAfter: "" };
			}

			render() {
				const { msg, channel, selectedUserId} = this.props;
				const { rankBefore, rankAfter } = this.state;
				
				const result = BdApi.React.createElement("div", {
					style: {
						padding: 10
					}
				}, [
					renderMessage(msg,channel),

					BdApi.React.createElement("div", {
						style: { 
							marginTop: 20, 
							display: "flex", 
							gap: 10 
						}
					}, [
						renderInput("Ранг до",e => { this.setState({ rankBefore: e.target.value }) }),
						renderInput("Ранг после",e => { this.setState({ rankAfter: e.target.value }) })
					]),
					renderButton(() => {
							if (!rankBefore.trim() || !rankAfter.trim()) {
								BdApi.UI.showToast("Заполните оба поля: ранг до и ранг после!", { type: "warning" });
								return;
							}

							let selfId = BdApi.Webpack.getModule(m => m.getCurrentUser).getCurrentUser().id;
							
							if (!getUserNick(selfId) || !getUserNick(selectedUserId)) return;
							if (!getUserStatick(selfId) || ! getUserStatick(selectedUserId)) return

							sendMessage(
								TARGET_CHANNEL_ID_KA,
								`1. <@${selfId}> ${getUserNick(selfId)} ${getUserStatick(selfId)}\n2. <@${selectedUserId}> ${getUserNick(selectedUserId)} ${getUserStatick(selectedUserId)}\n3. Повышение\n4. c ${rankBefore} на ${rankAfter}\n5. ${createLink(channel,msg)}`,
								"Повышение отписано!"
							)
							closeMenu();
						}
					)
				]
				);
				return result;
			}
		}

		return class MajesticRPRight extends Plugin {
			onLoad() {
				this.modulePatches = { after: ["UnreadDMs"] };
			}

			onStart() {
				checkForUpdate();

				BdApi.ContextMenu.patch("message", (menu, props) => {
					const { message , channel } = props;

					let propsChildren = menu.props.children.props.children
					buttons.forEach(buttonArray => {
						let button
						if (buttonArray.type === "separator") {
							button = BdApi.ContextMenu.buildItem( {type: "separator"});
						} else {
							if (propsChildren.some(e => e.props.id === buttonArray.id)) return;
							button = BdApi.ContextMenu.buildItem({ 
								type: "item", 
								id: buttonArray.id, 
								label: buttonArray.name,
								action: () => { buttonArray.action(message , channel) }
							});
						}
						propsChildren.push(button)
					})
				});
				
			}

			onStop() {
				BdApi.ContextMenu.unpatch("message");
			}
		};
	})(window.BDFDB_Global.PluginUtils.buildPlugin({}));
})();
