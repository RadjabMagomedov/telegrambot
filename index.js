require("dotenv").config()
const { Telegraf } = require('telegraf')
const mongoose = require("mongoose")
const users = require("./model/user")
const card = require("./model/card")
let num = 0

const bot = new Telegraf(process.env.BOT_TOKEN)
bot.start( async (ctx) => {

    await mongoose.connect(process.env.DB_URL)
    users.findOne({ telegramid: ctx.message.from.id} )
    .exec()
    .then(doc => {
        if (doc){
            ctx.reply(`Приветствую вас снова ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец'}!` ,{
                reply_markup: {
                    inline_keyboard: [
                        [ { text: 'играть', callback_data: "game" } , { text: 'профиль', callback_data: "profile" } ]
                    ]
                }
            })
         
        } else {
            ctx.reply(`Привет ${ctx.message.from.first_name ? ctx.message.from.first_name : 'незнакомец'}!` )
            const user = new users({
                telegramid: ctx.message.from.id,
                username: ctx.message.from.first_name
            });
            user
              .save()
        }
    })
    .catch()
})
bot.action('correct', async (ctx) => {
    if (num == 9){
        await ctx.reply('Вы победили!');
    } else {
        await bot.telegram.deleteMessage(ctx.chat.id, ctx.msgId) 
        const emoji = [ '🤩', '🤓', '🥳', '🤩', '🦁', '👍', '👌', '🐯', '🦅', '🥇'];
        var rand = Math.floor(Math.random() * emoji.length);  
        await ctx.reply('Вы ответили привильно!');
        await ctx.reply(emoji[rand]);
        num++
       const chatId = ctx.chat.id;
       game(bot, chatId)
    }
});
bot.action('incorrect', (ctx) => {
    bot.telegram.deleteMessage(ctx.chat.id, ctx.msgId)
    const emoji = [ '😢', '😔', '😫', '😭', '🫣', '👎', '🤬', '😑', '🤧', '🥉'];
    var rand = Math.floor(Math.random() * emoji.length);   
    ctx.reply('К сожелению вы ответили неверно');
    ctx.reply(emoji[rand]);
    num=0
});
bot.action('game', (ctx) => {
    game(bot, ctx.chat.id)
});
bot.action('profile', (ctx) => {
    ctx.reply("Профиль");
   
});

function game (bot, chatId)  {
    card.find({number:num})
     .exec()
     .then(doc => {
            doc.forEach((data) => {
                let arr = [    [ { text: data.correct, callback_data: "correct" } ],[{ text: data.incorrect,callback_data: "incorrect" } ],
                [{ text: data.incorrect1,callback_data: "incorrect" } ],[{ text: data.incorrect2,callback_data: "incorrect" }],]
                shuffle(arr)
                bot.telegram.sendMessage(chatId,data.question, {
                    reply_markup: {
                         
                        inline_keyboard: arr
                      
                    },
    
                })
            });

     })
     .catch()
}



function shuffle(array) {
    let currentIndex = array.length;
 
    while (currentIndex != 0) {
  
      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
  
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
}
 

bot.on("message", (ctx) => {
    const chatId = ctx.chat.id;

    if (ctx.message.text == "играть"){
       game(bot, chatId)
    }else{
        bot.telegram.sendMessage(chatId,"Может лучше поиграем?",{
            reply_markup: {
                inline_keyboard: [
                    [ { text: 'играть', callback_data: "game" } ]
                ]
            }
        })
    }
})

bot.launch()

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))