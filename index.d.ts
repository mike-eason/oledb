export function oledbConnection(connectionString: string): Connection;
export function odbcConnection(connectionString: string): Connection;
export function sqlConnection(connectionString: string): Connection;

declare class Connection {
    constructor(constring: string, contype: string | null);

    query<EntityType = Record<string, FieldValue>>(
        command: string,
        params?: CommandParameter | CommandParameter[]
    ): Promise<CommandResult<EntityType[][]>>;
    scalar<FieldType = FieldValue>(
        command: string,
        params?: CommandParameter | CommandParameter[]
    ): Promise<CommandResult<FieldType>>;
    execute(
        command: string,
        params?: CommandParameter | CommandParameter[]
    ): Promise<CommandResult<number>>;
    procedure(
        command: string,
        params?: CommandParameter | CommandParameter[]
    ): Promise<CommandResult<number>>;
    procedureScalar<FieldType = FieldValue>(
        command: string,
        params?: CommandParameter | CommandParameter[]
    ): Promise<CommandResult<FieldType>>;
    transaction(
        commands: {
            query: string;
            params?: CommandParameter | CommandParameter[];
            type?: COMMAND_TYPES;
        }[]
    ): Promise<CommandResult<number>[]>;
}

type CommandParameter = unknown | CommandParameterOptions;

interface CommandParameterOptions {
    name?: string;
    value?: unknown;
    direction?: PARAMETER_DIRECTIONS;
    isNullable?: boolean;
    precision?: Uint8Array;
    scale?: Uint8Array;
    size?: Uint8Array;
}

type FieldValue = string | boolean | number | Date | null;

interface CommandResult<Result> {
    query: string;
    type: COMMAND_TYPES;
    params: CommandParameter[];
    result: Result;
}

export enum COMMAND_TYPES {
    QUERY = "query",
    SCALAR = "scalar",
    COMMAND = "command",
    PROCEDURE = "procedure",
    PROCEDURE_SCALAR = "procedure_scalar",
}

export enum PARAMETER_DIRECTIONS {
    INPUT = 1,
    OUTPUT = 2,
    INPUT_OUTPUT = 3,
    RETURN_VALUE = 6,
}
