const discord = require('discord.js')
const client = new discord.Client()
const fetch = require('node-fetch');
const express = require('express');
const { clientID, clientSecret, port } = require('./config.json');
const {XMLHttpRequest} = require('xmlhttprequest')
const app = express();
const prefix = '!'



client.login('ODI4NTgxNzEzOTMyMTg5NzA2.YGrq2g.xspfOIxXOAfnvAP9uzWNlcZuskQ')


app.get('/', async ({ query }, response) => {
    const { code } = query;

    if (code) {
        try {
            const oauthResult = await fetch('https://discord.com/api/oauth2/token', {
                method: 'POST',
                body: new URLSearchParams({
                    client_id: clientID,
                    client_secret: clientSecret,
                    code,
                    grant_type: 'authorization_code',
                    redirect_uri: `http://localhost:${port}`,
                    scope: 'identify guilds.join',
                }),
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const oauthData = await oauthResult.json();

            const userResult = await fetch('https://discord.com/api/users/@me', {
                headers: {
                    authorization: `${oauthData.token_type} ${oauthData.access_token}`,
                },
            });


            let result = await userResult.json()
            console.log(result);
            console.log(result.id)
                return response.sendFile('./public/command.html', { root: '.' });
        } catch (error) {
            // NOTE: An unauthorized token will not throw an error;
            // it will return a 401 Unauthorized response in the try block above
            console.error(error);
        }
    }else{
        return response.sendFile('./public/index.html', { root: '.' });
    }

});

app.get('/command', async ({ query }, response) => {
    response.sendFile('./public/command.html')
})
app.use(express.static(__dirname + '/public'));
app.listen(port, () => console.log(`App listening at http://localhost:${port}`));

const activities_list = [
    `Mp pour de l'aide `,
  ];
client.on("ready", () => {
    setInterval(() => {
      
      client.user.setActivity(`Mp pour de l'aide `, {
        status: "dnd",
        type: "WATCHING",
      });
    }, 2000);
    console.log(
      `${client.user.username} connecté ${client.users.cache.size} utilisateurs !`
    );

  });

client.on("channelDelete", async(channel) => {
    if(channel.parentID == channel.guild.channels.cache.find((x) => x.name == "📧» MAIL").id) {
        const person = channel.guild.members.cache.find((x) => x.id == channel.name)

        if(!person) return;

        let yembed = new discord.MessageEmbed()
        .setAuthor("Ticket supprimé", client.user.displayAvatarURL())
        .setColor('RED')
        .setDescription(`:alarm_clock: Votre demande a été fermée par les responsables de votre ticket.\n** Au revoir !**`)
        
        return person.send(yembed)
    
    }


})

client.on("message", async message => {
    if(message.author.bot) return;
  
    let args = message.content.slice(prefix.length).split(' ');
    let command = args.shift().toLowerCase();
  
  
    if(message.guild) {
        if(command == "setup") {
            if(!message.member.hasPermission("ADMINISTRATOR")) {
                return message.channel.send("Vous devez avoir les permissions ``ADMINISTRATOR`` pour faire cette commande.")
            }
  
            let mod1 = message.guild.roles.cache.find((x) => x.id == "856913423502016542")
            let everyone = message.guild.roles.cache.find((x) => x.name == "@everyone")
  
            await message.guild.channels.create("📧» MAIL", {
                type: "category",
                topic: "All the mail will be here :D",
                permissionOverwrites: [
                    {
                        id: mod1.id,
                        allow: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    },
                    {
                        id: everyone.id,
                        deny: ["VIEW_CHANNEL", "SEND_MESSAGES", "READ_MESSAGE_HISTORY"]
                    }
                ]
            })
  
  
            return message.channel.send("Le setup est fini !")
  
        } else if(command == "close") {
  
  
          if(message.channel.parentID == message.guild.channels.cache.find((x) => x.name == "📧» MAIL").id) {
              
              const person = message.guild.members.cache.get(message.channel.name)
  
              if(!person) {
                  return message.channel.send("Je ne peux pas fermer le ticket car le nom à probablement été changé.")
              }
  
              message.channel.delete()
              return;
  
          }
        } 
        else if(command == "deliver") {
            let u = client.users.cache.get(message.channel.name)
            if(!u){
                return message.channel.send( new discord.MessageEmbed()
                .setTitle(`ERREUR !`)
                .setColor('RED')
                .setDescription('Vous devez taper la commande dans le ticket du client !'))
            }
            if(!args[0]){return message.channel.send( new discord.MessageEmbed()
                .setTitle(`ERREUR !`)
                .setColor('RED')
                .setDescription('Vous devez indiquer le prix de la commande ! Exemple : `!deliver 30€ <lien code source>`'))}
                if(!args[1]){return message.channel.send( new discord.MessageEmbed()
                    .setTitle(`ERREUR !`)
                    .setColor('RED')
                    .setDescription('Vous devez indiquer le lien du code source de la commande ! Exemple : `!deliver 30€ <lien code source>`'))}
                    
            u.send(new discord.MessageEmbed()
            .setAuthor(`Votre commande touche à sa fin !`, u.displayAvatarURL())
            .setDescription(`**Pour des raisons de sécurité, nous demandons que vous payez la somme demandé, soit ${args[0]}. [Voici le lien paypal de règlement](https://paypal.me/pools/c/8yZWPlXZYC) et votre commande sera livrée après verification. \n\nMerci de votre fidélité !**`) 
            .setThumbnail(`https://cdn.discordapp.com/attachments/626432578509078529/856919651605938211/paypal.png`)
            .setColor('GREEN')
            )
            let msgverif = await message.channel.send(
                new discord.MessageEmbed()
                .setTitle(`Attente de payement de ${u.tag}`)
                .setDescription(`**Veuillez réagir à ce message quand vous avez reçu l'argent**`)
                )
            await msgverif.react('👍')    
            await msgverif.awaitReactions((reaction, user) => user.id == message.author.id && (reaction.emoji.name == '👍'),
            { max: 1, time: 30000000 }).then(collected => {
                    if (collected.first().emoji.name == '👍') {
                            message.channel.send(
                                new discord.MessageEmbed()
                                .setColor('GREEN')
                                .setTitle('Commande TERMINEE !!!!')
                                .setDescription(`Les ${args[0]} ont bien étés crédités !`)
                                
                            )
                            u.send(
                                new discord.MessageEmbed()
                                .setColor('GREEN')
                                .setTitle('Merci pour tout !')
                                .setDescription(`**Votre projet va être hebergé dans l'heure (si vous avez payé l'option hebergement) et [voici le code source de votre bot/site](https://github.com/https-cyke-xyz/test)**`)
                                .setThumbnail('https://cdn.discordapp.com/attachments/843085796713824266/856947872083476490/cyke-logo.png')
                                )
                    }
                })
        }
    }
    
    
    if(message.channel.parentID) {
  
      const category = message.guild.channels.cache.find((x) => x.name == "📧» MAIL")
      
      if(message.channel.parentID == category.id) {
          if(!message.content.startsWith('!r ')) return;
          let member = message.guild.members.cache.get(message.channel.name)
      
          if(!member) return message.channel.send('Je ne peux pas envoyer de message à cette personne car je ne la trouve pas. Avez vous changé le nom du salon ? Si oui, merci de remettre l\'identifiant de l\'utilisateur à qui appartient le ticket en nom pour que je puisse lui envoyé un message.')
      
          member.send(`\`📬\` Reçu de \`\`${message.author.username}\`\`: ${message.content.slice(3)}`)
          message.delete()
          message.channel.send(`\`📮\` Message envoyé à <@${member.id}> par \`${message.author.username}\`: ${message.content.slice(3)}`)
      }
      
      
        } 
    
        if(!message.guild) {
            const guild = await client.guilds.cache.get("849932256373506050");
            if(!guild) return;
      
            const main = guild.channels.cache.find((x) => x.name == message.author.id)
            const category = guild.channels.cache.find((x) => x.name == "📧» MAIL")
      
      
            if(!main) {
                if(message.content.startsWith(prefix + 'chat')){

                
                let mx = await guild.channels.create(message.author.id, {
                    type: "text",
                    parent: category.id,
                    topic: "📧» MODMAIL de: **" + message.author.tag + "**\nRaison: " + message.content
                })
      
                let sembed = new discord.MessageEmbed()
                .setAuthor("Ticket ouvert")
                .setColor("GREEN")
                .setThumbnail(`https://cdn.discordapp.com/attachments/828583212874727454/856907546190020618/check.png`)
                .setDescription("Vôtre conversation avec le staff vient de débuter.\n\n__Comment ça va se passer ?__\n> Lorsqu'un membre du staff souhaitera vous répondre, je vous enverrais un message contenant son message. Pour lui répondre, vous avez juste à m'envoyer un message.\n\n**RAPPEL:** Tout spam, ou abus de ticket est sanctionnable !")
      
                message.author.send(sembed)
      
      
                let eembed = new discord.MessageEmbed()
                .setAuthor("DETAILS", message.author.displayAvatarURL({dynamic: true}))
                .setColor("GREEN")
                .setThumbnail(message.author.displayAvatarURL({dynamic: true}))
                .setDescription(`\n__Auteur__: ${message.author}\n__Sujet__: ${message.content}\n__Date de création du compte__: ${message.author.createdAt}\n\nPersonne d'autre que vous, les staffs, n'a accès à ce salon. Vous pouvez y parler comme vous voulez, et pour répondre, faites: \`!r <message>\``)
      
      
                mx.send(eembed)
                let msg = await mx.send('@here').then(
                  setTimeout(() => {
                    msg.delete()
                  }, 1000)
                )
                return;
                
            }else{return}
            }
            message.react('📨')
            main.send(`\`📬\` Reçu de <@${message.author.id}>: ${message.content}`)
        } 
       
      })

client.on('guildMemberAdd', async (member)=> {
    
        let u = client.users.cache.get(member.id)
        if(!u){console.log('utilisateur introuvable !')}

            u.send(new discord.MessageEmbed()
            .setAuthor(`Compte crée !`, u.displayAvatarURL())
            .setDescription(`> ID: ${u.id} \n> Nom: ${u.username}\n\n Fait !chat dans mon mp pour commencer une discution avec le staff de l'entreprise ! [serveur discord](https://discord.gg/QAHKNh3Ayu)`)
            .setThumbnail(`https://cdn.discordapp.com/attachments/828583212874727454/856907546190020618/check.png`))
        
return
})

 
