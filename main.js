// API Baileys
const { WAMessageProto, MessageOptions, WAFlag, WANode, WAMetric, ChatModification, DisconectReason, MessageTypeProto, WAConnection, WALocationMessage, ReconnectMode, WAContextInfo, proto, ProxyAgent, waChatKey, MimetypeMap, MediaPathMap, WAContactMessage, WAContactsArrayMessage, WAGroupInviteMessage, WATextMessage, WAMessageContent, WAMessage, BaileysError, WA_MESSAGE_STATUS_TYPE, MediaConnInfo, URL_REGEX, WAUrlInfo, WA_DEFAULT_EPHEMERAL, WAMediaUpload, mentionedJid, processTime, Browser, MessageType, Presence, WA_MESSAGE_STUB_TYPES, Mimetype, relayWAMessage, GroupconfigChange } = require('@adiwajshing/baileys')

// Módulos / Lib
const fs = require('fs')
const moment = require('moment-timezone')
const { send } = require('process')
const { consumers } = require('stream')
const ffmpeg = require('fluent-ffmpeg')
const axios = require("axios")
const { color, bgcolor } = require('./lib/color')
const { fetchJson } = require('./lib/fetcher')
const { mediafireDl } = require('./lib/mediafire')
const { wait, getBuffer, h2k, generateMessageID, getGroupAdmins, getRandom, start, info, success, close } = require('./lib/functions')

// MENSAGENS
const { plays } = require('./mensagens/plays')
const { criacao } = require('./mensagens/criacao')
const { outros } = require('./mensagens/outros')

// Configurações
const config = JSON.parse(fs.readFileSync('./configs/configs.json'))
prefix = config.prefix
emoji = config.emoji
verificado = config.verificado

// Adicionar Outras Funções

async function starts() {
  const conn = new WAConnection()
  conn.logger.level = 'warn'
  conn.on('qr', () => {
    console.log(color('[', 'white'), color('!', 'red'), color(']', 'white'), color('escaneie o código qr'))
  })

  fs.existsSync('./qrcode.json') && conn.loadAuthInfo('./qrcode.json')
  conn.on('connecting', () => {
    start('2', 'Conectando...')
  })
  conn.on('open', () => {
    success('2', 'Conectado com sucesso')
  })
  await conn.connect({ timeoutMs: 30 * 1000 })
  fs.writeFileSync('./qrcode.json', JSON.stringify(conn.base64EncodedAuthInfo(), null, '\t'))

  // Para adicionar bem-vindo entre outros

  conn.on('chat-update', async (msg) => {
    try {
      if (!msg.hasNewMessage) return
      msg = msg.messages.all()[0]
      if (!msg.message) return
      if (msg.key && msg.key.remoteJid == 'status@broadcast') return
      if (msg.key.fromMe) return
      const content = JSON.stringify(msg.message)
      const type = Object.keys(msg.message)[0]
      const jid = msg.key.remoteJid
      const { text, extendedText, contact, location, liveLocation, image, video, sticker, document, audio, product } = MessageType
      const time = moment.tz('America/Sao_Paulo').format('HH:mm:ss')
      const cmd = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : ''.slice(1).trim().split(/ +/).shift().toLowerCase()
      body = (type === 'conversation' && msg.message.conversation.startsWith(prefix)) ? msg.message.conversation : (type == 'imageMessage') && msg.message[type].caption.startsWith(prefix) ? msg.message[type].caption : (type == 'videoMessage') && msg.message[type].caption.startsWith(prefix) ? msg.message[type].caption : (type == 'extendedTextMessage') && msg.message[type].text.startsWith(prefix) ? msg.message[type].text : (type == 'listResponseMessage') && msg.message[type].singleSelectReply.selectedRowId ? msg.message[type].singleSelectReply.selectedRowId : (type == 'buttonsResponseMessage') && msg.message[type].selectedButtonId ? msg.message[type].selectedButtonId : ''
      budy = (type === 'conversation') ? msg.message.conversation : (type === 'extendedTextMessage') ? msg.message.extendedTextMessage.text : ''
      const isCmd = body.startsWith(prefix)
      global.prefix

      // COM PREFIX       
      const comando = body.slice(1).trim().split(/ +/).shift().toLowerCase()

      // SEM PREFIX
      const semPrefix = budy.slice(0).trim().split(/ +/).shift().toLowerCase()

      const botNumber = conn.user.jid
      const isGroup = jid.endsWith('@g.us')
      const sender = isGroup ? msg.participant : msg.key.remoteJid
      const ownerNumber = [`${config.dono}@s.whatsapp.net`]
      const isOwner = ownerNumber.includes(sender)
      const groupMetadata = isGroup ? await conn.groupMetadata(jid) : ''
      const groupName = isGroup ? groupMetadata.subject : ''
      const groupId = isGroup ? groupMetadata.jid : ''
      const groupMembers = isGroup ? groupMetadata.participants : ''
      const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : ''
      const isBotGroupAdmins = groupAdmins.includes(botNumber) || false
      const isGroupAdmins = groupAdmins.includes(sender) || false
      const args = body.trim().split(/ +/).slice(1)
      const q = args.join(" ")
      const conts = msg.key.fromMe ? conn.user.jid : conn.contacts[sender] || { notify: jid.replace(/@.+/, '') }
      var pes = (type === 'conversation' && msg.message.conversation) ? msg.message.conversation : (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : (type == 'extendedTextMessage') && msg.message.extendedTextMessage.text ? msg.message.extendedTextMessage.text : ''
      const messagesC = pes.slice(0).trim().split(/ +/).shift().toLowerCase()
      const pushname = msg.key.fromMe ? conn.user.name : conts.notify || conts.vname || conts.name || '-'

      // Enviar Mensagem
      const isUrl = (url) => {
        return url.match(new RegExp(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)/, 'gi'))
      }
      const enviarAqUrl = async (link, type, options) => {
        resultados = await getBuffer(link)
        conn.sendMessage(jid, resultados, type, options).catch(e => {
          fetch(link).then((resultados) => {
            conn.sendMessage(jid, resultados, type, options).catch(e => {
              conn.sendMessage(jid, { url: link }, type, options).catch(e => {
                enviar('erro')
              })
            })
          })
        })
      }
      const enviar = (texto) => {
        conn.sendMessage(jid, texto, text, { quoted: msg })
      }

      const enviarButTexto = (contentText, footer, options = {}) => {
        var buttons = {
          contentText: contentText,
          footerText: footer,
          buttons: [],
          contextInfo: {
            forwardingScore: 200,
            isForwarded: true
          },
          headerType: 1
        }
        conn.sendMessage(jid, buttons, MessageType.buttonsMessage, options)
      }

      const enviarButMsg = (id, texto1, desc1, but = [], options = {}) => {
        const buttonMessage = {
          contentText: texto1,
          footerText: desc1,
          buttons: but,
          headerType: 1,
        };
        conn.sendMessage(id, buttonMessage, MessageType.buttonsMessage, options)
      }

      const enviarButImg = async (jid, texto, desc, img, but, msg) => {
        jadinya = await conn.prepareMessage(jid, img, image)
        botao = {
          imageMessage: jadinya.message.imageMessage,
          contentText: texto,
          footerText: desc,
          buttons: but,
          headerType: 4
        }
        conn.sendMessage(jid, botao, MessageType.buttonsMessage, {
          quoted: msg,
        })
      }

      // Tipos de midias
      colors = ['red', 'white', 'black', 'blue', 'yellow', 'green']
      const isMedia = (type === 'imageMessage' || type === 'videoMessage')
      const isQuotedImage = type === 'extendedTextMessage' && content.includes('imageMessage')
      const isQuotedVideo = type === 'extendedTextMessage' && content.includes('videoMessage')
      const isQuotedSticker = type === 'extendedTextMessage' && content.includes('stickerMessage')

      // Comandos
      if (!isGroup && isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mCMD\x1b[1;37m]', time, color(comando), 'de', color(pushname), color(sender.split('@')[0]), 'args :', color(args.length))
      if (isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;32mCMD\x1b[1;37m]', time, color(comando), 'de', color(pushname), color(sender.split('@')[0]), 'grupo', color(groupName), 'args :', color(args.length))
      // Mensagens
      if (!isGroup && !isCmd) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color('Mensagem'), 'de', color(pushname), color(sender.split('@')[0]), 'args :', color(args.length))
      if (!isCmd && isGroup) console.log('\x1b[1;31m~\x1b[1;37m>', '[\x1b[1;31mMSG\x1b[1;37m]', time, color('Mensagem'), 'de', color(pushname), color(sender.split('@')[0]), 'grupo', color(groupName), 'args :', color(args.length))

      // AUTO RESPOSTA
      if (pes.includes("559884746638")) {
        fds = fs.readFileSync('./videos/fds.mp4')
        conn.sendMessage(jid, fds, video, { caption: null, quoted: msg })
      }
      if (pes.includes("5511931762063")) {
        fds = fs.readFileSync('./videos/fds.mp4')
        conn.sendMessage(jid, fds, video, { caption: null, quoted: msg })
      }
      if (pes.includes("roubei")) {
        corre = fs.readFileSync('./figurinhas/corre.webp')
        conn.sendMessage(jid, corre, sticker, { quoted: msg })
      }
      if (pes.includes("Roubei")) {
        corre = fs.readFileSync('./figurinhas/corre.webp')
        conn.sendMessage(jid, corre, sticker, { quoted: msg })
      }

      // CASE SEM PREFIX
      switch (semPrefix) {

      }

      // CASE COM PREFIX
      switch (comando) {
        // TODOS OS MENU
        case 'menu':
          conn.updatePresence(jid, Presence.recording)
          voz = fs.readFileSync('mensagens/audios/menu.mp3')
          await conn.sendMessage(jid, voz, MessageType.audio, { quoted: msg, mimetype: 'audio/mp4', ptt: true })

          listMsg = {
            buttonText: '𝙴𝚜𝚌𝚘𝚕𝚑𝚊 𝚊𝚚𝚞𝚒',
            footerText: `Menu ID: ${Math.floor(Date.now() * Math.random()).toString(36)}`,
            description: '𝙴𝚜𝚌𝚘𝚕𝚑𝚊 𝚞𝚖 𝚖𝚎𝚗𝚞 𝚗𝚎𝚜𝚝𝚊 𝚕𝚒𝚜𝚝𝚊.',
            sections: [
              {
                "title": `𝚃𝙾𝙳𝙾𝚂 𝙾𝚂 𝙼𝙴𝙽𝚄`,
                rows: [
                  {
                    "title": "𝙼𝙴𝙽𝚄 𝙿𝙻𝙰𝚈𝚂",
                    "rowId": `${prefix}plays`
                  },
                  {
                    "title": "𝙲𝚁𝙸𝙰𝙲𝙾𝙴𝚂",
                    "rowId": `${prefix}criacao`
                  },
                  {
                    "title": "𝙾𝚄𝚃𝚁𝙾𝚂",
                    "rowId": `${prefix}outros`
                  },
                  {
                    "title": "𝙴𝙼 - 𝙱𝚁𝙴𝚅𝙴",
                    "rowId": `${prefix}embreve`
                  }
                ]
              }
            ],
            listType: 1
          }
          conn.sendMessage(jid, listMsg, MessageType.listMessage, { contextInfo: { mentionedJid: [sender] }, quoted: msg })
          break
        // RESPOSTA MENU LISTA
        case 'plays':
          enviar(plays(prefix, emoji))
          break
        case 'criacao':
          enviar(criacao(prefix, emoji))
          break
        case 'outros':
          enviar(outros(prefix, emoji))
          break

        // TODOS OS COMANDOS
        //========== PLAYS ==========//
        case 'play':
          play = `${body.slice(6)}`
          api = await fetchJson(`https://yuzzu-api.herokuapp.com/api/yts?judul=${play}`)
          // RESULTADO 01
          const titulo = `${api.result[0].title}`
          const duracao = `${api.result[0].duration}`
          const link = `${api.result[0].url}`
          // RESULTADO 02
          const titulo2 = `${api.result[1].title}`
          const duracao2 = `${api.result[1].duration}`
          const link2 = `${api.result[1].url}`
          // RESULTADO 03
          const titulo3 = `${api.result[2].title}`
          const duracao3 = `${api.result[2].duration}`
          const link3 = `${api.result[2].url}`
          // RESULTADO 04
          const titulo4 = `${api.result[3].title}`
          const duracao4 = `${api.result[3].duration}`
          const link4 = `${api.result[3].url}`
          // RESULTADO 05
          const titulo5 = `${api.result[4].title}`
          const duracao5 = `${api.result[4].duration}`
          const link5 = `${api.result[4].url}`
          // RESULTADO 06
          const titulo6 = `${api.result[5].title}`
          const duracao6 = `${api.result[5].duration}`
          const link6 = `${api.result[5].url}`

          listMsg = {
            buttonText: '𝙴𝚜𝚌𝚘𝚕𝚑𝚊 𝚊𝚚𝚞𝚒',
            footerText: '𝚂𝚞𝚊 𝚖𝚞𝚜𝚒𝚌𝚊 𝚏𝚘𝚒 𝚎𝚗𝚌𝚘𝚗𝚝𝚛𝚊𝚍𝚊 𝚌𝚘𝚖 𝚜𝚞𝚌𝚎𝚜𝚜𝚘.',
            description: ' ',
            sections: [
              {
                "title": `𝚁𝙴𝚂𝚄𝙻𝚃𝙰𝙳𝙾𝚂`,
                rows: [
                  {
                    "title": `${titulo}`,
                    "description": `Duração: ${duracao}`,
                    "rowId": `${prefix}ytmp3 ${link}`
                  },
                  {
                    "title": `${titulo2}`,
                    "description": `Duração: ${duracao2}`,
                    "rowId": `${prefix}ytmp3 ${link2}`
                  },
                  {
                    "title": `${titulo3}`,
                    "description": `Duração: ${duracao3}`,
                    "rowId": `${prefix}ytmp3 ${link3}`
                  },
                  {
                    "title": `${titulo4}`,
                    "description": `Duração: ${duracao4}`,
                    "rowId": `${prefix}ytmp3 ${link4}`
                  },
                  {
                    "title": `${titulo5}`,
                    "description": `Duração: ${duracao5}`,
                    "rowId": `${prefix}ytmp3 ${link5}`
                  },
                  {
                    "title": `${titulo6}`,
                    "description": `Duração: ${duracao6}`,
                    "rowId": `${prefix}ytmp3 ${link6}`
                  }
                ]
              }
            ],
            listType: 1
          }
          conn.sendMessage(jid, listMsg, MessageType.listMessage, { contextInfo: { mentionedJid: [sender] }, quoted: msg })
          break
        case 'ytmp4':
          ytmp4 = `${body.slice(7)}`
          api = await fetchJson(`https://thiago-api.herokuapp.com/docs/download/ytmp4?&link=${ytmp4}`)
          if (api.message) return enviar(api.message)
          enviar('Aguarde, estou enviando o seu video')
          vd = await getBuffer(api.resultado.link)
          conn.sendMessage(jid, vd, video, { mimetype: 'video/mp4', quoted: msg, caption: null })
          break
        case 'ytmp3':
          ytmp3 = `${body.slice(7)}`
          api = await fetchJson(`https://hardianto.xyz/api/yt/playmp3?query=${ytmp3}&apikey=hardianto`)
          if (api.message) return enviar(api.message)
          infomp3 = `Aguarde, estou enviando sua música`
          conn.sendMessage(jid, infomp3, text, { quoted: msg })
          msc = await getBuffer(api.url)
          conn.sendMessage(jid, msc, audio, { mimetype: 'audio/mp4', quoted: msg, filename: 'musica.mp3', ptt: false })
          break
        //========== PLAYS FIM ==========//

        //========== CRIAÇÕES ==========//
        case 'attp':
          attp = `${body.slice(6)}`
          api = encodeURI(`https://hardianto.xyz/api/maker/attp?text=${attp}&apikey=hardianto`)
          img = await getBuffer(api)
          conn.sendMessage(jid, img, sticker, { quoted: msg })
          break
        case 'logololi':
          loli = `${body.slice(10)}`
          api = encodeURI(`https://hardianto.xyz/api/bot/gfx2?apikey=hardianto&nama=${loli}`)
          img = await getBuffer(api)
          conn.sendMessage(jid, img, image, { caption: null, thumbnail: null, quoted: msg })
          break
        case 'f': case 'figu': case 'sticker': case 'stiker':
          if ((isMedia && !msg.message.videoMessage || isQuotedImage) && args.length == 0) {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
            const media = await conn.downloadAndSaveMediaMessage(encmedia)
            ran = getRandom('.webp')
            ffmpeg(`./${media}`)
              .input(media)
              .on('start', function (cmd) {
                console.log(`Started : ${cmd}`)
              })
              .on('error', function (err) {
                console.log(`Error : ${err}`)
                fs.unlinkSync(media)
                enviar('Tente novamente')
              })
              .on('end', function () {
                console.log('Finish')
                conn.sendMessage(jid, fs.readFileSync(ran), sticker, { quoted: msg })
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              })
              .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
              .toFormat('webp')
              .save(ran)
          } else if ((isMedia && msg.message.videoMessage.seconds < 11 || isQuotedVideo && msg.message.extendedTextMessage.contextInfo.quotedMessage.videoMessage.seconds < 11) && args.length == 0) {
            const encmedia = isQuotedVideo ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
            const media = await conn.downloadAndSaveMediaMessage(encmedia)
            ran = getRandom('.webp')
            enviar('Aguarde...')
            ffmpeg(`./${media}`)
              .inputFormat(media.split('.')[1])
              .on('start', function (cmd) {
                console.log(`Started : ${cmd}`)
              })
              .on('error', function (err) {
                console.log(`Error : ${err}`)
                fs.unlinkSync(media)
                tipe = media.endsWith('.mp4') ? 'video' : 'gif'
                enviar(`Falhou no momento da conversão`)
              })
              .on('end', function () {
                console.log('Finish')
                conn.sendMessage(jid, fs.readFileSync(ran), sticker, { quoted: msg })
                fs.unlinkSync(media)
                fs.unlinkSync(ran)
              })
              .addOutputOptions([`-vcodec`, `libwebp`, `-vf`, `scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15, pad=320:320:-1:-1:color=white@0.0, split [a][b]; [a] palettegen=reserve_transparent=on:transparency_color=ffffff [p]; [b][p] paletteuse`])
              .toFormat('webp')
              .save(ran)
          } else if ((isMedia || isQuotedImage) && args[0] == 'nobg') {
            const encmedia = isQuotedImage ? JSON.parse(JSON.stringify(msg).replace('quotedM', 'm')).message.extendedTextMessage.contextInfo : msg
            const media = await conn.downloadAndSaveMediaMessage(encmedia)
            ranw = getRandom('.webp')
            ranp = getRandom('.png')
            enviar('Aguarde...')
            keyrmbg = 'Your-ApiKey'
            await removeBackgroundFromImageFile({ path: media, apiKey: keyrmbg.result, size: 'auto', type: 'auto', ranp }).then(res => {
              fs.unlinkSync(media)
              let buffer = Buffer.jid(res.base64img, 'base64')
              fs.writeFileSync(ranp, buffer, (err) => {
                if (err) return enviar('Tente novamente')
              })
              exec(`ffmpeg -i ${ranp} -vcodec libwebp -filter:v fps=fps=20 -lossless 1 -loop 0 -preset default -an -vsync 0 -s 512:512 ${ranw}`, (err) => {
                fs.unlinkSync(ranp)
                if (err) return enviar('Tente novamente')
                conn.sendMessage(jid, fs.readFileSync(ranw), sticker, { quoted: msg })
              })
            })
          } else {
            enviar(`Envie imagem/video com a legenda: ${prefix}f. Ou marque uma imagem/video, que já foi enviada`)
          }
          break
        //========== CRIAÇÕES FIM ==========//

        //========== OUTROS ==========//
        case 'meme':
          api = encodeURI(`https://bot-apis.herokuapp.com/apis/meme?APIKEY=fillipe`)
          img = getBuffer(api)
          but = [
            { buttonId: `${prefix}meme`, buttonText: { displayText: 'próximo/>' }, type: 1 }
          ]
          enviarButImg(jid, 'mama', `mama`, img, but)
          break
        case 'download':
          if (!isUrl(args[0]) && !args[0].includes('mediafire')) return enviar('erro')
          enviar('Aguarde...')
          texto = args.join(' ')
          resposta = await mediafireDl(texto)
          resultado = `Nome : ${resposta[0].nama}\nTamanho : ${resposta[0].size}`
          enviarButTexto(resultado, 'Aguarde, estou enviando o seu arquivo...')
          enviarAqUrl(resposta[0].link, document, { mimetype: resposta[0].mime, filename: resposta[0].nama, quoted: msg })
          break
        //========== OUTROS FIM ==========//

        //========== DONO ==========//
        case 'del':
          if (!isOwner) return enviar('Recurso so pro dono')
          try {
            conn.deleteMessage(jid, {
              id: msg.message.extendedTextMessage.contextInfo.stanzaId, remoteJid: jid, fromMe: true
            })
          } catch { }
          break
        case 'exe':
          if (isOwner) return enviar('Recurso so pro dono');
          try {
            eval(`(async () => {
            try {
            ${body.slice(5)};
            } catch(err) {
            conn.sendMessage(jid, String(err), MessageType.text);
            }
            })();`);
          } catch (err) {
            conn.sendMessage(jid, String(err), MessageType.text);
          }
          break
        //========== DONO FIM ==========//

        case 'bot':
          bot = `${body.slice(5)}`
          api = await fetchJson(`https://api.simsimi.net/v2/?text=${bot}&lc=pt`)
          enviarButTexto(`${api.success}`, 'BOT')
          break

        case 'mek':
          conn.sendMessage(jid, JSON.stringify(msg, null, '\t'), MessageType.text);
          break

        case 'embreve':
          figukk = fs.readFileSync('./figurinhas/embreve.webp')
          conn.sendMessage(jid, figukk, sticker, { quoted: msg })
          break
        default:
      }
    } catch (err) {
      e = String(err)
      if (!e.includes("this.isZero" || !e.match("jid is not defined"))) {
        const time_error = moment.tz('America/Sao_Paulo').format('HH:mm:ss')
        console.log(color(time_error, "yellow"), color("[ ERRO ]", "aqua"), color(e, 'red'))
      }
    }
  })
}
starts()