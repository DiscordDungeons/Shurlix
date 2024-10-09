// @generated automatically by Diesel CLI.

diesel::table! {
    links (id) {
        id -> Int4,
        #[max_length = 255]
        slug -> Varchar,
        #[max_length = 255]
        custom_slug -> Nullable<Varchar>,
        original_link -> Text,
        owner_id -> Int4,
        created_at -> Timestamp,
        updated_at -> Timestamp,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    users (id) {
        id -> Int4,
        #[max_length = 255]
        username -> Varchar,
        #[max_length = 255]
        email -> Varchar,
        password_hash -> Text,
        password_salt -> Text,
        verified_at -> Nullable<Timestamp>,
        created_at -> Timestamp,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::joinable!(links -> users (owner_id));

diesel::allow_tables_to_appear_in_same_query!(
    links,
    users,
);
