var Botkit = require('botkit');
var os = require('os');
var request = require('request');
var config = require('./config.json');

var controller = Botkit.slackbot();

controller.hears(['zalgo'], config.channels.all, (bot, message) => {
    bot.reply(message, 'G̦̜̝̦͍͝r͗͢rͦ̐ͫͥ͆̌̈́͏͍̳͚̣͍!̴̣ͭͭͪ');
});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'], config.channels.direct, (bot, message) => {
    var uptime = process.uptime();
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }
    uptime = uptime + ' ' + unit;
    
    bot.reply(message, ':bear: Grr! (I am a bear named <@' + bot.identity.name + '>. I have been running for ' + uptime + ' on ' + os.hostname() + '.)');
});

controller.hears(['what is my name', 'who am i'], config.channels.direct, (bot, message) => {
    controller.storage.users.get(message.user, (err, user) => {
        if (user && user.name) {
            bot.reply(message, 'Grr! (Your name is ' + user.name + '!)');
        } else {
            bot.startConversation(message, (err, convo) => {
                if (!err) {
                    convo.say('Grr! (I do not know your name yet.)');
                    convo.ask('Grr? (What should I call you?)', (response, convo) => {
                        convo.ask('Grr? (You want me to call you `' + response.text + '`?)', [
                            {
                                pattern: 'yes',
                                callback: function (response, convo) {
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function (response, convo) {
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function (response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();
                    }, { 'key': 'nickname' });

                    convo.on('end', (convo) => {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'Grr! (Ok! I will update my dossier...)');

                            controller.storage.users.get(message.user, function (err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function (err, id) {
                                    bot.reply(message, 'Grr! (Got it. I will call you ' + user.name + ' from now on.)');
                                });
                            });
                        } else {
                            bot.reply(message, 'Grr! (Ok, nevermind!)');
                        }
                    });
                }
            });
        }
    });
});

controller.hears(['change my name'], config.channels.direct, (bot, message) => {
    controller.storage.users.get(message.user, (err, user) => {
        if (user && user.name) {
            bot.startConversation(message, (err, convo) => {
                if (!err) {
                    convo.ask('Grr! (What would you like me to call you now?)', (response, convo) => {
                        convo.ask('Grr? (You want me to call you `' + response.text + '`?)', [
                            {
                                pattern: 'yes',
                                callback: function (response, convo) {
                                    convo.next();
                                }
                            },
                            {
                                pattern: 'no',
                                callback: function (response, convo) {
                                    convo.stop();
                                }
                            },
                            {
                                default: true,
                                callback: function (response, convo) {
                                    convo.repeat();
                                    convo.next();
                                }
                            }
                        ]);

                        convo.next();
                    }, { 'key': 'nickname' });

                    convo.on('end', (convo) => {
                        if (convo.status == 'completed') {
                            bot.reply(message, 'Grr! (Ok! I will update my dossier...)');

                            controller.storage.users.get(message.user, function (err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('nickname');
                                controller.storage.users.save(user, function (err, id) {
                                    bot.reply(message, 'Grr! (Got it. I will call you ' + user.name + ' from now on.)');
                                });
                            });
                        } else {
                            bot.reply(message, 'Grr! (Ok, nevermind!)');
                        }
                    });
                }
            });
        } else {
            bot.reply('message', 'Grr! (I do not know your name!');
        }
    });
});

controller.hears([''], config.channels.direct, (bot, message) => {
    var say = message.text;
    say = message.text.split('/').join('');
    say = say.split(' ').join('%20');

    request.get('http://api.program-o.com/v2/chatbot/?bot_id=' + config.bots.programO + '&say=' + say + '&convo_id=1&format=json', (error, response, body) => {
        body = JSON.parse(body);

        bot.reply(message, 'Grr! (' + body.botsay + ')');
    });
});

var bot = controller.spawn({
    token: require('./config.json').token
});

bot.startRTM((err, bot, payload) => {
    if (err) {
        console.log(err);
    }
});