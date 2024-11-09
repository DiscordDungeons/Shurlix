use std::str::FromStr;

use chrono::Duration;
use humantime::{format_duration, parse_duration};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, PartialEq)]
pub struct WrappedDuration(chrono::Duration);

impl FromStr for WrappedDuration {
	type Err = String;

	fn from_str(s: &str) -> Result<Self, Self::Err> {
		parse_duration(s)
			.map(|d| WrappedDuration(Duration::seconds(d.as_secs() as i64)))
			.map_err(|_| format!("Failed to parse '{}' as a Duration", s))
	}
}

impl Into<Duration> for WrappedDuration {
	fn into(self) -> Duration {
		self.0
	}
}

impl ToString for WrappedDuration {
	fn to_string(&self) -> String {
		format_duration(self.0.to_std().expect("Duration overflow")).to_string()
	}
}

impl Serialize for WrappedDuration {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
	where
		S: serde::Serializer {
			serializer.serialize_str(self.to_string().as_str())
	}
} 

impl<'de> Deserialize<'de> for WrappedDuration {
	fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
	where
		D: serde::Deserializer<'de> {
			let s = String::deserialize(deserializer)?;

			match Self::from_str(&s) {
				Ok(duration) => Ok(duration),
				Err(e) => Err(serde::de::Error::custom(e))
			}
	}
}

#[cfg(test)]
mod test {
    use super::*;
	use std::str::FromStr;
	use chrono::Duration;
	use serde_test::{Token, assert_tokens, assert_de_tokens};

	#[test]
    fn test_wrapped_duration_from_str_valid() {
        let duration_str = "5s";
        let wrapped_duration = WrappedDuration::from_str(duration_str).expect("Failed to parse duration");
        assert_eq!(wrapped_duration.0, Duration::seconds(5));
    }

    #[test]
    fn test_wrapped_duration_from_str_invalid() {
        let duration_str = "invalid";
        let wrapped_duration = WrappedDuration::from_str(duration_str);
        assert!(wrapped_duration.is_err());
    }

    #[test]
    fn test_wrapped_duration_to_string() {
        let wrapped_duration = WrappedDuration(Duration::seconds(10));
        assert_eq!(wrapped_duration.to_string(), "10s");
    }

    #[test]
    fn test_wrapped_duration_into_duration() {
        let wrapped_duration = WrappedDuration(Duration::seconds(15));
        let duration: Duration = wrapped_duration.into();
        assert_eq!(duration, Duration::seconds(15));
    }

    #[test]
    fn test_wrapped_duration_serialize() {
        let wrapped_duration = WrappedDuration(Duration::seconds(20));
        assert_tokens(&wrapped_duration, &[Token::Str("20s")]);
    }

    #[test]
    fn test_wrapped_duration_deserialize() {
        let wrapped_duration = WrappedDuration(Duration::seconds(25));
        assert_de_tokens(&wrapped_duration, &[Token::Str("25s")]);
    }

    #[test]
    fn test_wrapped_duration_deserialize_invalid() {
        let invalid_str = "invalid";
        let result = WrappedDuration::from_str(invalid_str);
        assert!(result.is_err());
    }
}