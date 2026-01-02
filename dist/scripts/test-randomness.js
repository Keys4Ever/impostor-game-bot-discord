"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const StateMachine_1 = require("../domain/StateMachine");
const types_1 = require("../domain/types");
async function testRandomness() {
    console.warn("Starting Randomness Test (1000 iterations)...");
    const iterations = 1000;
    const frequencies = [0, 0, 0]; // For 3 players
    // We can reuse the same session object structure if we carefully reset it, 
    // or just mock the part we need. But let's use the real Manager to be safe,
    // though creating 1000 sessions might be slow?
    // Actually, StateMachine.handleAssigning is static and takes a session. 
    // We can just construct a mock session and call transition repeatedly.
    const mockSession = {
        state: types_1.GameState.START,
        players: [
            { userId: 'p0', role: 'INOCENTS', name: 'P0' },
            { userId: 'p1', role: 'INOCENTS', name: 'P1' },
            { userId: 'p2', role: 'INOCENTS', name: 'P2' }
        ],
        alivePlayers: new Set(),
        word: '',
        votes: new Map()
    };
    for (let i = 0; i < iterations; i++) {
        // Reset roles
        mockSession.players.forEach((p) => p.role = 'INOCENTS');
        mockSession.state = types_1.GameState.START; // Reset state for transition validity
        // Transition to ASSIGNING
        await StateMachine_1.StateMachine.transition(mockSession, types_1.GameState.ASSIGNING);
        // Check who is impostor
        const impostorIndex = mockSession.players.findIndex((p) => p.role === 'IMPOSTOR');
        if (impostorIndex === -1)
            throw new Error("No impostor assigned!");
        // Note: The players array is shuffled inside handleAssigning! 
        // So checking index 0, 1, 2 of the *resulting* array doesn't tell us if the *original* P0 was impostor if we don't track UserID.
        // Wait, handleAssigning shuffles the array IN PLACE.
        // So we need to find which UserID became the impostor.
        // If we want to check if the "First Player in the List" is always the impostor (which was the bug),
        // we should check the index in the *shuffled* array.
        // The bug was: players[0].role = 'IMPOSTOR' -> So Index 0 was ALWAYS impostor.
        // We want Index 0 to be Impostor only ~33% of the time.
        frequencies[impostorIndex]++;
    }
    console.log("Frequencies of Index being Impostor (0, 1, 2):", frequencies);
    // Check distribution
    const total = iterations;
    const expected = total / 3;
    const tolerance = 50; // Allow some variance
    const isRandom = frequencies.every(f => Math.abs(f - expected) < tolerance);
    if (isRandom) {
        console.log("SUCCESS: Impostor assignment appears random.");
    }
    else {
        console.error("FAILURE: Impostor assignment NOT random enough.", frequencies);
        process.exit(1);
    }
}
testRandomness().catch(console.error);
