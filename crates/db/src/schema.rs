// @generated automatically by Diesel CLI.

diesel::table! {
    domains (id) {
        id -> Int4,
        #[max_length = 255]
        domain -> Varchar,
        public -> Bool,
        created_at -> Timestamp,
        updated_at -> Timestamp,
    }
}

diesel::table! {
    links (id) {
        id -> Int4,
        domain_id -> Int4,
        #[max_length = 255]
        slug -> Varchar,
        #[max_length = 255]
        custom_slug -> Nullable<Varchar>,
        original_link -> Text,
        owner_id -> Nullable<Int4>,
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
        verified_at -> Nullable<Timestamp>,
        is_admin -> Bool,
        created_at -> Timestamp,
        deleted_at -> Nullable<Timestamp>,
    }
}

diesel::table! {
    verification_tokens (id) {
        id -> Int4,
        user_id -> Int4,
        #[max_length = 255]
        token -> Varchar,
        created_at -> Timestamp,
        expires_at -> Timestamp,
    }
}

diesel::joinable!(links -> domains (domain_id));
diesel::joinable!(links -> users (owner_id));
diesel::joinable!(verification_tokens -> users (user_id));

diesel::allow_tables_to_appear_in_same_query!(
    domains,
    links,
    users,
    verification_tokens,
);
