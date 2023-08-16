import { ApplicationCommandData, AutocompleteInteraction, ButtonInteraction, Client, Collection, CommandInteraction, CommandInteractionOptionResolver, ModalSubmitInteraction, StringSelectMenuInteraction } from 'discord.js';

interface CommandProps {
    client: Client,
    interaction: CommandInteraction,
    options: CommandInteractionOptionResolver
}

export type ComponentsButton = Collection<string, (interaction: ButtonInteraction) => void>
export type ComponentsSelect = Collection<string, (interaction: StringSelectMenuInteraction) => void>
export type ComponentsModal = Collection<string, (interaction: ModalSubmitInteraction) => void>

interface CommandComponents {
    buttons?: ComponentsButton;
    selects?: ComponentsSelect;
    modals?: ComponentsModal;
}

export type CommandType = ApplicationCommandData & CommandComponents & {
    run(props: CommandProps): void;
    autoComplete?: (interaction: AutocompleteInteraction) => void;
}

export class Command {
    constructor(options: CommandType) {
        options.dmPermission = false;
        Object.assign(this, options);
    }
}