import "dotenv/config";

import {Client, Intents} from "discord.js";
import {chatCommandsMap, messageCommandsMap, userCommandsMap,} from "./commands";
import {prisma} from "./services/prisma";
import {redis} from "./services/redis";
import {isDev} from "./constants";
import {handleInteraction} from "./services/events/interaction";
import signale from "signale";

const myIntents = new Intents();
// myIntents.add(Intents.FLAGS.GUILD_PRESENCES);
// myIntents.add(Intents.FLAGS.GUILD_MESSAGES);
// myIntents.add(Intents.FLAGS.GUILDS);

const client = new Client({
    intents: myIntents,
    allowedMentions: {parse: ["users", "roles"], repliedUser: false},
});

client.on("ready", async () => {
    signale.info("Environment:", isDev ? "dev" : "prod");
    signale.success("Ready as", client.user?.tag);

    await client.user?.setPresence({
        status: "online",
        activities: [
            {
                type: "LISTENING",
                name: `???????`,
            },
        ],
    });

    if (isDev) {
        await client.guilds.cache
            .get("840584537599770635")
            ?.commands.set([
                ...chatCommandsMap.values(),
                ...messageCommandsMap.values(),
                ...userCommandsMap.values(),
            ]);

        signale.success("Loaded all commands");
    } else {
        signale.info("Setting application commands...");
        await client.application?.commands.set([
            ...chatCommandsMap.values(),
            ...messageCommandsMap.values(),
            ...userCommandsMap.values(),
        ]);
    }
});

client.on("interactionCreate", handleInteraction);

prisma.$connect().then(async () => {
    signale.info("Connected to Database");
    await redis.connect();
    signale.info("Connected to Redis");
    await client.login(process.env.DISCORD_TOKEN);
    signale.info("Connected to Discord");
});
