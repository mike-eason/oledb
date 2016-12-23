//#r "System.dll"
//#r "System.Data.dll"

using System;
using System.Collections.Generic;
using System.Data;
using System.Data.OleDb;
using System.Dynamic;
using System.Threading.Tasks;

public class Startup
{
    private string _ConnectionString;

    public async Task<object> Invoke(IDictionary<string, object> parameters)
    {
        _ConnectionString = parameters["constring"].ToString();

        if (string.IsNullOrEmpty(_ConnectionString))
            throw new ArgumentNullException("constring");

        string commandString = parameters["query"].ToString();

        if (string.IsNullOrEmpty(_ConnectionString))
            throw new ArgumentNullException("query");

        object commandType = null;

        parameters.TryGetValue("type", out commandType);

        if (commandType == null)
            commandType = "query";

        string type = commandType.ToString().ToLower();

        switch (type)
        {
            case "query":
                return await ExecuteQuery(commandString);
            case "scalar":
                return await ExecuteScalar(commandString);
            case "command":
                return await ExecuteNonQuery(commandString);
            default:
                throw new InvalidOperationException("Unsupported type of SQL command type. Only query and command are supported.");
        }
    }

    private async Task<object> ExecuteQuery(string query)
    {
        OleDbConnection connection = null;

        try
        {
            using (connection = new OleDbConnection(_ConnectionString))
            {
                await connection.OpenAsync();

                using (var command = new OleDbCommand(query, connection))
                {
                    List<object> rows = new List<object>();

                    using (OleDbDataReader reader = command.ExecuteReader())
                    {
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
                }
            }
        }
        finally
        {
            if (connection != null)
                connection.Close();
        }
    }

    private async Task<object> ExecuteScalar(string query)
    {
        OleDbConnection connection = null;

        try
        {
            using (connection = new OleDbConnection(_ConnectionString))
            {
                await connection.OpenAsync();

                using (var command = new OleDbCommand(query, connection))
                    return await command.ExecuteScalarAsync();
            }
        }
        finally
        {
            if (connection != null)
                connection.Close();
        }
    }

    private async Task<object> ExecuteNonQuery(string query)
    {
        OleDbConnection connection = null;

        try
        {
            using (connection = new OleDbConnection(_ConnectionString))
            {
                await connection.OpenAsync();

                using (var command = new OleDbCommand(query, connection))
                    return await command.ExecuteNonQueryAsync();
            }
        }
        finally
        {
            if (connection != null)
                connection.Close();
        }
    }
}
