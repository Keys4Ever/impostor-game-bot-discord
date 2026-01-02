"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const GameManager_1 = require("../domain/GameManager");
const StateMachine_1 = require("../domain/StateMachine");
const VoteManager_1 = require("../domain/VoteManager");
const types_1 = require("../domain/types");
async function testGame() {
    console.log("Starting Game Logic Test...");
    const gm = GameManager_1.GameManager.getInstance();
    // 1. Create Session
    const channelId = 'test-channel';
    const hostId = 'user-1';
    console.log("Creating session...");
    const session = gm.createSession(channelId, 'guild-1', hostId, 'MULTI');
    if (session.state !== types_1.GameState.START)
        throw new Error("State should be START");
    console.log("Session created. State: " + session.state);
    // 2. Add Players
    console.log("Adding players...");
    gm.addPlayer(channelId, { userId: 'user-1', role: 'INOCENTS', hasSeenRole: false });
    gm.addPlayer(channelId, { userId: 'user-2', role: 'INOCENTS', hasSeenRole: false });
    gm.addPlayer(channelId, { userId: 'user-3', role: 'INOCENTS', hasSeenRole: false });
    console.log("Players: " + session.players.length);
    // 3. Start Game (Transition to ASSIGNING -> PLAYING)
    console.log("Transitioning to ASSIGNING...");
    await StateMachine_1.StateMachine.transition(session, types_1.GameState.ASSIGNING);
    // Check roles
    const impostors = session.players.filter(p => p.role === 'IMPOSTOR');
    console.log(`Impostors count: ${impostors.length}`);
    if (impostors.length !== 1)
        throw new Error("Should have 1 impostor");
    console.log(`Word: ${session.word}`);
    if (!session.word)
        throw new Error("Word should be assigned");
    // Manually move to PLAYING
    await StateMachine_1.StateMachine.transition(session, types_1.GameState.PLAYING);
    console.log("State: " + session.state);
    // 4. Voting
    console.log("Transitioning to VOTING...");
    await StateMachine_1.StateMachine.transition(session, types_1.GameState.VOTING);
    console.log("Casting votes...");
    // user-1 votes user-2
    VoteManager_1.VoteManager.castVote(session, 'user-1', 'user-2');
    // user-2 votes user-3
    VoteManager_1.VoteManager.castVote(session, 'user-2', 'user-3');
    // user-3 votes user-2
    VoteManager_1.VoteManager.castVote(session, 'user-3', 'user-2');
    const result = VoteManager_1.VoteManager.resolveVotes(session);
    console.log("Vote Result:", result);
    if (result.eliminatedId !== 'user-2')
        throw new Error("User-2 should be eliminated");
    console.log("Eliminated: " + result.eliminatedId);
    console.log("Test Passed!");
}
testGame().catch(e => console.error("Test Failed:", e));
