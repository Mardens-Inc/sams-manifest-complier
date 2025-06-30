use thiserror::Error;

#[derive(Debug, Error)]
pub(crate) enum CommandError {
    #[error(transparent)]
    Io(#[from] std::io::Error),
    #[error("failed to parse as string: {0}")]
    Utf8(#[from] std::str::Utf8Error),
    #[error(transparent)]
    CsvError(#[from] csv::Error),
    #[error(transparent)]
    SerdeJsonError(#[from] serde_json::Error),
}

#[derive(serde::Serialize)]
#[serde(tag = "kind", content = "message")]
#[serde(rename_all = "camelCase")]
enum ErrorKind {
    Io(String),
    Utf8(String),
    CsvError(String),
    SerdeJsonError(String),
}

impl serde::Serialize for CommandError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        let error_message = self.to_string();
        let error_kind = match self {
            Self::Io(_) => ErrorKind::Io(error_message),
            Self::Utf8(_) => ErrorKind::Utf8(error_message),
            Self::CsvError(_) => ErrorKind::CsvError(error_message),
            Self::SerdeJsonError(_) => ErrorKind::SerdeJsonError(error_message),
        };
        error_kind.serialize(serializer)
    }
}
