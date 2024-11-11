use std::{ops::Add, str::FromStr, fmt};

use chrono::{DateTime, Duration, Utc};
use humantime::{format_duration, parse_duration};
use serde::{Serialize, Deserialize};

#[derive(Debug, Clone, PartialEq, Copy)]
pub struct WrappedDuration(pub chrono::Duration);

impl WrappedDuration {
    pub fn new(duration: chrono::Duration) -> Self {
        WrappedDuration(duration)
    }
}

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

impl Add<WrappedDuration> for DateTime<Utc> {
	type Output = DateTime<Utc>;

	fn add(self, rhs: WrappedDuration) -> Self::Output {
		self + rhs.0
	}
}

impl Serialize for WrappedDuration {
	fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
	where
		S: serde::Serializer {
			serializer.serialize_str(self.to_string().as_str())
	}
} 

impl fmt::Display for WrappedDuration {
	fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
		let formatted = format_duration(self.0.to_std().expect("Duration overflow")).to_string();

		write!(f, "{}", formatted)
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
	use chrono::{Duration, Utc};
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

	#[test]
    fn test_add_wrapped_duration_to_datetime() {
        let now = Utc::now();
        let wrapped_duration = WrappedDuration::new(Duration::hours(2));

        let new_datetime = now + wrapped_duration;

        // Assert that the new datetime is 2 hours ahead of the original
        assert_eq!(new_datetime, now + Duration::hours(2));
    }

    #[test]
    fn test_add_zero_wrapped_duration_to_datetime() {
        let now = Utc::now();
        let wrapped_duration = WrappedDuration::new(Duration::zero());

        let new_datetime = now + wrapped_duration;

        // Assert that adding zero duration does not change the datetime
        assert_eq!(new_datetime, now);
    }

    #[test]
    fn test_add_negative_wrapped_duration_to_datetime() {
        let now = Utc::now();
        let wrapped_duration = WrappedDuration::new(Duration::hours(-3));

        let new_datetime = now + wrapped_duration;

        // Assert that the new datetime is 3 hours behind the original
        assert_eq!(new_datetime, now + Duration::hours(-3));
    }

    #[test]
    fn test_add_mixed_wrapped_duration_to_datetime() {
        let now = Utc::now();
        let wrapped_duration = WrappedDuration::new(Duration::days(1) + Duration::hours(5));

        let new_datetime = now + wrapped_duration;

        // Assert that the new datetime is 1 day and 5 hours ahead of the original
        assert_eq!(new_datetime, now + Duration::days(1) + Duration::hours(5));
    }
}