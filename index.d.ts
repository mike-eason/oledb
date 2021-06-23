export function oledbConnection(connectionString: string): Connection;
export function odbcConnection(connectionString: string): Connection;
export function sqlConnection(connectionString: string): Connection;

declare class Connection {
    constructor(constring: string, contype: string | null);

    query<EntityType = QueryResult>(
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
    transaction(commands: CommandData[]): Promise<CommandResult<number>[]>;
}

type CommandParameter = unknown | CommandParameterOptions;

interface CommandParameterOptions {
    name?: string;
    value?: unknown;
    direction?: ParameterDirection;
    isNullable?: boolean;
    precision?: Uint8Array;
    scale?: Uint8Array;
    size?: Uint8Array;
}

interface CommandData {
    query: string;
    params?: CommandParameter | CommandParameter[];
    type?: CommandType;
}

type FieldValue = string | boolean | number | Date | null;
type QueryResult = Record<string, FieldValue>;
interface CommandResult<Result> {
    query: string;
    type: CommandType;
    params: CommandParameter[];
    result: Result;
}

export enum CommandType {
    Query = "query",
    Scalar = "scalar",
    Command = "command",
    Procedure = "procedure",
    ProcedureScalar = "procedure_scalar",
}

export enum ParameterDirection {
    Input = 1,
    Output = 2,
    InputOutput = 3,
    ReturnValue = 6,
}
