"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Messages = exports.CustomIds = void 0;
exports.CustomIds = {
    JOIN_GAME: 'join_game',
    START_GAME: 'start_game',
    START_GAME_LOCAL: 'start_game_local',
    REVEAL_LOCAL_ROLE: 'reveal_local_role',
    REVEAL_NAME_MODAL: 'reveal_name_modal',
    PLAYER_NAME_INPUT: 'player_name',
    OPEN_VOTE_MENU: 'open_vote_menu',
    OPEN_MULTI_VOTE_MODAL: 'open_multi_vote_modal',
    SUBMIT_MULTI_VOTE: 'submit_multi_vote',
    SUBMIT_LOCAL_VOTE: 'submit_local_vote',
    SKIP_VOTE: 'SKIP'
};
exports.Messages = {
    ERRors: {
        INVALID_MODE: 'Invalid mode. Use MULTI or LOCAL.',
        CANNOT_START_HERE: 'Cannot start game here.',
        GAME_ALREADY_RUNNING: 'A game is already running in this channel.',
        NO_ACTIVE_GAME: 'No hay una partida activa en este canal.',
        ALREADY_JOINED: 'Ya estás en la partida.',
        HOST_ONLY: 'Solo el host puede iniciar.',
        NEED_MORE_PLAYERS: 'Se necesitan al menos 3 jugadores.',
        SESSION_EXPIRED: 'Session expired.',
        ACTION_REQUIRED: 'Acción requerida.',
        TEXT_REQUIRED: 'Debes especificar el texto.',
        ID_REQUIRED: 'Debes especificar el ID de la palabra a eliminar.',
        UNKNOWN_ACTION: 'Acción desconocida.',
        ONLY_HOST_VOTE: 'Solo el host puede gestionar la votación.',
        VOTING_ERROR: 'Error al votar:',
        DEAD_VOTE: 'Cannot vote for dead player'
    },
    Game: {
        NEW_GAME_MULTI: (hostId) => `**NUEVA PARTIDA: MULTI**\nHost: <@${hostId}>\nJugadores: `,
        NEW_GAME_LOCAL: (count) => `**NUEVA PARTIDA LOCAL**\nJugadores: ${count}\nClick "Empezar" para repartir roles.`,
        GAME_STARTED_MULTI: '🎲 **¡JUEGO INICIADO!**\nLos roles han sido enviados por MD.\n',
        GAME_STARTED_LOCAL: '🎲 **¡JUEGO INICIADO!**\nCliquea para revelar tu rol. (Local)',
        ASSIGNING_PHASE: (currentPlayerName, nextPlayerIndex) => `**FASE DE ASIGNACIÓN**\nPasar el dispositivo al **Jugador ${nextPlayerIndex}** (Provisorio).\nCuando estés listo, toca el botón.`,
        ASSIGNING_PHASE_UPDATE: (prevName, nextIndex) => `**FASE DE ASIGNACIÓN**\n✅ ${prevName} ya vio su rol.\n\n👉 Pasar dispositivo al **Jugador ${nextIndex}**.\nCuando estés listo, toca el botón.`,
        ALL_ROLES_SEEN: `**¡JUEGO INICIADO!**\nTodos han visto sus roles.\n¡Discutan y encuentren al Impostor!`,
        VOTE_PHASE_START: '🗣️ **FASE DE VOTACIÓN**\nElegí quién es eliminado por la mayoría.',
        VOTE_NOW_BUTTON: '🚨 Es hora de votar! Toca el botón para elegir a tu sospechoso.',
        VOTE_MODAL_TITLE: 'Elegí tu voto:',
        VOTE_REGISTERED: (targetName) => `✅ Voto registrado para: ${targetName}`,
        ROUND_CONTINUES: '🔊 **Continúa la ronda...**',
        TIE: '⚖️ **EMPATE / NADIE ELIMINADO.**',
        ELIMINATED: (name, role) => `💀 **${name}** fue eliminado.\nEra: **${role}**`,
        WIN_INOCENTS: '🏆 **¡VICTORIA DE LOS INOCENTES!**',
        WIN_IMPOSTOR: '🔪 **¡VICTORIA DEL IMPOSTOR!**',
        DM_IMPOSTOR: '🕵️ **SOS EL IMPOSTOR**\nTu objetivo es pasar desapercibido.',
        DM_INOCENT: (word) => `🙂 **NO SOS EL IMPOSTOR**\nLa palabra secreta es: ||**${word}**||`,
        ROLE_INFO_IMPOSTOR: '🕵️ SOS EL IMPOSTOR',
        ROLE_INFO_INOCENT: (word) => `🙂 NO SOS EL IMPOSTOR. Palabra: **${word}**`
    }
};
