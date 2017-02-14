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
        //Convert the input parameters to a useable object.
        ParameterCollection pcol = new ParameterCollection(parameters);

        using (DbConnection connection = CreateConnection(pcol.ConnectionString, pcol.ConnectionType))
        {
            try
            {
                await connection.OpenAsync();

                //Work out which query type to execute.
                switch (pcol.QueryType)
                {
                    case QueryTypes.query:
                        return await ExecuteQuery(connection, pcol.Query, pcol.Parameters);
                    case QueryTypes.scalar:
                        return await ExecuteScalar(connection, pcol.Query, pcol.Parameters);
                    case QueryTypes.command:
                        return await ExecuteNonQuery(connection, pcol.Query, pcol.Parameters);
                    default:
                        throw new InvalidOperationException("Unsupported type of SQL command type. Only query and command are supported.");
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

    private async Task<object> ExecuteQuery(DbConnection connection, string query, object[] parameters)
    {
        using (var command = connection.CreateCommand())
        {
            command.CommandText = query;

            AddCommandParameters(command, parameters);

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
    }

    private async Task<object> ExecuteScalar(DbConnection connection, string query, object[] parameters)
    {
        using (var command = connection.CreateCommand())
        {
            command.CommandText = query;

            AddCommandParameters(command, parameters);

            return await command.ExecuteScalarAsync();
        }
    }

    private async Task<object> ExecuteNonQuery(DbConnection connection, string query, object[] parameters)
    {
        using (var command = connection.CreateCommand())
        {
            command.CommandText = query;

            AddCommandParameters(command, parameters);

            return await command.ExecuteNonQueryAsync();
        }
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
        //Generate names for each parameter and add them to the parameter collection.
        for (int i = 0; i < parameters.Length; i++)
        {
            string name = string.Format("@p{0}", i + 1);

            DbParameter param = command.CreateParameter();
            param.ParameterName = name;
            
            if (param.Value == null)
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
    command
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
    public QueryTypes QueryType { get; private set; }
    public string Query { get; private set; }
    public object[] Parameters { get; private set; }

    public ParameterCollection(IDictionary<string, object> parameters)
    {
        if (parameters == null)
            throw new ArgumentNullException("parameters");

        _Raw = parameters;
        ParseRawParameters();
    }

    private void ParseRawParameters()
    {
        //Extract the connection string.
        ConnectionString = _Raw["constring"].ToString();

        if (string.IsNullOrEmpty(ConnectionString))
            throw new ArgumentNullException("constring");

        //Extract the query
        Query = _Raw["query"].ToString();

        if (string.IsNullOrEmpty(Query))
            throw new ArgumentNullException("query");

        //Extract the provider type (optional)
        object connectionType = null;

        _Raw.TryGetValue("connection", out connectionType);

        if (connectionType == null)
            connectionType = "oledb";

        ConnectionType = (ConnectionTypes)Enum.Parse(typeof(ConnectionTypes), connectionType.ToString().ToLower());

        //Extract and command type (optional)
        object commandType = null;

        _Raw.TryGetValue("type", out commandType);

        if (commandType == null)
            commandType = "query";

        QueryType = (QueryTypes)Enum.Parse(typeof(QueryTypes), commandType.ToString().ToLower());

        //Extract the parameters (optional)
        object parameters = null;

        _Raw.TryGetValue("params", out parameters);

        if (parameters == null)
            Parameters = new object[0];

        Parameters = (object[])parameters;
    }
}