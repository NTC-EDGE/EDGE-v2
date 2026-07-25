using System;

namespace EDGE.Application.Common.Exceptions;

public class StorageException : Exception
{
    public StorageException()
        : base("An error occurred while communicating with the storage service. Please try again later.")
    {
    }

    public StorageException(string message)
        : base(message)
    {
    }

    public StorageException(string message, Exception innerException)
        : base(message, innerException)
    {
    }
}
