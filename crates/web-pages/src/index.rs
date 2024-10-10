use crate::layout::Layout;
use dioxus::prelude::*;
use dioxus::prelude::component;
use log::info;

#[component]
pub fn IndexPage() -> Element {
    rsx! {
        Layout {    // <-- Use our layout
            title: "Index",
            h1 { "Enter url!" }
            div {
                label { r#for: "link", "Long link:" }
                input { id: "link", name: "link", r#type: "url", required: "true"}
                button { onclick: move |event| println!("Clicked! Event: {event:?}"), "Shorten" }
            }
        }
    }
}