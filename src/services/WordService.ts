import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class WordService {
    static async addWord(text: string, guildId?: string): Promise<void> {
        await prisma.word.create({
            data: {
                text,
                guildId
            }
        });
    }

    static async getWords(guildId?: string): Promise<string[]> {
        const whereClause = guildId ? { OR: [{ guildId }, { guildId: null }] } : {};
        const words = await prisma.word.findMany({
            where: whereClause
        });
        return words.map((w: any) => w.text);
    }

    static async getRandomWord(guildId?: string): Promise<string> {
        const words = await this.getWords(guildId);
        if (words.length === 0) return 'DEFAULT_WORD';
        const index = Math.floor(Math.random() * words.length);
        return words[index];
    }

    static async deleteWord(param: any): Promise<void> {
        if (isNaN(parseInt(param))) {
            await prisma.word.delete({ where: { text: param } });
        } else {
            await prisma.word.delete({ where: { id: parseInt(param) } });
        }
    }

    static async listWordsFormatted(guildId?: string): Promise<string> {
        const words = await prisma.word.findMany({
            where: guildId ? { OR: [{ guildId }, { guildId: null }] } : {}
        });
        if (words.length === 0) return "No words found.";
        return words.map((w: any) => `${w.id}: ${w.text}`).join('\n');
    }
}
