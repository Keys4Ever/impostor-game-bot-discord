"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WordService = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
class WordService {
    static async addWord(text, guildId) {
        await prisma.word.create({
            data: {
                text,
                guildId
            }
        });
    }
    static async getWords(guildId) {
        const whereClause = guildId ? { OR: [{ guildId }, { guildId: null }] } : {};
        const words = await prisma.word.findMany({
            where: whereClause
        });
        return words.map((w) => w.text);
    }
    static async getRandomWord(guildId) {
        const words = await this.getWords(guildId);
        if (words.length === 0)
            return 'DEFAULT_WORD';
        const index = Math.floor(Math.random() * words.length);
        return words[index];
    }
    static async deleteWord(param) {
        if (isNaN(parseInt(param))) {
            await prisma.word.delete({ where: { text: param } });
        }
        else {
            await prisma.word.delete({ where: { id: parseInt(param) } });
        }
    }
    static async listWordsFormatted(guildId) {
        const words = await prisma.word.findMany({
            where: guildId ? { OR: [{ guildId }, { guildId: null }] } : {}
        });
        if (words.length === 0)
            return "No words found.";
        return words.map((w) => `${w.id}: ${w.text}`).join('\n');
    }
}
exports.WordService = WordService;
