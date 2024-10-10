use rust_embed::RustEmbed;

#[derive(RustEmbed)]
#[folder = "./static/assets"] // Adjust this to your static assets folder
pub struct Asset;