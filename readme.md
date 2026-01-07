# Impostor Bot

This is a Discord bot for the party game "Impostor"

- A random word is picked from a list of words, then all players receive a rol, if you're the impostor you have to try to guess the word, if you're the crew you have to try to find the impostor. In every round you say a relationed word, but never the word.
- Between every round there is a votation to kick a suspicious player, or skip if no one is suspicious.
- The game ends when the crew votes to kick the impostor or when the impostor stands the last.

## Features

- Fully functional game flow
- Add custom words by every server

## TODO

- [ ] Dockerize the bot
- [ ] Add a deployment flow, so i don't have to access to the vps every time i want to update the bot
- [ ] Add a list of default words + a flag to deactivate it.
- [ ] Add a "whitelist"/"blacklist" feature to play the game and to add words - maybe based on roles?