//#r "System.dll"
//#r "System.Data.dll"

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Common;
using System.Data.Odbc;
using System.Data.OleDb;
using System.Data.SqlClient;
using System.Dynamic;
using System.Threading.Tasks;

public class Startup
{
    public async Task<object> Invoke(IDictionary<string, object> parameters)
    {
        ParameterCollection pcol = new ParameterCollection(parameters);

        using (DbConnection connection = CreateConnection(pcol.ConnectionString, pcol.ConnectionType))
        {
            try
            {
                await connection.OpenAsync();

                using (var command = connection.CreateCommand())
                {
                    //If there is only one command then execute it on it's own.
                    //Otherwise run all commands as a single transaction.
                    if (pcol.Commands.Count == 1)
                    {
                        var com = pcol.Commands[0];

                        switch (com.type)
                        {
                            case QueryTypes.query:
                                return await ExecuteQuery(command, com);
                            case QueryTypes.scalar:
                                return await ExecuteScalar(command, com);
                            case QueryTypes.command:
                                return await ExecuteNonQuery(command, com);
                            case QueryTypes.procedure:
                                return await ExecuteProcedure(command, com);
                            default:
                                throw new NotSupportedException("Unsupported type of database command. Only 'query', 'scalar', 'command' and 'procedure' are supported.");
                        }
                    }
                    else
                    {
                        return await ExecuteTransaction(connection, command, pcol.Commands);
                    }
                }
            }
            finally
            {
                connection.Close();
            }
        }
    }

    private DbConnection CreateConnection(string connectionString, ConnectionTypes type)
    {
        switch (type)
        {
            case ConnectionTypes.oledb:
                return new OleDbConnection(connectionString);
            case ConnectionTypes.odbc:
                return new OdbcConnection(connectionString);
            case ConnectionTypes.sql:
                return new SqlConnection(connectionString);
        }

        throw new NotImplementedException();
    }

    private async Task<object> ExecuteQuery(DbCommand command, Command com)
    {
        command.CommandText = com.query;

        AddCommandParameters(command, com.@params);

        using (DbDataReader reader = command.ExecuteReader())
        {
            List<object> results = new List<object>();

            do
            {
                results.Add(await ParseReaderRow(reader));
            }
            while (await reader.NextResultAsync());

            return results;
        }
    }

    private async Task<object> ExecuteScalar(DbCommand command, Command com)
    {
        command.CommandText = com.query;

        AddCommandParameters(command, com.@params);

        return await command.ExecuteScalarAsync();
    }

    private async Task<object> ExecuteNonQuery(DbCommand command, Command com)
    {
        command.CommandText = com.query;

        AddCommandParameters(command, com.@params);

        return await command.ExecuteNonQueryAsync();
    }

    private async Task<object> ExecuteProcedure(DbCommand command, Command com)
    {
        bool hasReturnParameter = com.returns != null;

        command.CommandText = com.query;
        command.CommandType = CommandType.StoredProcedure;

        AddCommandParameters(command, com.@params);

        if (hasReturnParameter)
        {
            DbParameter returnParam = command.CreateParameter();
            returnParam.ParameterName = com.returns.parameterName;
            returnParam.Direction = ParameterDirection.ReturnValue;
            returnParam.Value = com.returns.value;

            if (com.returns.precision != null)
                returnParam.Precision = (byte)com.returns.precision;
            if (com.returns.scale != null)
                returnParam.Scale = (byte)com.returns.scale;
            if (com.returns.size != null)
                returnParam.Size = (byte)com.returns.size;

            command.Parameters.Add(returnParam);
        }

        object result = await command.ExecuteScalarAsync();

        if (hasReturnParameter)
            return command.Parameters[com.returns.parameterName].Value;
        else
            return result;
    }

    private async Task<object> ExecuteTransaction(DbConnection connection, DbCommand command, List<Command> commands)
    {
        DbTransaction transaction = null;

        try
        {
            transaction = connection.BeginTransaction(IsolationLevel.ReadCommitted);

            command.Transaction = transaction;

            foreach (Command com in commands)
            {
                switch (com.type)
                {
                    case QueryTypes.command:
                        com.result = await ExecuteNonQuery(command, com);
                        break;
                    case QueryTypes.query:
                        com.result = await ExecuteQuery(command, com);
                        break;
                    case QueryTypes.scalar:
                        com.result = await ExecuteScalar(command, com);
                        break;
                    case QueryTypes.procedure:
                        com.result = await ExecuteProcedure(command, com);
                        break;
                    default:
                        throw new NotSupportedException("Unsupported type of database command. Only 'query', 'scalar', 'command' and 'procedure' are supported.");
                }
            }

            transaction.Commit();
        }
        catch
        {
            try
            {
                transaction.Rollback();
            }
            catch
            {
                //Do nothing here; transaction is not active.
            }

            throw;
        }

        return commands;
    }

    private async Task<List<object>> ParseReaderRow(DbDataReader reader)
    {
        List<object> rows = new List<object>();
        IDataRecord row = reader;

        while (await reader.ReadAsync())
        {
            var data = new ExpandoObject() as IDictionary<string, object>;
            var result = new object[row.FieldCount];
            row.GetValues(result);

            for (int i = 0; i < row.FieldCount; i++)
            {
                Type type = row.GetFieldType(i);

                if (result[i] is DBNull)
                    result[i] = null;
                else if (type == typeof(byte[]) || type == typeof(char[]))
                    result[i] = Convert.ToBase64String((byte[])result[i]);
                else if (type == typeof(Guid) || type == typeof(DateTime))
                    result[i] = result[i].ToString();
                else if (type == typeof(IDataReader))
                    result[i] = "<IDataReader>";

                data.Add(row.GetName(i), result[i]);
            }

            rows.Add(data);
        }

        return rows;
    }

    private void AddCommandParameters(DbCommand command, object[] parameters)
    {
        command.Parameters.Clear();

        for (int i = 0; i < parameters.Length; i++)
        {
            string name = string.Format("@p{0}", i + 1);

            DbParameter param = command.CreateParameter();
            param.ParameterName = name;

            if (parameters[i] == null)
                param.Value = DBNull.Value;
            else
                param.Value = parameters[i];

            command.Parameters.Add(param);
        }
    }
}

public enum QueryTypes
{
    query,
    scalar,
    command,
    procedure
}

public enum ConnectionTypes
{
    oledb,
    odbc,
    sql
}

public class ParameterCollection
{
    private IDictionary<string, object> _Raw;

    public string ConnectionString { get; private set; }
    public ConnectionTypes ConnectionType { get; private set; }

    public List<Command> Commands { get; private set; }

    public ParameterCollection(IDictionary<string, object> parameters)
    {
        if (parameters == null)
            throw new ArgumentNullException("parameters");

        Commands = new List<Command>();

        _Raw = parameters;
        ParseRawParameters();
    }

    private void ParseRawParameters()
    {
        //Extract the connection string.
        ConnectionString = _Raw["constring"].ToString();

        if (string.IsNullOrWhiteSpace(ConnectionString))
            throw new ArgumentNullException("constring");

        //Extract the connection type (optional)
        object connectionType = null;

        _Raw.TryGetValue("connection", out connectionType);

        if (connectionType == null)
            connectionType = "oledb";

        ConnectionType = (ConnectionTypes)Enum.Parse(typeof(ConnectionTypes), connectionType.ToString().ToLower());

        //Extract the commands array.
        dynamic commands = null;

        _Raw.TryGetValue("commands", out commands);

        if (commands == null)
            throw new ArgumentException("The commands field is required.");

        for (int i = 0; i < commands.Length; i++)
        {
            dynamic com = commands[i];

            if (!IsPropertyExist(com, "query"))
                throw new ArgumentException("The query field is required on transaction object.");

            Command newCom = new Command()
            {
                query = com.query
            };

            if (IsPropertyExist(com, "params"))
                newCom.@params = com.@params;
            else
                newCom.@params = new object[] { };

            if (IsPropertyExist(com, "type"))
                newCom.type = (QueryTypes)Enum.Parse(typeof(QueryTypes), com.type.ToString().ToLower());
            else
                newCom.type = QueryTypes.command;

            if (IsPropertyExist(com, "returns"))
            {
                newCom.returns = new ReturnParameter()
                {
                    name = com.returns.name
                };

                try { newCom.returns.precision = (byte)com.returns.precision; } catch { }
                try { newCom.returns.scale = (byte)com.returns.scale; } catch { }
                try { newCom.returns.size = (byte)com.returns.size; } catch { }
                try { newCom.returns.value = com.returns.value; } catch { }
            }

            Commands.Add(newCom);
        }
    }

    private bool IsPropertyExist(dynamic settings, string name)
    {
        if (settings is ExpandoObject)
            return ((IDictionary<string, object>)settings).ContainsKey(name);

        return settings.GetType().GetProperty(name) != null;
    }
}

public class ReturnParameter
{
    public string name { get; set; }

    public string parameterName
    {
        get
        {
            string name = this.name.Replace("@", "");

            return "@" + name;
        }
    }

    public byte? precision { get; set; }
    public byte? scale { get; set; }
    public byte? size { get; set; }
    public object value { get; set; }
}

public class Command
{
    public string query { get; set; }
    public object[] @params { get; set; }
    public QueryTypes type { get; set; }
    public ReturnParameter returns { get; set; }
    public object result { get; set; }
}