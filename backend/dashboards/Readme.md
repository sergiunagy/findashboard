# Initial configuration and run
use from deploy/:

        bash initial:setup.bash
Run with:

        docker compose --profile dev up


# Commit strategy

## Regular use case 
Do not commit/expose environment to public repository.

## Demo use case:

To pack everything nicely for the demo we will commit env files.
Make sure to avoid any data that could compromise the account:
- keys
- actual users/passwords

