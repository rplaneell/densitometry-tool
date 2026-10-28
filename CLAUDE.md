# Notes for Claude Code

## Secrets rule (applies to every project)

* Keep API keys, tokens and passwords only in a local `.env` file. (API means application programming interface, the door a program uses to talk to another service, and a key is the password for that door.)
* `.env` must always be listed in `.gitignore`. Check this before the first commit of any project, and check that `git ls-files` shows no `.env` file with real secrets.
* Commit a `.env.example` with the variable names and empty values, so anyone can see what to fill in without seeing the secrets.
* Never paste a key into source code, docs, chat messages, screenshots or commit messages.
* If a key ever reaches GitHub, even for a minute, treat it as stolen: revoke it at the provider and make a new one. Deleting the commit is not enough, because bots scan GitHub within seconds.

Why: Git remembers everything forever, and a public or shared repository is read by automated scanners that steal keys and run up bills on your account. A file that Git never sees can never be uploaded by mistake.
