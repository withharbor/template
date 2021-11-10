import {GuildMember} from "discord.js";
import {Inhibitor} from "../types/command";

export const BOT_ADMINS = process.env.BOT_ADMINS?.split(",") ?? [
    "657057112593268756"
];

export const botAdmins: Inhibitor = interaction => {
    if (!BOT_ADMINS.includes((interaction.member as GuildMember).id)) {
        throw new Error("Only bot admins can use this command!");
    }
};
