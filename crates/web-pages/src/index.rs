use crate::layout::Layout;
use dioxus::prelude::*;
use dioxus::prelude::component;

#[component]
pub fn IndexPage() -> Element {
    rsx! {
        Layout {    // <-- Use our layout
            title: "Index",
            h1 { "Hello World!" }
        }
    }
}